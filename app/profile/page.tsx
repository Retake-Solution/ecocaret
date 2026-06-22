"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import CartDrawer from "@/components/CartDrawer";
import ProfileDialog from "@/components/ProfileDialog";
import { useAppDispatch, useAppSelector } from "@/lib/store";
import { setCartOpen, removeFromCart, clearCart } from "@/lib/features/cart/cartSlice";
import { setProfileOpen, logoutUser } from "@/lib/features/profile/profileSlice";
import { toggleWishlist } from "@/lib/features/wishlist/wishlistSlice";

export default function ProfilePage() {
  const dispatch = useAppDispatch();
  const cartOpen = useAppSelector((state) => state.cart.isOpen);
  const profileOpen = useAppSelector((state) => state.profile.isOpen);
  const cartItems = useAppSelector((state) => state.cart.items);
  const wishlistItems = useAppSelector((state) => state.wishlist.items);
  const user = useAppSelector((state) => state.profile.user);

  const [scrolled, setScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "orders" | "wishlist" | "settings">("profile");

  // Local settings state
  const [settingsName, setSettingsName] = useState("Eleanor Vance");
  const [settingsEmail, setSettingsEmail] = useState("eleanor.vance@atelier.com");
  const [settingsAddress, setSettingsAddress] = useState("48 Atelier Way, Suite 4, San Francisco, CA");
  const [updateSuccess, setUpdateSuccess] = useState(false);

  // Animations on mount
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync settings inputs when user logins
  useEffect(() => {
    if (user) {
      setSettingsName(user.name || "Eleanor Vance");
      setSettingsEmail(user.email);
    }
  }, [user]);

  // Scroll listener for Header
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Vault carousel scroll handler
  const carouselRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (carouselRef.current) {
        e.preventDefault();
        carouselRef.current.scrollLeft += e.deltaY;
      }
    };
    const el = carouselRef.current;
    if (el && activeTab === "profile") {
      el.addEventListener("wheel", handleWheel, { passive: false });
    }
    return () => {
      if (el) {
        el.removeEventListener("wheel", handleWheel);
      }
    };
  }, [activeTab]);

  const handleUpdateSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setUpdateSuccess(true);
    setTimeout(() => setUpdateSuccess(false), 3000);
  };

  const handleLogout = () => {
    dispatch(logoutUser());
    alert("Successfully logged out of the Conscious Circle.");
    window.location.href = "/";
  };

  // Mock orders
  const mockOrders = [
    {
      id: "EC-98421",
      name: "Celestia Brilliant Solitaire",
      price: 4800,
      image: "https://lh3.googleusercontent.com/aida/AP1WRLtYUW-Vc7nSagdGIsLWiUqUrlzb_s9R39aUUG1zd7Bb07tN6aZiQTkMsGQeM_2Isl3CJb10mA92Jffxof-pjjYIj1HpDJu16YAIXeMgUxU-yr-IR1PG46h5bMPuzrqR-9fn_AwoI1eRuOJeLvqgb1PoXeUPFWnBX4WpuFmzh5ojimVVvzvrxx7bsXSAsH8zLIGlxUSGHnRRCkDIKF3ql9UXdaGhQ-xCOJTrTiRfna3UmChmcbGj2WtRZ9A",
      status: "Shipped",
      statusColor: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
      date: "June 1, 2026",
      tracking: "1Z999AA10123456784"
    },
    {
      id: "EC-98319",
      name: "The Terra Drop Pendant",
      price: 2400,
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCtEGLDC-9MkDh8yRjviZ1ykmGePsNTLJLmZ76TAz9HqAk3gwEAlFqVhHeqwVNFpS5_OhhFj5yb-cyXh5vbaItkpac9yF6K8p8nkDuVFbhlJMPyWr4IGxPSWCN0xy2zwba1QmmgE_NUy-dKRPNygm2a8X_pvQu921TbA59g8ew6DYiRQGcnbx6p0KkIFL4bJh1NMCAII8Oi29UABapAFFrSV9Aw_mZJmwnHxxBmGFIUAaba1ULLquAN0CAbbpG93vifSvPkNGcwoIQ",
      status: "In Production",
      statusColor: "bg-amber-500/10 text-amber-700 border-amber-500/20",
      date: "May 20, 2026",
      tracking: null
    }
  ];

  return (
    <div className="bg-background text-on-surface font-body-md min-h-screen flex flex-col relative overflow-x-hidden selection:bg-secondary-fixed selection:text-on-secondary-fixed">
      {/* Local styling overrides */}
      <style dangerouslySetInnerHTML={{
        __html: `
        .editorial-gradient {
          background: linear-gradient(to top, rgba(35, 26, 17, 0.7) 0%, rgba(35, 26, 17, 0.2) 60%, transparent 100%);
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #fff8f4;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #d8c3b4;
          border-radius: 10px;
        }
        .copper-accent {
          border-top: 2px solid #b87333;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
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

      {/* Main Container */}
      <div className="flex-grow pt-[76px] lg:pt-[84px] min-h-[calc(100vh-80px)] flex flex-col lg:flex-row">

        {/* Left Editorial Column */}
        <section className={`hidden lg:block lg:w-1/2 relative h-[calc(100vh-84px)] sticky top-[84px] bg-surface-dim overflow-hidden transition-all duration-1000 ${mounted ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
          }`}>
          <img
            className="w-full h-full object-cover grayscale-[20%] sepia-[10%] transition-transform duration-[2000ms] hover:scale-105"
            alt="Eleanor Vance high-fashion editorial portrait"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCWNFUiqj-VsGjdxPtplfC6JRHX77OD1bhX2d9uycXI3hc0oeScgigT5PQt6aQi1E2Au1WKOzPHvkWwagPqIex9DBOw9N-B7UT5KKOoulnOrY5JXtsyHKnHStddkPH9NvPXhUiwRFWYlvmKeFJHEkTnPq6xwxTmcJQ-4Uxaqsp8TVBrN36Mgx4x8Y50Uv-pyiK5ggroL8YO_NdoEcatu_Z9_bXKI3urKIWU426QG2AUtcaUhp40fBpgQDMobwCTOJHo7FvCPt6hHGY"
          />
          <div className="absolute inset-0 editorial-gradient flex flex-col justify-end p-margin-desktop">
            <div className="mb-8">
              <div className="inline-flex items-center bg-primary-container/20 backdrop-blur-md px-4 py-1 rounded-full border border-primary-fixed/30 mb-4 animate-pulse">
                <span className="material-symbols-outlined text-primary-fixed-dim text-sm mr-2" style={{ fontVariationSettings: "'FILL' 1" }}>
                  diamond
                </span>
                <span className="text-primary-fixed font-label-md text-label-md tracking-widest uppercase">
                  Legend Tier
                </span>
              </div>
              <h1 className="font-playfair text-6xl text-white mb-2 leading-tight">
                {user ? settingsName : "Eleanor Vance"}
              </h1>
              <p className="font-body-lg text-white/80 max-w-md italic">
                Curation of bespoke sustainability and timeless craftsmanship since 2018.
              </p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => {
                  alert("Loyalty perk program details sent to: " + (user?.email || "eleanor.vance@atelier.com"));
                }}
                className="bg-secondary text-white px-8 py-3 rounded-lg font-label-md text-label-md hover:bg-primary transition-all duration-300 shadow-xl shadow-secondary/20 cursor-pointer"
              >
                View Loyalty Perks
              </button>
              <button
                onClick={() => {
                  alert("Accessing private Atelier collections. Premium line: +1 (800) ECO-LUXE");
                }}
                className="bg-white/10 backdrop-blur-md text-white border border-white/30 px-8 py-3 rounded-lg font-label-md text-label-md hover:bg-white/20 transition-all cursor-pointer"
              >
                Atelier Access
              </button>
            </div>
          </div>
        </section>

        {/* Right Dashboard Column */}
        <section className={`w-full lg:w-1/2 h-[calc(100vh-76px)] lg:h-[calc(100vh-84px)] overflow-y-auto custom-scrollbar bg-surface px-margin-mobile md:px-margin-desktop py-12 flex flex-col transition-all duration-1000 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}>

          {user ? (
            <>
              {/* Member Dashboard Navigation Tabs */}
              <div className="flex items-center justify-between mb-12">
                <div className="flex space-x-8 border-b border-outline-variant/20 w-full">
                  <button
                    onClick={() => setActiveTab("profile")}
                    className={`pb-4 font-label-md text-label-md tracking-wider transition-colors cursor-pointer border-b-2 ${activeTab === "profile"
                        ? "text-primary border-primary font-bold"
                        : "text-on-surface-variant border-transparent hover:text-primary"
                      }`}
                  >
                    PROFILE
                  </button>
                  <button
                    onClick={() => setActiveTab("orders")}
                    className={`pb-4 font-label-md text-label-md tracking-wider transition-colors cursor-pointer border-b-2 ${activeTab === "orders"
                        ? "text-primary border-primary font-bold"
                        : "text-on-surface-variant border-transparent hover:text-primary"
                      }`}
                  >
                    ORDERS
                  </button>
                  <button
                    onClick={() => setActiveTab("wishlist")}
                    className={`pb-4 font-label-md text-label-md tracking-wider transition-colors cursor-pointer border-b-2 ${activeTab === "wishlist"
                        ? "text-primary border-primary font-bold"
                        : "text-on-surface-variant border-transparent hover:text-primary"
                      }`}
                  >
                    WISHLIST {wishlistItems.length > 0 && `(${wishlistItems.length})`}
                  </button>
                  <button
                    onClick={() => setActiveTab("settings")}
                    className={`pb-4 font-label-md text-label-md tracking-wider transition-colors cursor-pointer border-b-2 ${activeTab === "settings"
                        ? "text-primary border-primary font-bold"
                        : "text-on-surface-variant border-transparent hover:text-primary"
                      }`}
                  >
                    SETTINGS
                  </button>
                </div>
              </div>

              {/* Dynamic Tab Contents */}
              <div className="flex-grow space-y-12">
                {activeTab === "profile" && (
                  <>
                    {/* The Bespoke Vault */}
                    <section className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h2 className="font-headline-sm text-headline-sm text-primary">The Bespoke Vault</h2>
                        <span
                          onClick={() => setActiveTab("orders")}
                          className="text-on-surface-variant font-label-sm text-label-sm cursor-pointer hover:underline"
                        >
                          Manage Collection
                        </span>
                      </div>
                      <div
                        ref={carouselRef}
                        className="flex gap-6 overflow-x-auto pb-4 snap-x no-scrollbar"
                      >
                        {/* Vault Item 1 */}
                        <div className="min-w-[280px] snap-start bg-surface-container-low rounded-xl overflow-hidden group cursor-pointer transition-transform duration-300 hover:-translate-y-1 shadow-sm">
                          <div className="h-48 overflow-hidden bg-surface-container">
                            <img
                              alt="Bespoke Diamond Ring"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              src="https://lh3.googleusercontent.com/aida/AP1WRLtYUW-Vc7nSagdGIsLWiUqUrlzb_s9R39aUUG1zd7Bb07tN6aZiQTkMsGQeM_2Isl3CJb10mA92Jffxof-pjjYIj1HpDJu16YAIXeMgUxU-yr-IR1PG46h5bMPuzrqR-9fn_AwoI1eRuOJeLvqgb1PoXeUPFWnBX4WpuFmzh5ojimVVvzvrxx7bsXSAsH8zLIGlxUSGHnRRCkDIKF3ql9UXdaGhQ-xCOJTrTiRfna3UmChmcbGj2WtRZ9A"
                            />
                          </div>
                          <div className="p-4 copper-accent">
                            <span className="text-label-sm font-label-sm text-primary-container tracking-widest uppercase mb-1 block">
                              RINGS
                            </span>
                            <h3 className="font-headline-sm text-lg text-on-surface mb-2">Solaris Solitaire</h3>
                            <p className="text-on-surface-variant text-sm line-clamp-1 italic">
                              Recycled 18k Rose Gold with Lab-Grown Brilliant
                            </p>
                          </div>
                        </div>

                        {/* Vault Item 2 */}
                        <div className="min-w-[280px] snap-start bg-surface-container-low rounded-xl overflow-hidden group cursor-pointer transition-transform duration-300 hover:-translate-y-1 shadow-sm">
                          <div className="h-48 overflow-hidden bg-surface-container">
                            <img
                              alt="Bespoke Necklace"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              src="https://lh3.googleusercontent.com/aida/AP1WRLt9cwIQbmUJH8fFEJICaVz8ZSavrT0RjEWWzYjnnvkj1otcvm13Qzhhpy1-iSwTW0dPGshlN8zinL5WYaG4HvE7RF4HmGbwG2uaxOeVxa1K5xtodt16_rbbGOysz-ZW0EryBlVmAVWN8Ww4EEep9k3egW-MjZpzJj1WysZ5zgYY62kGlN5XYVu_IYLT4fR4i2YQNuiPXsfKj3ErSs-J2-FtD7PZz166LW-_ABNTpFk68Ak2MwwOoARaFow"
                            />
                          </div>
                          <div className="p-4 copper-accent">
                            <span className="text-label-sm font-label-sm text-primary-container tracking-widest uppercase mb-1 block">
                              NECKLACES
                            </span>
                            <h3 className="font-headline-sm text-lg text-on-surface mb-2">Celestial Cascade</h3>
                            <p className="text-on-surface-variant text-sm line-clamp-1 italic">
                              Ethically Sourced Cushion-Cut Tennis Strand
                            </p>
                          </div>
                        </div>

                        {/* Vault Item 3 */}
                        <div className="min-w-[280px] snap-start bg-surface-container-low rounded-xl overflow-hidden group cursor-pointer transition-transform duration-300 hover:-translate-y-1 shadow-sm">
                          <div className="h-48 overflow-hidden bg-surface-container">
                            <img
                              alt="Bespoke Earrings"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              src="https://lh3.googleusercontent.com/aida/AP1WRLua0dfoByecNwTJZM_E7G88uPduHJg0Hs73LuqE1kbpYYyYMiBnGOI-_H7pnpabZqyYddE91RBzs2XxzezeHZVAzkyspk2Kg6PF-ulSu7BM-IgUGBcTSjfsMncjPiZSolqedzPlHMNXlJN1XTwYE1IkWmBfYRTSNdOkDcENhisLoaRE5RT2fVQ-7JK1hhZ3fyWwveLmRYEwULZfW_wrIybqUWSDZ_OfRI0YS11FC-sqQ0Bki1r-8Yw4E4Q"
                            />
                          </div>
                          <div className="p-4 copper-accent">
                            <span className="text-label-sm font-label-sm text-primary-container tracking-widest uppercase mb-1 block">
                              EARRINGS
                            </span>
                            <h3 className="font-headline-sm text-lg text-on-surface mb-2">Echo Hoops</h3>
                            <p className="text-on-surface-variant text-sm line-clamp-1 italic">
                              Hammered textures on pure recycled platinum
                            </p>
                          </div>
                        </div>
                      </div>
                    </section>

                    {/* Personal Details & Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="bg-surface-container-highest/30 p-8 rounded-2xl border border-outline-variant/10">
                        <h3 className="font-headline-sm text-xl text-primary mb-6">Sustainability Impact</h3>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="text-on-surface-variant font-body-md">Carbon Offset</span>
                            <span className="text-primary font-semibold">1.2 Tons</span>
                          </div>
                          <div className="w-full bg-surface-variant/30 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-primary h-full rounded-full w-[70%]" />
                          </div>
                          <p className="text-xs text-on-surface-variant/70 italic">
                            Your collection supports reforestation projects in the Amazon Basin.
                          </p>
                        </div>
                      </div>
                      <div className="bg-surface-container-highest/30 p-8 rounded-2xl border border-outline-variant/10">
                        <h3 className="font-headline-sm text-xl text-primary mb-6">Curation Stats</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center p-4 bg-white/50 rounded-xl border border-outline-variant/5">
                            <div className="text-2xl font-headline-md text-secondary">12</div>
                            <div className="text-[10px] uppercase tracking-tighter text-on-surface-variant font-semibold mt-1">
                              Active Pieces
                            </div>
                          </div>
                          <div className="text-center p-4 bg-white/50 rounded-xl border border-outline-variant/5">
                            <div className="text-2xl font-headline-md text-secondary">4</div>
                            <div className="text-[10px] uppercase tracking-tighter text-on-surface-variant font-semibold mt-1">
                              Bespoke Projects
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Exclusive Perks Section */}
                    <section className="pt-8">
                      <h2 className="font-headline-sm text-headline-sm text-primary mb-6">
                        Legend Exclusive Perks
                      </h2>
                      <div className="space-y-4">
                        {/* Perk 1 */}
                        <div
                          onClick={() => {
                            alert("Calling Private Concierge line: +1 (888) ATELIER-VIP");
                          }}
                          className="flex items-center p-6 bg-surface-container-low border-l-4 border-primary rounded-r-xl group cursor-pointer transition-all hover:bg-surface-container"
                        >
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mr-6 group-hover:bg-primary/20 transition-colors">
                            <span className="material-symbols-outlined text-primary">concierge</span>
                          </div>
                          <div className="flex-1">
                            <h4 className="font-headline-sm text-lg text-on-surface">Private Concierge</h4>
                            <p className="text-on-surface-variant text-sm">
                              Dedicated assistant for valuation and custom redesigns.
                            </p>
                          </div>
                          <button className="material-symbols-outlined text-on-surface-variant">
                            chevron_right
                          </button>
                        </div>

                        {/* Perk 2 */}
                        <div
                          onClick={() => {
                            alert("A preview catalog of limited heritage drops has been sent to your inbox.");
                          }}
                          className="flex items-center p-6 bg-surface-container-low border-l-4 border-secondary rounded-r-xl group cursor-pointer transition-all hover:bg-surface-container"
                        >
                          <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center mr-6 group-hover:bg-secondary/20 transition-colors">
                            <span className="material-symbols-outlined text-secondary">schedule</span>
                          </div>
                          <div className="flex-1">
                            <h4 className="font-headline-sm text-lg text-on-surface">Early Access</h4>
                            <p className="text-on-surface-variant text-sm">
                              Preview of limited heritage drops 48 hours early.
                            </p>
                          </div>
                          <button className="material-symbols-outlined text-on-surface-variant">
                            chevron_right
                          </button>
                        </div>
                      </div>
                    </section>
                  </>
                )}

                {activeTab === "orders" && (
                  <section className="space-y-6">
                    <h2 className="font-headline-sm text-headline-sm text-primary mb-6">Order Provenance</h2>
                    <div className="space-y-6">
                      {mockOrders.map((order) => (
                        <div key={order.id} className="bg-surface-container-low border border-outline-variant/20 rounded-2xl p-6 flex flex-col md:flex-row gap-6 items-start md:items-center">
                          <div className="w-24 h-24 rounded-xl overflow-hidden bg-surface-container flex-shrink-0 border border-outline-variant/10">
                            <img src={order.image} alt={order.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-grow space-y-2">
                            <div className="flex flex-wrap items-center gap-3">
                              <span className="font-headline-sm text-lg text-on-surface">{order.name}</span>
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${order.statusColor}`}>
                                {order.status}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-y-1 gap-x-4 text-sm text-on-surface-variant">
                              <div>
                                <span className="font-medium text-on-surface">Order ID:</span> {order.id}
                              </div>
                              <div>
                                <span className="font-medium text-on-surface">Date:</span> {order.date}
                              </div>
                              <div>
                                <span className="font-medium text-on-surface">Total:</span> ${order.price.toLocaleString()}
                              </div>
                            </div>
                            {order.tracking && (
                              <p className="text-xs text-on-surface-variant">
                                <span className="font-medium text-on-surface">UPS Tracking:</span>{" "}
                                <span className="font-mono text-secondary hover:underline cursor-pointer" onClick={() => alert("Tracking shipment on UPS site...")}>
                                  {order.tracking}
                                </span>
                              </p>
                            )}
                          </div>
                          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                            <Link
                              href={`/orders/${order.id}`}
                              className="w-full md:w-auto bg-primary hover:opacity-90 text-white text-center px-5 py-2.5 rounded-xl text-sm font-label-md font-semibold transition-all cursor-pointer block"
                            >
                              View Details
                            </Link>
                            <button
                              onClick={() => alert(`Details for order ${order.id} loaded from blockchain registry.`)}
                              className="w-full md:w-auto bg-white hover:bg-surface-container-high text-primary border border-outline-variant/40 px-5 py-2.5 rounded-xl text-sm font-label-md font-semibold transition-all cursor-pointer"
                            >
                              Blockchain Ledger
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {activeTab === "wishlist" && (
                  <section className="space-y-6">
                    <h2 className="font-headline-sm text-headline-sm text-primary mb-6">Your Curated Wishlist</h2>
                    {wishlistItems.length === 0 ? (
                      <div className="text-center py-16 space-y-6">
                        <div className="w-16 h-16 rounded-full bg-secondary-fixed/30 flex items-center justify-center mx-auto">
                          <span className="material-symbols-outlined text-secondary text-3xl">favorite_border</span>
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-headline-sm text-xl text-on-surface">Your Collection is Waiting</h4>
                          <p className="text-on-surface-variant text-sm max-w-sm mx-auto leading-relaxed">
                            Mark your favorite lab-grown diamonds and bespoke gold jewelry as you browse to store them here.
                          </p>
                        </div>
                        <Link
                          href="/collections"
                          className="inline-block bg-primary text-white px-8 py-3.5 rounded-full font-label-md text-label-md hover:bg-secondary transition-all duration-300 shadow-md"
                        >
                          Discover Collections
                        </Link>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {wishlistItems.map((productId) => (
                          <div
                            key={productId}
                            className="bg-surface-container-low rounded-2xl overflow-hidden group border border-outline-variant/10 shadow-sm relative flex flex-col justify-between"
                          >
                            <button
                              onClick={() => dispatch(toggleWishlist(productId))}
                              className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-secondary hover:text-primary transition-all duration-300 cursor-pointer shadow-sm active:scale-90"
                            >
                              <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>
                                favorite
                              </span>
                            </button>
                            <Link href={`/collections/${productId}`} className="flex-grow flex flex-col justify-between">
                              <div>
                                <div className="h-48 overflow-hidden bg-gradient-to-br from-surface-container-lowest via-surface-container-low to-secondary-container/30 text-primary flex flex-col items-center justify-center">
                                  <span className="material-symbols-outlined text-5xl mb-3">
                                    diamond
                                  </span>
                                  <span className="font-label-sm text-label-sm uppercase tracking-widest">
                                    Saved Piece
                                  </span>
                                </div>
                                <div className="p-5 copper-accent space-y-2">
                                  <span className="text-label-sm font-label-sm text-primary-container tracking-widest uppercase block">
                                    Sustainable Luxury
                                  </span>
                                  <h4 className="font-headline-sm text-lg text-on-surface group-hover:text-primary transition-colors leading-tight">
                                    Wishlisted Product
                                  </h4>
                                  <p className="text-on-surface-variant text-xs line-clamp-1 italic">
                                    Product ID: {productId}
                                  </p>
                                </div>
                              </div>
                              <div className="px-5 pb-5 pt-1 flex items-center justify-between border-t border-outline-variant/10 mt-auto">
                                <span className="font-label-md text-label-md text-secondary font-bold">
                                  View details
                                </span>
                                <span className="text-xs font-semibold text-primary group-hover:underline flex items-center gap-1">
                                  View Details
                                  <span className="material-symbols-outlined text-xs group-hover:translate-x-0.5 transition-transform">
                                    east
                                  </span>
                                </span>
                              </div>
                            </Link>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>
                )}

                {activeTab === "settings" && (
                  <section className="space-y-8">
                    <div className="flex items-center justify-between">
                      <h2 className="font-headline-sm text-headline-sm text-primary">Atelier Settings</h2>
                      <span className="text-xs font-semibold px-3 py-1 bg-primary-fixed text-on-primary-fixed-variant rounded-full uppercase tracking-widest">
                        Legend Member
                      </span>
                    </div>

                    <form onSubmit={handleUpdateSettings} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                          <label className="font-label-sm text-label-sm text-on-surface-variant">Full Name</label>
                          <input
                            type="text"
                            required
                            value={settingsName}
                            onChange={(e) => setSettingsName(e.target.value)}
                            className="w-full bg-surface-container-low border border-outline-variant/40 rounded-xl px-4 py-3 text-body-md focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-all"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="font-label-sm text-label-sm text-on-surface-variant">Registered Email</label>
                          <input
                            type="email"
                            required
                            readOnly
                            disabled
                            value={settingsEmail}
                            className="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl px-4 py-3 text-body-md outline-none text-on-surface-variant/60 cursor-not-allowed"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="font-label-sm text-label-sm text-on-surface-variant">Shipping Address</label>
                        <textarea
                          required
                          rows={3}
                          value={settingsAddress}
                          onChange={(e) => setSettingsAddress(e.target.value)}
                          className="w-full bg-surface-container-low border border-outline-variant/40 rounded-xl px-4 py-3 text-body-md focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-all resize-none"
                        />
                      </div>

                      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between pt-4">
                        <button
                          type="submit"
                          className="w-full sm:w-auto bg-primary text-white px-8 py-3.5 rounded-full font-label-md text-label-md hover:bg-secondary hover:shadow-lg transition-all text-center cursor-pointer font-bold"
                        >
                          Save Changes
                        </button>

                        <button
                          type="button"
                          onClick={handleLogout}
                          className="w-full sm:w-auto border border-error text-error hover:bg-error-container/20 px-8 py-3.5 rounded-full font-label-md text-label-md transition-all text-center cursor-pointer font-semibold"
                        >
                          Sign Out of Circle
                        </button>
                      </div>

                      {updateSuccess && (
                        <p className="text-emerald-700 text-sm italic animate-fade-in font-medium">
                          ✓ Profile settings updated successfully.
                        </p>
                      )}
                    </form>
                  </section>
                )}
              </div>

              {/* Footer Links Area */}
              <footer className="pt-12 pb-4 border-t border-outline-variant/20 text-center mt-12">
                <p className="text-on-surface-variant font-label-sm text-label-sm tracking-widest uppercase opacity-60">
                  © 2024 Eco Caret. Handcrafted Sustainability.
                </p>
                <div className="mt-4 flex justify-center space-x-6">
                  <a className="text-on-surface-variant hover:text-primary transition-colors font-label-sm text-label-sm" href="/#provenance">
                    PROVENANCE
                  </a>
                  <a className="text-on-surface-variant hover:text-primary transition-colors font-label-sm text-label-sm" href="/#atelier">
                    CRAFTSMANSHIP
                  </a>
                  <a className="text-on-surface-variant hover:text-primary transition-colors font-label-sm text-label-sm" href="/collections">
                    CARE GUIDE
                  </a>
                </div>
              </footer>
            </>
          ) : (
            /* Logged Out Empty State */
            <div className="my-auto flex flex-col items-center justify-center text-center space-y-6 max-w-md mx-auto py-16">
              <span className="material-symbols-outlined text-secondary text-7xl bg-secondary-container/20 p-6 rounded-full">
                person
              </span>
              <div className="space-y-2">
                <h2 className="font-headline-sm text-2xl text-on-surface">The Conscious Circle</h2>
                <p className="font-body-md text-on-surface-variant text-sm max-w-sm leading-relaxed">
                  Log in to access your certified blockchain ledgers, bespoke orders, and private collections.
                </p>
              </div>
              <button
                onClick={() => dispatch(setProfileOpen(true))}
                className="bg-secondary text-white px-10 py-3.5 rounded-full font-label-md text-label-md hover:bg-primary transition-all duration-300 shadow-xl shadow-secondary/20 cursor-pointer font-bold"
              >
                Sign In to Circle
              </button>
            </div>
          )}
        </section>

      </div>

      {/* Floating Action Button (Mobile Only) */}
      <div className="fixed bottom-6 right-6 lg:hidden z-50">
        <button
          onClick={() => alert("Our Private Concierge is available to help. Direct Line: +1 (800) ECO-LUXE")}
          className="w-14 h-14 bg-primary text-white rounded-full shadow-2xl flex items-center justify-center active:scale-90 transition-transform cursor-pointer"
        >
          <span className="material-symbols-outlined">chat_bubble</span>
        </button>
      </div>

      {/* Side Navigation Badge (Desktop Hover Shortcut) */}
      <div className="fixed left-0 top-1/2 -translate-y-1/2 group hidden lg:block z-[60]">
        <div className="bg-surface-container-low border border-outline-variant/30 py-8 px-2 rounded-r-2xl shadow-xl transition-all duration-300 transform -translate-x-2/3 group-hover:translate-x-0">
          <div className="flex flex-col space-y-6 items-center">
            <span
              onClick={() => user ? setActiveTab("settings") : dispatch(setProfileOpen(true))}
              className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-primary transition-colors"
              title="Profile Settings"
            >
              person
            </span>
            <span
              onClick={() => user ? setActiveTab("orders") : dispatch(setProfileOpen(true))}
              className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-primary transition-colors"
              title="Orders History"
            >
              history
            </span>
            <span
              onClick={() => user ? setActiveTab("profile") : dispatch(setProfileOpen(true))}
              className="material-symbols-outlined text-primary cursor-pointer hover:scale-110 transition-transform"
              style={{ fontVariationSettings: "'FILL' 1" }}
              title="Vault Collection"
            >
              diamond
            </span>
            <span
              onClick={() => {
                user ? setActiveTab("profile") : dispatch(setProfileOpen(true));
                setTimeout(() => {
                  const el = document.getElementById("provenance");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }, 100);
              }}
              className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-primary transition-colors"
              title="Impact"
            >
              eco
            </span>
            <span
              onClick={() => user ? setActiveTab("settings") : dispatch(setProfileOpen(true))}
              className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-primary transition-colors"
              title="Settings"
            >
              settings
            </span>
          </div>
        </div>
      </div>

      {/* Cart & Profile Toggles */}
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
