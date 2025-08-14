import { NextResponse } from "next/server";
import { testEmailConnection, sendOrderConfirmationEmail, sendOrderStatusUpdateEmail } from "@/lib/email";

export async function GET() {
  try {
    // Test email connection
    const connectionTest = await testEmailConnection();
    
    if (!connectionTest.success) {
      return NextResponse.json({ 
        success: false, 
        error: 'Email connection failed', 
        details: connectionTest.error 
      }, { status: 500 });
    }

    // Test with a sample order
    const sampleOrder = {
      items: [
        {
          productId: 'test-1',
          quantity: 2,
          name: 'Test Product 1',
          image: 'https://via.placeholder.com/150',
          price: 29.99
        },
        {
          productId: 'test-2',
          quantity: 1,
          name: 'Test Product 2',
          image: 'https://via.placeholder.com/150',
          price: 49.99
        }
      ],
      status: 'pending' as const,
      subtotal: 109.97,
      deliveryFee: 5.0,
      grandTotal: 114.97,
      customer: {
        name: 'Test Customer',
        email: 'rijanmailsender@gmail.com', // Send to yourself for testing
        address: { street: '123 Test Street', city: 'Test City' }
      },
      userId: 'test-user-id',
      createdAt: new Date()
    };

    const emailResult = await sendOrderConfirmationEmail(sampleOrder, 'TEST-ORDER-123');
    const statusEmailResult = await sendOrderStatusUpdateEmail(sampleOrder, 'TEST-ORDER-123', 'delivered');

    return NextResponse.json({
      success: true,
      connectionTest: connectionTest.success,
      confirmationEmailSent: emailResult.success,
      statusUpdateEmailSent: statusEmailResult.success,
      confirmationMessageId: emailResult.messageId,
      statusUpdateMessageId: statusEmailResult.messageId,
      confirmationError: emailResult.error,
      statusUpdateError: statusEmailResult.error
    });

  } catch (error) {
    console.error('Test email error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
}
