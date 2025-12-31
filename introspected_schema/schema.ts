import { mysqlTable, mysqlSchema, AnyMySqlColumn, primaryKey, unique, varchar, text, timestamp, float, int } from "drizzle-orm/mysql-core"
import { sql } from "drizzle-orm"

export const categories = mysqlTable("categories", {
	id: varchar({ length: 36 }).notNull(),
	name: varchar({ length: 255 }).notNull(),
	slug: varchar({ length: 255 }).notNull(),
	description: text(),
	image: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`(now())`).onUpdateNow(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "categories_id"}),
	unique("categories_slug_unique").on(table.slug),
]);

export const inquiries = mysqlTable("inquiries", {
	id: varchar({ length: 36 }).notNull(),
	name: varchar({ length: 255 }).notNull(),
	email: varchar({ length: 255 }).notNull(),
	message: text().notNull(),
	status: varchar({ length: 50 }).default('pending').notNull(),
	adminResponse: text("admin_response"),
	respondedAt: timestamp("responded_at", { mode: 'string' }),
	respondedBy: varchar("responded_by", { length: 255 }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`),
},
(table) => [
	primaryKey({ columns: [table.id], name: "inquiries_id"}),
]);

export const orders = mysqlTable("orders", {
	id: varchar({ length: 36 }).notNull(),
	items: text().notNull(),
	status: varchar({ length: 50 }).default('pending').notNull(),
	subtotal: float().notNull(),
	deliveryFee: float("delivery_fee").notNull(),
	grandTotal: float("grand_total").notNull(),
	paymentMethod: varchar("payment_method", { length: 50 }).notNull(),
	customer: text().notNull(),
	deliveredAt: timestamp("delivered_at", { mode: 'string' }),
	userId: varchar("user_id", { length: 36 }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`),
},
(table) => [
	primaryKey({ columns: [table.id], name: "orders_id"}),
]);

export const products = mysqlTable("products", {
	id: varchar({ length: 36 }).notNull(),
	name: varchar({ length: 255 }).notNull(),
	slug: varchar({ length: 255 }).notNull(),
	price: float().notNull(),
	image: text().notNull(),
	images: text().default(sql`('[]')`).notNull(),
	description: text(),
	discountPercentage: float("discount_percentage").notNull(),
	stockQuantity: int("stock_quantity").default(0).notNull(),
	isFeatured: tinyint("is_featured").default(0).notNull(),
	categoryId: varchar("category_id", { length: 36 }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`(now())`).onUpdateNow(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "products_id"}),
	unique("products_slug_unique").on(table.slug),
]);

export const returnRequests = mysqlTable("return_requests", {
	id: varchar({ length: 36 }).notNull(),
	reason: text().notNull(),
	description: text(),
	images: text().notNull(),
	status: varchar({ length: 50 }).default('pending').notNull(),
	adminNote: text("admin_note"),
	refundAmount: float("refund_amount"),
	refundMethod: varchar("refund_method", { length: 50 }),
	orderId: varchar("order_id", { length: 36 }).notNull(),
	userId: varchar("user_id", { length: 36 }).notNull(),
	requestedAt: timestamp("requested_at", { mode: 'string' }).default(sql`(now())`),
	processedAt: timestamp("processed_at", { mode: 'string' }),
},
(table) => [
	primaryKey({ columns: [table.id], name: "return_requests_id"}),
	unique("return_requests_order_id_unique").on(table.orderId),
]);

export const users = mysqlTable("users", {
	id: varchar({ length: 36 }).notNull(),
	username: varchar({ length: 255 }).notNull(),
	email: varchar({ length: 255 }).notNull(),
	password: text().notNull(),
	wishlist: text().default(sql`('[]')`).notNull(),
	cart: text().default(sql`('[]')`).notNull(),
	role: varchar({ length: 20 }).default('user').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`(now())`).onUpdateNow(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "users_id"}),
	unique("users_email_unique").on(table.email),
]);
