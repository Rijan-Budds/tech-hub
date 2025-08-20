'use client';

import { useState } from 'react';
import Image from 'next/image';
import { toast } from 'sonner';
import { createESewaPaymentRequest, getESewaPaymentUrl } from '@/lib/esewa';

interface ESewaPaymentProps {
  amount: number;
  productName: string;
  orderId: string;
  onSuccess?: () => void;
  onFailure?: () => void;
}

export default function ESewaPayment({ 
  amount, 
  productName, 
  orderId, 
  onSuccess, 
  onFailure 
}: ESewaPaymentProps) {
  const [loading, setLoading] = useState(false);

  const handleESewaPayment = async () => {
    setLoading(true);
    
    try {
      // Create payment request
      const paymentRequest = createESewaPaymentRequest(
        amount,
        productName,
        `${window.location.origin}/payment/success?orderId=${orderId}`,
        `${window.location.origin}/payment/failure?orderId=${orderId}`
      );

      // Get payment URL
      const paymentUrl = getESewaPaymentUrl(paymentRequest);

      // Debug logging
      console.log('eSewa Payment Request:', paymentRequest);
      console.log('eSewa Payment URL:', paymentUrl);

      // Method 1: Try form submission first
      try {
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = paymentUrl;
        form.target = '_blank';

        // Add form fields
        Object.entries(paymentRequest).forEach(([key, value]) => {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = key;
          input.value = value.toString();
          form.appendChild(input);
        });

        // Add form to page and submit
        document.body.appendChild(form);
        
        // Log form before submission
        console.log('Form being submitted:', form);
        console.log('Form action:', form.action);
        
        form.submit();
        document.body.removeChild(form);

        toast.success('Redirecting to eSewa payment gateway...');
        
        // Call success callback
        if (onSuccess) {
          onSuccess();
        }
      } catch (formError) {
        console.error('Form submission failed, trying alternative method:', formError);
        
        // Method 2: Try opening URL directly with query parameters
        const queryParams = new URLSearchParams();
        Object.entries(paymentRequest).forEach(([key, value]) => {
          queryParams.append(key, value.toString());
        });
        
        const urlWithParams = `${paymentUrl}?${queryParams.toString()}`;
        console.log('Alternative URL with params:', urlWithParams);
        
        // Open in new window
        window.open(urlWithParams, '_blank', 'width=800,height=600');
        
        toast.success('Opening eSewa payment gateway in new window...');
        
        // Call success callback
        if (onSuccess) {
          onSuccess();
        }
      }

    } catch (error) {
      console.error('Error initiating eSewa payment:', error);
      toast.error('Failed to initiate payment. Please try again.');
      
      // Call failure callback
      if (onFailure) {
        onFailure();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <button
        onClick={handleESewaPayment}
        disabled={loading}
        className="w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed transition-colors font-semibold flex items-center justify-center"
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            Processing...
          </>
        ) : (
          <>
            <Image 
              src="/home/esewa.png" 
              alt="eSewa" 
              width={24}
              height={24}
              className="mr-2"
            />
            Pay with eSewa
          </>
        )}
      </button>
      
      <div className="mt-3 text-xs text-gray-500 text-center">
        Secure payment powered by eSewa
      </div>
    </div>
  );
}
