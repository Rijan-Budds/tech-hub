import express from "express";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import cors from "cors"; // import cors
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";

const app = express();
const port = 5000;

// In production, move this to process.env.JWT_SECRET
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";

const ADMIN_EMAIL = "admin@admin.com";
const ADMIN_PASSWORD = "Admin/1234";

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
); // enable CORS for Next.js dev server with credentials
app.use(express.json()); // built-in JSON body parser
app.use(cookieParser());

// MongoDB connection - you can use MongoDB Atlas or local MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce';

mongoose.connect(MONGODB_URI)
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

const cartItemSchema = new mongoose.Schema({
  productId: { type: String, required: true },
  quantity: { type: Number, required: true, default: 1 },
});

const orderItemSchema = new mongoose.Schema({
  productId: { type: String, required: true },
  quantity: { type: Number, required: true },
});

const orderSchema = new mongoose.Schema({
  items: [orderItemSchema],
  createdAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['pending', 'canceled', 'delivered'], default: 'pending' },
  subtotal: { type: Number, default: 0 },
  deliveryFee: { type: Number, default: 0 },
  grandTotal: { type: Number, default: 0 },
  customer: {
    name: String,
    email: String,
    address: {
      street: String,
      city: String,
      country: String,
    },
  },
});

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true },
  wishlist: { type: [String], default: [] }, // array of productId
  cart:     { type: [cartItemSchema], default: [] },
  orders:   { type: [orderSchema], default: [] },
});

const User = mongoose.model('User', userSchema);

