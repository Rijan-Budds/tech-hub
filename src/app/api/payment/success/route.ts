import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { orderService, userService } from '@/lib/firebase-db';
import { sendOrderConfirmationEmail, sendOrderStatusUpdateEmail } from '@/lib/email';
import { getAuth } from '@/lib/auth';

// eSewa Configuration
const ESEWA_CONFIG = {
  merchantId: process.env.ESEWA_MERCHANT_ID || 'EPAYTEST',
  serviceCode: process.env.ESEWA_SERVICE_CODE || 'EPAYTEST',
  secretKey: process.env.ESEWA_SECRET_KEY || '8gBm/:&EnhH.1/q',
  environment: process.env.NODE_ENV === 'production' ? 'production' : 'test'
};

// eSewa verification URLs
const VERIFICATION_URLS = {
  test: 'https://rc-epay.esewa.com.np/api/epay/transaction/status',
  production: 'https://esewa.com.np/epay/transaction/status'
};

interface PaymentSuccessRequest {
  transactionId: string;
  orderId: string;
  amount: number;
  totalAmount: number;
  signature: string;
}

interface PaymentSuccessResponse {
  success: boolean;
  transactionId?: string;
  orderId?: string;
  amount?: number;
  message?: string;
  error?: string;
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

// Verify transaction with eSewa API
async function verifyTransactionWithEsewa(transactionId: string): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const verificationUrl = VERIFICATION_URLS[ESEWA_CONFIG.environment as keyof typeof VERIFICATION_URLS];
    
    const response = await fetch(verificationUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        merchantId: ESEWA_CONFIG.merchantId,
        transactionId: transactionId,
        serviceCode: ESEWA_CONFIG.serviceCode
      })
    });

    if (!response.ok) {
      throw new Error(`eSewa API responded with status: ${response.status}`);
    }

    const data = await response.json();
    
    // In test environment, we'll simulate successful verification
    if (ESEWA_CONFIG.environment === 'test') {
      return {
        success: true,
        data: {
          status: 'SUCCESS',
          transactionId: transactionId,
          amount: data.amount || 0
        }
      };
    }

    // In production, check the actual response
    if (data.status === 'SUCCESS' || data.responseCode === '00') {
      return {
        success: true,
        data: data
      };
    } else {
      return {
        success: false,
        error: data.message || 'Transaction verification failed'
      };
    }

  } catch (error) {
    console.error('Error verifying transaction with eSewa:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Verification failed'
    };
  }
}

