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
}

export default function OrderTimeline({
  events,
  eventsLoading,
  isMock,
  orderDetails,
}: OrderTimelineProps) {
  const getEventIconAndColor = (type: string) => {
    const norm = type.toLowerCase();
    if (norm === "order_created") {
      return { icon: "shopping_cart", color: "#2563EB", bgColor: "rgba(37, 99, 235, 0.1)" };
    }
    if (norm === "payment_succeeded") {
      return { icon: "payments", color: "#3C9984", bgColor: "rgba(60, 153, 132, 0.1)" };
    }
    if (norm === "order_status_changed" || norm === "item_status_changed") {
      return { icon: "package_2", color: "#D97706", bgColor: "rgba(217, 119, 6, 0.1)" };
    }
    return { icon: "info", color: "#7C3AED", bgColor: "rgba(124, 58, 237, 0.1)" };
  };

  const getEventTitle = (type: string) => {
    const norm = type.toLowerCase();
    if (norm === "order_created") return "Order Created";
    if (norm === "payment_succeeded") return "Payment Succeeded";
    if (norm === "order_status_changed") return "Order Status Updated";
    if (norm === "item_status_changed") return "Item Status Updated";
    return type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
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
        <div className="relative pl-8 space-y-8">
          <div className="absolute left-[11px] top-2 bottom-2 w-[2px] bg-outline-variant/30"></div>

          {events.map((event) => {
            const { icon, color, bgColor } = getEventIconAndColor(event.type);
            const title = getEventTitle(event.type);
            const actorType = event.actor?.type
              ? event.actor.type.charAt(0).toUpperCase() + event.actor.type.slice(1)
              : "System";

            return (
              <div key={event.id} className="relative group">
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

                  {event.previousValue && event.newValue && (
                    <p className="text-xs text-on-surface-variant leading-relaxed">
                      Status changed from <strong className="text-secondary font-semibold">{event.previousValue}</strong> to <strong className="text-primary font-bold">{event.newValue}</strong>.
                    </p>
                  )}

                  {event.reason && (
                    <p className="text-xs italic text-on-surface-variant/80 bg-surface-container-high/40 p-2.5 rounded-lg border border-outline-variant/10 mt-1 block">
                      "{event.reason}"
                    </p>
                  )}

                  {event.metadata?.trackingNumber && (
                    <div className="pt-1.5">
                      <span
                        onClick={() => alert(`Redirecting to carrier tracking registry for: ${event.metadata?.trackingNumber}`)}
                        className="inline-flex items-center gap-1 bg-primary-fixed/20 text-primary-fixed-variant hover:bg-primary-fixed/30 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider cursor-pointer border border-primary-fixed/25"
                      >
                        <span className="material-symbols-outlined text-[12px]">local_shipping</span>
                        Tracking: {event.metadata.trackingNumber}
                      </span>
                    </div>
                  )}

                  <p className="text-[10px] text-on-surface-variant/50 font-bold uppercase tracking-widest pt-0.5">
                    Triggered by {actorType}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
