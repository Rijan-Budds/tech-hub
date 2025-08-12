import mongoose, { Schema } from "mongoose";

// Product
const ProductSchema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    image: { type: String, required: true },
  },
  { timestamps: true }
);

export const Product =
  mongoose.models.Product || mongoose.model("Product", ProductSchema);

// User + embedded orders/cart
const CartItemSchema = new Schema({
  productId: { type: String, required: true },
  quantity: { type: Number, required: true, default: 1 },
});

const OrderItemSchema = new Schema({
  productId: { type: String, required: true },
  quantity: { type: Number, required: true },
  name: String,
  image: String,
  price: Number,
});

const OrderSchema = new Schema({
  items: [OrderItemSchema],
  createdAt: { type: Date, default: Date.now },
  status: { type: String, enum: ["pending", "canceled", "delivered"], default: "pending" },
  subtotal: { type: Number, default: 0 },
  deliveryFee: { type: Number, default: 0 },
  grandTotal: { type: Number, default: 0 },
  customer: {
    name: String,
    email: String,
    address: { street: String, city: String },
  },
});

const UserSchema = new Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  wishlist: { type: [String], default: [] },
  cart: { type: [CartItemSchema], default: [] },
  orders: { type: [OrderSchema], default: [] },
});

export const User = mongoose.models.User || mongoose.model("User", UserSchema);


