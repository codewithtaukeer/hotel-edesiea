import {
  verifyRazorpaySignature as _verifyRazorpaySignature,
  verifyWebhookSignature as _verifyWebhookSignature,
  recordVerifiedPayment as _recordVerifiedPayment,
  processRefund as _processRefund,
} from "./payments-core.mjs";

export const verifyRazorpaySignature = _verifyRazorpaySignature as (
  orderId: string,
  paymentId: string,
  signature: string,
  secret?: string
) => boolean;

export const verifyWebhookSignature = _verifyWebhookSignature as (
  rawBody: string,
  signature: string,
  secret?: string
) => boolean;

export const recordVerifiedPayment = _recordVerifiedPayment as (params: {
  bookingId: string;
  amount: number;
  method?: string;
  gatewayOrderId?: string;
  gatewayPaymentId?: string;
  gatewaySignature?: string;
  notes?: string;
}) => Promise<{ isDuplicate: boolean; payment: any }>;

export const processRefund = _processRefund as (params: {
  bookingId: string;
  paymentId?: string;
  amount: number;
  reason: string;
  processedBy?: string;
}) => Promise<any>;