// Update order status and clear cart
async function processSuccessfulPayment(orderId: string, transactionId: string, amount: number): Promise<{ success: boolean; error?: string }> {
  try {
    // Get the order
    let order = await orderService.getOrderById(orderId);
    
    // If order doesn't exist, create a test order for testing purposes
    if (!order) {
      console.log('Order not found, creating test order for payment processing');
      
      // Get the current authenticated user for test orders
      const auth = await getAuth();
      console.log('Auth result:', auth);
      
      let userId = 'test-user-id';
      let userEmail = 'test@example.com';
      let userName = 'Test Customer';
      let userAddress = { street: 'Test Address', city: 'Kathmandu' };
      let orderItems = [{
        productId: 'test-product',
        quantity: 1,
        name: 'Test Product',
        image: '/home/category1.jpg',
        price: amount
      }];
      
      if (auth && auth.sub) {
        // Get user details for real test orders
        const user = await userService.getUserById(auth.sub);
        console.log('User found:', user ? { id: user.id, email: user.email, username: user.username } : 'No user found');
        
        if (user) {
          userId = auth.sub;
          userEmail = user.email;
          userName = user.username || 'Customer';
          console.log('Using real user for test order:', { userId, userEmail, userName });
        }
      } else {
        console.log('No auth found, using test user data');
      }
      
      // Try to get order details from sessionStorage (for real orders from cart)
      try {
        const storedOrderDetails = sessionStorage.getItem('pendingOrderDetails');
        if (storedOrderDetails) {
          const parsedDetails = JSON.parse(storedOrderDetails);
          console.log('Found stored order details:', parsedDetails);
          
          // Use real order details if available
          if (parsedDetails.customerName) userName = parsedDetails.customerName;
          if (parsedDetails.customerEmail) userEmail = parsedDetails.customerEmail;
          if (parsedDetails.customerAddress) {
            const addressParts = parsedDetails.customerAddress.split(', ');
            userAddress = {
              street: addressParts[0] || 'Test Address',
              city: addressParts[1] || 'Kathmandu'
            };
          }
          if (parsedDetails.items && parsedDetails.items.length > 0) {
            // Try to get real product details from database
            try {
              const { productService } = await import('@/lib/firebase-db');
              const allProducts = await productService.getAllProducts();
              
              orderItems = parsedDetails.items.map((item: any) => {
                // Try to find a real product that matches the name
                const matchingProduct = allProducts.find(p => 
                  p.name.toLowerCase().includes(item.name?.toLowerCase() || '') ||
                  item.name?.toLowerCase().includes(p.name.toLowerCase())
                );
                
                if (matchingProduct) {
                  return {
                    productId: matchingProduct.id!,
                    quantity: item.quantity || 1,
                    name: matchingProduct.name,
                    image: matchingProduct.image,
                    price: matchingProduct.price
                  };
                } else {
                  // Use first available product as fallback
                  const fallbackProduct = allProducts[0];
                  return {
                    productId: fallbackProduct?.id || 'test-product',
                    quantity: item.quantity || 1,
                    name: item.name || fallbackProduct?.name || 'Test Product',
                    image: fallbackProduct?.image || '/home/category1.jpg',
                    price: item.price || fallbackProduct?.price || amount
                  };
                }
              });
            } catch (error) {
              console.log('Error getting product details, using fallback:', error);
              orderItems = parsedDetails.items.map((item: any) => ({
                productId: item.name?.toLowerCase().replace(/\s+/g, '-') || 'test-product',
                quantity: item.quantity || 1,
                name: item.name || 'Test Product',
                image: '/home/category1.jpg', // Default image
                price: item.price || amount
              }));
            }
          }
        }
      } catch (error) {
        console.log('Error parsing stored order details:', error);
      }
      
      // Create a test order for payment processing
      const testOrderData = {
        items: orderItems,
        status: 'pending' as const,
        subtotal: amount,
        deliveryFee: 0,
        grandTotal: amount,
        paymentMethod: 'esewa' as const,
        customer: {
          name: userName,
          email: userEmail,
          address: userAddress
        },
        userId: userId,
        createdAt: new Date()
      };
      
      // Create the test order
      const createdOrderId = await orderService.createOrder(testOrderData);
      order = await orderService.getOrderById(createdOrderId);
      
      if (!order) {
        console.error('Failed to create test order');
        return { success: false, error: 'Failed to create test order' };
      }
      
      console.log('Test order created successfully:', createdOrderId);
    }

    // Update order status to 'paid' and add transaction details
    const updatedOrder = {
      ...order,
      status: 'paid' as const,
      paymentDetails: {
        transactionId: transactionId,
        paymentMethod: 'esewa',
        paidAt: new Date(),
        amount: amount
      }
    };

    // Update the order in database
    await orderService.updateOrder(order.id!, updatedOrder);

    // Clear the user's cart by setting it to empty array (only if it's a real user)
    if (order.userId !== 'test-user-id') {
      await userService.updateUserCart(order.userId, []);
    }

    // Send only order confirmation email (not payment confirmation to avoid duplicate emails)
    const emailResult = await sendOrderConfirmationEmail(updatedOrder, order.id!);
    if (!emailResult.success) {
      console.error('Failed to send order confirmation email:', emailResult.error);
      // Don't fail the process if email fails, but log it
    } else {
      console.log('Order confirmation email sent successfully');
    }

    console.log('Payment processed successfully:', {
      orderId: order.id,
      transactionId,
      amount,
      isTestOrder: order.userId === 'test-user-id',
      userEmail: order.customer.email,
      customerName: order.customer.name,
      customerAddress: order.customer.address
    });

    return { success: true };

  } catch (error) {
    console.error('Error processing successful payment:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to process payment' 
    };
  }
}

