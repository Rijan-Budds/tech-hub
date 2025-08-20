'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { toast } from 'sonner';
import ESewaPayment from '@/components/ESewaPayment';

interface OrderDetails {
  amount: number;
  productName: string;
  orderId: string;
  customerName?: string;
  customerEmail?: string;
  customerAddress?: string;
}

interface DebugInfo {
  paymentRequest: any;
  paymentUrl: string;
}

export default function TestESewaPage() {
  const router = useRouter();
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentFormData, setPaymentFormData] = useState({
    esewaId: '',
    password: '',
    mpin: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Load order details from sessionStorage
    const storedOrderDetails = sessionStorage.getItem('pendingOrderDetails');
    if (storedOrderDetails) {
      try {
        const parsed = JSON.parse(storedOrderDetails);
        setOrderDetails(parsed);
      } catch (error) {
        console.error('Error parsing order details:', error);
      }
    }
  }, []);

  useEffect(() => {
    // Generate debug info when order details are available
    if (orderDetails) {
      const paymentRequest = {
        amount: orderDetails.amount,
        productName: orderDetails.productName,
        orderId: orderDetails.orderId,
        transactionId: `TXN_${Date.now()}`,
        merchantId: 'EPAYTEST',
        serviceCode: 'EPAYTEST'
      };
      
      setDebugInfo({
        paymentRequest,
        paymentUrl: 'https://rc-epay.esewa.com.np/api/epay/main/v2/form'
      });
    }
  }, [orderDetails]);

  const handleESewaPayment = () => {
    setShowPaymentForm(true);
  };

  const handlePaymentFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    // Validate credentials
    const validESewaIds = ['9806800001', '9806800002', '9806800003', '9806800004', '9806800005'];
    const validPassword = 'Nepal@123';
    const validMPIN = '1122';

    if (!validESewaIds.includes(paymentFormData.esewaId)) {
      toast.error('Invalid eSewa ID. Please use one of the test IDs: 9806800001-9806800005');
      setIsProcessing(false);
      return;
    }

    if (paymentFormData.password !== validPassword) {
      toast.error('Invalid password. Test password is: Nepal@123');
      setIsProcessing(false);
      return;
    }

    if (paymentFormData.mpin !== validMPIN) {
      toast.error('Invalid MPIN. Test MPIN is: 1122');
      setIsProcessing(false);
      return;
    }

    try {
      // Simulate payment processing
      toast.success('Processing payment...');
      console.log('Starting payment process...');
      
      // For testing, we'll create a simple order directly without going through the cart
      const testOrderId = `TEST_ORDER_${Date.now()}`;
      const transactionId = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      console.log('Using test order ID:', testOrderId);
      console.log('Using transaction ID:', transactionId);

      // Simulate successful payment
      setTimeout(async () => {
        try {
          setIsProcessing(false);
          
          console.log('Processing payment success for test order:', testOrderId);
          
          // Call the payment success API with test data
          const paymentSuccessResponse = await fetch('/api/payment/success', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              transactionId: transactionId,
              orderId: testOrderId,
              amount: orderDetails?.amount || 1000,
              totalAmount: (orderDetails?.amount || 1000) * 1.13,
              signature: 'test_signature_' + Date.now()
            })
          });

          console.log('Payment success response status:', paymentSuccessResponse.status);
          
          if (paymentSuccessResponse.ok) {
            const successResult = await paymentSuccessResponse.json();
            console.log('Payment processed successfully:', successResult);
            
            // Clear session storage
            sessionStorage.removeItem('pendingOrderDetails');
            
            // Redirect to success page
            router.push(`/payment/success?orderId=${testOrderId}&transactionId=${transactionId}`);
          } else {
            const errorText = await paymentSuccessResponse.text();
            console.error('Payment processing failed:', errorText);
            toast.error('Payment processing failed. Please try again.');
          }
        } catch (error) {
          console.error('Error in payment processing:', error);
          toast.error('Payment processing failed. Please try again.');
          setIsProcessing(false);
        }
      }, 3000);
      
    } catch (error) {
      console.error('Payment error:', error);
      toast.error(`Payment failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setIsProcessing(false);
    }
  };

  const handlePaymentFailure = () => {
    const errorCode = 'INSUFFICIENT_FUNDS';
    const message = 'Insufficient funds in your eSewa account';
    router.push(`/payment/failure?orderId=${orderDetails?.orderId}&errorCode=${errorCode}&message=${encodeURIComponent(message)}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            eSewa Payment Gateway Test
          </h1>
          <p className="text-gray-600">
            Test the eSewa payment integration with realistic payment flow
          </p>
        </div>

        {/* Order Details */}
        {orderDetails && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
              Your Order Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Order ID:</span>
                <span className="ml-2 font-mono text-gray-900">{orderDetails.orderId}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Product:</span>
                <span className="ml-2 text-gray-900">{orderDetails.productName}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Amount:</span>
                <span className="ml-2 text-gray-900">रु{orderDetails.amount.toFixed(2)}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">VAT (13%):</span>
                <span className="ml-2 text-gray-900">रु{(orderDetails.amount * 0.13).toFixed(2)}</span>
              </div>
              <div className="md:col-span-2">
                <span className="font-medium text-gray-700">Total Amount:</span>
                <span className="ml-2 text-lg font-bold text-green-600">
                  रु{(orderDetails.amount * 1.13).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* eSewa Payment Form */}
        {showPaymentForm ? (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <Image 
                  src="/home/esewa.png" 
                  alt="eSewa" 
                  width={40} 
                  height={40}
                  className="mr-3"
                />
                <h2 className="text-xl font-semibold text-gray-900">
                  eSewa Payment Gateway
                </h2>
              </div>
              <div className="text-sm text-gray-500">
                Test Environment
              </div>
            </div>

            <form onSubmit={handlePaymentFormSubmit} className="space-y-6">
              {/* Payment Amount Display */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Payment Amount:</span>
                  <span className="text-xl font-bold text-green-600">
                    रु{orderDetails ? (orderDetails.amount * 1.13).toFixed(2) : '0.00'}
                  </span>
                </div>
              </div>

              {/* eSewa ID */}
              <div>
                <label htmlFor="esewaId" className="block text-sm font-medium text-gray-700 mb-2">
                  eSewa ID *
                </label>
                <input
                  type="text"
                  id="esewaId"
                  value={paymentFormData.esewaId}
                  onChange={(e) => setPaymentFormData(prev => ({ ...prev, esewaId: e.target.value }))}
                  placeholder="Enter your eSewa ID"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Test IDs: 9806800001, 9806800002, 9806800003, 9806800004, 9806800005
                </p>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password *
                </label>
                <input
                  type="password"
                  id="password"
                  value={paymentFormData.password}
                  onChange={(e) => setPaymentFormData(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Test password: Nepal@123
                </p>
              </div>

              {/* MPIN */}
              <div>
                <label htmlFor="mpin" className="block text-sm font-medium text-gray-700 mb-2">
                  MPIN *
                </label>
                <input
                  type="password"
                  id="mpin"
                  value={paymentFormData.mpin}
                  onChange={(e) => setPaymentFormData(prev => ({ ...prev, mpin: e.target.value }))}
                  placeholder="Enter your MPIN"
                  maxLength={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Test MPIN: 1122
                </p>
              </div>

              {/* Security Notice */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">
                      Security Notice
                    </h3>
                    <div className="mt-2 text-sm text-blue-700">
                      <p>This is a test environment. Your payment information is secure and will not be processed.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4">
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed transition-colors font-semibold flex items-center justify-center"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Processing Payment...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                      Complete Payment
                    </>
                  )}
                </button>
                
                <button
                  type="button"
                  onClick={() => setShowPaymentForm(false)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* Payment Options */
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Choose Payment Option
            </h2>
            
            <div className="space-y-4">
              {/* Real eSewa Payment */}
              <button
                onClick={handleESewaPayment}
                className="w-full bg-green-600 text-white px-6 py-4 rounded-lg hover:bg-green-700 transition-colors font-semibold flex items-center justify-center"
              >
                <Image 
                  src="/home/esewa.png" 
                  alt="eSewa" 
                  width={32}
                  height={32}
                  className="mr-3"
                />
                Pay with eSewa (Test Form)
              </button>

              {/* Simple Test Payment */}
              <button
                onClick={async () => {
                  const testOrderId = `SIMPLE_TEST_${Date.now()}`;
                  const transactionId = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                  
                  console.log('Testing simple payment flow...');
                  
                  try {
                    const response = await fetch('/api/payment/success', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        transactionId,
                        orderId: testOrderId,
                        amount: 1000,
                        totalAmount: 1130,
                        signature: 'simple_test_signature'
                      })
                    });
                    
                    console.log('Simple test response:', response.status);
                    
                    if (response.ok) {
                      const result = await response.json();
                      console.log('Simple test success:', result);
                      router.push(`/payment/success?orderId=${testOrderId}&transactionId=${transactionId}`);
                    } else {
                      const error = await response.text();
                      console.error('Simple test failed:', error);
                      toast.error('Simple test failed: ' + error);
                    }
                  } catch (error) {
                    console.error('Simple test error:', error);
                    toast.error('Simple test error: ' + error);
                  }
                }}
                className="w-full bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors font-semibold"
              >
                Simple Test Payment (Debug)
              </button>

              {/* Test Success */}
              <button
                onClick={() => {
                  const transactionId = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                  router.push(`/payment/success?orderId=${orderDetails?.orderId}&transactionId=${transactionId}`);
                }}
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                Test Success Page
              </button>

              {/* Test Failure */}
              <button
                onClick={handlePaymentFailure}
                className="w-full bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-semibold"
              >
                Test Failure Page
              </button>
            </div>
          </div>
        )}
        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">Test Instructions:</h3>
          <div className="space-y-2 text-sm text-blue-800">
            <p>• <strong>eSewa ID:</strong> Use any of the test IDs: 9806800001, 9806800002, 9806800003, 9806800004, 9806800005</p>
            <p>• <strong>Password:</strong> Use the test password: Nepal@123</p>
            <p>• <strong>MPIN:</strong> Use the test MPIN: 1122</p>
            <p>• This simulates the real eSewa payment experience with test credentials</p>
            <p>• After successful payment, you'll be redirected to the success page</p>
            <p>• You can also test failure scenarios using the test buttons</p>
          </div>
        </div>
      </div>
    </div>
  );
}
