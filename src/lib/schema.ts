import { mysqlTable, varchar, text, float, int, datetime, boolean, timestamp } from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";

export const users = mysqlTable("users", {
    id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
    username: varchar("username", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    password: text("password").notNull(),
    wishlist: text("wishlist").notNull().default("[]"),
    cart: text("cart").notNull().default("[]"),
    role: varchar("role", { length: 20 }).notNull().default("user"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

export const categories = mysqlTable("categories", {
    id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
    name: varchar("name", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    description: text("description"),
    image: text("image"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

export const products = mysqlTable("products", {
    id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
    name: varchar("name", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    price: float("price").notNull(),
    image: text("image").notNull(),
    images: text("images").notNull().default("[]"),
    description: text("description"),
    discountPercentage: float("discount_percentage").notNull().default(0),
    stockQuantity: int("stock_quantity").notNull().default(0),
    isFeatured: boolean("is_featured").notNull().default(false),
    categoryId: varchar("category_id", { length: 36 }).notNull(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

export const orders = mysqlTable("orders", {
    id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
    items: text("items").notNull(),
    status: varchar("status", { length: 50 }).notNull().default("pending"),
    subtotal: float("subtotal").notNull(),
    deliveryFee: float("delivery_fee").notNull(),
    grandTotal: float("grand_total").notNull(),
    paymentMethod: varchar("payment_method", { length: 50 }).notNull(),
    customer: text("customer").notNull(),
    deliveredAt: timestamp("delivered_at"),
    userId: varchar("user_id", { length: 36 }).notNull(),
    createdAt: timestamp("created_at").defaultNow(),
});

export const returnRequests = mysqlTable("return_requests", {
    id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
    reason: text("reason").notNull(),
    description: text("description"),
    images: text("images").notNull(),
    status: varchar("status", { length: 50 }).notNull().default("pending"),
    adminNote: text("admin_note"),
    refundAmount: float("refund_amount"),
    refundMethod: varchar("refund_method", { length: 50 }),
    orderId: varchar("order_id", { length: 36 }).notNull().unique(),
    userId: varchar("user_id", { length: 36 }).notNull(),
    requestedAt: timestamp("requested_at").defaultNow(),
    processedAt: timestamp("processed_at"),
});

export const inquiries = mysqlTable("inquiries", {
    id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
    name: varchar("name", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    message: text("message").notNull(),
    status: varchar("status", { length: 50 }).notNull().default("pending"),
    adminResponse: text("admin_response"),
    respondedAt: timestamp("responded_at"),
    respondedBy: varchar("responded_by", { length: 255 }),
    createdAt: timestamp("created_at").defaultNow(),
});
