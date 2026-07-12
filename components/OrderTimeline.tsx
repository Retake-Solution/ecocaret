"use client";

import React from "react";
import { OrderEvent } from "@/services/api";

interface OrderTimelineProps {
  events: OrderEvent[];
  eventsLoading: boolean;
  isMock: boolean;
  orderDetails: {
    stepIndex: number;
    number: string;
  };
  hasMore: boolean;
  loadingMore: boolean;
  onLoadMore: () => void;
}

export default function OrderTimeline({
  events,
  eventsLoading,
  isMock,
  orderDetails,
  hasMore,
  loadingMore,
  onLoadMore,
}: OrderTimelineProps) {
  const getEventIconAndColor = (type: string) => {
    const norm = type.toLowerCase();
    switch (norm) {
      case "order_created":
        return { icon: "shopping_cart", color: "#6B7280", bgColor: "rgba(107, 114, 128, 0.1)" }; // Gray
      case "inventory_reserved":
        return { icon: "package", color: "#3B82F6", bgColor: "rgba(59, 130, 246, 0.1)" }; // Blue
      case "inventory_committed":
        return { icon: "check_circle", color: "#10B981", bgColor: "rgba(16, 185, 129, 0.1)" }; // Green
      case "inventory_released":
        return { icon: "lock_open", color: "#6B7280", bgColor: "rgba(107, 114, 128, 0.1)" }; // Gray
      case "inventory_expired":
        return { icon: "schedule", color: "#EF4444", bgColor: "rgba(239, 68, 68, 0.1)" }; // Red
      case "fulfillment_status_changed":
        return { icon: "sync", color: "#3B82F6", bgColor: "rgba(59, 130, 246, 0.1)" }; // Blue
      case "item_status_changed":
        return { icon: "assignment", color: "#8B5CF6", bgColor: "rgba(139, 92, 246, 0.1)" }; // Purple
      case "cancellation_requested":
        return { icon: "close", color: "#EF4444", bgColor: "rgba(239, 68, 68, 0.1)" }; // Red
      case "order_partially_cancelled":
        return { icon: "warning", color: "#F59E0B", bgColor: "rgba(245, 158, 11, 0.1)" }; // Yellow
      case "item_cancelled":
        return { icon: "delete", color: "#EF4444", bgColor: "rgba(239, 68, 68, 0.1)" }; // Red
      case "order_cancelled":
        return { icon: "cancel", color: "#EF4444", bgColor: "rgba(239, 68, 68, 0.1)" }; // Red
      case "payment_updated":
        return { icon: "credit_card", color: "#3B82F6", bgColor: "rgba(59, 130, 246, 0.1)" }; // Blue
      case "refund_requested":
        return { icon: "attach_money", color: "#F59E0B", bgColor: "rgba(245, 158, 11, 0.1)" }; // Yellow
      case "refund_updated":
        return { icon: "attach_money", color: "#F59E0B", bgColor: "rgba(245, 158, 11, 0.1)" }; // Yellow
      case "shipment_created":
        return { icon: "local_shipping", color: "#F97316", bgColor: "rgba(249, 115, 22, 0.1)" }; // Orange
      case "shipment_updated":
        return { icon: "place", color: "#F97316", bgColor: "rgba(249, 115, 22, 0.1)" }; // Orange
      case "shipment_cancelled":
        return { icon: "block", color: "#374151", bgColor: "rgba(55, 65, 81, 0.1)" }; // Dark Gray
      case "address_corrected":
        return { icon: "mark_as_unread", color: "#10B981", bgColor: "rgba(16, 185, 129, 0.1)" }; // Green
      default:
        return { icon: "info", color: "#6B7280", bgColor: "rgba(107, 114, 128, 0.1)" };
    }
  };

  const getEventTitle = (type: string) => {
    switch (type.toLowerCase()) {
      case "order_created": return "Order Placed";
      case "inventory_reserved": return "Items Reserved";
      case "inventory_committed": return "Items Confirmed";
      case "inventory_released": return "Reservation Released";
      case "inventory_expired": return "Reservation Expired";
      case "fulfillment_status_changed": return "Order Status Updated";
      case "item_status_changed": return "Item Status Updated";
      case "cancellation_requested": return "Cancellation Requested";
      case "order_partially_cancelled": return "Partial Cancellation";
      case "item_cancelled": return "Item Cancelled";
      case "order_cancelled": return "Order Cancelled";
      case "payment_updated": return "Payment Updated";
      case "refund_requested": return "Refund Requested";
      case "refund_updated": return "Refund Updated";
      case "shipment_created": return "Shipment Created";
      case "shipment_updated": return "Shipment Updated";
      case "shipment_cancelled": return "Shipment Cancelled";
      case "address_corrected": return "Address Updated";
      default: return type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    }
  };

  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString);
    return (
      date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }) +
      ", " +
      date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
    );
  };

  if (isMock) {
    return (
      <div className="bg-surface-container rounded-xl p-8 organic-shadow border border-outline-variant/20">
        <h3 className="font-label-md text-label-md text-primary uppercase tracking-widest mb-8">
          Journey Status
        </h3>

        <div className="relative pl-8 space-y-12">
          {/* Vertical Line */}
          <div className="absolute left-[11px] top-0 bottom-0 w-[2px] bg-outline-variant/30"></div>
          <div
            className="absolute left-[11px] top-0 w-[2px] timeline-gradient"
            style={{ height: orderDetails.stepIndex === 4 ? "100%" : "60%" }}
          ></div>

          {/* Step 1 */}
          <div className="relative">
            <div className="absolute -left-[29px] w-5 h-5 rounded-full bg-primary ring-4 ring-primary-fixed flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                check
              </span>
            </div>
            <div>
              <p className="font-label-md text-label-md font-bold text-on-surface">Order Placed</p>
              <p className="font-label-sm text-label-sm text-on-surface-variant">Validated &amp; Signed</p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="relative">
            <div className="absolute -left-[29px] w-5 h-5 rounded-full bg-primary ring-4 ring-primary-fixed flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                check
              </span>
            </div>
            <div>
              <p className="font-label-md text-label-md font-bold text-on-surface">Crafting &amp; Sourcing</p>
              <p className="font-label-sm text-label-sm text-on-surface-variant">Sustainable settings casted</p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="relative">
            {orderDetails.stepIndex === 3 ? (
              <div className="absolute -left-[29px] w-5 h-5 rounded-full bg-secondary-container animate-pulse flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-secondary"></div>
              </div>
            ) : orderDetails.stepIndex > 3 ? (
              <div className="absolute -left-[29px] w-5 h-5 rounded-full bg-primary ring-4 ring-primary-fixed flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  check
                </span>
              </div>
            ) : (
              <div className="absolute -left-[29px] w-5 h-5 rounded-full bg-outline-variant"></div>
            )}
            <div>
              <p className={`font-label-md text-label-md font-bold ${orderDetails.stepIndex === 3 ? "text-primary" : "text-on-surface"}`}>
                Quality Inspection
              </p>
              <p className="font-label-sm text-label-sm text-on-surface-variant">GIA Dossier validation</p>
            </div>
          </div>

          {/* Step 4 */}
          <div className="relative">
            {orderDetails.stepIndex === 4 ? (
              <div className="absolute -left-[29px] w-5 h-5 rounded-full bg-primary ring-4 ring-primary-fixed flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  check
                </span>
              </div>
            ) : (
              <div className="absolute -left-[29px] w-5 h-5 rounded-full bg-outline-variant"></div>
            )}
            <div>
              <p className={`font-label-md text-label-md font-bold ${orderDetails.stepIndex === 4 ? "text-primary" : "text-on-surface"}`}>
                Secure Handover &amp; Shipment
              </p>
              <p className="font-label-sm text-label-sm text-on-surface-variant">
                {orderDetails.stepIndex === 4 ? "Delivered / Handed over" : "Pending dispatch"}
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => alert(`Redirecting to carbon-neutral tracking for ${orderDetails.number}...`)}
          className="w-full mt-12 py-4 px-6 bg-primary text-white font-label-md text-label-md rounded-lg hover:bg-primary-container transition-all shadow-sm active:scale-[0.98] cursor-pointer"
        >
          Track Detailed Shipment
        </button>
      </div>
    );
  }

  return (
    <div className="bg-surface-container rounded-xl p-8 organic-shadow border border-outline-variant/20">
      <h3 className="font-label-md text-label-md text-primary uppercase tracking-widest mb-8">
        Order Timeline History
      </h3>

      {eventsLoading ? (
        <div className="space-y-8 animate-pulse pl-8 relative">
          <div className="absolute left-[11px] top-0 bottom-0 w-[2px] bg-outline-variant/20"></div>
          {[1, 2].map((i) => (
            <div key={i} className="relative space-y-2">
              <div className="absolute -left-[29px] w-5 h-5 rounded-full bg-outline-variant/30"></div>
              <div className="h-4 bg-outline-variant/20 rounded-md w-1/3"></div>
              <div className="h-3 bg-outline-variant/20 rounded-md w-1/2"></div>
            </div>
          ))}
        </div>
      ) : events.length === 0 ? (
        <p className="text-sm text-on-surface-variant italic text-center py-6">
          No timeline events recorded yet.
        </p>
      ) : (
        <div className="space-y-8">
          <div className="relative pl-8 space-y-8">
            <div className="absolute left-[11px] top-2 bottom-2 w-[2px] bg-outline-variant/30"></div>

            {events.map((event) => {
              const { icon, color, bgColor } = getEventIconAndColor(event.type);
              const title = getEventTitle(event.type);

              return (
                <div key={event.sequence} className="relative group">
                  <div
                    className="absolute -left-[35px] w-8 h-8 rounded-full border-2 border-surface flex items-center justify-center shadow-sm z-10"
                    style={{ backgroundColor: bgColor, color: color }}
                  >
                    <span className="material-symbols-outlined text-[16px] font-bold">
                      {icon}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-1">
                      <p className="font-label-md text-label-md font-bold text-on-surface">
                        {title}
                      </p>
                      <span className="text-[10px] text-on-surface-variant font-medium">
                        {formatEventDate(event.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {hasMore && (
            <div className="pt-4 flex justify-center">
              <button
                disabled={loadingMore}
                onClick={onLoadMore}
                className="px-6 py-2.5 bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant text-xs font-bold uppercase tracking-wider rounded-full transition-all cursor-pointer text-on-surface disabled:opacity-50"
              >
                {loadingMore ? "Loading More..." : "Load More"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
