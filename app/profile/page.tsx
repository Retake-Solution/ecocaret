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

const formatProfileLabel = (value?: string) =>
  value
    ? value
      .replace(/[_-]/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase())
    : "";

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
  const [settingsName, setSettingsName] = useState("");
  const [settingsAddress, setSettingsAddress] = useState("");
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const roleLabel = formatProfileLabel(user?.role) || "Member";
  const profileName = user?.name || user?.email.split("@")[0] || "Eco Caret Member";
  const displayName = settingsName || profileName;
  const profileEmail = user?.email || "";

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
    alert("Successfully signed out.");
    window.location.href = "/";
  };

  const navTabs: Array<{
    id: "profile" | "orders" | "wishlist" | "settings";
    label: string;
    icon: string;
    count?: number;
  }> = [
    { id: "profile", label: "PROFILE", icon: "person" },
    { id: "orders", label: "ORDER HISTORY", icon: "history" },
    { id: "wishlist", label: "WISHLIST", icon: "favorite", count: wishlistItems.length },
  ];

  return (
    <div className="bg-background text-on-surface font-body-md min-h-screen flex flex-col relative overflow-x-hidden selection:bg-secondary-fixed selection:text-on-secondary-fixed">
      {/* Local styling overrides */}
      <style dangerouslySetInnerHTML={{
        __html: `
        .editorial-gradient {
          background: linear-gradient(to top, rgba(16, 32, 28, 0.7) 0%, rgba(16, 32, 28, 0.2) 60%, transparent 100%);
        }
        .copper-accent {
          border-top: 2px solid #3C9984;
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
                          {roleLabel}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Profile Name & Email */}
                  <div className="space-y-1 mb-6 text-center lg:text-left">
                    <h2 className="font-playfair text-3xl font-semibold text-on-surface leading-tight">
                      {displayName}
                    </h2>
                    <p className="text-sm text-on-surface-variant font-medium opacity-80">
                      {profileEmail}
                    </p>
                    {user?.role && (
                      <span className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-primary">
                        {roleLabel}
                      </span>
                    )}
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
              </aside>

              {/* Right Content Panel (8 columns) */}
              <section className="lg:col-span-8 space-y-12">
                
                {/* ORDERS TAB */}
                {activeTab === "orders" && (
                  <div className="space-y-8 animate-fade-in">
                    <h2 className="font-playfair text-3xl font-semibold text-primary border-b border-outline-variant/20 pb-4">Order Provenance</h2>
                    <div className="rounded-[2rem] border border-outline-variant/20 bg-surface-container-low p-10 text-center shadow-sm">
                      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-secondary/10">
                        <span className="material-symbols-outlined text-3xl text-secondary">
                          receipt_long
                        </span>
                      </div>
                      <h3 className="font-playfair text-2xl font-semibold text-on-surface">
                        No orders yet
                      </h3>
                      <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-on-surface-variant">
                        Your order history will appear here once purchases are connected to your account.
                      </p>
                      <Link
                        href="/collections"
                        className="mt-6 inline-block rounded-full bg-primary px-8 py-3.5 font-label-md text-label-md font-bold uppercase tracking-wider text-white shadow-md transition-all duration-300 hover:bg-secondary"
                      >
                        Start Shopping
                      </Link>
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

                {/* PROFILE / SETTINGS TAB */}
                {(activeTab === "profile" || activeTab === "settings") && (
                  <div className="space-y-8 animate-fade-in">
                    <div className="flex items-center justify-between border-b border-outline-variant/20 pb-4">
                      <h2 className="font-playfair text-3xl font-semibold text-primary">
                        {activeTab === "profile" ? "Profile" : "Settings"}
                      </h2>
                      <span className="text-[10px] font-bold px-3 py-1 bg-primary-fixed text-on-primary-fixed-variant rounded-full uppercase tracking-widest">
                        {roleLabel}
                      </span>
                    </div>

                    <form onSubmit={handleUpdateSettings} className="bg-surface-container-low border border-outline-variant/20 rounded-[2rem] p-8 space-y-6 shadow-sm">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block">Full Name</label>
                          <input
                            type="text"
                            required
                            value={displayName}
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
                            value={profileEmail}
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
                          placeholder="Add your shipping address"
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
                          Sign Out
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
                <h2 className="font-playfair text-4xl font-semibold text-on-surface">EcoCaret</h2>
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
                  setActiveTab("profile");
                } else {
                  dispatch(setProfileOpen(true));
                }
              }}
              className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-primary transition-colors"
              title="Profile"
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