// Sample products (in-memory for now)
const products = [
  { id: 'p1', slug: 'wireless-headphones', name: 'Wireless Headphones', price: 59.99, category: 'electronics', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80' },
  { id: 'p2', slug: 'smart-watch', name: 'Smart Watch', price: 129.99, category: 'electronics', image: 'https://images.unsplash.com/photo-1517433456452-f9633a875f6f?auto=format&fit=crop&w=800&q=80' },
  { id: 'p3', slug: 'gaming-mouse', name: 'Gaming Mouse', price: 39.99, category: 'electronics', image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80' },
  { id: 'p4', slug: 'bluetooth-speaker', name: 'Bluetooth Speaker', price: 49.99, category: 'electronics', image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80' },
  { id: 'p5', slug: 'men-hoodie', name: 'Men Hoodie', price: 35.5, category: 'clothing', image: 'https://images.unsplash.com/photo-1520975964562-25f53a38f04b?auto=format&fit=crop&w=800&q=80' },
  { id: 'p6', slug: 'women-dress', name: 'Women Dress', price: 79.0, category: 'clothing', image: 'https://images.unsplash.com/photo-1475180098004-ca77a66827be?auto=format&fit=crop&w=800&q=80' },
  { id: 'p7', slug: 'chef-knife', name: 'Chef Knife', price: 24.99, category: 'home-kitchen', image: 'https://images.unsplash.com/photo-1607305387299-07bd86da72bb?auto=format&fit=crop&w=800&q=80' },
  { id: 'p8', slug: 'yoga-mat', name: 'Yoga Mat', price: 19.99, category: 'sports-fitness', image: 'https://images.unsplash.com/photo-1599050751732-b77ed2cbf9c6?auto=format&fit=crop&w=800&q=80' },
  { id: 'p9', slug: 'novel-book', name: 'Novel Book', price: 12.99, category: 'books-media', image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=800&q=80' },
  { id: 'p10', slug: 'face-cream', name: 'Face Cream', price: 22.5, category: 'beauty-health', image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80' },
  { id: 'p11', slug: 'toy-car', name: 'Toy Car', price: 9.99, category: 'toys-games', image: 'https://images.unsplash.com/photo-1602143407151-7111542de2db?auto=format&fit=crop&w=800&q=80' },
  { id: 'p12', slug: 'car-vacuum', name: 'Car Vacuum', price: 45.0, category: 'automotive', image: 'https://images.unsplash.com/photo-1542367597-8849ebd5a0a6?auto=format&fit=crop&w=800&q=80' },
];

// Shipping cities and fees (example)
const cityFees = {
  Kathmandu: 3.5,
  Pokhara: 4.5,
  Lalitpur: 3.0,
  Bhaktapur: 3.0,
  Biratnagar: 5.0,
  Butwal: 4.0,
};

// Helper: sign JWT
function signUserToken(user, role = 'user') {
  return jwt.sign(
    { sub: user._id ? user._id.toString() : 'admin', email: user.email, username: user.username || 'admin', role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// Helper: auth middleware
function requireAuth(req, res, next) {
  const token = req.cookies?.token;
  if (!token) return res.status(401).json({ message: 'Unauthorized' });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload; // attach to request
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden' });
  }
  next();
}

app.get('/products', (req, res) => {
  const { category } = req.query;
  const list = category ? products.filter(p => p.category === category) : products;
  res.json({ products: list });
});

app.get('/products/:slug', (req, res) => {
  const prod = products.find(p => p.slug === req.params.slug);
  if (!prod) return res.status(404).json({ message: 'Not found' });
  res.json({ product: prod });
});

// Shipping cities endpoint
app.get('/shipping/cities', (_req, res) => {
  res.json({ cities: Object.keys(cityFees).map((name) => ({ name, fee: cityFees[name] })) })
});

app.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Please provide username, email, and password' });
  }

  try {
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).json({ message: 'Username or email already taken' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      username,
      email,
      password: hashedPassword,
    });

    await user.save();

    // Optionally sign in immediately after registration
    const token = signUserToken(user, 'user');
    res.cookie('token', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false, // set true behind HTTPS
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(201).json({ message: 'User registered successfully', user: { id: user._id, email: user.email, username: user.username, role: 'user' } });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: 'Email and password are required' });

  try {
    // Admin hard-coded login
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      const token = jwt.sign({ sub: 'admin', email: ADMIN_EMAIL, username: 'admin', role: 'admin' }, JWT_SECRET, { expiresIn: '7d' });
      res.cookie('token', token, {
        httpOnly: true,
        sameSite: 'lax',
        secure: false,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      return res.json({ message: 'Admin login successful', user: { id: 'admin', email: ADMIN_EMAIL, username: 'admin', role: 'admin' } });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid email or password' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid email or password' });

    const token = signUserToken(user, 'user');
    res.cookie('token', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false, // set true behind HTTPS
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ message: 'Login successful', user: { id: user._id, email: user.email, username: user.username, role: 'user' } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Current user
app.get('/me', (req, res) => {
  const token = req.cookies?.token;
  if (!token) return res.status(200).json({ user: null });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    return res.json({ user: { id: payload.sub, email: payload.email, username: payload.username, role: payload.role || 'user' } });
  } catch (err) {
    return res.status(200).json({ user: null });
  }
});

// Admin endpoints
app.get('/admin/users', requireAuth, requireAdmin, async (_req, res) => {
  const users = await User.find({}, { username: 1, email: 1 }).lean();
  res.json({ users });
});

app.get('/admin/orders', requireAuth, requireAdmin, async (_req, res) => {
  const users = await User.find({}).lean();
  const allOrders = [];
  for (const u of users) {
    (u.orders || []).forEach((o) => {
      allOrders.push({
        orderId: o._id?.toString(),
        userId: u._id.toString(),
        username: u.username,
        email: u.email,
        status: o.status,
        createdAt: o.createdAt,
        subtotal: o.subtotal,
        deliveryFee: o.deliveryFee,
        grandTotal: o.grandTotal,
        customer: o.customer,
        items: o.items,
      });
    });
  }
  res.json({ orders: allOrders });
});

app.patch('/admin/orders/:orderId', requireAuth, requireAdmin, async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body || {};
  if (!['pending', 'canceled', 'delivered'].includes(status)) return res.status(400).json({ message: 'Invalid status' });

  const users = await User.find({});
  let updated = false;
  for (const u of users) {
    const order = u.orders.id(orderId);
    if (order) {
      order.status = status;
      await u.save();
      updated = true;
      break;
    }
  }
  if (!updated) return res.status(404).json({ message: 'Order not found' });
  res.json({ message: 'Order updated' });
});

app.post('/admin/products', requireAuth, requireAdmin, (req, res) => {
  const { name, slug, price, category, image } = req.body || {};
  if (!name || !slug || !price || !category || !image) return res.status(400).json({ message: 'Missing fields' });
  if (products.find((p) => p.slug === slug)) return res.status(400).json({ message: 'Slug already exists' });
  const nextId = `p${products.length + 1}`;
  const prod = { id: nextId, name, slug, price: Number(price), category, image };
  products.push(prod);
  res.status(201).json({ message: 'Product added', product: prod });
});

// Wishlist
app.get('/wishlist', requireAuth, async (req, res) => {
  const user = await User.findById(req.user.sub);
  const items = user.wishlist.map(id => products.find(p => p.id === id)).filter(Boolean);
  res.json({ items });
});

app.post('/wishlist/toggle', requireAuth, async (req, res) => {
  const { productId } = req.body;
  if (!productId) return res.status(400).json({ message: 'productId required' });
  const user = await User.findById(req.user.sub);
  const index = user.wishlist.indexOf(productId);
  if (index >= 0) user.wishlist.splice(index, 1); else user.wishlist.push(productId);
  await user.save();
  res.json({ wishlist: user.wishlist });
});

// Cart
app.get('/cart', requireAuth, async (req, res) => {
  const user = await User.findById(req.user.sub);
  const detailed = user.cart.map(ci => ({
    ...ci.toObject(),
    product: products.find(p => p.id === ci.productId) || null,
  }));
  res.json({ items: detailed });
});

app.post('/cart/add', requireAuth, async (req, res) => {
  const { productId, quantity = 1 } = req.body;
  if (!productId) return res.status(400).json({ message: 'productId required' });
  const user = await User.findById(req.user.sub);
  const existing = user.cart.find(ci => ci.productId === productId);
  if (existing) existing.quantity += Number(quantity);
  else user.cart.push({ productId, quantity: Number(quantity) });
  await user.save();
  res.json({ message: 'Added to cart', cart: user.cart });
});

app.post('/cart/update', requireAuth, async (req, res) => {
  const { productId, quantity } = req.body;
  if (!productId || typeof quantity !== 'number') return res.status(400).json({ message: 'productId and quantity required' });
  const user = await User.findById(req.user.sub);
  const existing = user.cart.find(ci => ci.productId === productId);
  if (!existing) return res.status(404).json({ message: 'Item not found' });
  if (quantity <= 0) {
    user.cart = user.cart.filter(ci => ci.productId !== productId);
  } else {
    existing.quantity = quantity;
  }
  await user.save();
  res.json({ message: 'Cart updated', cart: user.cart });
});

app.post('/cart/remove', requireAuth, async (req, res) => {
  const { productId } = req.body;
  if (!productId) return res.status(400).json({ message: 'productId required' });
  const user = await User.findById(req.user.sub);
  user.cart = user.cart.filter(ci => ci.productId !== productId);
  await user.save();
  res.json({ message: 'Item removed', cart: user.cart });
});

// Orders
app.get('/orders', requireAuth, async (req, res) => {
  const user = await User.findById(req.user.sub);
  res.json({ orders: user.orders });
});

app.post('/orders/checkout', requireAuth, async (req, res) => {
  const user = await User.findById(req.user.sub);
  const { name, email, address } = req.body || {};
  if (!name || !email || !address?.city || !address?.country) {
    return res.status(400).json({ message: 'name, email, city and country are required' });
  }
  if (user.cart.length === 0) return res.status(400).json({ message: 'Cart is empty' });

  const subtotal = user.cart.reduce((sum, ci) => {
    const prod = products.find(p => p.id === ci.productId);
    return sum + (prod ? prod.price * ci.quantity : 0);
  }, 0);

  const deliveryFee = cityFees[address.city] ?? 5.0;
  const grandTotal = subtotal + deliveryFee;

  user.orders.push({
    items: user.cart.map(ci => ({ productId: ci.productId, quantity: ci.quantity })),
    status: 'pending',
    subtotal,
    deliveryFee,
    grandTotal,
    customer: {
      name,
      email,
      address: {
        street: address?.street || '',
        city: address.city,
        country: address.country,
      },
    },
  });
  user.cart = [];
  await user.save();
  res.json({ message: 'Order placed', orders: user.orders });
});

// Logout
app.post('/logout', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    sameSite: 'lax',
    secure: false,
  });
  res.json({ message: 'Logged out' });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
