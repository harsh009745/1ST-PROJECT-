import Razorpay from 'razorpay';
import crypto from 'crypto';
import { ENV } from '../config.js';

let razorpayClient: Razorpay | null = null;

export function getRazorpayClient(): Razorpay | null {
  if (razorpayClient) return razorpayClient;

  const keyId = ENV.RAZORPAY_KEY_ID;
  const keySecret = ENV.RAZORPAY_KEY_SECRET;

  if (keyId && keySecret) {
    razorpayClient = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
    return razorpayClient;
  }
  return null;
}

export const PaymentGateway = {
  isConfigured(): boolean {
    return Boolean(ENV.RAZORPAY_KEY_ID && ENV.RAZORPAY_KEY_SECRET);
  },

  getKeyId(): string {
    return ENV.RAZORPAY_KEY_ID;
  },

  /**
   * Creates an official order with Razorpay.
   * Amount must strictly be integer paise (1 INR = 100 paise).
   */
  async createOrder(params: {
    amountPaise: number;
    receipt: string;
    notes: Record<string, string>;
  }) {
    const client = getRazorpayClient();
    if (!client) {
      throw new Error(
        'Razorpay keys are not configured. Please add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in the environment variables or AI Studio Secrets.'
      );
    }

    return await client.orders.create({
      amount: Math.round(params.amountPaise),
      currency: 'INR',
      receipt: params.receipt,
      notes: params.notes,
      payment_capture: true,
    });
  },

  /**
   * Authoritative HMAC SHA-256 verification of the payment signature returned by Checkout.
   */
  verifyPaymentSignature(orderId: string, paymentId: string, signature: string): boolean {
    if (!ENV.RAZORPAY_KEY_SECRET) {
      return false;
    }

    const payload = `${orderId}|${paymentId}`;
    const generatedSignature = crypto
      .createHmac('sha256', ENV.RAZORPAY_KEY_SECRET)
      .update(payload)
      .digest('hex');

    try {
      const generatedBuffer = Buffer.from(generatedSignature, 'utf-8');
      const receivedBuffer = Buffer.from(signature, 'utf-8');

      if (generatedBuffer.length !== receivedBuffer.length) {
        return false;
      }
      return crypto.timingSafeEqual(generatedBuffer, receivedBuffer);
    } catch {
      return false;
    }
  },

  /**
   * Authoritative verification of the Razorpay Webhook signature against raw buffer.
   */
  verifyWebhookSignature(rawBody: Buffer | string, signature: string): boolean {
    if (!ENV.RAZORPAY_WEBHOOK_SECRET) {
      return false;
    }

    try {
      const generatedSignature = crypto
        .createHmac('sha256', ENV.RAZORPAY_WEBHOOK_SECRET)
        .update(rawBody)
        .digest('hex');

      const expectedBuffer = Buffer.from(generatedSignature, 'utf-8');
      const signatureBuffer = Buffer.from(signature, 'utf-8');

      if (expectedBuffer.length !== signatureBuffer.length) {
        return false;
      }
      return crypto.timingSafeEqual(expectedBuffer, signatureBuffer);
    } catch {
      return false;
    }
  },

  /**
   * Authoritative lookup of payment status and capture directly from Razorpay.
   */
  async fetchPayment(paymentId: string) {
    const client = getRazorpayClient();
    if (!client) {
      throw new Error('Razorpay client not configured');
    }
    return await client.payments.fetch(paymentId);
  },
};
