import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

// eSewa Configuration
const ESEWA_CONFIG = {
  merchantId: process.env.ESEWA_MERCHANT_ID || 'EPAYTEST',
  serviceCode: process.env.ESEWA_SERVICE_CODE || 'EPAYTEST',
  secretKey: process.env.ESEWA_SECRET_KEY || '8gBm/:&EnhH.1/q',
  environment: process.env.NODE_ENV === 'production' ? 'production' : 'test'
};

// Payment URLs based on environment
const PAYMENT_URLS = {
  test: 'https://rc-epay.esewa.com.np/api/epay/main/v2/form',
  production: 'https://esewa.com.np/epay/main'
};

interface PaymentInitiateRequest {
  amount: number;
  productName: string;
  orderId: string;
  customerName?: string;
  customerEmail?: string;
  customerAddress?: string;
}

interface PaymentInitiateResponse {
  success: boolean;
  paymentUrl: string;
  transactionId: string;
  amount: number;
  taxAmount: number;
  totalAmount: number;
  signature: string;
  message?: string;
  error?: string;
}

// Generate HMAC-SHA256 signature
function generateSignature(data: Record<string, string | number>): string {
  const sortedKeys = Object.keys(data).sort();
  const signatureString = sortedKeys
    .map(key => `${key}=${data[key]}`)
    .join(',');
  
  return crypto
    .createHmac('sha256', ESEWA_CONFIG.secretKey)
    .update(signatureString)
    .digest('hex');
}

// Validate payment request
function validatePaymentRequest(data: PaymentInitiateRequest): { valid: boolean; error?: string } {
  if (!data.amount || data.amount <= 0) {
    return { valid: false, error: 'Invalid amount' };
  }
  
  if (!data.productName || data.productName.trim().length === 0) {
    return { valid: false, error: 'Product name is required' };
  }
  
  if (!data.orderId || data.orderId.trim().length === 0) {
    return { valid: false, error: 'Order ID is required' };
  }
  
  if (data.amount > 1000000) { // 10 lakh limit
    return { valid: false, error: 'Amount exceeds maximum limit' };
  }
  
  return { valid: true };
}

export async function POST(req: NextRequest) {
  try {
    const body: PaymentInitiateRequest = await req.json();
    
    // Validate request
    const validation = validatePaymentRequest(body);
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }
    
    // Calculate amounts (13% VAT for Nepal)
    const amount = Math.round(body.amount * 100); // Convert to paisa
    const taxAmount = Math.round(amount * 0.13); // 13% VAT
    const totalAmount = amount + taxAmount;
    
    // Generate unique transaction ID
    const transactionId = `TXN_${uuidv4().replace(/-/g, '').toUpperCase()}`;
    
    // Create payment parameters
    const paymentParams = {
      amount: amount.toString(),
      taxAmount: taxAmount.toString(),
      totalAmount: totalAmount.toString(),
      transactionId,
      productCode: 'ECOMMERCE',
      productName: body.productName,
      productServiceCharge: '0',
      productDeliveryCharge: '0',
      successUrl: `${req.nextUrl.origin}/payment/success?orderId=${body.orderId}&transactionId=${transactionId}`,
      failureUrl: `${req.nextUrl.origin}/payment/failure?orderId=${body.orderId}&transactionId=${transactionId}`,
      merchantId: ESEWA_CONFIG.merchantId,
      serviceCode: ESEWA_CONFIG.serviceCode
    };
    
    // Generate HMAC signature
    const signature = generateSignature(paymentParams);
    
    // Get payment URL based on environment
    const paymentUrl = PAYMENT_URLS[ESEWA_CONFIG.environment as keyof typeof PAYMENT_URLS];
    
    // Log payment initiation (for debugging)
    console.log('Payment initiated:', {
      orderId: body.orderId,
      transactionId,
      amount: body.amount,
      totalAmount: totalAmount / 100,
      environment: ESEWA_CONFIG.environment
    });
    
    const response: PaymentInitiateResponse = {
      success: true,
      paymentUrl,
      transactionId,
      amount: body.amount,
      taxAmount: body.amount * 0.13,
      totalAmount: body.amount * 1.13,
      signature,
      message: 'Payment request created successfully'
    };
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Error initiating payment:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to initiate payment',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET method for testing
export async function GET(req: NextRequest) {
  return NextResponse.json({
    success: false,
    error: 'GET method not allowed. Use POST to initiate payment.'
  }, { status: 405 });
}