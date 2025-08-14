This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Database Connection

This application uses MongoDB Atlas with optimized connection pooling to prevent connection limit issues. The database connection is cached and reused across requests to minimize the number of concurrent connections to your MongoDB cluster.

### Connection Features:
- **Connection Pooling**: Maintains up to 10 socket connections
- **Connection Caching**: Reuses existing connections instead of creating new ones
- **Automatic Reconnection**: Handles connection failures gracefully
- **Connection Limits**: Prevents hitting MongoDB Atlas M0 cluster connection limits

## Email Functionality

This e-commerce application includes automated email notifications for order confirmations. The email system uses Nodemailer with Gmail SMTP.

### Features:
- **Order Confirmation Emails**: Automatically sent when customers complete checkout
- **Order Status Update Emails**: Sent when admin changes order status (pending → delivered/canceled)
- **Beautiful HTML Templates**: Professional-looking emails with order details
- **Gmail Integration**: Uses Gmail SMTP for reliable email delivery

### Testing:
You can test the email functionality from the admin dashboard:
1. Navigate to `/admin`
2. Click the "Test Email" button
3. Check your inbox for the test email

### Files:
- `src/lib/email.ts` - Email utility functions and templates
- `src/app/api/test-email/route.ts` - Test email API endpoint
- `src/app/api/orders/route.ts` - Updated to send emails on order creation
- `src/app/api/admin/orders/[orderId]/route.ts` - Updated to send status update emails

### Email Template Features:
- **Order Confirmation Emails**:
  - Responsive HTML design
  - Order details with product images
  - Pricing breakdown (subtotal, delivery fee, grand total)
  - Customer information and shipping address
  - Professional styling with gradients and modern design

- **Status Update Emails**:
  - Color-coded status badges (yellow for pending, green for delivered, red for canceled)
  - Status-specific messages and instructions
  - Order summary with key information
  - Professional styling matching confirmation emails
