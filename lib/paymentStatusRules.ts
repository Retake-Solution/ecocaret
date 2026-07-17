export type PaymentStatus =
  | "created"
  | "requires_action"
  | "processing"
  | "authorized"
  | "paid"
  | "failed"
  | "cancelled"
  | "expired"
  | "unknown"
  | "review_required";

export const ACTIVE_PAYMENT_STATUSES: PaymentStatus[] = [
  "created",
  "requires_action",
  "processing",
  "authorized",
  "unknown",
  "review_required",
];

export const POLLABLE_PAYMENT_STATUSES: PaymentStatus[] = [
  "created",
  "requires_action",
  "processing",
  "authorized",
  "unknown",
  "review_required",
];

export const TERMINAL_RETRY_PAYMENT_STATUSES: PaymentStatus[] = [
  "failed",
  "cancelled",
  "expired",
];

export const getPaymentAbandonIdempotencyKey = (paymentId: string) =>
  `payment-abandon:${paymentId}`;

export const isPollablePayment = (status: PaymentStatus) =>
  POLLABLE_PAYMENT_STATUSES.includes(status);

export const shouldPollPaymentStatus = (
  status: PaymentStatus,
  httpStatus?: number
) => httpStatus === 202 || isPollablePayment(status);
