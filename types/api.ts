import { ApiProduct } from "./index";
import type { ProfileUser } from "@/lib/features/profile/profileSlice";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AddressInput {
  name: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  isDefault?: boolean;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  residentialAddress: AddressInput;
  shippingAddresses: AddressInput[];
}

export interface LoginResult {
  user: ProfileUser;
  token: string;
}

export interface ProductFilters {
  category?: string;
  subCategory?: string;
  collection?: string;
  metalType?: string;
  metalColor?: string;
  purity?: string;
  gender?: string;
  shape?: string;
  stoneType?: string;
  minPrice?: string;
  maxPrice?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

export interface ProductListResult {
  products: ApiProduct[];
  total: number;
  page: number;
  limit: number;
}

export interface OrderAddress {
  name: string;
  line1: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
  phone: string;
}

export interface OrderItemInput {
  productId: string;
  metalType: string;
  metalColor: string;
  purity: string;
  size: string;
  quantity: number;
  engraving?: string;
}

export interface PlaceOrderPayload {
  items: OrderItemInput[];
  shippingAddress: OrderAddress;
  billingAddress: OrderAddress;
}

export interface PlaceOrderResult {
  success: boolean;
  data: {
    id: string;
    orderNumber: string;
    customerSnapshot?: {
      name: string;
      email: string;
    };
    [key: string]: unknown;
  };
}

export interface OrderItem {
  productSnapshot: {
    name: string;
    sku: string;
    slug: string;
    imageUrl?: string;
  };
  variantSnapshot: {
    metalType: string;
    metalColor: string;
    purity: string;
    size: string;
    sizeLabel: string;
    engraving?: string;
  };
  quantity: {
    ordered: number;
    cancelled: number;
    shipped: number;
    fulfilled: number;
    returned: number;
    refunded: number;
  };
  pricingSnapshot: {
    originalUnitPriceMinor: number;
    productDiscountMinor: number;
    finalUnitPriceMinor: number;
    subtotalMinor: number;
  };
  fulfillmentStatus: string;
  _id: string;
}

export interface OrderData {
  id: string;
  orderNumber: string;
  customerSnapshot?: {
    name: string;
    email: string;
  };
  items: OrderItem[];
  totals: {
    merchandiseSubtotalMinor: number;
    itemDiscountMinor: number;
    orderDiscountMinor: number;
    shippingMinor: number;
    taxMinor: number;
    totalMinor: number;
    authorizedMinor?: number;
    paidMinor: number;
    refundedMinor?: number;
    amountDueMinor: number;
    currency: string;
  };
  shippingAddressSnapshot?: AddressInput;
  billingAddressSnapshot?: AddressInput;
  fulfillmentStatus: string;
  paymentStatus: string;
  reservationStatus?: string;
  reservationExpiresAt?: string;
  cancellation?: {
    status: string;
    reason: string;
    requestedAt: string;
    completedAt: string;
  } | null;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface GetOrdersParams {
  page?: number;
  limit?: number;
  fulfillmentStatus?: string;
  paymentStatus?: string;
  search?: string;
}

export interface GetOrdersResult {
  success: boolean;
  data: OrderData[];
  pagination?: {
    totalItems: number;
    totalPages: number;
    page: number;
    limit: number;
    hasNextPage?: boolean;
    hasPreviousPage?: boolean;
  };
}

export interface SingleOrderResult {
  success: boolean;
  data: OrderData;
}

export type PaymentProvider = "stripe" | "razorpay";

export type CustomerPaymentStatus =
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

export interface RazorpayCheckoutAction {
  type: "razorpay_checkout";
  keyId: string;
  providerOrderId: string;
  amountMinor: number;
  currency: "USD";
  merchantName: string;
}

export interface CustomerPayment {
  id: string;
  orderId: string;
  provider: PaymentProvider;
  status: CustomerPaymentStatus;
  amountMinor: number;
  currency: "USD";
  captureMethod: "automatic" | "manual";
  expiresAt?: string;
  createdAt?: string;
  updatedAt?: string;
  clientAction?: RazorpayCheckoutAction | { type: "stripe_elements"; clientSecret: string; publishableKey: string };
}

export interface CreatePaymentPayload {
  channel: "web";
  returnPath: "order-status";
  provider: "razorpay";
}

export interface CustomerPaymentResult {
  success: boolean;
  data: CustomerPayment;
}

export interface CustomerPaymentListResult {
  success: boolean;
  data: CustomerPayment[];
}

export interface VerifyRazorpayPayload {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

export interface OrderEvent {
  sequence: number;
  type: string;
  createdAt: string;
}

export interface GetOrderEventsParams {
  afterSequence?: number;
  limit?: number;
}

export interface GetOrderEventsResult {
  success: boolean;
  data: OrderEvent[];
  pagination?: {
    limit: number;
    hasMore: boolean;
    nextAfterSequence: number;
  };
}

export interface ShipmentItem {
  orderItemId: string;
  quantity: number;
}

export interface ShipmentData {
  id: string;
  shipmentNumber: string;
  items: ShipmentItem[];
  carrier: string;
  service: string;
  trackingNumber: string;
  trackingUrl: string;
  status: string;
  shippedAt: string;
  estimatedDelivery?: string;
  deliveredAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface GetOrderShipmentsParams {
  limit?: number;
  cursor?: string;
}

export interface GetOrderShipmentsResult {
  success: boolean;
  data: ShipmentData[];
  pagination: {
    limit: number;
    hasMore: boolean;
    nextCursor: string | null;
  };
}

export interface CancelOrderItemInput {
  orderItemId: string;
  quantity: number;
}

export interface CancelOrderPayload {
  reason: string;
  expectedVersion: number;
  items?: CancelOrderItemInput[];
}

export interface CancelOrderResult {
  success: boolean;
  data: OrderData;
}
