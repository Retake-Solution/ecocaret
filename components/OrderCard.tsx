"use client";

import Link from "next/link";
import { THEME_COLORS } from "@/theme/colors";
import { OrderData } from "@/types";

interface OrderCardProps {
  order: OrderData;
}

const getFulfillmentBadgeDetails = (status: string) => {
  const norm = status.toLowerCase();
  switch (norm) {
    case "pending":
      return { label: "Order Placed", color: "#6B7280", bgColor: "rgba(107, 114, 128, 0.1)" };
    case "confirmed":
      return { label: "Confirmed", color: "#3B82F6", bgColor: "rgba(59, 130, 246, 0.1)" };
    case "crafting":
      return { label: "Being Crafted", color: "#6366F1", bgColor: "rgba(99, 102, 241, 0.1)" };
    case "quality_check":
      return { label: "Quality Check", color: "#8B5CF6", bgColor: "rgba(139, 92, 246, 0.1)" };
    case "ready_to_ship":
      return { label: "Ready to Ship", color: "#0D9488", bgColor: "rgba(13, 148, 136, 0.1)" };
    case "partially_shipped":
      return { label: "Partially Shipped", color: "#D97706", bgColor: "rgba(217, 119, 6, 0.1)" };
    case "shipped":
      return { label: "Shipped", color: "#F97316", bgColor: "rgba(249, 115, 22, 0.1)" };
    case "partially_delivered":
      return { label: "Partially Delivered", color: "#F59E0B", bgColor: "rgba(245, 158, 11, 0.1)" };
    case "delivered":
      return { label: "Delivered", color: "#10B981", bgColor: "rgba(16, 185, 129, 0.1)" };
    case "cancelled":
      return { label: "Cancelled", color: "#EF4444", bgColor: "rgba(239, 68, 68, 0.1)" };
    default:
      return { label: status, color: "#6B7280", bgColor: "rgba(107, 114, 128, 0.1)" };
  }
};

const getPaymentBadgeDetails = (status: string) => {
  const norm = status.toLowerCase();
  switch (norm) {
    case "pending":
      return { label: "Payment Pending", color: "#6B7280", bgColor: "rgba(107, 114, 128, 0.1)" };
    case "authorized":
      return { label: "Payment Authorized", color: "#3B82F6", bgColor: "rgba(59, 130, 246, 0.1)" };
    case "paid":
      return { label: "Paid", color: "#10B981", bgColor: "rgba(16, 185, 129, 0.1)" };
    case "failed":
      return { label: "Payment Failed", color: "#EF4444", bgColor: "rgba(239, 68, 68, 0.1)" };
    case "partially_refunded":
      return { label: "Partially Refunded", color: "#D97706", bgColor: "rgba(217, 119, 6, 0.1)" };
    case "refunded":
      return { label: "Refunded", color: "#F97316", bgColor: "rgba(249, 115, 22, 0.1)" };
    default:
      return { label: status, color: "#6B7280", bgColor: "rgba(107, 114, 128, 0.1)" };
  }
};

export default function OrderCard({ order }: OrderCardProps) {
  const firstItem = order.items[0];
  const imageSrc = firstItem?.productSnapshot?.imageUrl;
  const totalAmount = order.totals.totalMinor / 100;
  const { label: fulfillLabel, color: fulfillColor, bgColor: fulfillBg } =
    getFulfillmentBadgeDetails(order.fulfillmentStatus);
  const { label: payLabel, color: payColor, bgColor: payBg } =
    getPaymentBadgeDetails(order.paymentStatus);
  const itemsCount = order.items.reduce((sum, item) => sum + item.quantity.ordered, 0);

  return (
    <div className="order-card rounded-xl p-6 md:p-8 flex flex-col md:flex-row gap-8 items-center">
      <div className="w-full md:w-32 aspect-square overflow-hidden rounded-lg bg-surface-container-high flex-shrink-0 border border-outline-variant/10">
        <img
          alt={firstItem?.productSnapshot?.name || "Order item"}
          className="w-full h-full object-cover"
          src={imageSrc}
        />
      </div>
      <div className="flex-grow w-full grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
        <div className="space-y-1">
          <span className="text-[10px] uppercase tracking-wider font-bold text-on-surface-variant">
            Order Number
          </span>
          <p className="font-headline-sm text-headline-sm text-on-surface truncate">#{order.orderNumber}</p>
          <p className="text-on-surface-variant text-xs">
            Placed on {new Date(order.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>

        <div className="space-y-1">
          <span className="text-[10px] uppercase tracking-wider font-bold text-on-surface-variant">
            Fulfillment Status
          </span>
          <div className="flex items-center mt-1">
            <span className="text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider" style={{ backgroundColor: fulfillBg, color: fulfillColor }}>
              {fulfillLabel}
            </span>
          </div>
          <p className="text-on-surface-variant text-xs">{itemsCount} {itemsCount === 1 ? "Item" : "Items"}</p>
        </div>

        <div className="space-y-1">
          <span className="text-[10px] uppercase tracking-wider font-bold text-on-surface-variant">
            Payment &amp; Total
          </span>
          <div className="flex items-center mt-1">
            <span className="text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider" style={{ backgroundColor: payBg, color: payColor }}>
              {payLabel}
            </span>
          </div>
          <p className="text-on-surface font-bold mt-1 text-primary" style={{ color: THEME_COLORS.global.primary }}>
            ${totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>

        <div className="flex md:justify-end w-full md:w-auto">
          <Link
            href={`/orders/${order.id}`}
            className="px-8 py-3 text-on-primary rounded-full font-label-md text-label-md hover:opacity-90 transition-all active:scale-95 text-center w-full md:w-auto cursor-pointer block font-bold uppercase tracking-wider"
            style={{ backgroundColor: THEME_COLORS.global.primary }}
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}
