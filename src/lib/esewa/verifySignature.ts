import CryptoJS from 'crypto-js';

/**
 * Generates a Base64-encoded HMAC SHA256 signature using the eSewa secret key.
 *
 * @param message - The message string to be signed or verified.
 * @returns Base64-encoded HMAC-SHA256 signature.
 */
export function generateEsewaSignature(message: string): string {
  const secretKey = process.env.ESEWA_SECRET_KEY;

  if (!secretKey) {
    throw new Error('Missing ESEWA_SECRET_KEY in environment variables.');
  }

  return CryptoJS.HmacSHA256(message, secretKey).toString(CryptoJS.enc.Base64);
}