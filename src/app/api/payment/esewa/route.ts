import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@/lib/auth';
import { createESewaPaymentRequest, getESewaPaymentUrl, createPaymentFormData, verifyESewaPayment } from '@/lib/esewa';

export async function POST(req: NextRequest) {
  try {
    const { amount, productName, orderId } = await req.json();
    
    if (!amount || !productName || !orderId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Create payment request
    const paymentRequest = createESewaPaymentRequest(
      amount,
      productName,
      `${req.nextUrl.origin}/payment/success?orderId=${orderId}`,
      `${req.nextUrl.origin}/payment/failure?orderId=${orderId}`
    );

    // Get payment URL
    const paymentUrl = getESewaPaymentUrl(paymentRequest);

    return NextResponse.json({
      success: true,
      paymentUrl,
      paymentRequest,
      message: 'Payment request created successfully'
    });

  } catch (error) {
    console.error('Error creating eSewa payment request:', error);
    return NextResponse.json(
      { error: 'Failed to create payment request' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const transactionId = searchParams.get('transactionId');
    const status = searchParams.get('status');
    const orderId = searchParams.get('orderId');

    console.log('eSewa callback received:', { transactionId, status, orderId });

    if (!transactionId || !status) {
      return NextResponse.json(
        { error: 'Missing required callback parameters' },
        { status: 400 }
      );
    }

    // Verify the payment
    const verificationResult = verifyESewaPayment(
      { transactionId, status },
      transactionId
    );

    if (verificationResult.status === 'success') {
      // Payment was successful
      // Here you would typically:
      // 1. Update the order status in your database
      // 2. Send confirmation email
      // 3. Update inventory
      // 4. Log the transaction

      console.log('Payment verified successfully:', verificationResult);

      return NextResponse.json({
        success: true,
        message: 'Payment verified successfully',
        transactionId: verificationResult.transactionId
      });
    } else {
      // Payment failed
      console.log('Payment verification failed:', verificationResult);

      return NextResponse.json({
        success: false,
        message: verificationResult.message || 'Payment verification failed',
        errorCode: verificationResult.errorCode
      }, { status: 400 });
    }

  } catch (error) {
    console.error('Error processing eSewa callback:', error);
    return NextResponse.json(
      { error: 'Failed to process payment callback' },
      { status: 500 }
    );
  }
}
