# Tech-Hub E-Commerce Platform

A high-performance, modern e-commerce platform built with Next.js, Drizzle ORM, and MySQL.

## 🚀 Local Setup Guide

Follow these steps to get the project running on a new device:

1.  **Clone the Repository**:
    ```bash
    git clone <repository-url>
    cd tech-hub
    ```
2.  **Install Dependencies**:
    ```bash
    npm install
    ```
3.  **Environment Setup**:
    Create a `.env` file in the root with:
    ```env
    DATABASE_URL="mysql://user:password@localhost:3306/ecommerce"
    JWT_SECRET="your-secret-key"
    GMAIL_USER="your-email@gmail.com"
    GMAIL_APP_PASSWORD="your-google-app-password"
    ```
4.  **Database Sync**:
    Ensure MySQL is running and the database exists, then run:
    ```bash
    npx drizzle-kit push
    ```
5.  **Start the App**:
    ```bash
    npm run dev
    ```

## 🏗️ System Architecture

The platform follows a modern full-stack architecture with a focus on type safety, performance, and scalability.

```mermaid
graph TD
    User([User/Browser]) <--> NextJS[Next.js App Router]
    NextJS <--> API[API Routes / Server Components]
    API <--> Drizzle[Drizzle ORM]
    Drizzle <--> MySQL[(MySQL Database)]
    API <--> Storage[Local File Storage /uploads]
    API <--> Email[Nodemailer / Gmail SMTP]
```

### Tech Stack
- **Frontend**: Next.js 15 (App Router), Tailwind CSS, Framer Motion, Lucide Icons.
- **Backend**: Next.js API Routes (Node.js runtime).
- **ORM**: Drizzle ORM (TypeScript-first).
- **Database**: MySQL.
- **Authentication**: JWT (JSON Web Tokens) with `httpOnly` cookies.
- **File Storage**: Local filesystem (`public/uploads`).
- **Payments**: Integrated with Khalti and eSewa (Legacy support for COD).

---

## 📊 Data Schema & Relationships

The database schema is designed for efficiency and relational integrity.

```mermaid
erDiagram
    USERS ||--o{ ORDERS : places
    USERS ||--o{ RETURN_REQUESTS : submits
    CATEGORIES ||--o{ PRODUCTS : categorizes
    ORDERS ||--|| RETURN_REQUESTS : references
    PRODUCTS }|--o{ ORDER_ITEMS : contains
```

### Table Definitions

| Table | Purpose | Key Fields |
| :--- | :--- | :--- |
| **`users`** | Identity management | `id`, `email`, `password`, `role`, `cart`, `wishlist` |
| **`categories`** | Product categorization | `id`, `name`, `slug`, `image` |
| **`products`** | Main product catalog | `id`, `name`, `price`, `stock_quantity`, `category_id` |
| **`orders`** | Transaction records | `id`, `user_id`, `items` (JSON), `grand_total`, `status` |
| **`return_requests`** | Post-purchase logic | `id`, `order_id`, `status`, `reason` |
| **`inquiries`** | Customer support | `id`, `name`, `email`, `message`, `status` |

---

## 🔄 Core CRUD Operations

### Products Management
- **Create (Admin)**: `POST /api/admin/products`. Handles base64 image processing, slug generation, and category association.
- **Read (Public)**: `GET /api/products`. includes pagination, search filtering, and category sorting.
- **Update (Admin)**: `PATCH /api/admin/products/[slug]`. Allows partial updates to stock, price, and details.
- **Delete (Admin)**: `DELETE /api/admin/products/[slug]`. Removes product and associated metadata.

### Order Processing Flow
1. **Initiate**: Client sends cart data to `POST /api/orders`.
2. **Validate**: Server checks stock availability for all items.
3. **Transaction**:
    - Deduct stock from `products` table.
    - Create record in `orders` table.
    - Clear user's `cart` field in `users` table.
4. **Notify**: Trigger Nodemailer to send HTML confirmation email.

---

## 🧩 Complex Algorithms & Logic

### 1. Atomic Transactional Checkout
To prevent overselling, the checkout process uses an atomic database transaction.

```typescript
await db.transaction(async (tx) => {
  // 1. Verify stock for ALL items
  // 2. If any item is out of stock, tx.rollback()
  // 3. CreateOrder()
  // 4. UpdateStock() for each product
  // 5. ClearCart()
});
```

### 2. Intelligent Slug Generation
Ensures SEO-friendly, unique URLs even when products have identical names.
- **Logic**: Slugs are generated from the name. If a collision is detected in the database, a counter is appended (e.g., `iphone-15`, `iphone-15-1`).

### 3. Base64 Image Processing
Optimizes the administrative workflow by allowing direct image uploads via data URLs.
- **Workflow**:
    - Receive Base64 string.
    - Validate MIME type (PNG, JPEG, WEBP).
    - Generate unique UUID filename.
    - Store in year/month partitioned directories (e.g., `public/uploads/2025/12/xyz.jpg`).
    - Return relative public URL.

---

## 🔐 Security & Middleware
- **JWT Authentication**: Secure tokens signed with `jose` and stored in `SameSite=Lax`, `HttpOnly` cookies.
- **Admin Middleware**: Intercepts requests to `/admin/*` and verifies user role from the decrypted payload.
- **Input Sanitization**: Drizzle ORM prevents SQL injection through parameterized queries.
- **XSS Protection**: Next.js automatically escapes data rendered in the UI.

---

## 📁 Project Structure
- `/src/app/api`: Serverless API routes.
- `/src/lib/schema.ts`: Drizzle schema source of truth.
- `/src/components`: UI components (Atomic design).
- `/public/uploads`: Static storage for product assets.
- `/drizzle`: Migration files.
