"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
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



  // Sync settings inputs when user logins
  const [prevUser, setPrevUser] = useState(user);
  if (user !== prevUser) {
    setPrevUser(user);
    if (user) {
      setSettingsName(user.name || "Eleanor Vance");
      setSettingsEmail(user.email);
    }
  }

  // Scroll listener for Header
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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

  const vaultItems = [
    {
      category: "RINGS",
      name: "Solaris Solitaire",
      desc: "Recycled 18k Rose Gold with Lab-Grown Brilliant",
      image: "https://lh3.googleusercontent.com/aida/AP1WRLtYUW-Vc7nSagdGIsLWiUqUrlzb_s9R39aUUG1zd7Bb07tN6aZiQTkMsGQeM_2Isl3CJb10mA92Jffxof-pjjYIj1HpDJu16YAIXeMgUxU-yr-IR1PG46h5bMPuzrqR-9fn_AwoI1eRuOJeLvqgb1PoXeUPFWnBX4WpuFmzh5ojimVVvzvrxx7bsXSAsH8zLIGlxUSGHnRRCkDIKF3ql9UXdaGhQ-xCOJTrTiRfna3UmChmcbGj2WtRZ9A",
      shape: "rounded-t-[80px] rounded-b-2xl",
    },
    {
      category: "NECKLACES",
      name: "Celestial Cascade",
      desc: "Ethically Sourced Cushion-Cut Tennis Strand",
      image: "https://lh3.googleusercontent.com/aida/AP1WRLt9cwIQbmUJH8fFEJICaVz8ZSavrT0RjEWWzYjnnvkj1otcvm13Qzhhpy1-iSwTW0dPGshlN8zinL5WYaG4HvE7RF4HmGbwG2uaxOeVxa1K5xtodt16_rbbGOysz-ZW0EryBlVmAVWN8Ww4EEep9k3egW-MjZpzJj1WysZ5zgYY62kGlN5XYVu_IYLT4fR4i2YQNuiPXsfKj3ErSs-J2-FtD7PZz166LW-_ABNTpFk68Ak2MwwOoARaFow",
      shape: "rounded-[2rem]",
    },
    {
      category: "EARRINGS",
      name: "Echo Hoops",
      desc: "Hammered textures on pure recycled platinum",
      image: "https://lh3.googleusercontent.com/aida/AP1WRLua0dfoByecNwTJZM_E7G88uPduHJg0Hs73LuqE1kbpYYyYMiBnGOI-_H7pnpabZqyYddE91RBzs2XxzezeHZVAzkyspk2Kg6PF-ulSu7BM-IgUGBcTSjfsMncjPiZSolqedzPlHMNXlJN1XTwYE1IkWmBfYRTSNdOkDcENhisLoaRE5RT2fVQ-7JK1hhZ3fyWwveLmRYEwULZfW_wrIybqUWSDZ_OfRI0YS11FC-sqQ0Bki1r-8Yw4E4Q",
      shape: "rounded-t-2xl rounded-b-[80px]",
    },
  ];

  const navTabs: Array<{
    id: "profile" | "orders" | "wishlist" | "settings";
    label: string;
    icon: string;
    count?: number;
  }> = [
    { id: "profile", label: "BESPOKE VAULT", icon: "diamond" },
    { id: "orders", label: "ORDER HISTORY", icon: "history" },
    { id: "wishlist", label: "WISHLIST", icon: "favorite", count: wishlistItems.length },
    { id: "settings", label: "SETTINGS", icon: "settings" },
  ];

  return (
    <div className="bg-background text-on-surface font-body-md min-h-screen flex flex-col relative overflow-x-hidden selection:bg-secondary-fixed selection:text-on-secondary-fixed">
      {/* Local styling overrides */}
      <style dangerouslySetInnerHTML={{
        __html: `
        .editorial-gradient {
          background: linear-gradient(to top, rgba(35, 26, 17, 0.7) 0%, rgba(35, 26, 17, 0.2) 60%, transparent 100%);
        }
        .copper-accent {
          border-top: 2px solid #b87333;
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
      <main className="flex-grow pt-[84px] lg:pt-[96px] pb-16 md:pb-24 bg-background">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop mt-8 md:mt-12">
          {user ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start ripple-fade">
              
              {/* Left Sidebar Panel (4 columns) */}
              <aside className="lg:col-span-4 lg:sticky lg:top-28 space-y-8">
                <div className="bg-surface-container-low border border-outline-variant/30 rounded-[2.5rem] p-6 shadow-sm animate-fade-in">
                  {/* Framed Portrait */}
                  <div className="relative aspect-[3/4] rounded-t-[100px] rounded-b-2xl overflow-hidden border border-outline-variant/20 shadow-inner group mb-6">
                    <img
                      className="w-full h-full object-cover grayscale-[10%] sepia-[5%] transition-transform duration-[1500ms] group-hover:scale-105"
                      alt="Member portrait"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuCWNFUiqj-VsGjdxPtplfC6JRHX77OD1bhX2d9uycXI3hc0oeScgigT5PQt6aQi1E2Au1WKOzPHvkWwagPqIex9DBOw9N-B7UT5KKOoulnOrY5JXtsyHKnHStddkPH9NvPXhUiwRFWYlvmKeFJHEkTnPq6xwxTmcJQ-4Uxaqsp8TVBrN36Mgx4x8Y50Uv-pyiK5ggroL8YO_NdoEcatu_Z9_bXKI3urKIWU426QG2AUtcaUhp40fBpgQDMobwCTOJHo7FvCPt6hHGY"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                    
                    <div className="absolute bottom-4 left-4">
                      <div className="bg-primary-container/30 backdrop-blur-md px-3 py-1 rounded-full border border-primary-fixed/30 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[10px] text-primary-fixed-dim" style={{ fontVariationSettings: "'FILL' 1" }}>
                          diamond
                        </span>
                        <span className="text-[9px] text-primary-fixed font-bold tracking-widest uppercase">
                          Legend Tier
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Profile Name & Email */}
                  <div className="space-y-1 mb-6 text-center lg:text-left">
                    <h2 className="font-playfair text-3xl font-semibold text-on-surface leading-tight">
                      {settingsName}
                    </h2>
                    <p className="text-sm text-on-surface-variant font-medium opacity-80">
                      {settingsEmail}
                    </p>
                  </div>

                  {/* Sidebar Navigation Options */}
                  <nav className="flex overflow-x-auto gap-2 pb-4 border-b border-outline-variant/10 lg:border-none lg:pb-0 lg:flex-col lg:space-y-1.5 no-scrollbar">
                    {navTabs.map((tab) => {
                      const active = activeTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`flex items-center gap-3 px-5 py-3.5 rounded-xl font-label-md text-label-md tracking-wider transition-all cursor-pointer whitespace-nowrap lg:w-full ${
                            active
                              ? "bg-primary text-on-primary font-bold shadow-md"
                              : "text-on-surface-variant hover:bg-surface-container-high hover:text-primary"
                          }`}
                        >
                          <span className="material-symbols-outlined text-lg">{tab.icon}</span>
                          <span>
                            {tab.label} {tab.count !== undefined && tab.count > 0 ? `(${tab.count})` : ""}
                          </span>
                        </button>
                      );
                    })}
                  </nav>

                  {/* Desktop Quick Stats */}
                  <div className="hidden lg:grid grid-cols-2 gap-4 pt-6 border-t border-outline-variant/20 mt-6">
                    <div className="p-4 bg-surface-container rounded-2xl text-center border border-outline-variant/10">
                      <div className="text-xl font-playfair font-semibold text-secondary">12</div>
                      <div className="text-[9px] uppercase tracking-wider text-on-surface-variant font-bold mt-1">
                        Active Pieces
                      </div>
                    </div>
                    <div className="p-4 bg-surface-container rounded-2xl text-center border border-outline-variant/10">
                      <div className="text-xl font-playfair font-semibold text-secondary">1.2T</div>
                      <div className="text-[9px] uppercase tracking-wider text-on-surface-variant font-bold mt-1">
                        CO₂ Offset
                      </div>
                    </div>
                  </div>
                </div>

                {/* Left Sidebar Extra Actions */}
                <div className="hidden lg:flex flex-col gap-3">
                  <button
                    onClick={() => {
                      alert("Loyalty perk program details sent to: " + settingsEmail);
                    }}
                    className="w-full bg-secondary text-white py-3.5 rounded-xl font-label-md text-label-md hover:bg-primary transition-all duration-300 shadow-sm cursor-pointer text-center font-bold tracking-wider"
                  >
                    VIEW LOYALTY PERKS
                  </button>
                  <button
                    onClick={() => {
                      alert("Accessing private Atelier collections. Premium line: +1 (800) ECO-LUXE");
                    }}
                    className="w-full border border-outline text-on-surface-variant py-3.5 rounded-xl font-label-md text-label-md hover:bg-surface-container-low transition-all cursor-pointer text-center font-bold tracking-wider"
                  >
                    PRIVATE CONCIERGE LINE
                  </button>
                </div>
              </aside>

              {/* Right Content Panel (8 columns) */}
              <section className="lg:col-span-8 space-y-12">
                
                {/* PROFILE TAB */}
                {activeTab === "profile" && (
                  <div className="space-y-10 animate-fade-in">
                    {/* Welcome Header */}
                    <div className="space-y-2">
                      <h3 className="font-playfair text-4xl font-semibold text-on-surface">
                        Welcome back, <span className="text-secondary italic font-normal">{settingsName}</span>
                      </h3>
                      <p className="text-sm text-on-surface-variant max-w-xl leading-relaxed">
                        Manage your private collection of bio-ethical masterworks, track order provenance, and configure bespoke commissions.
                      </p>
                    </div>

                    {/* The Bespoke Vault */}
                    <div className="space-y-6">
                      <div className="flex items-center justify-between border-b border-outline-variant/20 pb-4">
                        <h2 className="font-playfair text-2xl font-semibold text-primary">The Bespoke Vault</h2>
                        <button
                          onClick={() => setActiveTab("orders")}
                          className="text-secondary font-label-sm text-label-sm cursor-pointer hover:underline uppercase tracking-wider font-bold"
                        >
                          View Orders
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        {vaultItems.map((item) => (
                          <div key={item.name} className="bg-surface-container-low border border-outline-variant/20 rounded-[2rem] overflow-hidden group cursor-pointer transition-all duration-500 hover:-translate-y-1 shadow-sm hover:shadow-md">
                            <div className="h-48 overflow-hidden bg-surface-container relative">
                              <img
                                alt={item.name}
                                className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ${item.shape}`}
                                src={item.image}
                              />
                            </div>
                            <div className="p-5 copper-accent">
                              <span className="text-[10px] font-label-sm text-secondary tracking-widest uppercase mb-1 block font-bold">
                                {item.category}
                              </span>
                              <h3 className="font-playfair text-lg font-semibold text-on-surface mb-1 group-hover:text-primary transition-colors">{item.name}</h3>
                              <p className="text-on-surface-variant text-[11px] line-clamp-2 italic leading-relaxed">
                                {item.desc}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Sustainability Impact card */}
                    <div className="bg-surface-container-low p-8 rounded-[2rem] border border-outline-variant/30 shadow-sm relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl" />
                      <h3 className="font-playfair text-2xl font-semibold text-primary mb-6">Carbon Offset & Ethical Impact</h3>
                      <div className="space-y-6">
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                          <span className="text-on-surface-variant font-medium text-sm">Carbon Offset Contribution</span>
                          <span className="text-primary font-bold text-lg">1.2 Tons CO₂ offset</span>
                        </div>
                        <div className="w-full bg-surface-variant/30 h-2.5 rounded-full overflow-hidden">
                          <div className="bg-primary h-full rounded-full w-[70%] transition-all duration-1000" />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-on-surface-variant leading-relaxed pt-2">
                          <div className="flex items-start gap-2">
                            <span className="material-symbols-outlined text-secondary text-sm">park</span>
                            <p>Your collection supports reforestation projects in the Amazon Basin, planting 18 native hardwood trees.</p>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="material-symbols-outlined text-secondary text-sm">language</span>
                            <p>100% of gold refining offsets verified under Gold Standard carbon credit registries.</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Exclusive Perks Section */}
                    <div className="space-y-6">
                      <h2 className="font-playfair text-2xl font-semibold text-primary border-b border-outline-variant/20 pb-4">
                        Legend Exclusive Perks
                      </h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {/* Perk 1 */}
                        <div
                          onClick={() => {
                            alert("Calling Private Concierge line: +1 (888) ATELIER-VIP");
                          }}
                          className="flex items-center p-6 bg-surface-container-low border border-outline-variant/20 rounded-[2rem] group cursor-pointer transition-all hover:bg-surface-container hover:shadow-md"
                        >
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mr-6 group-hover:bg-primary/20 transition-colors shrink-0">
                            <span className="material-symbols-outlined text-primary text-xl">concierge</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-playfair text-lg font-semibold text-on-surface mb-1">Private Concierge</h4>
                            <p className="text-on-surface-variant text-xs">
                              Dedicated assistant for valuation and custom designs.
                            </p>
                          </div>
                          <span className="material-symbols-outlined text-on-surface-variant text-md group-hover:translate-x-1 transition-transform ml-2 shrink-0">
                            east
                          </span>
                        </div>

                        {/* Perk 2 */}
                        <div
                          onClick={() => {
                            alert("A preview catalog of limited heritage drops has been sent to your inbox.");
                          }}
                          className="flex items-center p-6 bg-surface-container-low border border-outline-variant/20 rounded-[2rem] group cursor-pointer transition-all hover:bg-surface-container hover:shadow-md"
                        >
                          <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center mr-6 group-hover:bg-secondary/20 transition-colors shrink-0">
                            <span className="material-symbols-outlined text-secondary text-xl">schedule</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-playfair text-lg font-semibold text-on-surface mb-1">Early Access</h4>
                            <p className="text-on-surface-variant text-xs">
                              Preview of limited heritage drops 48 hours early.
                            </p>
                          </div>
                          <span className="material-symbols-outlined text-on-surface-variant text-md group-hover:translate-x-1 transition-transform ml-2 shrink-0">
                            east
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ORDERS TAB */}
                {activeTab === "orders" && (
                  <div className="space-y-8 animate-fade-in">
                    <h2 className="font-playfair text-3xl font-semibold text-primary border-b border-outline-variant/20 pb-4">Order Provenance</h2>
                    <div className="space-y-6">
                      {mockOrders.map((order) => (
                        <div key={order.id} className="bg-surface-container-low border border-outline-variant/20 rounded-[2rem] p-6 flex flex-col md:flex-row gap-6 items-start md:items-center shadow-sm hover:shadow-md transition-shadow">
                          <div className="w-24 h-24 rounded-2xl overflow-hidden bg-surface-container flex-shrink-0 border border-outline-variant/10">
                            <img src={order.image} alt={order.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-grow space-y-2">
                            <div className="flex flex-wrap items-center gap-3">
                              <span className="font-playfair text-xl font-semibold text-on-surface">{order.name}</span>
                              <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${order.statusColor}`}>
                                {order.status}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-y-1 gap-x-4 text-xs text-on-surface-variant">
                              <div>
                                <span className="font-semibold text-on-surface">Order ID:</span> {order.id}
                              </div>
                              <div>
                                <span className="font-semibold text-on-surface">Date:</span> {order.date}
                              </div>
                              <div>
                                <span className="font-semibold text-on-surface">Total:</span> ${order.price.toLocaleString()}
                              </div>
                            </div>
                            {order.tracking && (
                              <p className="text-[11px] text-on-surface-variant">
                                <span className="font-semibold text-on-surface">UPS Tracking:</span>{" "}
                                <span className="font-mono text-secondary hover:underline cursor-pointer" onClick={() => alert("Tracking shipment on UPS site...")}>
                                  {order.tracking}
                                </span>
                              </p>
                            )}
                          </div>
                          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto shrink-0">
                            <Link
                              href={`/orders/${order.id}`}
                              className="w-full md:w-auto bg-primary hover:opacity-95 text-white text-center px-5 py-2.5 rounded-xl text-xs font-label-md font-semibold transition-all cursor-pointer block uppercase tracking-wider"
                            >
                              View Details
                            </Link>
                            <button
                              onClick={() => alert(`Details for order ${order.id} loaded from blockchain registry.`)}
                              className="w-full md:w-auto bg-white hover:bg-surface-container-high text-primary border border-outline-variant/40 px-5 py-2.5 rounded-xl text-xs font-label-md font-semibold transition-all cursor-pointer uppercase tracking-wider"
                            >
                              Ledger
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* WISHLIST TAB */}
                {activeTab === "wishlist" && (
                  <div className="space-y-8 animate-fade-in">
                    <h2 className="font-playfair text-3xl font-semibold text-primary border-b border-outline-variant/20 pb-4">Your Curated Wishlist</h2>
                    {wishlistItems.length === 0 ? (
                      <div className="text-center py-20 space-y-6 bg-surface-container-low rounded-[2rem] border border-outline-variant/10 p-8 shadow-sm">
                        <div className="w-16 h-16 rounded-full bg-secondary-fixed/30 flex items-center justify-center mx-auto">
                          <span className="material-symbols-outlined text-secondary text-3xl">favorite_border</span>
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-playfair text-2xl font-semibold text-on-surface">Your Collection is Empty</h4>
                          <p className="text-on-surface-variant text-sm max-w-sm mx-auto leading-relaxed">
                            Mark your favorite lab-grown diamonds and bespoke gold jewelry as you browse to store them here.
                          </p>
                        </div>
                        <Link
                          href="/collections"
                          className="inline-block bg-primary text-white px-8 py-3.5 rounded-full font-label-md text-label-md hover:bg-secondary transition-all duration-300 shadow-md uppercase tracking-wider font-bold"
                        >
                          Discover Collections
                        </Link>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {wishlistItems.map((productId) => (
                          <div
                            key={productId}
                            className="bg-surface-container-low rounded-[2rem] overflow-hidden group border border-outline-variant/10 shadow-sm relative flex flex-col justify-between"
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
                                <div className="h-48 overflow-hidden bg-gradient-to-br from-surface-container-lowest via-surface-container-low to-secondary-container/20 text-primary flex flex-col items-center justify-center">
                                  <span className="material-symbols-outlined text-5xl mb-2">
                                    diamond
                                  </span>
                                  <span className="font-label-sm text-[10px] uppercase tracking-widest font-bold text-on-surface-variant opacity-70">
                                    Saved Piece
                                  </span>
                                </div>
                                <div className="p-5 copper-accent space-y-1.5">
                                  <span className="text-[10px] font-label-sm text-secondary tracking-widest uppercase block font-bold">
                                    Sustainable Luxury
                                  </span>
                                  <h4 className="font-playfair text-lg font-semibold text-on-surface group-hover:text-primary transition-colors leading-tight">
                                    Wishlisted Product
                                  </h4>
                                  <p className="text-on-surface-variant text-[11px] line-clamp-1 italic">
                                    Product ID: {productId}
                                  </p>
                                </div>
                              </div>
                              <div className="px-5 pb-5 pt-3 flex items-center justify-between border-t border-outline-variant/10 mt-auto bg-surface-container-low">
                                <span className="font-label-md text-label-md text-secondary font-bold uppercase tracking-wider">
                                  View Piece
                                </span>
                                <span className="text-xs font-semibold text-primary group-hover:underline flex items-center gap-1">
                                  Discover
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
                  </div>
                )}

                {/* SETTINGS TAB */}
                {activeTab === "settings" && (
                  <div className="space-y-8 animate-fade-in">
                    <div className="flex items-center justify-between border-b border-outline-variant/20 pb-4">
                      <h2 className="font-playfair text-3xl font-semibold text-primary">Atelier Settings</h2>
                      <span className="text-[10px] font-bold px-3 py-1 bg-primary-fixed text-on-primary-fixed-variant rounded-full uppercase tracking-widest">
                        Legend Member
                      </span>
                    </div>

                    <form onSubmit={handleUpdateSettings} className="bg-surface-container-low border border-outline-variant/20 rounded-[2rem] p-8 space-y-6 shadow-sm">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block">Full Name</label>
                          <input
                            type="text"
                            required
                            value={settingsName}
                            onChange={(e) => setSettingsName(e.target.value)}
                            className="w-full bg-surface-container border border-outline-variant/40 rounded-xl px-4 py-3 text-body-md focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-all"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block opacity-60">Registered Email</label>
                          <input
                            type="email"
                            required
                            readOnly
                            disabled
                            value={settingsEmail}
                            className="w-full bg-surface-container border border-outline-variant/20 rounded-xl px-4 py-3 text-body-md outline-none text-on-surface-variant/60 cursor-not-allowed"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block">Shipping Address</label>
                        <textarea
                          required
                          rows={3}
                          value={settingsAddress}
                          onChange={(e) => setSettingsAddress(e.target.value)}
                          className="w-full bg-surface-container border border-outline-variant/40 rounded-xl px-4 py-3 text-body-md focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-all resize-none"
                        />
                      </div>

                      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between pt-4">
                        <button
                          type="submit"
                          className="w-full sm:w-auto bg-primary text-white px-8 py-3.5 rounded-full font-label-md text-label-md hover:bg-secondary hover:shadow-lg transition-all text-center cursor-pointer font-bold uppercase tracking-wider"
                        >
                          Save Changes
                        </button>

                        <button
                          type="button"
                          onClick={handleLogout}
                          className="w-full sm:w-auto border border-error text-error hover:bg-error-container/20 px-8 py-3.5 rounded-full font-label-md text-label-md transition-all text-center cursor-pointer font-semibold uppercase tracking-wider"
                        >
                          Sign Out of Circle
                        </button>
                      </div>

                      {updateSuccess && (
                        <p className="text-emerald-700 text-sm italic animate-fade-in font-medium pt-2">
                          ✓ Profile settings updated successfully.
                        </p>
                      )}
                    </form>
                  </div>
                )}
              </section>
            </div>
          ) : (
            /* Logged Out Empty State */
            <div className="my-auto flex flex-col items-center justify-center text-center space-y-8 max-w-xl mx-auto py-20 px-8 bg-surface-container-low border border-outline-variant/30 rounded-[3rem] shadow-lg relative overflow-hidden animate-fade-in">
              <div className="absolute -top-24 -left-24 w-48 h-48 bg-primary/5 rounded-full blur-3xl" />
              <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-secondary/5 rounded-full blur-3xl" />
              <span className="material-symbols-outlined text-secondary text-5xl bg-secondary-container/20 p-6 rounded-full ring-8 ring-secondary-container/5 animate-pulse">
                lock
              </span>
              <div className="space-y-3">
                <h2 className="font-playfair text-4xl font-semibold text-on-surface">The Conscious Circle</h2>
                <p className="font-body-md text-on-surface-variant text-sm max-w-md mx-auto leading-relaxed opacity-90">
                  Log in to access your certified blockchain registries, track bespoke commissions, and manage your private collection.
                </p>
              </div>
              <button
                onClick={() => dispatch(setProfileOpen(true))}
                className="bg-secondary text-white px-10 py-4 rounded-full font-label-md text-label-md hover:bg-primary hover:shadow-xl hover:shadow-secondary/20 transition-all duration-300 cursor-pointer font-bold uppercase tracking-wider"
              >
                Sign In to Circle
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <Footer />

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
              onClick={() => {
                if (user) {
                  setActiveTab("settings");
                } else {
                  dispatch(setProfileOpen(true));
                }
              }}
              className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-primary transition-colors"
              title="Profile Settings"
            >
              person
            </span>
            <span
              onClick={() => {
                if (user) {
                  setActiveTab("orders");
                } else {
                  dispatch(setProfileOpen(true));
                }
              }}
              className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-primary transition-colors"
              title="Orders History"
            >
              history
            </span>
            <span
              onClick={() => {
                if (user) {
                  setActiveTab("profile");
                } else {
                  dispatch(setProfileOpen(true));
                }
              }}
              className="material-symbols-outlined text-primary cursor-pointer hover:scale-110 transition-transform"
              style={{ fontVariationSettings: "'FILL' 1" }}
              title="Vault Collection"
            >
              diamond
            </span>
            <span
              onClick={() => {
                if (user) {
                  setActiveTab("profile");
                } else {
                  dispatch(setProfileOpen(true));
                }
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
              onClick={() => {
                if (user) {
                  setActiveTab("settings");
                } else {
                  dispatch(setProfileOpen(true));
                }
              }}
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
