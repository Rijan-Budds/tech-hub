'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { XCircle, Home, RefreshCw, AlertTriangle } from 'lucide-react';

function PaymentFailureContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [errorDetails, setErrorDetails] = useState<{
    message?: string;
    errorCode?: string;
  } | null>(null);

  useEffect(() => {
    const orderId = searchParams.get('orderId');
    const errorCode = searchParams.get('errorCode');
    const message = searchParams.get('message');
    
    if (orderId) {
      console.log('Payment failed:', { orderId, errorCode, message });
      
      setErrorDetails({
        message: message || 'Payment processing failed. Please try again.',
        errorCode: errorCode || 'PAYMENT_FAILED'
      });
    }
    
    setLoading(false);
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Processing...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-orange-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        {/* Error Icon */}
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle className="w-12 h-12 text-red-600" />
        </div>

        {/* Error Message */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Payment Failed
        </h1>
        <p className="text-gray-600 mb-8">
          {errorDetails?.message || 'We encountered an issue processing your payment. Please try again.'}
        </p>

        {/* Error Details */}
        {errorDetails && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
            <h2 className="text-lg font-semibold text-red-900 mb-4 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Error Details
            </h2>
            <div className="space-y-2 text-sm text-red-800">
              <div className="flex justify-between">
                <span>Error Code:</span>
                <span className="font-mono">{errorDetails.errorCode}</span>
              </div>
              <div className="text-left mt-3">
                <span className="font-semibold">Possible reasons:</span>
                <ul className="list-disc list-inside mt-2 space-y-1 text-xs">
                  <li>Insufficient funds in your account</li>
                  <li>Network connectivity issues</li>
                  <li>Payment gateway timeout</li>
                  <li>Invalid payment information</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-4">
          <button
            onClick={() => router.back()}
            className="w-full bg-gradient-to-r from-red-600 to-pink-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-red-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center"
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            Try Again
          </button>
          
          <button
            onClick={() => router.push('/cart')}
            className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-200 flex items-center justify-center"
          >
            <Home className="w-5 h-5 mr-2" />
            Return to Cart
          </button>
        </div>

        {/* Additional Info */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500 mb-2">
            If you continue to experience issues, please contact our support team.
          </p>
          <p className="text-xs text-gray-500">
            Your order has been saved and you can retry the payment anytime.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function PaymentFailurePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading...</p>
        </div>
      </div>
    }>
      <PaymentFailureContent />
    </Suspense>
  );
}
