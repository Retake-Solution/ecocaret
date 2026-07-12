"use client";

import React, { use, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import ProfileDialog from "@/components/ProfileDialog";
import OrderTimeline from "@/components/OrderTimeline";
import { useAppDispatch, useAppSelector } from "@/lib/store";
import { setCartOpen, removeFromCart } from "@/lib/features/cart/cartSlice";
import { setProfileOpen } from "@/lib/features/profile/profileSlice";
import { THEME_COLORS } from "@/theme/colors";
import {
  getOrderById,
  getOrderEvents,
  getOrderShipments,
  cancelOrder,
  OrderData,
  OrderEvent,
  ShipmentData,
} from "@/services/api";

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

const generateUUID = () => {
  if (typeof window !== "undefined" && window.crypto && window.crypto.randomUUID) {
    return window.crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export default function OrderDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const cartOpen = useAppSelector((state) => state.cart.isOpen);
  const profileOpen = useAppSelector((state) => state.profile.isOpen);
  const cartItems = useAppSelector((state) => state.cart.items);

  const [scrolled, setScrolled] = useState(false);
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
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelError, setCancelError] = useState("");

  const isBracelet = id === "AUR-881045" || id.toLowerCase().includes("bracelet");
  const isMock = isBracelet || id === "AUR-882910";

  useEffect(() => {
    const fetchOrderData = async () => {
      setLoading(true);
      setError("");
      try {
        const orderResult = await getOrderById(id);
        setLiveOrder(orderResult.data);
      } catch (err: any) {
        setError(err.message || "Failed to load order provenance.");
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

    if (!isMock) {
      fetchOrderData();
      fetchEventsData();
      fetchShipmentsData();
    } else {
      setLoading(false);
      setEventsLoading(false);
      setShipmentsLoading(false);
    }
  }, [id, isMock]);

  // Scroll listener for Header solid transition
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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

  const handleCancelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!liveOrder || !cancelReason.trim()) return;
    try {
      setIsCancelling(true);
      setCancelError("");
      const idempotencyKey = generateUUID();
      const payload = {
        reason: cancelReason,
        expectedVersion: liveOrder.version,
      };
      const result = await cancelOrder(id, payload, idempotencyKey);
      setLiveOrder(result.data);
      setIsCancelOpen(false);
      setCancelReason("");
      
      // Refetch events list to capture cancellation events
      const eventsResult = await getOrderEvents(id);
      setEvents([...eventsResult.data].reverse());
      setEventsHasMore(eventsResult.pagination?.hasMore || false);
      setNextAfterSequence(eventsResult.pagination?.nextAfterSequence);
    } catch (err: any) {
      if (err.message.includes("version") || err.message.includes("CONFLICT") || err.message.includes("409")) {
        // Refetch order details automatically
        try {
          const freshOrder = await getOrderById(id);
          setLiveOrder(freshOrder.data);
        } catch (fetchErr) {
          console.error("Failed to refetch order:", fetchErr);
        }
        setCancelError("Order state was modified. We updated it to the latest version. Please review the changes and confirm again.");
      } else {
        setCancelError(err.message || "Failed to cancel order.");
      }
    } finally {
      setIsCancelling(false);
    }
  };

  const orderDetails = liveOrder
    ? {
        number: `#${liveOrder.orderNumber}`,
        name: liveOrder.items[0]?.productSnapshot?.name || "Bespoke Jewelry Piece",
        price: `$${(liveOrder.totals.totalMinor / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        date: new Date(liveOrder.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
        deliveryDate: new Date(new Date(liveOrder.createdAt).getTime() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        specs: `Metal: ${liveOrder.items[0]?.variantSnapshot?.metalType} • Purity: ${liveOrder.items[0]?.variantSnapshot?.purity} • Color: ${liveOrder.items[0]?.variantSnapshot?.metalColor} • Size: ${liveOrder.items[0]?.variantSnapshot?.sizeLabel}`,
        image: liveOrder.items[0]?.productSnapshot?.imageUrl || "https://lh3.googleusercontent.com/aida/AP1WRLurFJQ4iSPdztJ-UpOPfXfi-3UabSzn06tAERclG0j87fz_l9RO3Rd-sBpcuukbwu9XETXjdCAlINMskwEsll7ag5Y9dnuAT0W8yk1inPVRk1Kuj1xlvlm5COlBklKeavfM6oEb1lv7lp_Povi8AY0mqsExyG8uOSsL3B_0YR1mDPDdm_GhdrIW9Fv1v_ZRoqQucwdU5ai6YIF9Bg4Gz5sFLq1GQ1eJaghEnt7209yfkNEM-9NuPMharDM",
        stepIndex: getCurrentStepIndex(liveOrder.fulfillmentStatus),
      }
    : {
        number: id.startsWith("#") ? id : `#${id}`,
        name: isBracelet ? "Sophisticated Diamond Tennis Bracelet" : "Celestia Solitaire Ring",
        price: isBracelet ? "$12,400.00" : "£14,500.00",
        date: isBracelet ? "August 12, 2023" : "October 24, 2023",
        deliveryDate: isBracelet ? "Aug 15" : "Nov 02",
        specs: isBracelet
          ? "Metal: Platinum • Length: 7 inches • Diamonds: 8.42ct Princess Cut"
          : "Metal: Platinum • Size: M • Diamond: 2.05ct Oval",
        image: isBracelet
          ? "https://lh3.googleusercontent.com/aida/AP1WRLtNLNOmKIh9k73DJcyIy9iUcOU-b62nNBxxcDn8bd-XG_QjyPZ0LirSv9rfqFPvPwGoD6SP0zr3qoYQLDqWtBo0pndXoWV_Sn5TeqlXilBTjT_JbuvFfwKLuegTeBqEVPZqxwfsqd2Jp9JtSpbfDZmw19WjjrPc8YewJSz8bs7jw3aazoXh9H1hY0mS7FZ8Nv8BGejMkb4vRmUkb3MwD-7fIbzoN_JMu4bszZi6_AuZjsf4mDXmbRHGizs"
          : "https://lh3.googleusercontent.com/aida/AP1WRLurFJQ4iSPdztJ-UpOPfXfi-3UabSzn06tAERclG0j87fz_l9RO3Rd-sBpcuukbwu9XETXjdCAlINMskwEsll7ag5Y9dnuAT0W8yk1inPVRk1Kuj1xlvlm5COlBklKeavfM6oEb1lv7lp_Povi8AY0mqsExyG8uOSsL3B_0YR1mDPDdm_GhdrIW9Fv1v_ZRoqQucwdU5ai6YIF9Bg4Gz5sFLq1GQ1eJaghEnt7209yfkNEM-9NuPMharDM",
        stepIndex: isBracelet ? 5 : 3,
      };

  const handleDownloadInvoice = () => {
    alert(`Generating invoice receipt for order ${orderDetails.number}...`);
  };

  // Status mapping colors & labels
  const normStatus = (liveOrder?.fulfillmentStatus || (isBracelet ? "shipped" : "processing")).toLowerCase();
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
  const normPayment = (liveOrder?.paymentStatus || "paid").toLowerCase();
  const isPaid = normPayment === "paid" || normPayment === "authorized" || normPayment === "captured";
  let payStatusLabel = "Unpaid";
  let payStatusColor: string = "#71717A";
  if (isPaid) {
    payStatusLabel = "Paid";
    payStatusColor = THEME_COLORS.global.primary;
  } else if (normPayment === "pending") {
    payStatusLabel = "Payment Pending";
    payStatusColor = "#D97706";
  } else if (normPayment === "failed") {
    payStatusLabel = "Payment Failed";
    payStatusColor = "#EF4444";
  }

  // Customer cancellations allowed for pre-shipment only
  const isCancellable =
    liveOrder &&
    ["pending", "confirmed", "crafting", "quality_check", "ready_to_ship"].includes(
      liveOrder.fulfillmentStatus.toLowerCase()
    );

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
              {liveOrder && (
                <span className="text-[10px] font-extrabold px-4 py-1.5 bg-surface-container-high/60 border border-outline-variant/30 text-on-surface-variant rounded-full uppercase tracking-wider">
                  Ledger Ver. {liveOrder.version}
                </span>
              )}
            </div>
          </div>
          
          <button
            onClick={handleDownloadInvoice}
            className="flex items-center gap-2 px-6 py-3.5 bg-surface-container hover:bg-[#3C9984]/10 border border-outline-variant/20 rounded-full font-label-md text-label-md text-secondary hover:text-primary transition-all group cursor-pointer w-full md:w-auto justify-center"
          >
            <span className="material-symbols-outlined text-[20px] group-hover:scale-110 transition-transform">download</span>
            <span className="font-bold uppercase tracking-wider">Download Certificate</span>
          </button>
        </div>
      </div>
    );
  };

  const renderProgressStepper = () => {
    const currentStatus = liveOrder?.fulfillmentStatus || (isBracelet ? "shipped" : "crafting");
    const stepIndex = getCurrentStepIndex(currentStatus);
    const isCancelled = currentStatus.toLowerCase() === "cancelled";

    if (isCancelled) {
      return (
        <div className="mb-12 p-6 rounded-2xl bg-error-container/30 border border-error/20 flex items-start gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
          <span className="material-symbols-outlined text-error text-3xl">cancel</span>
          <div className="space-y-1">
            <h3 className="font-playfair text-xl font-bold text-on-error-container">Order Cancelled</h3>
            <p className="text-on-error-container/80 text-sm">
              This order was cancelled. {liveOrder?.cancellation?.reason && `Reason: "${liveOrder.cancellation.reason}"`}
            </p>
            {liveOrder?.cancellation?.completedAt && (
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
    const items = liveOrder
      ? liveOrder.items
      : [
          {
            _id: "mock-item-01",
            productSnapshot: {
              name: orderDetails.name,
              imageUrl: orderDetails.image,
              sku: isBracelet ? "EC-BRC-SOL-02" : "EC-RNG-CEL-10",
              slug: isBracelet ? "sophisticated-tennis-bracelet" : "celestia-solitaire-ring",
            },
            variantSnapshot: {
              metalType: isBracelet ? "Platinum" : "Gold",
              metalColor: "White",
              purity: isBracelet ? "950" : "18K",
              size: isBracelet ? "7" : "M",
              sizeLabel: isBracelet ? "7 inches" : "Size M",
              engraving: "",
            },
            quantity: {
              ordered: 1,
              cancelled: 0,
              shipped: isBracelet ? 1 : 0,
              fulfilled: isBracelet ? 1 : 0,
              returned: 0,
              refunded: 0,
            },
            pricingSnapshot: {
              originalUnitPriceMinor: parseFloat(orderDetails.price.replace(/[^\d.]/g, "")) * 100,
              productDiscountMinor: 0,
              finalUnitPriceMinor: parseFloat(orderDetails.price.replace(/[^\d.]/g, "")) * 100,
              subtotalMinor: parseFloat(orderDetails.price.replace(/[^\d.]/g, "")) * 100,
            },
            fulfillmentStatus: isBracelet ? "shipped" : "crafting",
          },
        ];

    return (
      <div className="bg-surface-container-low rounded-3xl p-8 organic-shadow border border-outline-variant/10">
        <h3 className="font-headline-sm text-headline-sm text-primary mb-8">
          Sourced Masterpieces
        </h3>
        <div className="space-y-8">
          {items.map((item, idx) => {
            const pricing = item.pricingSnapshot;
            const originalPrice = pricing.originalUnitPriceMinor / 100;
            const discount = pricing.productDiscountMinor ? pricing.productDiscountMinor / 100 : 0;
            const finalPrice = pricing.finalUnitPriceMinor / 100;
            const itemSubtotal = pricing.subtotalMinor / 100;

            const imageSrc = item.productSnapshot.imageUrl || "https://lh3.googleusercontent.com/aida/AP1WRLurFJQ4iSPdztJ-UpOPfXfi-3UabSzn06tAERclG0j87fz_l9RO3Rd-sBpcuukbwu9XETXjdCAlINMskwEsll7ag5Y9dnuAT0W8yk1inPVRk1Kuj1xlvlm5COlBklKeavfM6oEb1lv7lp_Povi8AY0mqsExyG8uOSsL3B_0YR1mDPDdm_GhdrIW9Fv1v_ZRoqQucwdU5ai6YIF9Bg4Gz5sFLq1GQ1eJaghEnt7209yfkNEM-9NuPMharDM";

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
                        ${finalPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                      {discount > 0 && (
                        <p className="text-xs text-on-surface-variant line-through mt-0.5">
                          ${originalPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
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
                        Engraving: "{item.variantSnapshot.engraving}"
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
                      <span className="font-bold text-primary text-base">${itemSubtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
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

  const renderSupportBox = () => {
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
  };

  const renderShipmentsSection = () => {
    if (isMock) return null;

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
                        const orderItem = liveOrder?.items.find((oi) => oi._id === item.orderItemId);
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

  // Convert minor units to standard decimals
  const subtotal = liveOrder
    ? liveOrder.totals.merchandiseSubtotalMinor / 100
    : isBracelet
    ? 12400
    : 14500;
  const itemDiscount = liveOrder ? liveOrder.totals.itemDiscountMinor / 100 : 0;
  const orderDiscount = liveOrder ? liveOrder.totals.orderDiscountMinor / 100 : 0;
  const shippingAmount = liveOrder ? liveOrder.totals.shippingMinor / 100 : 0;
  const taxAmount = liveOrder ? liveOrder.totals.taxMinor / 100 : subtotal * 0.08;
  const totalAmount = liveOrder ? liveOrder.totals.totalMinor / 100 : subtotal + taxAmount;
  const amountPaid = liveOrder ? liveOrder.totals.paidMinor / 100 : totalAmount;
  const amountDue = liveOrder ? liveOrder.totals.amountDueMinor / 100 : 0;

  return (
    <div className="bg-background text-on-surface font-body-md min-h-screen flex flex-col relative overflow-x-hidden selection:bg-secondary-container">
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
          font-family: var(--font-playfair-display), serif;
        }
      `,
        }}
      />

      {/* Header */}
      <Header
        scrolled={scrolled}
        setCartOpen={(open) => dispatch(setCartOpen(open))}
        setProfileOpen={(open) => dispatch(setProfileOpen(open))}
        cartItemsCount={cartItems.reduce((acc, curr) => acc + curr.quantity, 0)}
      />

      {/* Main Content Area */}
      <main className="flex-grow max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-12 pt-28 w-full animate-fade-in">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <div
              className="w-12 h-12 rounded-full border-4 border-outline-variant/30 border-t-primary animate-spin"
              style={{ borderTopColor: THEME_COLORS.global.primary }}
            />
            <p className="text-on-surface-variant text-sm font-label-md tracking-wider uppercase animate-pulse">
              Retrieving Provenance Certificate...
            </p>
          </div>
        ) : error ? (
          <div className="p-8 rounded-2xl bg-error-container/40 border border-error/20 text-center max-w-md mx-auto space-y-4">
            <span className="material-symbols-outlined text-error text-5xl">warning</span>
            <h3 className="font-playfair text-2xl font-semibold text-on-error-container">
              Sourcing Ledger Link Failed
            </h3>
            <p className="text-on-error-container font-medium text-sm leading-relaxed">{error}</p>
            <div className="flex gap-4 justify-center">
              <Link
                href="/orders"
                className="bg-primary text-white px-6 py-2.5 rounded-full text-xs font-bold uppercase hover:bg-secondary transition-all"
              >
                Go to History
              </Link>
            </div>
          </div>
        ) : (
          <>
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
                  {liveOrder?.shippingAddressSnapshot ? (
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
                      <span className="text-on-surface-variant">Merchandise Subtotal</span>
                      <span className="font-bold text-on-surface">
                        ${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    {itemDiscount > 0 && (
                      <div className="flex justify-between text-error font-medium">
                        <span>Item Discount</span>
                        <span>
                          -${itemDiscount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    )}
                    {orderDiscount > 0 && (
                      <div className="flex justify-between text-error font-medium">
                        <span>Order Discount</span>
                        <span>
                          -${orderDiscount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-on-surface-variant">Carbon-Neutral Shipping</span>
                      <span className="font-bold text-on-surface">
                        {shippingAmount === 0
                          ? "Free"
                          : `$${shippingAmount.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                            })}`}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-on-surface-variant">Sourcing Duty &amp; Tax</span>
                      <span className="font-bold text-on-surface">
                        ${taxAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    
                    {/* Perforated Luxury Dashed Line */}
                    <div className="border-t border-dashed border-outline-variant/30 my-4 pt-4"></div>

                    <div className="flex justify-between font-playfair text-xl text-on-surface font-bold">
                      <span>Grand Total</span>
                      <span className="font-bold text-primary" style={{ color: THEME_COLORS.global.primary }}>
                        ${totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    
                    <div className="border-t border-outline-variant/10 pt-3 space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-on-surface-variant font-medium">Amount Paid</span>
                        <span className="font-bold text-on-surface">
                          ${amountPaid.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="flex justify-between bg-primary/5 p-2.5 rounded-xl border border-primary/10 items-center">
                        <span className="text-primary font-bold text-xs uppercase tracking-wider">Amount Due</span>
                        <span className="font-extrabold text-primary text-sm">
                          ${amountDue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {isCancellable && (
                    <button
                      onClick={() => {
                        setCancelReason("");
                        setCancelError("");
                        setIsCancelOpen(true);
                      }}
                      className="mt-6 w-full py-3.5 bg-error/10 hover:bg-error text-error hover:text-white font-bold text-xs uppercase tracking-widest rounded-full transition-all border border-error/30 cursor-pointer active:scale-[0.98]"
                    >
                      Cancel Order
                    </button>
                  )}
                </div>

                {/* Tracking Timeline */}
                <OrderTimeline
                  events={events}
                  eventsLoading={eventsLoading}
                  isMock={isMock}
                  orderDetails={orderDetails}
                  hasMore={eventsHasMore}
                  loadingMore={loadingMoreEvents}
                  onLoadMore={loadMoreEvents}
                />

                {/* Support Box */}
                {renderSupportBox()}
              </div>
            </div>
          </>
        )}
      </main>

      {/* Cancel Order Confirmation Modal */}
      {isCancelOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-surface-container-low border border-outline-variant/20 rounded-[2rem] p-8 max-w-md w-full organic-shadow space-y-6 animate-in scale-in duration-300">
            <div className="flex items-center gap-3 text-error">
              <span className="material-symbols-outlined text-3xl">warning</span>
              <h3 className="font-playfair text-2xl font-bold">Cancel Order</h3>
            </div>
            <p className="text-on-surface-variant text-sm leading-relaxed">
              Are you sure you want to request cancellation for this order? This action is immutable once completed.
            </p>
            <form onSubmit={handleCancelSubmit} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider font-bold text-on-surface-variant mb-2">
                  Reason for Cancellation
                </label>
                <textarea
                  required
                  maxLength={500}
                  rows={4}
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
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
                <button
                  type="button"
                  disabled={isCancelling}
                  onClick={() => setIsCancelOpen(false)}
                  className="flex-1 py-3 bg-surface-container-highest hover:bg-outline-variant/30 text-on-surface font-bold text-xs uppercase tracking-widest rounded-full transition-all cursor-pointer"
                >
                  Go Back
                </button>
                <button
                  type="submit"
                  disabled={isCancelling || !cancelReason.trim()}
                  className="flex-1 py-3 bg-error text-white font-bold text-xs uppercase tracking-widest rounded-full hover:opacity-90 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isCancelling ? "Cancelling..." : "Confirm"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <Footer />

      {/* Cart & Profile Modals */}
      <CartDrawer
        isOpen={cartOpen}
        onClose={() => dispatch(setCartOpen(false))}
        cartItems={cartItems}
        onRemoveItem={(id) => dispatch(removeFromCart(id))}
        onCheckout={() => {
          dispatch(setCartOpen(false));
          router.push("/checkout");
        }}
      />
      <ProfileDialog isOpen={profileOpen} onClose={() => dispatch(setProfileOpen(false))} />
    </div>
  );
}
