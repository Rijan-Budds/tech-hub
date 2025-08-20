import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// eSewa Configuration
const ESEWA_CONFIG = {
  merchantId: process.env.ESEWA_MERCHANT_ID || 'EPAYTEST',
  serviceCode: process.env.ESEWA_SERVICE_CODE || 'EPAYTEST',
  secretKey: process.env.ESEWA_SECRET_KEY || '8gBm/:&EnhH.1/q',
  environment: process.env.NODE_ENV === 'production' ? 'production' : 'test'
};

interface PaymentFailureRequest {
  transactionId: string;
  orderId: string;
  errorCode: string;
  errorMessage: string;
  signature: string;
}

interface PaymentFailureResponse {
  success: boolean;
  transactionId?: string;
  orderId?: string;
  errorCode?: string;
  errorMessage?: string;
  redirectUrl?: string;
}

// Verify HMAC-SHA256 signature
function verifySignature(data: Record<string, string | number>, signature: string): boolean {
  const sortedKeys = Object.keys(data).sort();
  const signatureString = sortedKeys
    .map(key => `${key}=${data[key]}`)
    .join(',');
  
  const expectedSignature = crypto
    .createHmac('sha256', ESEWA_CONFIG.secretKey)
    .update(signatureString)
    .digest('hex');
  
  return signature === expectedSignature;
}

// Log failed payment
async function logFailedPayment(orderId: string, transactionId: string, errorCode: string, errorMessage: string): Promise<boolean> {
  try {
    // Here you would typically:
    // 1. Log the failed payment in your database
    // 2. Update order status to 'PAYMENT_FAILED'
    // 3. Send notification to admin
    // 4. Keep the order available for retry
    
    console.log('Payment failed:', {
      orderId,
      transactionId,
      errorCode,
      errorMessage,
      timestamp: new Date().toISOString(),
      environment: ESEWA_CONFIG.environment
    });

    // For now, we'll simulate a successful log
    // In a real implementation, you would:
    // await db.paymentLogs.create({
    //   orderId,
    //   transactionId,
    //   status: 'FAILED',
    //   errorCode,
    //   errorMessage,
    //   timestamp: new Date()
    // });
    // await db.orders.update({ id: orderId }, { status: 'PAYMENT_FAILED' });
    // await sendAdminNotification(orderId, errorCode, errorMessage);
    
    return true;
  } catch (error) {
    console.error('Error logging failed payment:', error);
    return false;
  }
}

// Get error details based on error code
function getErrorDetails(errorCode: string): { title: string; description: string; suggestions: string[] } {
  const errorMap: Record<string, { title: string; description: string; suggestions: string[] }> = {
    'INSUFFICIENT_FUNDS': {
      title: 'Insufficient Funds',
      description: 'Your eSewa account does not have sufficient balance to complete this transaction.',
      suggestions: [
        'Add money to your eSewa account',
        'Check your account balance',
        'Try a different payment method'
      ]
    },
    'INVALID_CREDENTIALS': {
      title: 'Invalid Credentials',
      description: 'The eSewa credentials provided are invalid or expired.',
      suggestions: [
        'Verify your eSewa ID and password',
        'Reset your eSewa password if needed',
        'Contact eSewa support for assistance'
      ]
    },
    'TRANSACTION_TIMEOUT': {
      title: 'Transaction Timeout',
      description: 'The payment transaction timed out. Please try again.',
      suggestions: [
        'Check your internet connection',
        'Try the payment again',
        'Contact support if the issue persists'
      ]
    },
    'INVALID_AMOUNT': {
      title: 'Invalid Amount',
      description: 'The payment amount is invalid or exceeds the allowed limit.',
      suggestions: [
        'Verify the payment amount',
        'Check if the amount is within limits',
        'Contact support for assistance'
      ]
    },
    'ACCOUNT_LOCKED': {
      title: 'Account Locked',
      description: 'Your eSewa account has been temporarily locked for security reasons.',
      suggestions: [
        'Contact eSewa support to unlock your account',
        'Try again after some time',
        'Use a different payment method'
      ]
    },
    'NETWORK_ERROR': {
      title: 'Network Error',
      description: 'A network error occurred while processing your payment.',
      suggestions: [
        'Check your internet connection',
        'Try again in a few minutes',
        'Contact support if the issue persists'
      ]
    }
  };

  return errorMap[errorCode] || {
    title: 'Payment Failed',
    description: 'An unexpected error occurred while processing your payment.',
    suggestions: [
      'Try the payment again',
      'Check your payment details',
      'Contact support for assistance'
    ]
  };
}

export async function POST(req: NextRequest) {
  try {
    const body: PaymentFailureRequest = await req.json();
    
    // Validate required fields
    if (!body.transactionId || !body.orderId || !body.errorCode || !body.signature) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify signature
    const signatureData = {
      transactionId: body.transactionId,
      orderId: body.orderId,
      errorCode: body.errorCode,
      errorMessage: body.errorMessage || ''
    };

    if (!verifySignature(signatureData, body.signature)) {
      console.error('Signature verification failed for failed transaction:', body.transactionId);
      return NextResponse.json(
        { success: false, error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Log the failed payment
    const logSuccess = await logFailedPayment(
      body.orderId,
      body.transactionId,
      body.errorCode,
      body.errorMessage
    );

    if (!logSuccess) {
      console.error('Failed to log payment failure for order:', body.orderId);
      return NextResponse.json(
        { success: false, error: 'Failed to log payment failure' },
        { status: 500 }
      );
    }

    // Get error details
    const errorDetails = getErrorDetails(body.errorCode);

    const response: PaymentFailureResponse = {
      success: true,
      transactionId: body.transactionId,
      orderId: body.orderId,
      errorCode: body.errorCode,
      errorMessage: body.errorMessage,
      redirectUrl: `/payment/failure?orderId=${body.orderId}&errorCode=${body.errorCode}&message=${encodeURIComponent(errorDetails.description)}`
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error processing payment failure:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to process payment failure',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET method for direct access (eSewa callback)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const transactionId = searchParams.get('transactionId');
    const orderId = searchParams.get('orderId');
    const errorCode = searchParams.get('errorCode');
    const errorMessage = searchParams.get('errorMessage');
    const signature = searchParams.get('signature');

    if (!transactionId || !orderId || !errorCode || !signature) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Verify signature
    const signatureData = {
      transactionId,
      orderId,
      errorCode,
      errorMessage: errorMessage || ''
    };

    if (!verifySignature(signatureData, signature)) {
      console.error('Signature verification failed for failed transaction:', transactionId);
      return NextResponse.json(
        { success: false, error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Log the failed payment
    const logSuccess = await logFailedPayment(
      orderId,
      transactionId,
      errorCode,
      errorMessage || 'Unknown error'
    );

    if (!logSuccess) {
      console.error('Failed to log payment failure for order:', orderId);
      return NextResponse.json(
        { success: false, error: 'Failed to log payment failure' },
        { status: 500 }
      );
    }

    // Get error details
    const errorDetails = getErrorDetails(errorCode);

    // Redirect to failure page
    const redirectUrl = `/payment/failure?orderId=${orderId}&errorCode=${errorCode}&message=${encodeURIComponent(errorDetails.description)}`;
    
    return NextResponse.redirect(new URL(redirectUrl, req.url));

  } catch (error) {
    console.error('Error processing eSewa failure callback:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to process payment failure callback',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
