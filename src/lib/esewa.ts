// eSewa Payment Gateway Integration
// Test credentials for development environment

export interface ESewaConfig {
  merchantId: string;
  serviceCode: string;
  clientId: string;
  clientSecret: string;
  secretKey: string;
  environment: 'test' | 'production';
}

export interface ESewaPaymentRequest {
  amount: number;
  taxAmount: number;
  totalAmount: number;
  transactionId: string;
  productCode: string;
  productName: string;
  productServiceCharge: number;
  productDeliveryCharge: number;
  successUrl: string;
  failureUrl: string;
  merchantId: string;
  serviceCode: string;
}

export interface ESewaPaymentResponse {
  status: 'success' | 'failure';
  transactionId?: string;
  message?: string;
  errorCode?: string;
}

// Test configuration
const TEST_CONFIG: ESewaConfig = {
  merchantId: process.env.ESEWA_MERCHANT_ID || 'EPAYTEST',
  serviceCode: process.env.ESEWA_SERVICE_CODE || 'EPAYTEST',
  clientId: process.env.ESEWA_CLIENT_ID || 'JB0BBQ4aD0UqIThFJwAKBgAXEUkEGQUBBAwdOgABHD4DChwUAB0R',
  clientSecret: process.env.ESEWA_CLIENT_SECRET || 'BhwIWQQADhIYSxILExMcAgFXFhcOBwAKBgAXEQ==',
  secretKey: process.env.ESEWA_SECRET_KEY || '8gBm/:&EnhH.1/q',
  environment: 'test'
};

// Production configuration (to be updated with live credentials)
const PRODUCTION_CONFIG: ESewaConfig = {
  merchantId: process.env.ESEWA_MERCHANT_ID || 'YOUR_LIVE_MERCHANT_ID',
  serviceCode: process.env.ESEWA_SERVICE_CODE || 'YOUR_LIVE_SERVICE_CODE',
  clientId: process.env.ESEWA_CLIENT_ID || 'YOUR_LIVE_CLIENT_ID',
  clientSecret: process.env.ESEWA_CLIENT_SECRET || 'YOUR_LIVE_CLIENT_SECRET',
  secretKey: process.env.ESEWA_SECRET_KEY || 'YOUR_LIVE_SECRET_KEY',
  environment: 'production'
};

export const getESewaConfig = (): ESewaConfig => {
  const isProduction = process.env.NODE_ENV === 'production';
  return isProduction ? PRODUCTION_CONFIG : TEST_CONFIG;
};

// Generate unique transaction ID
export const generateTransactionId = (): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  return `TXN_${timestamp}_${random}`.toUpperCase();
};

// Create eSewa payment request
export const createESewaPaymentRequest = (
  amount: number,
  productName: string,
  successUrl: string,
  failureUrl: string
): ESewaPaymentRequest => {
  const config = getESewaConfig();
  const transactionId = generateTransactionId();
  
  // Calculate tax (assuming 13% VAT for Nepal)
  const taxAmount = Math.round(amount * 0.13);
  const totalAmount = amount + taxAmount;
  
  return {
    amount: Math.round(amount * 100), // eSewa expects amount in paisa
    taxAmount: Math.round(taxAmount * 100),
    totalAmount: Math.round(totalAmount * 100),
    transactionId,
    productCode: 'ECOMMERCE',
    productName,
    productServiceCharge: 0,
    productDeliveryCharge: 0,
    successUrl,
    failureUrl,
    merchantId: config.merchantId,
    serviceCode: config.serviceCode,
  };
};

// Verify eSewa payment response
export const verifyESewaPayment = (
  response: { transactionId?: string; status?: string },
  _transactionId: string // eslint-disable-line @typescript-eslint/no-unused-vars
): ESewaPaymentResponse => {
  const config = getESewaConfig();
  
  try {
    // In test environment, we'll simulate verification
    if (config.environment === 'test') {
      // For testing, assume success if we have a response
      if (response && response.transactionId) {
        return {
          status: 'success',
          transactionId: response.transactionId,
          message: 'Payment successful'
        };
      }
    }
    
    // In production, implement actual verification logic
    // This would involve calling eSewa's verification API
    if (config.environment === 'production') {
      // TODO: Implement production verification
      console.log('Production verification not implemented yet');
    }
    
    return {
      status: 'failure',
      message: 'Payment verification failed',
      errorCode: 'VERIFICATION_FAILED'
    };
    
  } catch (error) {
    console.error('Error verifying eSewa payment:', error);
    return {
      status: 'failure',
      message: 'Payment verification error',
      errorCode: 'VERIFICATION_ERROR'
    };
  }
};

// Get eSewa payment URL
export const getESewaPaymentUrl = (_paymentRequest: ESewaPaymentRequest): string => { // eslint-disable-line @typescript-eslint/no-unused-vars
  const config = getESewaConfig();
  
  if (config.environment === 'test') {
    // Test environment URL - using the correct eSewa test endpoint
    // Note: This URL might need to be updated based on eSewa's actual test environment
    // Alternative test URLs to try:
    // return 'https://esewa.com.np/epay/test/initiate';
    // return 'https://esewa.com.np/epay/test';
    return 'https://rc-epay.esewa.com.np/api/epay/main/v2/form';
  } else {
    // Production environment URL
    return 'https://esewa.com.np/epay/main';
  }
};

// Create payment form data for eSewa
export const createPaymentFormData = (paymentRequest: ESewaPaymentRequest): FormData => {
  const formData = new FormData();
  
  Object.entries(paymentRequest).forEach(([key, value]) => {
    formData.append(key, value.toString());
  });
  
  return formData;
};
