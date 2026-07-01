"use client";

import React, { use, useState, useEffect } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import ProfileDialog from "@/components/ProfileDialog";
import { useAppDispatch, useAppSelector } from "@/lib/store";
import { setCartOpen, removeFromCart, clearCart } from "@/lib/features/cart/cartSlice";
import { setProfileOpen } from "@/lib/features/profile/profileSlice";
import { THEME_COLORS } from "@/theme/colors";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function OrderDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const dispatch = useAppDispatch();
  const cartOpen = useAppSelector((state) => state.cart.isOpen);
  const profileOpen = useAppSelector((state) => state.profile.isOpen);
  const cartItems = useAppSelector((state) => state.cart.items);

  const [scrolled, setScrolled] = useState(false);

  // Scroll listener for Header solid transition
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Map mock data dynamically depending on URL ID
  const isBracelet = id === "AUR-881045" || id.toLowerCase().includes("bracelet");

  const orderDetails = {
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
    stepIndex: isBracelet ? 4 : 3, // Shipped vs Quality Check
  };

  const handleDownloadInvoice = () => {
    alert(`Generating invoice receipt for order ${orderDetails.number}...`);
  };


  const renderOrderHeader = () => {
    return (
      <div className="mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <span className="font-label-md text-label-md text-secondary uppercase tracking-widest block mb-2">
              Order Confirmed
            </span>
            <h1 className="font-headline-lg text-headline-lg text-primary">
              Order {orderDetails.number}
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant mt-2">
              Placed on {orderDetails.date} • Estimated Delivery: {orderDetails.deliveryDate}
            </p>
          </div>
          <button
            onClick={handleDownloadInvoice}
            className="flex items-center gap-2 font-label-md text-label-md text-secondary hover:text-primary transition-all group cursor-pointer text-left self-start md:self-end"
          >
            <span className="material-symbols-outlined text-[20px]">download</span>
            <span className="border-b border-transparent group-hover:border-primary">Download Invoice</span>
          </button>
        </div>
        <div className="copper-underline mt-8 opacity-20"></div>
      </div>
    )
  }


  const renderItemSummary = () => {
    return (
      <div className="bg-surface-container-low rounded-xl p-8 organic-shadow border border-surface-container-high">
        <h3 className="font-headline-sm text-headline-sm text-primary mb-8">
          Order Summary
        </h3>
        <div className="space-y-8">
          <div className="flex gap-6 items-start">
            <div className="w-24 h-24 rounded-lg overflow-hidden bg-surface-container-highest flex-shrink-0">
              <img
                className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500"
                alt={orderDetails.name}
                src={orderDetails.image}
              />
            </div>
            <div className="flex-grow">
              <div className="flex justify-between items-start">
                <h4 className="font-body-lg text-body-lg font-semibold text-on-surface">
                  {orderDetails.name}
                </h4>
                <span className="font-body-lg text-body-lg text-primary">
                  {orderDetails.price}
                </span>
              </div>
              <p className="font-label-md text-label-md text-on-surface-variant mt-1">
                {orderDetails.specs}
              </p>
              <div className="mt-4 flex items-center gap-4">
                <button
                  onClick={() => alert("Engraving request sent to Atelier Concierge.")}
                  className="font-label-sm text-label-sm text-secondary hover:underline cursor-pointer"
                >
                  Add Inscription
                </button>
                <button
                  onClick={() => alert("Complimentary resizing request form initialized.")}
                  className="font-label-sm text-label-sm text-secondary hover:underline cursor-pointer"
                >
                  Request Resizing
                </button>
              </div>
            </div>
          </div>

          <div className="border-t border-outline-variant/30 pt-8 space-y-4">
            <div className="flex justify-between font-label-md text-label-md text-on-surface-variant">
              <span>Subtotal</span>
              <span>{orderDetails.price}</span>
            </div>
            <div className="flex justify-between font-label-md text-label-md text-on-surface-variant">
              <span>Sustainability-Verified Delivery</span>
              <span className="text-secondary">Complimentary</span>
            </div>
            <div className="flex justify-between font-body-lg text-body-lg font-bold text-primary pt-4 border-t border-outline-variant/30">
              <span>Total Carbon-Offset Price</span>
              <span>{orderDetails.price}</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

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
    )
  }

  const renderCareCTA = () => {
    return (
      <div className="bg-tertiary-container rounded-xl p-8 text-on-tertiary-container organic-shadow overflow-hidden relative">
        <div className="relative z-10">
          <h3 className="font-headline-sm text-headline-sm text-tertiary-fixed mb-2">Atelier Care</h3>
          <p className="font-body-md text-body-md opacity-90 mb-6 text-white/90">
            Schedule your first complimentary ultrasonic cleaning or speak with an expert about insurance valuation.
          </p>
          <button
            onClick={() => alert("Atelier consultation calendar opened. Please select a date.")}
            className="bg-white/10 hover:bg-white/20 border border-white/30 backdrop-blur-sm px-6 py-3 rounded-lg font-label-md text-label-md transition-all w-full cursor-pointer text-white font-bold"
          >
            Book Consultation
          </button>
        </div>
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-secondary rounded-full blur-[60px] opacity-20"></div>
      </div>
    )
  }


  const renderTrakingTimeLine = () => {
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
              <p className="font-label-sm text-label-sm text-on-surface-variant">Oct 24 • 14:30 GMT</p>
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
              <p className="font-label-md text-label-md font-bold text-on-surface">Crafting &amp; Polishing</p>
              <p className="font-label-sm text-label-sm text-on-surface-variant">Oct 26 • Atelier London</p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="relative">
            {orderDetails.stepIndex === 3 ? (
              <div className="absolute -left-[29px] w-5 h-5 rounded-full bg-secondary-container animate-pulse flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-secondary"></div>
              </div>
            ) : (
              <div className="absolute -left-[29px] w-5 h-5 rounded-full bg-primary ring-4 ring-primary-fixed flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  check
                </span>
              </div>
            )}
            <div>
              <p className={`font-label-md text-label-md font-bold ${orderDetails.stepIndex === 3 ? "text-primary" : "text-on-surface"}`}>
                Quality Inspection
              </p>
              <p className="font-label-sm text-label-sm text-on-surface-variant">
                {orderDetails.stepIndex === 3 ? "Estimated completion today" : "Completed Oct 29"}
              </p>
            </div>
          </div>

          {/* Step 4 */}
          <div className={`relative ${orderDetails.stepIndex === 3 ? "opacity-40" : ""}`}>
            {orderDetails.stepIndex === 4 ? (
              <div className="absolute -left-[29px] w-5 h-5 rounded-full bg-secondary-container animate-pulse flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-secondary"></div>
              </div>
            ) : (
              <div className="absolute -left-[29px] w-5 h-5 rounded-full bg-outline-variant"></div>
            )}
            <div>
              <p className={`font-label-md text-label-md font-bold ${orderDetails.stepIndex === 4 ? "text-primary" : "text-on-surface"}`}>
                Secure Handover &amp; Shipment
              </p>
              <p className="font-label-sm text-label-sm text-on-surface-variant">
                {orderDetails.stepIndex === 4 ? "In transit - Estimated arrival tomorrow" : "Pending delivery partner"}
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => alert(`Redirecting to UPS secure carbon-neutral tracking for ${orderDetails.number}...`)}
          className="w-full mt-12 py-4 px-6 bg-primary text-white font-label-md text-label-md rounded-lg hover:bg-primary-container transition-all shadow-sm active:scale-[0.98] cursor-pointer"
        >
          Track Detailed Shipment
        </button>
      </div>
    )

  }

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
        {/* Order Header */}
        {renderOrderHeader()}

        {/* Bento Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
          {/* Main Content Left: Cinematic Preview & Summary */}
          <div className="lg:col-span-8 space-y-gutter">

            {/* Cinematic Preview */}
            <div className="relative group overflow-hidden rounded-xl bg-surface-container-low organic-shadow aspect-[16/9] border border-outline-variant/10">
              <img
                alt="Cinematic jewelry item preview"
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                src={orderDetails.image}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-8">
                <h2 className="font-headline-md text-headline-md text-white mb-2">
                  {orderDetails.name}
                </h2>
                <p className="font-body-md text-body-md text-white/80 max-w-md">
                  Ethically crafted sustainable diamonds set in certified zero-carbon setting.
                </p>
              </div>
            </div>

            {/* Item Summary */}
            {renderItemSummary()}

            {/* GIA Documentation */}
            <div className="bg-surface-container-highest rounded-xl p-8 border border-primary-fixed overflow-hidden relative">
              <div className="flex flex-col md:flex-row gap-8 items-center">
                <div className="md:w-1/3 flex-shrink-0">
                  <img
                    alt="GIA certification report document"
                    className="w-full rounded-lg shadow-sm"
                    src="https://lh3.googleusercontent.com/aida/AP1WRLvEBZHy330ijdEQQPUeXP0uVXLbkzAyIn9J48AVUHz7ckuOzI4JC7ymQcxxMSJzlaXjAChvu_bEDxDgc-spX-Zj96AHopFhF6rQaWzq-L5ynoiOjbMdyaEFP3QjQlakB2Y4K8w1QgqGpA_BI7tmzeuGQ1_S7Oq_BShiaXFddQA98K-bMTYJeVDeJZSmado_iaYN92TFhGd4KekzCvcRFd3KfqD4bVPw0UCoJ3FMbPxRmOUyxKa6PN9c-w"
                  />
                </div>
                <div className="md:w-2/3">
                  <h3 className="font-headline-sm text-headline-sm text-primary mb-4">
                    Provenance &amp; Quality
                  </h3>
                  <p className="font-body-md text-body-md text-on-surface-variant mb-6">
                    Your diamond is accompanied by a digital-first GIA Diamond Dossier®, providing a permanent, immutable record of its unique fingerprint and ethical origin.
                  </p>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <li className="flex items-center gap-2 font-label-md text-label-md text-on-surface">
                      <span className="material-symbols-outlined text-[18px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                        verified
                      </span>
                      Conflict-Free Certified
                    </li>
                    <li className="flex items-center gap-2 font-label-md text-label-md text-on-surface">
                      <span className="material-symbols-outlined text-[18px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                        verified
                      </span>
                      Recycled Platinum
                    </li>
                    <li className="flex items-center gap-2 font-label-md text-label-md text-on-surface">
                      <span className="material-symbols-outlined text-[18px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                        verified
                      </span>
                      GIA Graded: Excellent
                    </li>
                    <li className="flex items-center gap-2 font-label-md text-label-md text-on-surface">
                      <span className="material-symbols-outlined text-[18px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                        verified
                      </span>
                      Lifetime Guarantee
                    </li>
                  </ul>
                </div>
              </div>
            </div>

          </div>

          {/* Sidebar Right: Tracking & Support */}
          <div className="lg:col-span-4 space-y-gutter">

            {/* Tracking Timeline */}
            {renderTrakingTimeLine()}

            {/* Care CTA */}
            {renderCareCTA()}

            {/* Support Box */}
            {renderSupportBox()}

          </div>
        </div>
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
          alert("Checkout processed safely. Thank you for selecting ethical luxury!");
          dispatch(clearCart());
          dispatch(setCartOpen(false));
        }}
      />
      <ProfileDialog isOpen={profileOpen} onClose={() => dispatch(setProfileOpen(false))} />
    </div>
  );
}
