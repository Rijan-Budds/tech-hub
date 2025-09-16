import nodemailer from "nodemailer";
import { IOrder, IReturnRequest } from "./firebase-models";
import { timestampToDate } from "./firebase-models";

// Validate email configuration
const GMAIL_USER = process.env.GMAIL_USER;
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;

if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
}

// Create transporter for Gmail
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: GMAIL_USER || "rijanmailsender@gmail.com",
    pass: GMAIL_APP_PASSWORD || "dkmu iaby adah zivk", // Your Gmail app password
  },
});

// Email template for order confirmation
const createOrderEmailTemplate = (order: IOrder, orderId: string) => {
  const itemsList = order.items
    .map(
      (item) =>
        `<tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">
        <img src="${item.image}" alt="${
          item.name
        }" style="width: 50px; height: 50px; object-fit: cover; border-radius: 5px;">
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${
        item.name
      }</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${
        item.quantity
      }</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">रु${(
        item.price || 0
      ).toFixed(2)}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">रु${(
        (item.price || 0) * item.quantity
      ).toFixed(2)}</td>
    </tr>`
    )
    .join("");

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Order Confirmation</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .order-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .order-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .order-table th { background: #f5f5f5; padding: 12px; text-align: left; border-bottom: 2px solid #ddd; }
        .order-table td { padding: 12px; border-bottom: 1px solid #eee; }
        .total-section { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .total-row { display: flex; justify-content: space-between; margin: 5px 0; }
        .grand-total { font-size: 18px; font-weight: bold; color: #667eea; border-top: 2px solid #ddd; padding-top: 10px; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        .thank-you { font-size: 24px; color: #667eea; margin-bottom: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Thank You for Your Order!</h1>
          <p>Order #${orderId}</p>
        </div>
        
        <div class="content">
          <div class="thank-you">Thank you for shopping with us!</div>
          
          <p>Dear ${order.customer.name},</p>
          
          <p>We're excited to confirm your order has been successfully placed. Here are the details:</p>
          
          <div class="order-details">
            <h3>Order Information</h3>
            <p><strong>Order ID:</strong> ${orderId}</p>
            <p><strong>Order Date:</strong> ${timestampToDate(
              order.createdAt
            ).toLocaleDateString()}</p>
            <p><strong>Status:</strong> <span style="color: #28a745; font-weight: bold;">${order.status.toUpperCase()}</span></p>
            ${
              order.paymentMethod
                ? `<p><strong>Payment Method:</strong> <span style="color: #667eea; font-weight: bold;">${order.paymentMethod.toUpperCase()}</span></p>`
                : ""
            }
            
            <h4>Shipping Address:</h4>
            <p>${order.customer.address.street}<br>
            ${order.customer.address.city}</p>
          </div>
          
          <div class="order-details">
            <h3>Order Items</h3>
            <table class="order-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th>Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsList}
              </tbody>
            </table>
            
            <div class="total-section">
              <div class="total-row">
                <span>Subtotal:</span>
                <span>रु${order.subtotal.toFixed(2)}</span>
              </div>
              <div class="total-row">
                <span>Delivery Fee:</span>
                <span>रु${order.deliveryFee.toFixed(2)}</span>
              </div>
              <div class="total-row grand-total">
                <span>Grand Total:</span>
                <span>रु${order.grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
          
          <p>We'll send you another email once your order ships. You can track your order status by logging into your account.</p>
          
          <p>If you have any questions, please don't hesitate to contact our customer support team.</p>
          
          <p>Best regards,<br>
          The E-commerce Team</p>
        </div>
        
        <div class="footer">
          <p>This email was sent to ${order.customer.email}</p>
          <p>&copy; 2024 E-commerce Store. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Function to send order confirmation email
export const sendOrderConfirmationEmail = async (
  order: IOrder,
  orderId: string
) => {
  try {
    const mailOptions = {
      from: GMAIL_USER || "rijanmailsender@gmail.com",
      to: order.customer.email,
      subject: `Order Confirmation - Order #${orderId}`,
      html: createOrderEmailTemplate(order, orderId),
    };

    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};

// Email template for order status updates
const createStatusUpdateEmailTemplate = (
  order: IOrder,
  orderId: string,
  newStatus: string
) => {
  const statusColors = {
    pending: "#ffc107",
    delivered: "#28a745",
    canceled: "#dc3545",
  };

  const statusMessages = {
    pending: "Your order is being processed",
    delivered: "Your order has been delivered!",
    canceled: "Your order has been canceled",
  };

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Order Status Update</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .status-badge { display: inline-block; padding: 8px 16px; border-radius: 20px; color: white; font-weight: bold; margin: 10px 0; }
        .order-summary { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📦 Order Status Update</h1>
          <p>Order #${orderId}</p>
        </div>
        
        <div class="content">
          <p>Dear ${order.customer.name},</p>
          
          <p>We wanted to let you know that your order status has been updated:</p>
          
          <div class="order-summary">
            <h3>Order Information</h3>
            <p><strong>Order ID:</strong> ${orderId}</p>
            <p><strong>Order Date:</strong> ${timestampToDate(
              order.createdAt
            ).toLocaleDateString()}</p>
            <p><strong>New Status:</strong> 
              <span class="status-badge" style="background-color: ${
                statusColors[newStatus as keyof typeof statusColors]
              }">
                ${newStatus.toUpperCase()}
              </span>
            </p>
            
            <h4>What this means:</h4>
            <p><strong>${
              statusMessages[newStatus as keyof typeof statusMessages]
            }</strong></p>
            
            ${
              newStatus === "delivered"
                ? `
            <p>🎉 Your order has been successfully delivered! Please check your delivery address and let us know if you have any questions.</p>
            `
                : newStatus === "canceled"
                ? `
            <p>We're sorry to inform you that your order has been canceled. If you have any questions about this cancellation, please contact our customer support team.</p>
            `
                : `
            <p>We're currently processing your order and will keep you updated on any further status changes.</p>
            `
            }
          </div>
          
             <div class="order-summary">
             <h3>Order Summary</h3>
             <p><strong>Total Items:</strong> ${order.items.length}</p>
             <p><strong>Grand Total:</strong> रु${order.grandTotal.toFixed(
               2
             )}</p>
             <p><strong>Shipping Address:</strong> ${
               order.customer.address.street
             }, ${order.customer.address.city}</p>
           </div>
          
          <p>You can track your order status by logging into your account.</p>
          
          <p>If you have any questions, please don't hesitate to contact our customer support team.</p>
          
          <p>Best regards,<br>
          The E-commerce Team</p>
        </div>
        
        <div class="footer">
          <p>This email was sent to ${order.customer.email}</p>
          <p>&copy; 2024 E-commerce Store. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Function to send order status update email
export const sendOrderStatusUpdateEmail = async (
  order: IOrder,
  orderId: string,
  newStatus: string
) => {
  try {
    const mailOptions = {
      from: GMAIL_USER || "rijanmailsender@gmail.com",
      to: order.customer.email,
      subject: `Order Status Update - ${newStatus.toUpperCase()} - Order #${orderId}`,
      html: createStatusUpdateEmailTemplate(order, orderId, newStatus),
    };

    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};

// Return request email template
const createReturnRequestEmailTemplate = (
  returnRequest: IReturnRequest,
  order: IOrder,
  type: "submitted" | "approved" | "rejected" | "completed" | "refunded"
) => {
  const getReasonText = (reason: string) => {
    switch (reason) {
      case "damaged":
        return "Item was damaged";
      case "wrong-item":
        return "Wrong item received";
      case "size-issue":
        return "Size/fit issue";
      case "defective":
        return "Item is defective";
      case "not-as-described":
        return "Not as described";
      case "other":
        return "Other reason";
      default:
        return reason;
    }
  };

  const statusColors = {
    submitted: "#ffc107",
    approved: "#28a745",
    rejected: "#dc3545",
    completed: "#17a2b8",
    refunded: "#6f42c1",
  };

  const statusMessages = {
    submitted: "Your return request has been submitted and is under review.",
    approved: "Great news! Your return request has been approved.",
    rejected: "We're sorry, but your return request has been declined.",
    completed: "Your return has been processed successfully.",
    refunded:
      "Your refund has been processed and will appear in your account soon.",
  };

  const icons = {
    submitted: "📝",
    approved: "✅",
    rejected: "❌",
    completed: "📦",
    refunded: "💰",
  };

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Return Request ${
        type.charAt(0).toUpperCase() + type.slice(1)
      }</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #ff7b54 0%, #ff416c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .status-badge { display: inline-block; padding: 8px 16px; border-radius: 20px; color: white; font-weight: bold; margin: 10px 0; }
        .return-summary { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .items-list { background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 10px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        .highlight { color: #ff416c; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${icons[type]} Return Request ${
    type.charAt(0).toUpperCase() + type.slice(1)
  }</h1>
          <p>Return Request #${returnRequest.id?.slice(-8).toUpperCase()}</p>
        </div>
        
        <div class="content">
          <p>Dear ${order.customer.name},</p>
          
          <p>${statusMessages[type]}</p>
          
          <div class="return-summary">
            <h3>Return Request Details</h3>
            <p><strong>Return Request ID:</strong> ${returnRequest.id
              ?.slice(-8)
              .toUpperCase()}</p>
            <p><strong>Original Order:</strong> #${order.id
              ?.slice(-8)
              .toUpperCase()}</p>
            <p><strong>Request Date:</strong> ${timestampToDate(
              returnRequest.requestedAt
            ).toLocaleDateString()}</p>
            <p><strong>Status:</strong> 
              <span class="status-badge" style="background-color: ${
                statusColors[type]
              }">
                ${type.toUpperCase()}
              </span>
            </p>
            <p><strong>Reason:</strong> ${getReasonText(
              returnRequest.reason
            )}</p>
            ${
              returnRequest.description
                ? `<p><strong>Description:</strong> ${returnRequest.description}</p>`
                : ""
            }
            
            <h4>Items Being Returned:</h4>
            <div class="items-list">
              ${returnRequest.items
                .map(
                  (item) =>
                    `<div style="margin: 10px 0; padding: 10px; border: 1px solid #dee2e6; border-radius: 5px;">
                  <strong>${
                    item.name || `Product #${item.productId.slice(-6)}`
                  }</strong><br>
                  Quantity: ${item.quantity}${
                      item.price
                        ? ` • রু${(item.price * item.quantity).toFixed(2)}`
                        : ""
                    }
                </div>`
                )
                .join("")}
            </div>
            
            ${
              returnRequest.adminNote
                ? `
            <div style="background: #e3f2fd; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #2196f3;">
              <h5 style="margin: 0 0 5px 0; color: #1976d2;">Admin Note:</h5>
              <p style="margin: 0;">${returnRequest.adminNote}</p>
            </div>
            `
                : ""
            }
            
            ${
              type === "refunded" && returnRequest.refundAmount
                ? `
            <div style="background: #e8f5e8; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #4caf50;">
              <h5 style="margin: 0 0 5px 0; color: #388e3c;">Refund Information:</h5>
              <p style="margin: 0;"><strong>Refund Amount:</strong> <span class="highlight">রু${returnRequest.refundAmount.toFixed(
                2
              )}</span></p>
              <p style="margin: 5px 0 0 0;">The refund will be processed to your original payment method within 3-5 business days.</p>
            </div>
            `
                : ""
            }
          </div>
          
          ${
            type === "submitted"
              ? `
          <p>We'll review your return request and get back to you within 1-2 business days. You'll receive another email once we've made a decision.</p>
          `
              : type === "approved"
              ? `
          <p>Please follow these next steps:</p>
          <ol>
            <li>Package the items securely in their original packaging (if possible)</li>
            <li>Include a copy of this email or the return request ID</li>
            <li>We'll contact you with return shipping instructions</li>
          </ol>
          `
              : type === "rejected"
              ? `
          <p>If you have any questions about this decision or would like to discuss your return, please contact our customer support team.</p>
          `
              : type === "completed"
              ? `
          <p>We've received and processed your returned items. If you selected a refund, it will be processed to your original payment method.</p>
          `
              : `
          <p>Thank you for choosing us. We appreciate your business and hope to serve you again soon.</p>
          `
          }
          
          <p>You can track your return request status by logging into your account.</p>
          
          <p>If you have any questions, please don't hesitate to contact our customer support team.</p>
          
          <p>Best regards,<br>
          The E-commerce Team</p>
        </div>
        
        <div class="footer">
          <p>This email was sent to ${order.customer.email}</p>
          <p>&copy; 2024 E-commerce Store. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Function to send return request status email
export const sendReturnRequestEmail = async (
  returnRequest: IReturnRequest,
  order: IOrder,
  type: "submitted" | "approved" | "rejected" | "completed" | "refunded"
) => {
  try {
    const subjects = {
      submitted: "Return Request Submitted",
      approved: "Return Request Approved",
      rejected: "Return Request Declined",
      completed: "Return Processed Successfully",
      refunded: "Refund Processed",
    };

    const mailOptions = {
      from: GMAIL_USER || "rijanmailsender@gmail.com",
      to: order.customer.email,
      subject: `${subjects[type]} - Return #${returnRequest.id
        ?.slice(-8)
        .toUpperCase()}`,
      html: createReturnRequestEmailTemplate(returnRequest, order, type),
    };

    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};

// Function to test email configuration
export const testEmailConnection = async () => {
  try {
    await transporter.verify();
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};
