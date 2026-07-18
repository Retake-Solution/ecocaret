export const PAYMENT_ACTION_BLOCKED_STATUSES = new Set([
  "paid",
  "not_required",
  "refund_pending",
  "partially_refunded",
  "refunded",
  "disputed",
  "cancelled",
  "review_required",
]);

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  created: "Payment required",
  requires_action: "Payment required",
  pending: "Payment required",
  processing: "Payment verification in progress",
  unknown: "Payment verification in progress",
  authorized: "Payment authorized",
  paid: "Paid",
  captured: "Paid",
  failed: "Payment failed",
  cancelled: "Payment cancelled",
  expired: "Payment session expired",
  refund_pending: "Cancellation completed. Your refund is pending.",
  partially_refunded: "Part of your refund has been completed.",
  review_required: "Payment requires support review",
  not_required: "Payment not required",
  refunded: "Refund completed.",
};

export const RETURN_STATUS_LABELS: Record<string, string> = {
  return_requested: "Return requested",
  return_in_transit: "Return in transit",
  return_received: "Received by warehouse",
  inspection_approved: "Inspection approved",
  inspection_rejected: "Inspection rejected",
  refund_processing: "Refund processing",
  refunded: "Refund completed",
  return_rejected: "Return rejected",
  cancelled: "Return cancelled",
};

export const RETURN_REFUND_LABELS: Record<string, string> = {
  not_eligible: "Not eligible",
  refund_pending: "Refund pending",
  partially_refunded: "Partially refunded",
  refunded: "Refund completed",
  review_required: "Requires review",
};

export const ACTIVE_RETURN_STATUSES = new Set([
  "return_requested",
  "return_in_transit",
  "return_received",
  "inspection_approved",
  "refund_processing",
]);
