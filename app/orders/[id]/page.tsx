"use client";

import React, { use, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import OrderTimeline from "@/components/OrderTimeline";
import Button from "@/components/Button";
import { useAppSelector } from "@/lib/store";
import { formatServerMoney } from "@/lib/money";
import { THEME_COLORS } from "@/theme/colors";
import axios from "axios";
import {
  ApiRequestError,
  getOrderById,
  getOrderEvents,
  getOrderShipments,
  cancelOrder,
  createOrderReturn,
  getOrderInvoice,
  listOrderReturns,
} from "@/services/api";
import { clearStoredIdempotencyKey, getStoredIdempotencyKey } from "@/lib/idempotency";
import { CustomerCancellation, CustomerReturn, OrderData, OrderEvent, OrderItem, ShipmentData } from "@/types";
import { useRazorpayPayment } from "@/hooks/useRazorpayPayment";
import {
  ACTIVE_RETURN_STATUSES,
  PAYMENT_ACTION_BLOCKED_STATUSES,
  PAYMENT_STATUS_LABELS,
  RETURN_REFUND_LABELS,
  RETURN_STATUS_LABELS,
} from "@/constants/orderDetail";

interface PageProps {
  params: Promise<{ id: string }>;
}

const STEPS = [
  { key: "pending", label: "Order Placed" },
  { key: "confirmed", label: "Confirmed" },
  { key: "crafting", label: "Being Crafted" },
  { key: "quality_check", label: "Quality Check" },
  { key: "ready_to_ship", label: "Ready to Ship" },
  { key: "shipped", label: "Shipped" },
  { key: "delivered", label: "Delivered" },
];

const getCurrentStepIndex = (status: string) => {
  const norm = status.toLowerCase();
  if (norm === "pending") return 0;
  if (norm === "confirmed") return 1;
  if (norm === "crafting") return 2;
  if (norm === "quality_check") return 3;
  if (norm === "ready_to_ship") return 4;
  if (norm === "shipped" || norm === "partially_shipped") return 5;
  if (norm === "delivered" || norm === "partially_delivered") return 6;
  return -1; // e.g. cancelled
};

const getShipmentStatusDetails = (status: string) => {
  const norm = status.toLowerCase();
  switch (norm) {
    case "pending":
      return { label: "Preparing", color: "#6B7280", bgColor: "rgba(107, 114, 128, 0.1)" };
    case "label_created":
      return { label: "Label Created", color: "#3B82F6", bgColor: "rgba(59, 130, 246, 0.1)" };
    case "shipped":
      return { label: "Shipped", color: "#6366F1", bgColor: "rgba(99, 102, 241, 0.1)" };
    case "in_transit":
      return { label: "In Transit", color: "#F97316", bgColor: "rgba(249, 115, 22, 0.1)" };
    case "delivered":
      return { label: "Delivered", color: "#10B981", bgColor: "rgba(16, 185, 129, 0.1)" };
    case "exception":
      return { label: "Delivery Issue", color: "#EF4444", bgColor: "rgba(239, 68, 68, 0.1)" };
    case "cancelled":
      return { label: "Cancelled", color: "#374151", bgColor: "rgba(55, 65, 81, 0.1)" };
    default:
      return { label: status, color: "#6B7280", bgColor: "rgba(107, 114, 128, 0.1)" };
  }
};

const isSafeCurrencyCode = (currency: string) => /^[A-Z]{3}$/.test(currency);

const isSafeCurrencyExponent = (exponent: unknown) =>
  Number.isSafeInteger(exponent) && Number(exponent) >= 0 && Number(exponent) <= 6;

const formatCurrencyMinor = (amountMinor: number, currency: string, exponent?: number) =>
  formatServerMoney(amountMinor, currency || "USD", [], {
    currencyDisplay: "code",
    fallbackExponent: exponent ?? 2,
  });

const formatDateTime = (value?: string) => {
  if (!value) return "Not updated yet";
  return new Date(value).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getCancelableQuantity = (item: OrderItem) =>
  Math.max(item.quantity.ordered - item.quantity.cancelled - item.quantity.shipped, 0);

const getShippedReturnBaseQuantity = (item: OrderItem) =>
  Math.max(item.quantity.shipped - item.quantity.returned, 0);

const getOrderItemId = (item: OrderItem) => item.id || item._id;

const getActiveReturnOutstandingByItem = (returns: CustomerReturn[]) =>
  returns.reduce<Record<string, number>>((acc, returnRequest) => {
    if (!ACTIVE_RETURN_STATUSES.has(returnRequest.status)) return acc;

    returnRequest.items.forEach((item) => {
      acc[item.orderItemId] = (acc[item.orderItemId] || 0) + Math.max(item.quantity - item.receivedQuantity, 0);
    });

    return acc;
  }, {});

const getSafeApiMessage = (error: unknown, fallback: string) => {
  if (error instanceof ApiRequestError) {
    if (error.status === 401) return "Your session expired. Please sign in again.";
    if (error.status === 404) return "This order is unavailable. Please refresh your order history.";
    if (error.status === 429) return "Too many requests. Please wait and try again later.";
    switch (error.code) {
      case "ORDER_RETURN_REQUIRED":
        return "Some selected quantities have already shipped. Please use Request Return for those items.";
      case "ORDER_VERSION_CONFLICT":
        return "This order changed while you were reviewing it. We refreshed the order; please submit again.";
      case "PAYMENT_CANCELLATION_REQUIRED":
        return "An active payment attempt must finish or expire before cancellation.";
      case "PAYMENT_VOID_REQUIRED":
        return "Payment authorization must be released before this cancellation can complete.";
      case "ORDER_RESERVATION_RELEASE_CONFLICT":
        return "Inventory reservation changed. We refreshed the order; please review and retry.";
      case "ORDER_SHIPMENT_QUANTITY_CONFLICT":
      case "ORDER_RETURN_QUANTITY_CONFLICT":
        return "Item quantities changed. We refreshed the order; please review and retry.";
      default:
        return error.message || fallback;
    }
  }

  return error instanceof Error && error.message ? error.message : fallback;
};

export default function OrderDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const selectedCurrencyCode = useAppSelector((state) => state.currency.selectedCode);

  const [liveOrder, setLiveOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Timeline events state
  const [events, setEvents] = useState<OrderEvent[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [eventsHasMore, setEventsHasMore] = useState(false);
  const [nextAfterSequence, setNextAfterSequence] = useState<number | undefined>(undefined);
  const [loadingMoreEvents, setLoadingMoreEvents] = useState(false);

  // Shipments state
  const [shipments, setShipments] = useState<ShipmentData[]>([]);
  const [shipmentsLoading, setShipmentsLoading] = useState(true);

  // Cancellation state
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelQuantities, setCancelQuantities] = useState<Record<string, number>>({});
  const [lastCancellation, setLastCancellation] = useState<CustomerCancellation | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelError, setCancelError] = useState("");

  // Return state
  const [returns, setReturns] = useState<CustomerReturn[]>([]);
  const [returnsLoading, setReturnsLoading] = useState(true);
  const [returnsHasMore, setReturnsHasMore] = useState(false);
  const [returnsNextCursor, setReturnsNextCursor] = useState<string | undefined>(undefined);
  const [loadingMoreReturns, setLoadingMoreReturns] = useState(false);
  const [isReturnOpen, setIsReturnOpen] = useState(false);
  const [returnReason, setReturnReason] = useState("");
  const [returnQuantities, setReturnQuantities] = useState<Record<string, number>>({});
  const [returnError, setReturnError] = useState("");
  const [isReturning, setIsReturning] = useState(false);
  const [expandedReturnId, setExpandedReturnId] = useState<string | null>(null);

  // Invoice download state
  const [isDownloading, setIsDownloading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "warning" } | null>(null);
  const [reservationTimeSnapshot, setReservationTimeSnapshot] = useState<number | null>(null);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setReservationTimeSnapshot(Date.now());
    }, 0);

    return () => window.clearTimeout(timer);
  }, [liveOrder?.reservationExpiresAt]);

  const showToast = (message: string, type: "success" | "error" | "warning") => {
    setToast({ message, type });
  };

  const refreshOrder = useCallback(async () => {
    const orderResult = await getOrderById(id);
    setLiveOrder(orderResult.data);
    return orderResult.data;
  }, [id]);

  const loadReturns = useCallback(async (cursor?: string) => {
    const result = await listOrderReturns(id, { limit: 20, cursor });

    setReturns((prev) => {
      const next = cursor ? [...prev] : [];
      result.data.forEach((returnRequest) => {
        if (!next.some((existing) => existing.id === returnRequest.id)) {
          next.push(returnRequest);
        }
      });
      return next;
    });
    setReturnsHasMore(result.pagination?.hasMore || false);
    setReturnsNextCursor(result.pagination?.nextCursor);
    return result.data;
  }, [id]);

  const refreshOrderWorkflow = useCallback(async () => {
    const [orderResult, eventsResult] = await Promise.all([
      getOrderById(id),
      getOrderEvents(id),
      loadReturns(),
    ]);

    setLiveOrder(orderResult.data);
    setEvents([...eventsResult.data].reverse());
    setEventsHasMore(eventsResult.pagination?.hasMore || false);
    setNextAfterSequence(eventsResult.pagination?.nextAfterSequence);
    return orderResult.data;
  }, [id, loadReturns]);

  const paymentFlow = useRazorpayPayment({
    onPaid: async () => {
      try {
        await refreshOrder();
        showToast("Payment verified successfully.", "success");
      } catch {
        showToast("Payment verified. Refresh the order to see the latest ledger.", "success");
      }
    },
    onPending: async () => {
      try {
        await refreshOrder();
      } catch {
        // The payment poll remains active; a later status check can refresh the order ledger.
      }
    },
    onTerminal: async () => {
      try {
        await refreshOrder();
      } catch {
        showToast("Payment status changed. Refresh the order to see the latest ledger.", "warning");
      }
    },
    onOrderRefresh: refreshOrder,
  });

  useEffect(() => {
    const fetchOrderData = async () => {
      setLoading(true);
      setError("");
      try {
        await refreshOrder();
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load order provenance.");
      } finally {
        setLoading(false);
      }
    };

    const fetchEventsData = async () => {
      setEventsLoading(true);
      try {
        const eventsResult = await getOrderEvents(id);
        setEvents([...eventsResult.data].reverse());
        setEventsHasMore(eventsResult.pagination?.hasMore || false);
        setNextAfterSequence(eventsResult.pagination?.nextAfterSequence);
      } catch (err) {
        console.error("Failed to load order events:", err);
      } finally {
        setEventsLoading(false);
      }
    };

    const fetchShipmentsData = async () => {
      setShipmentsLoading(true);
      try {
        const shipmentsResult = await getOrderShipments(id);
        setShipments(shipmentsResult.data);
      } catch (err) {
        console.error("Failed to load shipments:", err);
      } finally {
        setShipmentsLoading(false);
      }
    };

    const fetchReturnsData = async () => {
      setReturnsLoading(true);
      try {
        await loadReturns();
      } catch (err) {
        console.error("Failed to load returns:", err);
      } finally {
        setReturnsLoading(false);
      }
    };

    fetchOrderData();
    fetchEventsData();
    fetchShipmentsData();
    fetchReturnsData();
  }, [id, loadReturns, refreshOrder]);

  const loadMoreEvents = async () => {
    if (loadingMoreEvents || !eventsHasMore || nextAfterSequence === undefined) return;
    try {
      setLoadingMoreEvents(true);
      const eventsResult = await getOrderEvents(id, { afterSequence: nextAfterSequence });
      const reversedNewEvents = [...eventsResult.data].reverse();
      setEvents((prev) => [...prev, ...reversedNewEvents]);
      setEventsHasMore(eventsResult.pagination?.hasMore || false);
      setNextAfterSequence(eventsResult.pagination?.nextAfterSequence);
    } catch (err) {
      console.error("Failed to load more timeline events:", err);
    } finally {
      setLoadingMoreEvents(false);
    }
  };

  const loadMoreReturns = async () => {
    if (loadingMoreReturns || !returnsHasMore || !returnsNextCursor) return;
    try {
      setLoadingMoreReturns(true);
      await loadReturns(returnsNextCursor);
    } catch (err) {
      console.error("Failed to load more returns:", err);
      showToast("Unable to load more return requests.", "error");
    } finally {
      setLoadingMoreReturns(false);
    }
  };

  const handleCancelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!liveOrder || !cancelReason.trim()) return;
    const selectedItems = liveOrder.items
      .map((item) => {
        const itemId = getOrderItemId(item);
        return {
          orderItemId: itemId,
          quantity: Math.min(cancelQuantities[itemId] || 0, getCancelableQuantity(item)),
        };
      })
      .filter((item) => item.quantity > 0);
    const cancelableItems = liveOrder.items.filter((item) => getCancelableQuantity(item) > 0);
    const isFullUnshippedCancellation =
      selectedItems.length === cancelableItems.length &&
      cancelableItems.every((item) => (cancelQuantities[getOrderItemId(item)] || 0) === getCancelableQuantity(item)) &&
      liveOrder.items.every((item) => item.quantity.shipped === 0);

    if (selectedItems.length === 0) {
      setCancelError("Select at least one unshipped quantity to cancel.");
      return;
    }

    try {
      setIsCancelling(true);
      setCancelError("");
      const idempotencyKey = getStoredIdempotencyKey(`eco_caret_cancel_${id}`);
      const payload = {
        reason: cancelReason,
        expectedVersion: liveOrder.version,
        ...(isFullUnshippedCancellation ? {} : { items: selectedItems }),
      };
      const result = await cancelOrder(id, payload, idempotencyKey);
      setLiveOrder(result.data);
      setLastCancellation(result.cancellation || null);
      setIsCancelOpen(false);
      setCancelReason("");
      setCancelQuantities({});
      clearStoredIdempotencyKey(`eco_caret_cancel_${id}`);
      
      await refreshOrderWorkflow();
      showToast(
        result.cancellation?.refundStatus === "refund_pending"
          ? "Cancellation completed. Your refund is pending."
          : "Cancellation completed.",
        "success"
      );
    } catch (err: unknown) {
      if (
        err instanceof ApiRequestError &&
        [
          "ORDER_VERSION_CONFLICT",
          "ORDER_RESERVATION_RELEASE_CONFLICT",
          "ORDER_SHIPMENT_QUANTITY_CONFLICT",
        ].includes(err.code || "")
      ) {
        try {
          await refreshOrderWorkflow();
        } catch (fetchErr) {
          console.error("Failed to refetch order:", fetchErr);
        }
      }
      setCancelError(getSafeApiMessage(err, "Failed to cancel order."));
    } finally {
      setIsCancelling(false);
    }
  };

  const handleReturnSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!liveOrder || !returnReason.trim()) return;

    const outstandingByItem = getActiveReturnOutstandingByItem(returns);
    const selectedItems = liveOrder.items
      .map((item) => {
        const itemId = getOrderItemId(item);
        const maxQuantity = Math.max(getShippedReturnBaseQuantity(item) - (outstandingByItem[itemId] || 0), 0);
        return {
          id: itemId,
          returnQuantity: Math.min(returnQuantities[itemId] || 0, maxQuantity),
        };
      })
      .filter((item) => item.returnQuantity > 0);

    if (selectedItems.length === 0) {
      setReturnError("Select at least one returnable quantity.");
      return;
    }

    try {
      setIsReturning(true);
      setReturnError("");
      const idempotencyKey = getStoredIdempotencyKey(`eco_caret_return_${id}`);
      const payload = {
        expectedOrderVersion: liveOrder.version,
        reason: returnReason,
        items: selectedItems.map((item) => ({
          orderItemId: item.id,
          quantity: item.returnQuantity,
        })),
      };
      await createOrderReturn(id, payload, idempotencyKey);
      setIsReturnOpen(false);
      setReturnReason("");
      setReturnQuantities({});
      clearStoredIdempotencyKey(`eco_caret_return_${id}`);
      await refreshOrderWorkflow();
      showToast("Return requested. Refund status will update after inspection.", "success");
    } catch (err: unknown) {
      if (err instanceof ApiRequestError && ["ORDER_VERSION_CONFLICT", "ORDER_RETURN_QUANTITY_CONFLICT"].includes(err.code || "")) {
        try {
          await refreshOrderWorkflow();
        } catch (fetchErr) {
          console.error("Failed to refetch order:", fetchErr);
        }
      }
      setReturnError(getSafeApiMessage(err, "Unable to request return."));
    } finally {
      setIsReturning(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-background text-on-surface font-body-md min-h-screen flex flex-col relative selection:bg-secondary-container">
        <main className="flex-grow max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-12 pt-28 w-full">
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <div
              className="w-12 h-12 rounded-full border-4 border-outline-variant/30 border-t-primary animate-spin"
              style={{ borderTopColor: THEME_COLORS.global.primary }}
            />
            <p className="text-on-surface-variant text-sm font-label-md tracking-wider uppercase animate-pulse">
              Retrieving Provenance Certificate...
            </p>
          </div>
        </main>
      </div>
    );
  }

  if (error || !liveOrder) {
    return (
      <div className="bg-background text-on-surface font-body-md min-h-screen flex flex-col relative selection:bg-secondary-container">
        <main className="flex-grow max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-12 pt-28 w-full">
          <div className="p-8 rounded-2xl bg-error-container/40 border border-error/20 text-center max-w-md mx-auto space-y-4">
            <span className="material-symbols-outlined text-error text-5xl">warning</span>
            <h3 className="font-playfair text-2xl font-semibold text-on-error-container">
              Failed
            </h3>
            <p className="text-on-error-container font-medium text-sm leading-relaxed">{error || "Order not found."}</p>
            <div className="flex gap-4 justify-center">
              <Link
                href="/orders"
                className="bg-primary text-white px-6 py-2.5 rounded-full text-xs font-bold uppercase hover:bg-secondary transition-all"
              >
                Go to History
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const orderDetails = {
    number: `#${liveOrder.orderNumber}`,
    name: liveOrder.items[0]?.productSnapshot?.name,
    price: formatCurrencyMinor(liveOrder.totals.totalMinor, liveOrder.totals.currency, liveOrder.totals.exponent),
    date: new Date(liveOrder.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
    deliveryDate: new Date(new Date(liveOrder.createdAt).getTime() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    specs: `Metal: ${liveOrder.items[0]?.variantSnapshot?.metalType} • Purity: ${liveOrder.items[0]?.variantSnapshot?.purity} • Color: ${liveOrder.items[0]?.variantSnapshot?.metalColor} • Size: ${liveOrder.items[0]?.variantSnapshot?.sizeLabel || liveOrder.items[0]?.variantSnapshot?.size}`,
    image: liveOrder.items[0]?.productSnapshot?.imageUrl,
    stepIndex: getCurrentStepIndex(liveOrder.fulfillmentStatus),
  };

  const handleDownloadInvoice = async () => {
    if (isDownloading) return;
    try {
      setIsDownloading(true);
      const response = await getOrderInvoice(id);

      // Create blob link to download
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      // Parse filename from disposition or fallback
      const disposition = response.headers["content-disposition"];
      const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
      const matches = filenameRegex.exec(disposition);
      const filename = (matches && matches[1]) ? matches[1].replace(/['"]/g, "") : `invoice-${liveOrder.orderNumber}.pdf`;

      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();

      // Clean up
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      showToast("Invoice downloaded successfully.", "success");
    } catch (error: unknown) {
      console.error("Failed to download invoice:", error);
      
      let status = 500;
      if (axios.isAxiosError(error)) {
        status = error.response?.status || 500;
      }

      if (status === 429) {
        showToast("You are downloading invoices too frequently. Please wait a minute and try again.", "warning");
      } else if (status === 401 || status === 404) {
        showToast("Unable to download invoice. Please try logging in again.", "error");
      } else {
        showToast("Failed to generate invoice. Please contact support.", "error");
      }
    } finally {
      setIsDownloading(false);
    }
  };

  const paymentPrefill = () => ({
    name: liveOrder.customerSnapshot?.name || liveOrder.shippingAddressSnapshot?.name || "",
    email: liveOrder.customerSnapshot?.email || "",
    contact: liveOrder.shippingAddressSnapshot?.phone || "",
  });

  // Status mapping colors & labels
  const normStatus = liveOrder.fulfillmentStatus.toLowerCase();
  const isDelivered = normStatus === "fulfilled" || normStatus === "delivered";
  const isShipped = normStatus === "shipped";
  const isCancelled = normStatus === "cancelled" || normStatus === "refunded";

  let statusLabel = "Crafting";
  let statusColor: string = THEME_COLORS.global.secondary;

  if (isDelivered) {
    statusLabel = "Delivered";
    statusColor = THEME_COLORS.global.primary;
  } else if (isShipped) {
    statusLabel = "Shipped";
    statusColor = "#2B8A75";
  } else if (isCancelled) {
    statusLabel = "Cancelled";
    statusColor = "#EF4444";
  } else if (normStatus === "pending") {
    statusLabel = "Pending";
    statusColor = "#D97706";
  } else if (normStatus === "confirmed") {
    statusLabel = "Confirmed";
    statusColor = "#3B82F6";
  } else if (normStatus === "ready_to_ship") {
    statusLabel = "Ready to Ship";
    statusColor = "#0D9488";
  } else if (normStatus === "quality_check") {
    statusLabel = "Quality Check";
    statusColor = "#7C3AED";
  }

  // Payment status mapping
  const normPayment = liveOrder.paymentStatus.toLowerCase();
  const isPaid = normPayment === "paid" || normPayment === "captured";
  let payStatusLabel = PAYMENT_STATUS_LABELS[normPayment] || "Payment required";
  let payStatusColor: string = "#71717A";
  if (isPaid) {
    payStatusLabel = "Paid";
    payStatusColor = THEME_COLORS.global.primary;
  } else if (normPayment === "authorized") {
    payStatusColor = "#3B82F6";
  } else if (normPayment === "pending") {
    payStatusLabel = "Payment Pending";
    payStatusColor = "#D97706";
  } else if (normPayment === "failed") {
    payStatusLabel = "Payment Failed";
    payStatusColor = "#EF4444";
  }

  const outstandingReturnByItem = getActiveReturnOutstandingByItem(returns);
  const cancelableItems = liveOrder.items
    .map((item) => ({ item, quantity: getCancelableQuantity(item) }))
    .filter(({ quantity }) => quantity > 0);
  const returnableItems = liveOrder.items
    .map((item) => ({
      item,
      quantity: Math.max(getShippedReturnBaseQuantity(item) - (outstandingReturnByItem[getOrderItemId(item)] || 0), 0),
    }))
    .filter(({ quantity }) => quantity > 0);
  const isCancellable = cancelableItems.length > 0;
  const isReturnable = returnableItems.length > 0;
  const isFullyCancelled =
    liveOrder.items.length > 0 &&
    liveOrder.items.every((item) => item.quantity.cancelled >= item.quantity.ordered);
  const paymentActionLocked = paymentFlow.busy || paymentFlow.polling || paymentFlow.reconciling;

  const renderOrderHeader = () => {
    return (
      <div className="mb-16 p-8 rounded-[2rem] bg-gradient-to-br from-surface-container-low to-surface border border-[#3C9984]/15 organic-shadow relative overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#3C9984] rounded-full blur-[90px] opacity-10 pointer-events-none"></div>
        {/* Certificate borders in corners */}
        <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-[#3C9984]/30 rounded-tl-lg pointer-events-none"></div>
        <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-[#3C9984]/30 rounded-tr-lg pointer-events-none"></div>
        <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-[#3C9984]/30 rounded-bl-lg pointer-events-none"></div>
        <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-[#3C9984]/30 rounded-br-lg pointer-events-none"></div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <span className="font-label-md text-label-md text-secondary uppercase tracking-widest block mb-2 font-bold">
              Provenance Ledger Certificate
            </span>
            <h1 className="font-playfair text-3xl md:text-4xl font-bold text-primary">
              Order {orderDetails.number}
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant mt-2 flex flex-wrap items-center gap-x-2">
              <span>Placed on {orderDetails.date}</span>
              <span className="opacity-40">•</span>
              <span>Estimated Delivery: {orderDetails.deliveryDate}</span>
            </p>
            
            <div className="flex flex-wrap gap-2.5 mt-5">
              <span className="text-[10px] font-extrabold px-4 py-1.5 rounded-full uppercase tracking-wider border" style={{ backgroundColor: statusColor + "12", color: statusColor, borderColor: statusColor + "30" }}>
                Fulfillment: {statusLabel}
              </span>
              <span className="text-[10px] font-extrabold px-4 py-1.5 rounded-full uppercase tracking-wider border" style={{ backgroundColor: payStatusColor + "12", color: payStatusColor, borderColor: payStatusColor + "30" }}>
                Payment: {payStatusLabel}
              </span>
              <span className="text-[10px] font-extrabold px-4 py-1.5 bg-surface-container-high/60 border border-outline-variant/30 text-on-surface-variant rounded-full uppercase tracking-wider">
                Ledger Ver. {liveOrder.version}
              </span>
            </div>
          </div>
          
          <Button
            unstyled
            onClick={handleDownloadInvoice}
            disabled={isDownloading}
            className="flex items-center gap-2 px-6 py-3.5 bg-surface-container hover:bg-[#3C9984]/10 border border-outline-variant/20 rounded-full font-label-md text-label-md text-secondary hover:text-primary transition-all group cursor-pointer w-full md:w-auto justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDownloading ? (
              <span className="w-5 h-5 rounded-full border-2 border-outline-variant/30 border-t-primary animate-spin" />
            ) : (
              <span className="material-symbols-outlined text-[20px] group-hover:scale-110 transition-transform">download</span>
            )}
            <span className="font-bold uppercase tracking-wider">
              {isDownloading ? "Generating PDF..." : "Download Invoice"}
            </span>
          </Button>
        </div>
      </div>
    );
  };

  const renderPaymentActionCard = () => {
    const paymentState = paymentFlow.payment?.status || normPayment;
    const paymentLabel = PAYMENT_STATUS_LABELS[paymentState] || paymentState.replace(/_/g, " ");
    const paymentLastUpdated = paymentFlow.payment?.updatedAt || liveOrder.updatedAt;
    const paymentCurrencyValid = isSafeCurrencyCode(liveOrder.totals.currency);
    const paymentExponentValid =
      liveOrder.totals.exponent === undefined || isSafeCurrencyExponent(liveOrder.totals.exponent);
    const amountDueValid = Number.isSafeInteger(liveOrder.totals.amountDueMinor) && liveOrder.totals.amountDueMinor >= 0;
    const amountDueLabel = formatCurrencyMinor(
      liveOrder.totals.amountDueMinor,
      liveOrder.totals.currency,
      liveOrder.totals.exponent
    );
    const reservationExpired =
      liveOrder.reservationStatus?.toLowerCase() === "expired" ||
      Boolean(
        liveOrder.reservationExpiresAt &&
        reservationTimeSnapshot !== null &&
        new Date(liveOrder.reservationExpiresAt).getTime() < reservationTimeSnapshot
      );
    const needsPayment =
      liveOrder.totals.amountDueMinor > 0 &&
      !PAYMENT_ACTION_BLOCKED_STATUSES.has(normPayment) &&
      paymentState !== "review_required" &&
      !reservationExpired &&
      paymentCurrencyValid &&
      paymentExponentValid &&
      amountDueValid &&
      !isFullyCancelled;
    const canClickPayment = needsPayment && !paymentActionLocked;

    const handlePaymentClick = async () => {
      if (!canClickPayment) return;
      const orderReference = liveOrder.orderNumber ? `order #${liveOrder.orderNumber}` : `order ${id}`;
      if (paymentFlow.payment && ["processing", "authorized", "unknown", "review_required"].includes(paymentFlow.payment.status)) {
        await paymentFlow.resumePayment(id, paymentPrefill(), orderReference, liveOrder.totals.currency);
        return;
      }
      if (paymentFlow.payment && ["requires_action", "created"].includes(paymentFlow.payment.status)) {
        await paymentFlow.resumePayment(id, paymentPrefill(), orderReference, liveOrder.totals.currency);
        return;
      }
      await paymentFlow.startPayment({
        orderId: id,
        orderCurrency: liveOrder.totals.currency,
        prefill: paymentPrefill(),
        orderReference,
      });
    };

    return (
      <section
        tabIndex={0}
        aria-labelledby="payment-section-title"
        className="bg-surface-container-low rounded-2xl p-6 border border-[#3C9984]/20 organic-shadow text-sm space-y-5 outline-none focus-visible:ring-4 focus-visible:ring-[#3C9984]/25 focus-visible:border-[#3C9984] transition-all"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0">
            <div className="min-w-0">
              <h3
                id="payment-section-title"
                className="font-label-md text-label-md text-primary uppercase tracking-widest font-bold"
              >
                Payment
              </h3>
            </div>
          </div>
          <span
            className="text-[10px] font-extrabold px-3 py-1.5 rounded-full uppercase tracking-wider border flex-shrink-0"
            style={{
              backgroundColor: needsPayment ? "#3C998414" : "rgba(113, 113, 122, 0.12)",
              color: needsPayment ? "#3C9984" : "#71717A",
              borderColor: needsPayment ? "#3C998433" : "rgba(113, 113, 122, 0.24)",
            }}
          >
            {needsPayment ? "Action Needed" : "No Action"}
          </span>
        </div>

        <div className="rounded-2xl bg-[#3C9984]/5 border border-[#3C9984]/15 p-4">
          <p className="text-[10px] uppercase tracking-wider font-bold text-on-surface-variant">
            Amount Due
          </p>
          <p className="font-headline-sm text-headline-sm font-extrabold text-primary mt-1">
            {amountDueLabel}
          </p>
        </div>

        <div>
          <div className="bg-surface-container-high/40 border border-outline-variant/10 p-3">
            <p className="font-bold text-on-surface capitalize mt-1">{paymentLabel}</p>
          </div>
          <div className="bg-surface-container-high/40 border border-outline-variant/10 p-3">
            <p className="uppercase tracking-wider font-bold text-on-surface-variant">Last Updated</p>
            <p className="font-bold text-on-surface mt-1">{formatDateTime(paymentLastUpdated)}</p>
          </div>
        </div>

        {paymentFlow.message.text && (
          <p
            role="status"
            aria-live="polite"
            className={`text-xs font-semibold rounded-xl p-3 ${
              paymentFlow.message.type === "error"
                ? "bg-error-container/30 text-error"
                : paymentFlow.message.type === "warning"
                ? "bg-warning-container/40 text-on-warning-container"
                : "bg-primary/5 text-primary"
            }`}
          >
            {paymentFlow.message.text}
          </p>
        )}
        {selectedCurrencyCode && selectedCurrencyCode !== liveOrder.totals.currency && (
          <div className="rounded-xl border border-outline-variant/20 bg-surface-container-high/50 p-3 text-xs font-semibold text-on-surface-variant">
            This order will be paid in {liveOrder.totals.currency}, the currency selected when it was created.
          </div>
        )}
        {(!paymentCurrencyValid || !paymentExponentValid || !amountDueValid) && (
          <div className="rounded-xl border border-error/20 bg-error/5 p-3 text-xs font-semibold text-error">
            Payment is unavailable because this order has incomplete currency information. Please contact support.
          </div>
        )}

        {reservationExpired && (
          <p role="status" className="text-xs font-semibold rounded-xl p-3 bg-warning-container/40 text-on-warning-container">
            Payment is disabled because this order reservation expired. Please contact support before trying again.
          </p>
        )}

        {needsPayment && (
          <Button
            unstyled
            type="button"
            disabled={!canClickPayment}
            aria-disabled={!canClickPayment}
            aria-busy={paymentActionLocked}
            onClick={handlePaymentClick}
            className="w-full py-3.5 bg-primary text-white font-bold text-xs uppercase tracking-widest rounded-full hover:opacity-90 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#3C9984]/30 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-container-low"
          >
            {paymentFlow.polling || paymentFlow.reconciling ? "Checking Payment..." : paymentFlow.busy ? "Preparing Payment..." : "Pay Now"}
          </Button>
        )}
        {paymentFlow.payment && paymentFlow.reconciling && !paymentFlow.polling && (
          <Button
            unstyled
            type="button"
            disabled={paymentFlow.busy}
            onClick={() => void paymentFlow.checkPaymentStatus()}
            className="w-full py-3 bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant/20 text-xs font-bold uppercase tracking-wider rounded-full transition-all cursor-pointer text-on-surface disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Check payment status
          </Button>
        )}
      </section>
    );
  };

  const renderOrderActionsCard = () => {
    if (!isCancellable && !isReturnable && !lastCancellation) return null;

    return (
      <div className="bg-surface-container-low rounded-2xl p-6 border border-outline-variant/10 organic-shadow space-y-4">
        <h3 className="font-label-md text-label-md text-primary uppercase tracking-widest font-bold">
          Order Actions
        </h3>
        {lastCancellation && (
          <div className="rounded-xl bg-primary/5 border border-primary/10 p-3 text-xs space-y-1">
            <p className="font-bold text-primary uppercase tracking-wider">
              Cancellation {lastCancellation.status}
            </p>
            <p className="text-on-surface-variant">
              Refund: {RETURN_REFUND_LABELS[lastCancellation.refundStatus] || lastCancellation.refundStatus.replace(/_/g, " ")}
            </p>
            <p className="font-semibold text-on-surface">
              {formatOrderMoney(lastCancellation.refundAmountMinor)}
            </p>
          </div>
        )}
        {isCancellable && (
          <Button
            unstyled
            type="button"
            disabled={paymentActionLocked}
            onClick={() => {
              setCancelReason("");
              setCancelError("");
              clearStoredIdempotencyKey(`eco_caret_cancel_${id}`);
              setCancelQuantities(
                Object.fromEntries(cancelableItems.map(({ item, quantity }) => [getOrderItemId(item), quantity]))
              );
              setIsCancelOpen(true);
            }}
            className="w-full py-3 bg-error/10 hover:bg-error text-error hover:text-white font-bold text-xs uppercase tracking-widest rounded-full transition-all border border-error/30 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel Unshipped Items
          </Button>
        )}
        {paymentActionLocked && isCancellable && (
          <p className="text-xs font-semibold text-on-surface-variant rounded-xl bg-surface-container-high/40 p-3">
            Cancellation is paused while payment status is being verified.
          </p>
        )}
        {isReturnable && (
          <Button
            unstyled
            type="button"
            onClick={() => {
              setReturnReason("");
              setReturnError("");
              clearStoredIdempotencyKey(`eco_caret_return_${id}`);
              setReturnQuantities(
                Object.fromEntries(returnableItems.map(({ item, quantity }) => [getOrderItemId(item), quantity]))
              );
              setIsReturnOpen(true);
            }}
            className="w-full py-3 bg-primary text-white font-bold text-xs uppercase tracking-widest rounded-full hover:opacity-90 transition-all cursor-pointer"
          >
            Request Return
          </Button>
        )}
      </div>
    );
  };

  const renderReturnRequestsSection = () => {
    return (
      <div className="bg-surface-container-low rounded-3xl p-8 border border-outline-variant/10 organic-shadow space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="font-headline-sm text-headline-sm text-primary">
            Return Requests
          </h3>
          {isReturnable && (
            <Button
              unstyled
              type="button"
              onClick={() => {
                setReturnReason("");
                setReturnError("");
                clearStoredIdempotencyKey(`eco_caret_return_${id}`);
                setReturnQuantities(
                  Object.fromEntries(returnableItems.map(({ item, quantity }) => [getOrderItemId(item), quantity]))
                );
                setIsReturnOpen(true);
              }}
              className="px-5 py-2.5 bg-primary text-white text-xs font-bold uppercase tracking-wider rounded-full hover:opacity-90 transition-all"
            >
              Request Return
            </Button>
          )}
        </div>

        {returnsLoading ? (
          <div className="space-y-3 animate-pulse">
            {[1, 2].map((item) => (
              <div key={item} className="h-20 rounded-2xl bg-outline-variant/10" />
            ))}
          </div>
        ) : returns.length === 0 ? (
          <p className="text-sm text-on-surface-variant">
            No return requests yet. Eligible shipped items can be returned from this page.
          </p>
        ) : (
          <div className="space-y-3">
            {returns.map((returnRequest) => {
              const isExpanded = expandedReturnId === returnRequest.id;
              return (
                <div key={returnRequest.id} className="rounded-2xl border border-outline-variant/10 bg-surface-container-high/30 p-4">
                  <Button
                    unstyled
                    type="button"
                    onClick={() => setExpandedReturnId(isExpanded ? null : returnRequest.id)}
                    className="w-full text-left flex items-start justify-between gap-4 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#3C9984]/25 rounded-xl"
                    aria-expanded={isExpanded}
                  >
                    <div>
                      <p className="font-bold text-on-surface">
                        {RETURN_STATUS_LABELS[returnRequest.status] || returnRequest.status.replace(/_/g, " ")}
                      </p>
                      <p className="text-xs text-on-surface-variant mt-1">
                        Refund: {RETURN_REFUND_LABELS[returnRequest.refundStatus] || returnRequest.refundStatus.replace(/_/g, " ")}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs font-bold text-primary">
                        {formatOrderMoney(returnRequest.refundAmountMinor)}
                      </p>
                      <span className="material-symbols-outlined text-on-surface-variant text-lg">
                        {isExpanded ? "expand_less" : "expand_more"}
                      </span>
                    </div>
                  </Button>
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-outline-variant/10 space-y-3 text-xs">
                      <p className="text-on-surface-variant">
                        Reason: <span className="font-semibold text-on-surface">{returnRequest.reason}</span>
                      </p>
                      <div className="space-y-2">
                        {returnRequest.items.map((returnItem) => {
                          const orderItem = liveOrder.items.find((item) => getOrderItemId(item) === returnItem.orderItemId);
                          return (
                            <div key={returnItem.orderItemId} className="flex justify-between gap-3 rounded-xl bg-surface-container-low p-3">
                              <span className="font-semibold text-on-surface">
                                {orderItem?.productSnapshot.name || "Order item"}
                              </span>
                              <span className="text-on-surface-variant">
                                Qty {returnItem.quantity} · received {returnItem.receivedQuantity} · approved {returnItem.approvedQuantity}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            {returnsHasMore && (
              <Button
                unstyled
                type="button"
                disabled={loadingMoreReturns}
                onClick={loadMoreReturns}
                className="w-full py-2.5 bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant/20 text-xs font-bold uppercase tracking-wider rounded-full transition-all cursor-pointer text-on-surface disabled:opacity-50"
              >
                {loadingMoreReturns ? "Loading..." : "Load More Returns"}
              </Button>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderProgressStepper = () => {
    const currentStatus = liveOrder.fulfillmentStatus;
    const stepIndex = getCurrentStepIndex(currentStatus);
    const isCancelled = currentStatus.toLowerCase() === "cancelled";

    if (isCancelled) {
      return (
        <div className="mb-12 p-6 rounded-2xl bg-error-container/30 border border-error/20 flex items-start gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
          <span className="material-symbols-outlined text-error text-3xl">cancel</span>
          <div className="space-y-1">
            <h3 className="font-playfair text-xl font-bold text-on-error-container">Order Cancelled</h3>
            <p className="text-on-error-container/80 text-sm">
              This order was cancelled. {liveOrder.cancellation?.reason && `Reason: "${liveOrder.cancellation.reason}"`}
            </p>
            {liveOrder.cancellation?.completedAt && (
              <p className="text-xs text-on-error-container/60">
                Cancelled on {new Date(liveOrder.cancellation.completedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}
              </p>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="mb-16 bg-surface-container-low/60 backdrop-blur-md rounded-[2rem] p-8 border border-outline-variant/20 organic-shadow relative">
        {/* Glow decoration */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#3C9984] rounded-full blur-[60px] opacity-10"></div>
        
        <h3 className="font-label-md text-label-md text-primary uppercase tracking-widest mb-8 font-bold">
          Fulfillment Progress
        </h3>
        
        {/* Desktop Layout */}
        <div className="relative hidden md:flex justify-between items-start gap-4">
          {/* Connector Line for Desktop */}
          <div className="absolute left-4 right-4 top-[20px] -translate-y-1/2 h-[2px] bg-outline-variant/30 z-0" />
          <div
            className="absolute left-4 top-[20px] -translate-y-1/2 h-[2px] bg-[#3C9984] transition-all duration-1000 z-0"
            style={{ width: `${stepIndex === 0 ? 0 : (stepIndex / (STEPS.length - 1)) * 96}%` }}
          />

          {STEPS.map((step, idx) => {
            const isCompleted = idx < stepIndex;
            const isCurrent = idx === stepIndex;

            let circleClass = "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm z-10 transition-all duration-500 border-2 ";
            if (isCompleted) {
              circleClass += "bg-gradient-to-br from-[#3C9984] to-[#2B8A75] border-transparent text-white shadow-lg shadow-[#3C9984]/20 scale-105";
            } else if (isCurrent) {
              circleClass += "bg-surface border-[#3C9984] text-[#3C9984] ring-4 ring-[#3C9984]/30 shadow-md scale-110";
            } else {
              circleClass += "bg-surface border-outline-variant text-on-surface-variant/60";
            }

            return (
              <div key={step.key} className="flex flex-col items-center gap-3 flex-1 text-center z-10">
                <div className={circleClass}>
                  {isCompleted ? (
                    <span className="material-symbols-outlined text-[16px] font-bold">check</span>
                  ) : isCurrent ? (
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#3C9984] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-[#3C9984]"></span>
                    </span>
                  ) : (
                    <span>{idx + 1}</span>
                  )}
                </div>
                <p className={`text-[10px] uppercase tracking-wider font-bold max-w-[100px] leading-tight ${isCurrent ? "text-primary font-extrabold" : "text-on-surface-variant/80"}`}>
                  {step.label}
                </p>
              </div>
            );
          })}
        </div>

        {/* Mobile Layout */}
        <div className="relative flex flex-col gap-6 pl-8 md:hidden">
          {/* Connector Line for Mobile */}
          <div className="absolute left-[11px] top-4 bottom-4 w-[2px] bg-outline-variant/30 z-0" />
          <div
            className="absolute left-[11px] top-4 w-[2px] bg-gradient-to-b from-[#3C9984] to-[#2B8A75] transition-all duration-1000 z-0"
            style={{ height: `${(stepIndex / (STEPS.length - 1)) * 90}%` }}
          />

          {STEPS.map((step, idx) => {
            const isCompleted = idx < stepIndex;
            const isCurrent = idx === stepIndex;

            let circleClass = "w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] z-10 transition-all duration-500 border ";
            if (isCompleted) {
              circleClass += "bg-gradient-to-br from-[#3C9984] to-[#2B8A75] border-transparent text-white shadow-md shadow-[#3C9984]/20";
            } else if (isCurrent) {
              circleClass += "bg-surface border-[#3C9984] text-[#3C9984] ring-2 ring-[#3C9984]/30 shadow-sm scale-110";
            } else {
              circleClass += "bg-surface border-outline-variant text-on-surface-variant/60";
            }

            return (
              <div key={step.key} className="flex items-center gap-4 relative">
                <div className="absolute -left-[29px] flex items-center justify-center">
                  <div className={circleClass}>
                    {isCompleted ? (
                      <span className="material-symbols-outlined text-[10px] font-bold">check</span>
                    ) : isCurrent ? (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#3C9984]"></span>
                    ) : (
                      <span>{idx + 1}</span>
                    )}
                  </div>
                </div>
                <p className={`text-xs font-bold uppercase tracking-wider ${isCurrent ? "text-primary" : "text-on-surface-variant"}`}>
                  {step.label}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderItemSummary = () => {
    return (
      <div className="bg-surface-container-low rounded-3xl p-8 organic-shadow border border-outline-variant/10">
        <h3 className="font-headline-sm text-headline-sm text-primary mb-8">
          Sourced Masterpieces
        </h3>
        <div className="space-y-8">
          {liveOrder.items.map((item, idx) => {
            const pricing = item.pricingSnapshot;
            const discount = pricing.productDiscountMinor || 0;
            const imageSrc = item.productSnapshot.imageUrl;

            return (
              <div
                key={item._id || idx}
                className="flex flex-col sm:flex-row gap-6 items-start border-b border-outline-variant/10 pb-8 last:border-0 last:pb-0"
              >
                {/* Photo with hover golden effect */}
                <div className="w-28 h-28 rounded-2xl overflow-hidden bg-surface-container-highest flex-shrink-0 border border-outline-variant/20 relative group/photo">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-10 opacity-0 group-hover/photo:opacity-100 transition-opacity duration-300"></div>
                  <img
                    className="w-full h-full object-cover transition-transform duration-500 group-hover/photo:scale-110"
                    alt={item.productSnapshot.name}
                    src={imageSrc}
                  />
                </div>
                
                <div className="flex-grow w-full">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div>
                      <h4 className="font-playfair text-xl font-bold text-on-surface leading-tight">
                        {item.productSnapshot.name}
                      </h4>
                      <span className="text-[10px] text-on-surface-variant uppercase tracking-wider font-extrabold block mt-1.5 bg-surface-container-high px-2.5 py-0.5 rounded border border-outline-variant/10 w-fit">
                        SKU: {item.productSnapshot.sku}
                      </span>
                    </div>
                    <div className="text-left sm:text-right">
                      <span className="font-headline-sm text-headline-sm text-primary font-bold">
                        {formatOrderMoney(pricing.finalUnitPriceMinor)}
                      </span>
                      {discount > 0 && (
                        <p className="text-xs text-on-surface-variant line-through mt-0.5">
                          {formatOrderMoney(pricing.originalUnitPriceMinor)}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {/* Variant Details Badges */}
                  <div className="flex flex-wrap gap-2 mt-4">
                    <span className="bg-surface-container-high/50 border border-outline-variant/15 text-on-surface-variant text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                      Metal: {item.variantSnapshot.metalType} ({item.variantSnapshot.metalColor})
                    </span>
                    <span className="bg-surface-container-high/50 border border-outline-variant/15 text-on-surface-variant text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                      Purity: {item.variantSnapshot.purity}
                    </span>
                    <span className="bg-surface-container-high/50 border border-outline-variant/15 text-on-surface-variant text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                      Size: {item.variantSnapshot.sizeLabel || item.variantSnapshot.size}
                    </span>
                  </div>

                  {item.variantSnapshot.engraving && (
                    <div className="mt-3 bg-secondary-container/10 border border-secondary/20 rounded-xl p-3 flex items-start gap-2.5 max-w-md">
                      <span className="material-symbols-outlined text-secondary text-sm mt-0.5">border_color</span>
                      <p className="font-label-sm text-label-sm text-secondary font-medium italic">
                        Engraving: &quot;{item.variantSnapshot.engraving}&quot;
                      </p>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-6 pt-4 border-t border-outline-variant/10 text-xs">
                    <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-on-surface-variant font-medium">
                      <span>Ordered: <strong className="text-on-surface font-bold">{item.quantity.ordered}</strong></span>
                      {item.quantity.shipped > 0 && (
                        <span className="text-secondary flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                          Shipped: <strong className="font-bold">{item.quantity.shipped}</strong>
                        </span>
                      )}
                      {item.quantity.cancelled > 0 && (
                        <span className="text-error flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-error"></span>
                          Cancelled: <strong className="font-bold">{item.quantity.cancelled}</strong>
                        </span>
                      )}
                      {item.quantity.fulfilled > 0 && (
                        <span className="text-primary flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                          Delivered: <strong className="font-bold">{item.quantity.fulfilled}</strong>
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-on-surface-variant">Subtotal:</span>
                      <span className="font-bold text-primary text-base">{formatOrderMoney(pricing.subtotalMinor)}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderShipmentsSection = () => {
    return (
      <div className="bg-surface-container-low rounded-3xl p-8 border border-outline-variant/10 organic-shadow">
        <h3 className="font-headline-sm text-headline-sm text-primary mb-6">
          Shipment Tracking
        </h3>

        {shipmentsLoading ? (
          <div className="space-y-6 animate-pulse">
            <div className="h-6 bg-outline-variant/20 rounded-md w-1/4"></div>
            <div className="h-20 bg-outline-variant/10 rounded-2xl w-full"></div>
          </div>
        ) : shipments.length === 0 ? (
          <div className="text-center py-8 space-y-4">
            <span className="material-symbols-outlined text-on-surface-variant/40 text-4xl">local_shipping</span>
            <p className="text-sm text-on-surface-variant italic">
              No shipments yet. Your order is being prepared.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {shipments.map((shipment) => {
              const { label: statusLabel, color: statusColor, bgColor: statusBg } = getShipmentStatusDetails(shipment.status);
              return (
                <div
                  key={shipment.id}
                  className="p-6 rounded-2xl bg-surface-container-high/40 border border-outline-variant/10 space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant/10 pb-4">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider font-bold text-on-surface-variant">
                        Shipment Number
                      </p>
                      <p className="font-bold text-on-surface truncate">
                        {shipment.shipmentNumber}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className="text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider"
                        style={{ backgroundColor: statusBg, color: statusColor }}
                      >
                        {statusLabel}
                      </span>
                      <a
                        href={shipment.trackingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 bg-primary text-white text-xs font-bold px-4 py-2 rounded-full hover:bg-secondary transition-all"
                      >
                        <span className="material-symbols-outlined text-sm">open_in_new</span>
                        Track Package
                      </a>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider font-bold text-on-surface-variant">
                        Carrier &amp; Service
                      </p>
                      <p className="font-semibold text-on-surface mt-1">
                        {shipment.carrier} ({shipment.service})
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider font-bold text-on-surface-variant">
                        Tracking Number
                      </p>
                      <p className="font-semibold text-on-surface mt-1">
                        {shipment.trackingNumber}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider font-bold text-on-surface-variant">
                        Estimated Delivery
                      </p>
                      <p className="font-semibold text-on-surface mt-1">
                        {shipment.estimatedDelivery
                          ? new Date(shipment.estimatedDelivery).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })
                          : "Pending estimation"}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2">
                    <p className="text-[10px] uppercase tracking-wider font-bold text-on-surface-variant mb-2">
                      Items Included
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {shipment.items.map((item, idx) => {
                        const orderItem = liveOrder.items.find((oi) => getOrderItemId(oi) === item.orderItemId);
                        const itemName = orderItem?.productSnapshot.name || "Jewelry Piece";
                        return (
                          <span
                            key={idx}
                            className="bg-surface-container text-on-surface text-xs font-semibold px-3 py-1.5 rounded-full border border-outline-variant/10"
                          >
                            {itemName} &times; {item.quantity}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const orderCurrency = liveOrder.totals.currency || "USD";
  const orderExponent = liveOrder.totals.exponent;
  const formatOrderMoney = (amountMinor: number) =>
    formatCurrencyMinor(amountMinor, orderCurrency, orderExponent);

  return (
    <div className="order-detail-simple bg-background text-on-surface font-sans min-h-screen flex flex-col relative overflow-x-hidden selection:bg-secondary-container">
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .organic-shadow {
          box-shadow: 0 10px 30px -10px rgba(60, 153, 132, 0.12);
          transition: transform 0.4s cubic-bezier(0.165, 0.84, 0.44, 1), box-shadow 0.4s ease;
        }
        .organic-shadow:hover {
          transform: translateY(-2px);
          box-shadow: 0 15px 35px -8px rgba(60, 153, 132, 0.16);
        }
        .copper-underline {
          background: linear-gradient(to right, #3C9984, transparent);
          height: 1px;
          width: 100%;
        }
        .font-playfair {
          font-family: var(--font-plus-jakarta-sans), Arial, sans-serif;
        }
        .order-detail-simple :where(*:not(.material-symbols-outlined)) {
          font-family: var(--font-plus-jakarta-sans), Arial, sans-serif !important;
          letter-spacing: 0 !important;
        }
        .order-detail-simple :where(h1, h2, h3, h4, p, span, label, button, a, input, textarea) {
          text-transform: none;
        }
      `,
        }}
      />

      {/* Main Content Area */}
      <main className="flex-grow max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-12 pt-28 w-full animate-fade-in">
        {/* Order Header */}
        {renderOrderHeader()}

        {/* Stepper progress visual */}
        {renderProgressStepper()}

        {/* Bento Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
          {/* Main Content Left */}
          <div className="lg:col-span-8 space-y-gutter animate-in fade-in duration-700">
            {/* Items List */}
            {renderItemSummary()}

            {/* Sourcing Destination Details */}
            <div className="bg-surface-container-low rounded-3xl p-8 border border-outline-variant/10 organic-shadow">
              <h3 className="font-headline-sm text-headline-sm text-primary mb-6">
                Shipping Address
              </h3>
              {liveOrder.shippingAddressSnapshot ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm text-on-surface-variant">
                  <div className="space-y-2">
                    <p className="text-[10px] uppercase tracking-wider font-extrabold text-secondary">
                      Delivery Address
                    </p>
                    <div className="font-medium text-on-surface space-y-1.5">
                      <p className="font-bold text-lg text-primary">
                        {liveOrder.shippingAddressSnapshot.name}
                      </p>
                      <p>{liveOrder.shippingAddressSnapshot.line1}</p>
                      {liveOrder.shippingAddressSnapshot.line2 && (
                        <p>{liveOrder.shippingAddressSnapshot.line2}</p>
                      )}
                      <p>
                        {liveOrder.shippingAddressSnapshot.city},{" "}
                        {liveOrder.shippingAddressSnapshot.state}{" "}
                        {liveOrder.shippingAddressSnapshot.postalCode}
                      </p>
                      <p className="uppercase font-extrabold tracking-widest text-[10px] text-[#3C9984] mt-1">
                        {liveOrder.shippingAddressSnapshot.country}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <p className="text-[10px] uppercase tracking-wider font-extrabold text-secondary">
                        Contact Phone
                      </p>
                      <p className="font-bold text-on-surface">
                        {liveOrder.shippingAddressSnapshot.phone}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-on-surface-variant leading-relaxed">
                  <p className="font-bold text-on-surface">Nirmal Sorathiya</p>
                  <p>123 Diamond Avenue</p>
                  <p>London, Greater London NW1 4NP</p>
                  <p className="uppercase">United Kingdom</p>
                </div>
              )}
            </div>

            {/* Shipment Section */}
            {renderShipmentsSection()}

            {renderReturnRequestsSection()}
          </div>

          {/* Sidebar Right */}
          <div className="lg:col-span-4 space-y-gutter animate-in fade-in duration-700 delay-150">
            {/* Perforated Luxury Pricing Ledger Card */}
            <div className="bg-surface-container-low rounded-3xl p-8 border border-outline-variant/10 organic-shadow text-sm space-y-4 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#3C9984] opacity-80"></div>
              <h3 className="font-label-md text-label-md text-primary uppercase tracking-widest border-b border-outline-variant/10 pb-4 flex items-center gap-2 font-bold">
                <span className="material-symbols-outlined text-[18px]">receipt</span>
                Pricing Ledger
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Subtotal</span>
                  <span className="font-bold text-on-surface">
                    {formatOrderMoney(liveOrder.totals.merchandiseSubtotalMinor)}
                  </span>
                </div>
                {liveOrder.totals.itemDiscountMinor > 0 && (
                  <div className="flex justify-between text-error font-medium">
                    <span>Item Discount</span>
                    <span>
                      -{formatOrderMoney(liveOrder.totals.itemDiscountMinor)}
                    </span>
                  </div>
                )}
                {liveOrder.totals.orderDiscountMinor > 0 && (
                  <div className="flex justify-between text-error font-medium">
                    <span>Order Discount</span>
                    <span>
                      -{formatOrderMoney(liveOrder.totals.orderDiscountMinor)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Shipping</span>
                  <span className="font-bold text-on-surface">
                    {liveOrder.totals.shippingMinor === 0
                      ? "Free"
                      : formatOrderMoney(liveOrder.totals.shippingMinor)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Tax</span>
                  <span className="font-bold text-on-surface">
                    {formatOrderMoney(liveOrder.totals.taxMinor)}
                  </span>
                </div>
                
                {/* Perforated Luxury Dashed Line */}
                <div className="border-t border-dashed border-outline-variant/30 my-4 pt-4"></div>

                <div className="flex justify-between font-playfair text-xl text-on-surface font-bold">
                  <span>Grand Total</span>
                  <span className="font-bold text-primary" style={{ color: THEME_COLORS.global.primary }}>
                    {formatOrderMoney(liveOrder.totals.totalMinor)}
                  </span>
                </div>
                
                <div className="border-t border-outline-variant/10 pt-3 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant font-medium">Amount Paid</span>
                    <span className="font-bold text-on-surface">
                      {formatOrderMoney(liveOrder.totals.paidMinor)}
                    </span>
                  </div>
                  <div className="flex justify-between bg-primary/5 p-2.5 rounded-xl border border-primary/10 items-center">
                    <span className="text-primary font-bold text-xs uppercase tracking-wider">Amount Due</span>
                    <span className="font-extrabold text-primary text-sm">
                      {formatOrderMoney(liveOrder.totals.amountDueMinor)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {renderOrderActionsCard()}

            {renderPaymentActionCard()}

            {/* Tracking Timeline */}
            <OrderTimeline
              events={events}
              eventsLoading={eventsLoading}
              orderDetails={orderDetails}
              hasMore={eventsHasMore}
              loadingMore={loadingMoreEvents}
              onLoadMore={loadMoreEvents}
            />

            {/* Support Box */}
            <SupportBox />
          </div>
        </div>
      </main>

      {/* Cancel Order Confirmation Modal */}
      {isCancelOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-surface-container-low border border-outline-variant/20 rounded-[2rem] p-8 max-w-2xl w-full organic-shadow space-y-6 animate-in scale-in duration-300 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center gap-3 text-error">
              <span className="material-symbols-outlined text-3xl">warning</span>
              <h3 className="font-playfair text-2xl font-bold">Cancel Unshipped Items</h3>
            </div>
            <p className="text-on-surface-variant text-sm leading-relaxed">
              Select only unshipped quantities. Shipped quantities must use Request Return.
            </p>
            <form onSubmit={handleCancelSubmit} className="space-y-4">
              <div className="space-y-3">
                {cancelableItems.map(({ item, quantity }) => {
                  const itemId = getOrderItemId(item);
                  return (
                  <div key={itemId} className="rounded-2xl bg-surface-container-high/40 border border-outline-variant/10 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <p className="font-bold text-on-surface">{item.productSnapshot.name}</p>
                      <p className="text-xs text-on-surface-variant mt-1">
                        Cancelable: {quantity} · Shipped: {item.quantity.shipped}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <label htmlFor={`cancel-${itemId}`} className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                        Qty
                      </label>
                      <input
                        id={`cancel-${itemId}`}
                        type="number"
                        min={0}
                        max={quantity}
                        value={cancelQuantities[itemId] ?? 0}
                        onChange={(event) => {
                          clearStoredIdempotencyKey(`eco_caret_cancel_${id}`);
                          const next = Math.max(0, Math.min(quantity, Number(event.target.value) || 0));
                          setCancelQuantities((prev) => ({ ...prev, [itemId]: next }));
                        }}
                        className="w-20 rounded-xl border border-outline-variant/20 bg-surface px-3 py-2 text-sm font-bold text-on-surface focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>
                  );
                })}
                {returnableItems.length > 0 && (
                  <div className="rounded-xl bg-warning-container/40 text-on-warning-container p-3 text-xs font-semibold">
                    Some shipped quantities are returnable. Use Request Return for those items.
                  </div>
                )}
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider font-bold text-on-surface-variant mb-2">
                  Reason for Cancellation
                </label>
                <textarea
                  required
                  maxLength={500}
                  rows={4}
                  value={cancelReason}
                  onChange={(e) => {
                    clearStoredIdempotencyKey(`eco_caret_cancel_${id}`);
                    setCancelReason(e.target.value);
                  }}
                  placeholder="Please tell us why you wish to cancel this order..."
                  className="w-full rounded-xl bg-surface-container-high border border-outline-variant/20 p-4 text-sm text-on-surface focus:outline-none focus:border-primary transition-all resize-none"
                />
              </div>

              {cancelError && (
                <div className="p-3 bg-error-container/20 border border-error/10 text-error rounded-xl text-xs font-semibold">
                  {cancelError}
                </div>
              )}

              <div className="flex gap-4">
                <Button
                  unstyled
                  type="button"
                  disabled={isCancelling}
                  onClick={() => setIsCancelOpen(false)}
                  className="flex-1 py-3 bg-surface-container-highest hover:bg-outline-variant/30 text-on-surface font-bold text-xs uppercase tracking-widest rounded-full transition-all cursor-pointer"
                >
                  Go Back
                </Button>
                <Button
                  unstyled
                  type="submit"
                  disabled={isCancelling || !cancelReason.trim() || Object.values(cancelQuantities).every((quantity) => quantity <= 0)}
                  className="flex-1 py-3 bg-error text-white font-bold text-xs uppercase tracking-widest rounded-full hover:opacity-90 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isCancelling ? "Cancelling..." : "Confirm"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Return Request Modal */}
      {isReturnOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-surface-container-low border border-outline-variant/20 rounded-[2rem] p-8 max-w-2xl w-full organic-shadow space-y-6 animate-in scale-in duration-300 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center gap-3 text-primary">
              <span className="material-symbols-outlined text-3xl">assignment_return</span>
              <h3 className="font-playfair text-2xl font-bold">Request Return</h3>
            </div>
            <p className="text-on-surface-variant text-sm leading-relaxed">
              Return requests are reviewed after warehouse receipt and inspection. Refunds are not immediate.
            </p>
            <form onSubmit={handleReturnSubmit} className="space-y-4">
              <div className="space-y-3">
                {returnableItems.map(({ item, quantity }) => {
                  const itemId = getOrderItemId(item);
                  return (
                  <div key={itemId} className="rounded-2xl bg-surface-container-high/40 border border-outline-variant/10 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <p className="font-bold text-on-surface">{item.productSnapshot.name}</p>
                      <p className="text-xs text-on-surface-variant mt-1">
                        Returnable: {quantity} · Already returned: {item.quantity.returned}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <label htmlFor={`return-${itemId}`} className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                        Qty
                      </label>
                      <input
                        id={`return-${itemId}`}
                        type="number"
                        min={0}
                        max={quantity}
                        value={returnQuantities[itemId] ?? 0}
                        onChange={(event) => {
                          clearStoredIdempotencyKey(`eco_caret_return_${id}`);
                          const next = Math.max(0, Math.min(quantity, Number(event.target.value) || 0));
                          setReturnQuantities((prev) => ({ ...prev, [itemId]: next }));
                        }}
                        className="w-20 rounded-xl border border-outline-variant/20 bg-surface px-3 py-2 text-sm font-bold text-on-surface focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>
                  );
                })}
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider font-bold text-on-surface-variant mb-2">
                  Return Reason
                </label>
                <textarea
                  required
                  maxLength={500}
                  rows={4}
                  value={returnReason}
                  onChange={(e) => {
                    clearStoredIdempotencyKey(`eco_caret_return_${id}`);
                    setReturnReason(e.target.value);
                  }}
                  placeholder="Please tell us why you want to return these items..."
                  className="w-full rounded-xl bg-surface-container-high border border-outline-variant/20 p-4 text-sm text-on-surface focus:outline-none focus:border-primary transition-all resize-none"
                />
              </div>

              {returnError && (
                <div className="p-3 bg-error-container/20 border border-error/10 text-error rounded-xl text-xs font-semibold">
                  {returnError}
                </div>
              )}

              <div className="flex gap-4">
                <Button
                  unstyled
                  type="button"
                  disabled={isReturning}
                  onClick={() => setIsReturnOpen(false)}
                  className="flex-1 py-3 bg-surface-container-highest hover:bg-outline-variant/30 text-on-surface font-bold text-xs uppercase tracking-widest rounded-full transition-all cursor-pointer"
                >
                  Go Back
                </Button>
                <Button
                  unstyled
                  type="submit"
                  disabled={isReturning || !returnReason.trim() || Object.values(returnQuantities).every((quantity) => quantity <= 0)}
                  className="flex-1 py-3 bg-primary text-white font-bold text-xs uppercase tracking-widest rounded-full hover:opacity-90 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isReturning ? "Submitting..." : "Request Return"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 left-6 z-[100] animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className={`p-4 rounded-2xl shadow-2xl border flex items-center gap-3 font-semibold text-sm max-w-sm ${
            toast.type === "error"
              ? "bg-error-container border-error text-on-error-container"
              : toast.type === "warning"
              ? "bg-warning-container border-warning/50 text-on-warning-container"
              : "bg-primary-container border-primary/50 text-on-primary-container"
          }`}>
            <span className="material-symbols-outlined">
              {toast.type === "error" ? "error" : toast.type === "warning" ? "warning" : "check_circle"}
            </span>
            <span>{toast.message}</span>
            <Button unstyled onClick={() => setToast(null)} className="ml-auto opacity-60 hover:opacity-100 flex items-center">
              <span className="material-symbols-outlined text-sm">close</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function SupportBox() {
  return (
    <div className="bg-surface-container-low rounded-xl p-6 border border-outline-variant/20">
      <h4 className="font-label-md text-label-md text-primary mb-4 font-bold">
        Concierge Support
      </h4>
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-[#3C9984] text-[20px]">chat_bubble</span>
          <span className="font-label-md text-label-md text-on-surface-variant">Live Chat (Available now)</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-[#3C9984] text-[20px]">call</span>
          <span className="font-label-md text-label-md text-on-surface-variant">+44 20 7946 0123</span>
        </div>
      </div>
    </div>
  );
}
