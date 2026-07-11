"use client";

import React, { use, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import ProfileDialog from "@/components/ProfileDialog";
import { useAppDispatch, useAppSelector } from "@/lib/store";
import { setCartOpen, removeFromCart, clearCart } from "@/lib/features/cart/cartSlice";
import { setProfileOpen } from "@/lib/features/profile/profileSlice";
import { THEME_COLORS } from "@/theme/colors";
import { getOrderById, getOrderEvents, OrderData, OrderEvent } from "@/services/api";
import OrderTimeline from "@/components/OrderTimeline";

interface PageProps {
  params: Promise<{ id: string }>;
}

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
  const [events, setEvents] = useState<OrderEvent[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);

  // Map mock data dynamically depending on URL ID
  const isBracelet = id === "AUR-881045" || id.toLowerCase().includes("bracelet");
  const isMock = isBracelet || id === "AUR-882910";

  useEffect(() => {
    const fetchOrderAndEvents = async () => {
      setLoading(true);
      setEventsLoading(true);
      setError("");
      try {
        const orderResult = await getOrderById(id);
        setLiveOrder(orderResult.data);
      } catch (err: any) {
        setError(err.message || "Failed to load order provenance.");
      } finally {
        setLoading(false);
      }

      try {
        const eventsResult = await getOrderEvents(id);
        // Reversing to show newest at the top (reverse chronological order)
        setEvents([...eventsResult.data].reverse());
      } catch (err) {
        console.error("Failed to load order events:", err);
      } finally {
        setEventsLoading(false);
      }
    };

    if (!isMock) {
      fetchOrderAndEvents();
    } else {
      setLoading(false);
      setEventsLoading(false);
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

  const orderDetails = liveOrder
    ? {
        number: `#${liveOrder.orderNumber}`,
        name: liveOrder.items[0]?.productSnapshot?.name || "Bespoke Jewelry Piece",
        price: `$${(liveOrder.totals.totalMinor / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        date: new Date(liveOrder.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
        deliveryDate: new Date(new Date(liveOrder.createdAt).getTime() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        specs: `Metal: ${liveOrder.items[0]?.variantSnapshot?.metalType} • Purity: ${liveOrder.items[0]?.variantSnapshot?.purity} • Color: ${liveOrder.items[0]?.variantSnapshot?.metalColor} • Size: ${liveOrder.items[0]?.variantSnapshot?.sizeLabel}`,
        image: liveOrder.items[0]?.productSnapshot?.imageUrl || "https://lh3.googleusercontent.com/aida/AP1WRLurFJQ4iSPdztJ-UpOPfXfi-3UabSzn06tAERclG0j87fz_l9RO3Rd-sBpcuukbwu9XETXjdCAlINMskwEsll7ag5Y9dnuAT0W8yk1inPVRk1Kuj1xlvlm5COlBklKeavfM6oEb1lv7lp_Povi8AY0mqsExyG8uOSsL3B_0YR1mDPDdm_GhdrIW9Fv1v_ZRoqQucwdU5ai6YIF9Bg4Gz5sFLq1GQ1eJaghEnt7209yfkNEM-9NuPMharDM",
        stepIndex: liveOrder.fulfillmentStatus.toLowerCase() === "fulfilled" || liveOrder.fulfillmentStatus.toLowerCase() === "delivered" ? 4 : liveOrder.fulfillmentStatus.toLowerCase() === "shipped" ? 3 : 2,
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
        stepIndex: isBracelet ? 4 : 3,
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
  }

  const renderOrderHeader = () => {
    return (
      <div className="mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <span className="font-label-md text-label-md text-secondary uppercase tracking-widest block mb-2">
              Sourcing Provenance Certificate
            </span>
            <h1 className="font-headline-lg text-headline-lg text-primary">
              Order {orderDetails.number}
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant mt-2">
              Placed on {orderDetails.date} • Estimated Delivery: {orderDetails.deliveryDate}
            </p>
            <div className="flex flex-wrap gap-2 mt-4">
              <span className="text-[10px] font-bold px-3.5 py-1.5 rounded-full uppercase tracking-widest text-xs" style={{ backgroundColor: statusColor + "12", color: statusColor }}>
                Status: {statusLabel}
              </span>
              <span className="text-[10px] font-bold px-3.5 py-1.5 rounded-full uppercase tracking-widest text-xs" style={{ backgroundColor: payStatusColor + "12", color: payStatusColor }}>
                Payment: {payStatusLabel}
              </span>
            </div>
          </div>
          <button
            onClick={handleDownloadInvoice}
            className="flex items-center gap-2 font-label-md text-label-md text-secondary hover:text-primary transition-all group cursor-pointer text-left self-start md:self-end"
          >
            <span className="material-symbols-outlined text-[20px]">download</span>
            <span className="border-b border-transparent group-hover:border-primary">Download Certificate</span>
          </button>
        </div>
        <div className="copper-underline mt-8 opacity-20"></div>
      </div>
    );
  };

  const renderItemSummary = () => {
    const items = liveOrder ? liveOrder.items : [
      {
        productSnapshot: { name: orderDetails.name, imageUrl: orderDetails.image, sku: isBracelet ? "EC-BRC-SOL-02" : "EC-RNG-CEL-10" },
        variantSnapshot: { metalType: "platinum", metalColor: "white", purity: "950", sizeLabel: isBracelet ? "7 inches" : "Size M" },
        quantity: { ordered: 1 },
        pricingSnapshot: { finalUnitPriceMinor: parseFloat(orderDetails.price.replace(/[^\d.]/g, '')) * 100 }
      }
    ];

    return (
      <div className="bg-surface-container-low rounded-xl p-8 organic-shadow border border-outline-variant/10">
        <h3 className="font-headline-sm text-headline-sm text-primary mb-8">
          Sourced Masterpieces
        </h3>
        <div className="space-y-8">
          {items.map((item, idx) => {
            const price = item.pricingSnapshot.finalUnitPriceMinor / 100;
            const itemSpecs = `Metal: ${item.variantSnapshot.purity} ${item.variantSnapshot.metalColor} ${item.variantSnapshot.metalType} • Size: ${item.variantSnapshot.sizeLabel}`;
            return (
              <div key={idx} className="flex gap-6 items-start border-b border-outline-variant/10 pb-6 last:border-0 last:pb-0">
                <div className="w-24 h-24 rounded-lg overflow-hidden bg-surface-container-highest flex-shrink-0 border border-outline-variant/15">
                  <img
                    className="w-full h-full object-cover"
                    alt={item.productSnapshot.name}
                    src={item.productSnapshot.imageUrl || "https://lh3.googleusercontent.com/aida/AP1WRLurFJQ4iSPdztJ-UpOPfXfi-3UabSzn06tAERclG0j87fz_l9RO3Rd-sBpcuukbwu9XETXjdCAlINMskwEsll7ag5Y9dnuAT0W8yk1inPVRk1Kuj1xlvlm5COlBklKeavfM6oEb1lv7lp_Povi8AY0mqsExyG8uOSsL3B_0YR1mDPDdm_GhdrIW9Fv1v_ZRoqQucwdU5ai6YIF9Bg4Gz5sFLq1GQ1eJaghEnt7209yfkNEM-9NuPMharDM"}
                  />
                </div>
                <div className="flex-grow">
                  <div className="flex justify-between items-start">
                    <h4 className="font-body-lg text-body-lg font-semibold text-on-surface leading-tight">
                      {item.productSnapshot.name}
                    </h4>
                    <span className="font-body-lg text-body-lg text-primary font-bold">
                      ${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <p className="font-label-sm text-label-sm text-on-surface-variant/80 mt-2">
                    {itemSpecs}
                  </p>
                  <div className="flex justify-between items-center mt-3 text-xs">
                    <span className="text-on-surface-variant uppercase tracking-wider font-bold">
                      SKU: {item.productSnapshot.sku}
                    </span>
                    <span className="px-3 py-1 bg-surface-container-highest text-on-surface font-semibold rounded-full">
                      Qty: {item.quantity.ordered}
                    </span>
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
        <h4 className="font-label-md text-label-md text-primary mb-4">
          Concierge Support
        </h4>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-secondary text-[20px]">chat_bubble</span>
            <span className="font-label-md text-label-md text-on-surface-variant">Live Chat (Available now)</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-secondary text-[20px]">call</span>
            <span className="font-label-md text-label-md text-on-surface-variant">+44 20 7946 0123</span>
          </div>
        </div>
      </div>
    );
  };

  // Convert minor units to standard decimals
  const subtotal = liveOrder ? (liveOrder.totals.merchandiseSubtotalMinor / 100) : (isBracelet ? 12400 : 14500);
  const shippingAmount = liveOrder ? (liveOrder.totals.shippingMinor / 100) : 0;
  const taxAmount = liveOrder ? (liveOrder.totals.taxMinor / 100) : (subtotal * 0.08);
  const totalAmount = liveOrder ? (liveOrder.totals.totalMinor / 100) : (subtotal + taxAmount + shippingAmount);

  return (
    <div className="bg-background text-on-surface font-body-md min-h-screen flex flex-col relative overflow-x-hidden selection:bg-secondary-container">
      {/* Custom Styles matching design mockups */}
      <style dangerouslySetInnerHTML={{
        __html: `
        .organic-shadow {
          box-shadow: 0 10px 30px -10px rgba(60, 153, 132, 0.12);
          transition: transform 0.4s cubic-bezier(0.165, 0.84, 0.44, 1), box-shadow 0.4s ease;
        }
        .organic-shadow:hover {
          transform: translateY(-2px);
          box-shadow: 0 15px 35px -8px rgba(60, 153, 132, 0.16);
        }
        .timeline-gradient {
          background: linear-gradient(to bottom, #8ed8c8 0%, #3C9984 100%);
        }
        .copper-underline {
          background: linear-gradient(to right, #3C9984, transparent);
          height: 1px;
          width: 100%;
        }
        .glass-panel {
          background: rgba(247, 255, 252, 0.72);
          backdrop-filter: blur(8px);
        }
        .font-playfair {
          font-family: var(--font-playfair-display), serif;
        }
      `}} />

      {/* Header */}
      <Header
        scrolled={scrolled}
        setCartOpen={(open) => dispatch(setCartOpen(open))}
        setProfileOpen={(open) => dispatch(setProfileOpen(open))}
        cartItemsCount={cartItems.reduce((acc, curr) => acc + curr.quantity, 0)}
      />

      {/* Main Content Area */}
      <main className="flex-grow max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-12 pt-28 w-full">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <div className="w-12 h-12 rounded-full border-4 border-outline-variant/30 border-t-primary animate-spin" style={{ borderTopColor: THEME_COLORS.global.primary }} />
            <p className="text-on-surface-variant text-sm font-label-md tracking-wider uppercase animate-pulse">
              Retrieving Provenance Certificate...
            </p>
          </div>
        ) : error ? (
          <div className="p-8 rounded-2xl bg-error-container/40 border border-error/20 text-center max-w-md mx-auto space-y-4">
            <span className="material-symbols-outlined text-error text-5xl">warning</span>
            <h3 className="font-playfair text-2xl font-semibold text-on-error-container">Sourcing Ledger Link Failed</h3>
            <p className="text-on-error-container font-medium text-sm leading-relaxed">{error}</p>
            <div className="flex gap-4 justify-center">
              <Link href="/orders" className="bg-primary text-white px-6 py-2.5 rounded-full text-xs font-bold uppercase hover:bg-secondary transition-all">
                Go to History
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Order Header */}
            {renderOrderHeader()}

            {/* Bento Layout Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
              {/* Main Content Left: Cinematic Preview & Summary */}
              <div className="lg:col-span-8 space-y-gutter">
                {/* Item Summary */}
                {renderItemSummary()}

                {/* Sourcing Destination Details */}
                <div className="bg-surface-container-low rounded-xl p-8 border border-outline-variant/10 organic-shadow">
                  <h3 className="font-headline-sm text-headline-sm text-primary mb-6">
                    Sourcing Shipping Destination
                  </h3>
                  {liveOrder?.shippingAddressSnapshot ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm text-on-surface-variant">
                      <div className="space-y-2">
                        <p className="text-[10px] uppercase tracking-wider font-bold text-secondary">Delivery Address</p>
                        <div className="font-medium text-on-surface space-y-1">
                          <p className="font-bold text-base text-primary">{liveOrder.shippingAddressSnapshot.name}</p>
                          <p>{liveOrder.shippingAddressSnapshot.line1}</p>
                          {liveOrder.shippingAddressSnapshot.line2 && <p>{liveOrder.shippingAddressSnapshot.line2}</p>}
                          <p>{liveOrder.shippingAddressSnapshot.city}, {liveOrder.shippingAddressSnapshot.state} {liveOrder.shippingAddressSnapshot.postalCode}</p>
                          <p className="uppercase font-bold tracking-widest text-xs mt-1">{liveOrder.shippingAddressSnapshot.country}</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="space-y-1">
                          <p className="text-[10px] uppercase tracking-wider font-bold text-secondary">Contact Phone</p>
                          <p className="font-bold text-on-surface">{liveOrder.shippingAddressSnapshot.phone}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] uppercase tracking-wider font-bold text-secondary">Billing Address</p>
                          <p className="font-medium text-on-surface">Same as shipping destination</p>
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

                {/* Sourced Pricing Breakdown */}
                <div className="bg-surface-container-low rounded-xl p-8 border border-outline-variant/10 organic-shadow text-sm space-y-4">
                  <h3 className="font-label-md text-label-md text-primary uppercase tracking-widest border-b border-outline-variant/10 pb-2">
                    Pricing Ledger
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-on-surface-variant">Merchandise Subtotal</span>
                      <span className="font-bold text-on-surface">${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-on-surface-variant">Carbon-Neutral Shipping</span>
                      <span className="font-bold text-on-surface">{shippingAmount === 0 ? "Free" : `$${shippingAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-on-surface-variant">Sourcing Duty &amp; Tax</span>
                      <span className="font-bold text-on-surface">${taxAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between border-t border-outline-variant/15 pt-4 font-headline-sm text-headline-sm text-on-surface">
                      <span>Grand Total</span>
                      <span className="font-bold text-primary" style={{ color: THEME_COLORS.global.primary }}>
                        ${totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Sidebar Right: Tracking & Support */}
              <div className="lg:col-span-4 space-y-gutter">

                {/* Tracking Timeline */}
                <OrderTimeline
                  events={events}
                  eventsLoading={eventsLoading}
                  isMock={isMock}
                  orderDetails={orderDetails}
                />



                {/* Support Box */}
                {renderSupportBox()}

              </div>
            </div>
          </>
        )}
      </main>

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