export async function POST(req: NextRequest) {
  try {
    const body: PaymentSuccessRequest = await req.json();
    
    // Validate required fields
    if (!body.transactionId || !body.orderId || !body.amount || !body.signature) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Skip signature verification for test payments (signatures starting with 'test_' or 'simple_test_')
    const isTestPayment = body.signature.startsWith('test_') || body.signature.startsWith('simple_test_');
    
    if (!isTestPayment) {
      // Verify signature only for real payments
      const signatureData = {
        transactionId: body.transactionId,
        orderId: body.orderId,
        amount: body.amount.toString(),
        totalAmount: body.totalAmount.toString()
      };

      if (!verifySignature(signatureData, body.signature)) {
        console.error('Signature verification failed for transaction:', body.transactionId);
        return NextResponse.json(
          { success: false, error: 'Invalid signature' },
          { status: 400 }
        );
      }
    } else {
      console.log('Skipping signature verification for test payment');
    }

    // Verify transaction with eSewa (skip for test payments)
    if (!isTestPayment) {
      const verificationResult = await verifyTransactionWithEsewa(body.transactionId);
      
      if (!verificationResult.success) {
        console.error('Transaction verification failed:', verificationResult.error);
        return NextResponse.json(
          { success: false, error: verificationResult.error || 'Transaction verification failed' },
          { status: 400 }
        );
      }
    } else {
      console.log('Skipping eSewa verification for test payment');
    }

    // Process the successful payment (update order, clear cart, send emails)
    const processResult = await processSuccessfulPayment(body.orderId, body.transactionId, body.amount);
    
    if (!processResult.success) {
      console.error('Failed to process payment:', processResult.error);
      return NextResponse.json(
        { success: false, error: processResult.error || 'Failed to process payment' },
        { status: 500 }
      );
    }

    // Log successful payment
    console.log('Payment successful:', {
      orderId: body.orderId,
      transactionId: body.transactionId,
      amount: body.amount,
      isTestPayment,
      timestamp: new Date().toISOString()
    });

    const response: PaymentSuccessResponse = {
      success: true,
      transactionId: body.transactionId,
      orderId: body.orderId,
      amount: body.amount,
      message: 'Payment verified and processed successfully',
      redirectUrl: `/payment/success?orderId=${body.orderId}&transactionId=${body.transactionId}`
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error processing payment success:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to process payment success',
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
    const amount = searchParams.get('amount');
    const signature = searchParams.get('signature');

    if (!transactionId || !orderId || !amount || !signature) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Verify signature
    const signatureData = {
      transactionId,
      orderId,
      amount,
      totalAmount: amount
    };

    if (!verifySignature(signatureData, signature)) {
      console.error('Signature verification failed for transaction:', transactionId);
      return NextResponse.json(
        { success: false, error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Verify transaction with eSewa
    const verificationResult = await verifyTransactionWithEsewa(transactionId);
    
    if (!verificationResult.success) {
      console.error('Transaction verification failed:', verificationResult.error);
      return NextResponse.json(
        { success: false, error: verificationResult.error || 'Transaction verification failed' },
        { status: 400 }
      );
    }

    // Process the successful payment (update order, clear cart, send emails)
    const processResult = await processSuccessfulPayment(orderId, transactionId, parseFloat(amount));
    
    if (!processResult.success) {
      console.error('Failed to process payment:', processResult.error);
      return NextResponse.json(
        { success: false, error: processResult.error || 'Failed to process payment' },
        { status: 500 }
      );
    }

    // Redirect to success page
    const redirectUrl = `/payment/success?orderId=${orderId}&transactionId=${transactionId}`;
    
    return NextResponse.redirect(new URL(redirectUrl, req.url));

  } catch (error) {
    console.error('Error processing eSewa callback:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to process payment callback',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
