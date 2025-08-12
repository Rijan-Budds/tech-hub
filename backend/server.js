import express from "express";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import cors from "cors"; // import cors
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import multer from "multer";
import path from "path";
import fs from "fs";
import { config } from "dotenv";
import { fileURLToPath } from "url";

config();

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

// Ensure uploads directory exists and is served statically
const uploadDir = path.resolve("uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
app.use("/uploads", express.static(uploadDir));

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname || "");
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype || !file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed"));
    }
    cb(null, true);
  },
});

// MongoDB connection - you can use MongoDB Atlas or local MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://rijanbuddhacharya:Rijan123@rijan.cmzjbaa.mongodb.net/ecommerce?retryWrites=true&w=majority&appName=Rijan';

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
  // Snapshot of product at time of order
  name: { type: String },
  image: { type: String },
  price: { type: Number },
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

// Products: switch from file-based storage to MongoDB model
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    image: { type: String, required: true },
  },
  { timestamps: true }
);

const Product = mongoose.model('Product', productSchema);

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

// Helper: slugify string and ensure uniqueness
function slugify(text) {
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function generateUniqueSlugFromName(name) {
  const base = slugify(name || 'item');
  let candidate = base || 'item';
  let counter = 2;
  // Ensure slug uniqueness against the database
  // eslint-disable-next-line no-constant-condition
  while (true) {
    // eslint-disable-next-line no-await-in-loop
    const exists = await Product.exists({ slug: candidate });
    if (!exists) return candidate;
    candidate = `${base}-${counter++}`;
  }
}

function escapeRegex(str = '') {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function mapProduct(doc) {
  if (!doc) return null;
  return {
    id: doc._id.toString(),
    slug: doc.slug,
    name: doc.name,
    price: doc.price,
    category: doc.category,
    image: doc.image,
  };
}

app.get('/products', async (req, res) => {
  try {
    const { category } = req.query;
    let query = {};
    if (category) {
      query = { category: { $regex: `^${escapeRegex(String(category))}$`, $options: 'i' } };
    }
    const docs = await Product.find(query).lean();
    res.json({ products: docs.map((d) => mapProduct(d)) });
  } catch (err) {
    console.error('GET /products error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Product search by name, slug, or category (case-insensitive)
app.get('/search', async (req, res) => {
  const q = (req.query.q || '').toString().trim();
  if (!q) return res.json({ products: [] });
  try {
    const regex = new RegExp(escapeRegex(q), 'i');
    const docs = await Product.find({
      $or: [{ name: regex }, { slug: regex }, { category: regex }],
    }).lean();
    res.json({ products: docs.map((d) => mapProduct(d)) });
  } catch (err) {
    console.error('GET /search error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/products/:slug', async (req, res) => {
  try {
    const doc = await Product.findOne({ slug: req.params.slug }).lean();
    if (!doc) return res.status(404).json({ message: 'Not found' });
    res.json({ product: mapProduct(doc) });
  } catch (err) {
    console.error('GET /products/:slug error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Shipping cities endpoint
app.get('/shipping/cities', (_req, res) => {
  res.json({ cities: Object.keys(cityFees).map((name) => ({ name, fee: cityFees[name] })) })
});

// Image upload endpoint
app.post('/upload', requireAuth, requireAdmin, (req, res, next) => {
  upload.single('image')(req, res, function (err) {
    if (err) {
      return res.status(400).json({ message: err.message || 'Upload error' });
    }
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    const publicUrl = `/uploads/${req.file.filename}`;
    // Provide absolute URL for convenience on the frontend
    const absoluteUrl = `${req.protocol}://${req.get('host')}${publicUrl}`;
    return res.status(201).json({ url: absoluteUrl, path: publicUrl });
  });
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

app.delete('/admin/users/:userId', requireAuth, requireAdmin, async (req, res) => {
  const { userId } = req.params;
  // Prevent deleting the hard-coded admin
  if (!userId || userId === 'admin') {
    return res.status(400).json({ message: 'Invalid userId' });
  }
  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ message: 'User not found' });
  await User.deleteOne({ _id: userId });
  return res.json({ message: 'User deleted' });
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

// Admin delete order
app.delete('/admin/orders/:orderId', requireAuth, requireAdmin, async (req, res) => {
  const { orderId } = req.params;
  try {
    const users = await User.find({});
    let removed = false;
    for (const u of users) {
      const order = u.orders.id(orderId);
      if (order) {
        // Remove the subdocument and save
        order.deleteOne();
        await u.save();
        removed = true;
        break;
      }
    }
    if (!removed) return res.status(404).json({ message: 'Order not found' });
    res.json({ message: 'Order deleted' });
  } catch (err) {
    console.error('DELETE /admin/orders/:orderId error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/admin/products', requireAuth, requireAdmin, async (req, res) => {
  const { name, slug: incomingSlug, price, category, image } = req.body || {};
  if (!name || price == null || !category || !image) {
    return res.status(400).json({ message: 'Missing fields' });
  }
  try {
    // Enforce unique product name (case-insensitive)
    const existingByName = await Product.findOne({ name: { $regex: `^${escapeRegex(String(name).trim())}$`, $options: 'i' } });
    if (existingByName) return res.status(400).json({ message: 'Product name already exists' });

    let slug = (incomingSlug || '').toString().trim();
    if (!slug) {
      slug = await generateUniqueSlugFromName(name);
    } else {
      slug = slugify(slug);
      const conflict = await Product.exists({ slug });
      if (conflict) slug = await generateUniqueSlugFromName(name);
    }

    const created = await Product.create({
      name: String(name).trim(),
      slug,
      price: Number(price),
      category: String(category).toLowerCase().trim(),
      image: String(image).trim(),
    });
    res.status(201).json({ message: 'Product added', product: mapProduct(created) });
  } catch (err) {
    console.error('POST /admin/products error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin update product (by slug)
app.patch('/admin/products/:slug', requireAuth, requireAdmin, async (req, res) => {
  const { slug } = req.params;
  const { name, price, category, image } = req.body || {};
  try {
    const doc = await Product.findOne({ slug });
    if (!doc) return res.status(404).json({ message: 'Product not found' });

    // If name changes, ensure uniqueness (case-insensitive)
    if (name != null && String(name).trim().toLowerCase() !== doc.name.trim().toLowerCase()) {
      const existingByName = await Product.findOne({ name: { $regex: `^${escapeRegex(String(name).trim())}$`, $options: 'i' } });
      if (existingByName && existingByName._id.toString() !== doc._id.toString()) {
        return res.status(400).json({ message: 'Product name already exists' });
      }
    }

    if (name != null) doc.name = String(name).trim();
    if (price != null) doc.price = Number(price);
    if (category != null) doc.category = String(category).toLowerCase().trim();
    if (image != null) doc.image = String(image).trim();

    await doc.save();
    res.json({ message: 'Product updated', product: mapProduct(doc) });
  } catch (err) {
    console.error('PATCH /admin/products/:slug error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin delete product (by slug)
app.delete('/admin/products/:slug', requireAuth, requireAdmin, async (req, res) => {
  const { slug } = req.params;
  try {
    const product = await Product.findOne({ slug });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    const productIdStr = product._id.toString();
    await Product.deleteOne({ _id: product._id });

    // Remove from users' carts and wishlists to avoid dangling references
    try {
      const users = await User.find({});
      for (const u of users) {
        u.cart = u.cart.filter((ci) => ci.productId !== productIdStr);
        u.wishlist = u.wishlist.filter((pid) => pid !== productIdStr);
        // Save only if modified
        await u.save();
      }
    } catch (e) {
      console.error('Failed to cascade delete from users:', e);
    }
    res.json({ message: 'Product deleted' });
  } catch (err) {
    console.error('DELETE /admin/products/:slug error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Wishlist
app.get('/wishlist', requireAuth, async (req, res) => {
  try {
    // Admin does not have a user document; return empty wishlist for admin
    if (req.user?.role === 'admin') {
      return res.json({ items: [] });
    }
    const user = await User.findById(req.user.sub);
    if (!user) return res.json({ items: [] });
    const ids = (user.wishlist || []).filter(Boolean).filter((id) => mongoose.Types.ObjectId.isValid(id)).map((id) => new mongoose.Types.ObjectId(id));
    if (ids.length === 0) return res.json({ items: [] });
    const docs = await Product.find({ _id: { $in: ids } }).lean();
    res.json({ items: docs.map((d) => mapProduct(d)) });
  } catch (err) {
    console.error('GET /wishlist error:', err);
    res.status(500).json({ message: 'Server error' });
  }
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
  try {
    const user = await User.findById(req.user.sub);
    const ids = (user.cart || [])
      .map((ci) => ci.productId)
      .filter(Boolean)
      .filter((id) => mongoose.Types.ObjectId.isValid(id))
      .map((id) => new mongoose.Types.ObjectId(id));
    const docs = ids.length ? await Product.find({ _id: { $in: ids } }).lean() : [];
    const map = new Map(docs.map((d) => [d._id.toString(), mapProduct(d)]));
    const detailed = user.cart.map((ci) => ({
      ...ci.toObject(),
      product: map.get(ci.productId) || null,
    }));
    res.json({ items: detailed });
  } catch (err) {
    console.error('GET /cart error:', err);
    res.status(500).json({ message: 'Server error' });
  }
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
  try {
    // Admin does not have a user document; return empty orders for admin
    if (req.user?.role === 'admin') {
      return res.json({ orders: [] });
    }
    const user = await User.findById(req.user.sub);
    if (!user) return res.json({ orders: [] });
    res.json({ orders: user.orders });
  } catch (err) {
    console.error('GET /orders error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/orders/checkout', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.sub);
    const { name, email, address } = req.body || {};
    if (!name || !email || !address?.city) {
      return res.status(400).json({ message: 'name, email, city are required' });
    }
    if (user.cart.length === 0) return res.status(400).json({ message: 'Cart is empty' });

    const ids = (user.cart || [])
      .map((ci) => ci.productId)
      .filter(Boolean)
      .filter((id) => mongoose.Types.ObjectId.isValid(id))
      .map((id) => new mongoose.Types.ObjectId(id));
  const docs = ids.length ? await Product.find({ _id: { $in: ids } }).lean() : [];
  const productMap = new Map(docs.map((d) => [d._id.toString(), { price: d.price, name: d.name, image: d.image }]));
    const subtotal = user.cart.reduce((sum, ci) => {
    const price = productMap.get(ci.productId)?.price || 0;
      return sum + price * ci.quantity;
    }, 0);

    const deliveryFee = cityFees[address.city] ?? 5.0;
    const grandTotal = subtotal + deliveryFee;

    user.orders.push({
      items: user.cart.map((ci) => ({
        productId: ci.productId,
        quantity: ci.quantity,
        name: productMap.get(ci.productId)?.name,
        image: productMap.get(ci.productId)?.image,
        price: productMap.get(ci.productId)?.price,
      })),
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
        },
      },
    });
    user.cart = [];
    await user.save();
    res.json({ message: 'Order placed', orders: user.orders });
  } catch (err) {
    console.error('POST /orders/checkout error:', err);
    res.status(500).json({ message: 'Server error' });
  }
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
