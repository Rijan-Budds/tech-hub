-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE `categories` (
	`id` varchar(36) NOT NULL,
	`name` varchar(255) NOT NULL,
	`slug` varchar(255) NOT NULL,
	`description` text,
	`image` text,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `categories_id` PRIMARY KEY(`id`),
	CONSTRAINT `categories_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `inquiries` (
	`id` varchar(36) NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`status` varchar(50) NOT NULL DEFAULT 'pending',
	`admin_response` text,
	`responded_at` timestamp,
	`responded_by` varchar(255),
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `inquiries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` varchar(36) NOT NULL,
	`items` text NOT NULL,
	`status` varchar(50) NOT NULL DEFAULT 'pending',
	`subtotal` float NOT NULL,
	`delivery_fee` float NOT NULL,
	`grand_total` float NOT NULL,
	`payment_method` varchar(50) NOT NULL,
	`customer` text NOT NULL,
	`delivered_at` timestamp,
	`user_id` varchar(36) NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `orders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` varchar(36) NOT NULL,
	`name` varchar(255) NOT NULL,
	`slug` varchar(255) NOT NULL,
	`price` float NOT NULL,
	`image` text NOT NULL,
	`images` text NOT NULL DEFAULT ('[]'),
	`description` text,
	`discount_percentage` float NOT NULL DEFAULT 0,
	`stock_quantity` int NOT NULL DEFAULT 0,
	`is_featured` tinyint(1) NOT NULL DEFAULT 0,
	`category_id` varchar(36) NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `products_id` PRIMARY KEY(`id`),
	CONSTRAINT `products_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `return_requests` (
	`id` varchar(36) NOT NULL,
	`reason` text NOT NULL,
	`description` text,
	`images` text NOT NULL,
	`status` varchar(50) NOT NULL DEFAULT 'pending',
	`admin_note` text,
	`refund_amount` float,
	`refund_method` varchar(50),
	`order_id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`requested_at` timestamp DEFAULT (now()),
	`processed_at` timestamp,
	CONSTRAINT `return_requests_id` PRIMARY KEY(`id`),
	CONSTRAINT `return_requests_order_id_unique` UNIQUE(`order_id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` varchar(36) NOT NULL,
	`username` varchar(255) NOT NULL,
	`email` varchar(255) NOT NULL,
	`password` text NOT NULL,
	`wishlist` text NOT NULL DEFAULT ('[]'),
	`cart` text NOT NULL DEFAULT ('[]'),
	`role` varchar(20) NOT NULL DEFAULT 'user',
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`)
);

*/