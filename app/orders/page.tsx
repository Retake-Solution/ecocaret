"use client";

import React, { useState, useEffect } from "react";
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
import { getOrders, OrderData } from "@/services/api";

export default function OrderHistory() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const cartOpen = useAppSelector((state) => state.cart.isOpen);
  const profileOpen = useAppSelector((state) => state.profile.isOpen);
  const cartItems = useAppSelector((state) => state.cart.items);
  const user = useAppSelector((state) => state.profile.user);
  const token = useAppSelector((state) => state.profile.token);

  const [scrolled, setScrolled] = useState(false);
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(() => {
    if (typeof window !== "undefined") {
      return !!localStorage.getItem("eco_caret_token");
    }
    return true;
  });
  const [error, setError] = useState("");

  const fetchOrders = async () => {
    try {
      setError("");
      const result = await getOrders();
      setOrders(result.data);
    } catch (err: any) {
      setError(err.message || "Failed to load order history.");
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setLoading(true);
    fetchOrders();
  };

  useEffect(() => {
    if (typeof window !== "undefined" && localStorage.getItem("eco_caret_token")) {
      fetchOrders();
    }
  }, [user]);

  // Scroll listener for Header solid transition
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="bg-background text-on-surface font-body-md min-h-screen flex flex-col relative overflow-x-hidden selection:bg-secondary-container">
      {/* Custom Styles using theme/colors.ts variables */}
      <style dangerouslySetInnerHTML={{ __html: `
        .order-card {
          background-color: ${THEME_COLORS.global["surface-container-low"]};
          border: 1px solid rgba(109, 128, 122, 0.14);
          transition: transform 0.3s ease, box-shadow 0.3s ease, background-color 0.3s ease;
        }
        .order-card:hover {
          background-color: ${THEME_COLORS.global["surface-container"]};
          transform: translateY(-4px);
          box-shadow: 0 20px 40px -20px rgba(60, 153, 132, 0.14);
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

      {/* Main Order History Content */}
      <main className="flex-grow max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-16 pt-28 w-full">
        {/* Page Header */}
        <div className="mb-12 md:mb-20 text-center md:text-left">
          <h1 className="font-headline-lg text-headline-lg mb-4" style={{ color: THEME_COLORS.global.primary }}>
            Order History
          </h1>
          <p className="text-on-surface-variant font-body-lg max-w-2xl">
            Reflect on your journey of sustainable luxury. Each piece marks a milestone in conscious craftsmanship.
          </p>
        </div>

        {/* Orders List */}
        <div className="space-y-8">
          {loading ? (
            /* Loading State */
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <div className="w-12 h-12 rounded-full border-4 border-outline-variant/30 border-t-primary animate-spin" style={{ borderTopColor: THEME_COLORS.global.primary }} />
              <p className="text-on-surface-variant text-sm font-label-md tracking-wider uppercase animate-pulse">
                Decrypting Sourcing History...
              </p>
            </div>
          ) : error ? (
            /* Error State */
            <div className="p-6 rounded-2xl bg-error-container/40 border border-error/20 text-center max-w-md mx-auto space-y-4">
              <span className="material-symbols-outlined text-error text-4xl">error</span>
              <p className="text-on-error-container font-medium">{error}</p>
              <button
                onClick={handleRetry}
                className="bg-primary text-white px-6 py-2.5 rounded-full text-xs font-bold uppercase hover:bg-secondary transition-all cursor-pointer"
              >
                Retry
              </button>
            </div>
          ) : !token && (typeof window === "undefined" || !localStorage.getItem("eco_caret_token")) ? (
            /* Logged Out / Not Authenticated Prompt */
            <div className="text-center py-20 space-y-6 bg-surface-container-low rounded-[2rem] border border-outline-variant/10 p-8 shadow-sm">
              <div className="w-16 h-16 rounded-full bg-secondary-fixed/30 flex items-center justify-center mx-auto">
                <span className="material-symbols-outlined text-secondary text-3xl">lock</span>
              </div>
              <div className="space-y-2">
                <h4 className="font-playfair text-2xl font-semibold text-on-surface">Sign In to View History</h4>
                <p className="text-on-surface-variant text-sm max-w-sm mx-auto leading-relaxed">
                  Please log in to your Eco Caret account to view your past orders and provenance tracking records.
                </p>
              </div>
              <button
                onClick={() => dispatch(setProfileOpen(true))}
                className="bg-primary text-white px-8 py-3.5 rounded-full font-label-md text-label-md hover:bg-secondary transition-all duration-300 shadow-md uppercase tracking-wider font-bold cursor-pointer"
              >
                Sign In / Register
              </button>
            </div>
          ) : orders.length === 0 ? (
            /* Empty State */
            <div className="text-center py-20 space-y-6 bg-surface-container-low rounded-[2rem] border border-outline-variant/10 p-8 shadow-sm">
              <div className="w-16 h-16 rounded-full bg-secondary-fixed/30 flex items-center justify-center mx-auto">
                <span className="material-symbols-outlined text-secondary text-3xl">receipt_long</span>
              </div>
              <div className="space-y-2">
                <h4 className="font-playfair text-2xl font-semibold text-on-surface">No Sourcing Records Yet</h4>
                <p className="text-on-surface-variant text-sm max-w-sm mx-auto leading-relaxed">
                  You haven't placed any orders yet. Discover our masterfully crafted sustainable jewelry collections to start your journey.
                </p>
              </div>
              <Link
                href="/collections"
                className="inline-block bg-primary text-white px-8 py-3.5 rounded-full font-label-md text-label-md hover:bg-secondary transition-all duration-300 shadow-md uppercase tracking-wider font-bold"
              >
                Explore Collections
              </Link>
            </div>
          ) : (
            /* Live Orders Map */
            <div className="space-y-8 animate-fade-in">
              {orders.map((order) => {
                const firstItem = order.items[0];
                const imageSrc = firstItem?.productSnapshot?.imageUrl || "https://lh3.googleusercontent.com/aida/AP1WRLurFJQ4iSPdztJ-UpOPfXfi-3UabSzn06tAERclG0j87fz_l9RO3Rd-sBpcuukbwu9XETXjdCAlINMskwEsll7ag5Y9dnuAT0W8yk1inPVRk1Kuj1xlvlm5COlBklKeavfM6oEb1lv7lp_Povi8AY0mqsExyG8uOSsL3B_0YR1mDPDdm_GhdrIW9Fv1v_ZRoqQucwdU5ai6YIF9Bg4Gz5sFLq1GQ1eJaghEnt7209yfkNEM-9NuPMharDM";
                const totalAmount = order.totals.totalMinor / 100;
                
                const normStatus = order.fulfillmentStatus.toLowerCase();
                const isDelivered = normStatus === "fulfilled" || normStatus === "delivered";
                const isShipped = normStatus === "shipped";
                const isCancelled = normStatus === "cancelled" || normStatus === "refunded";
                
                let statusLabel = "Processing";
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
                }

                return (
                  <div key={order.id} className="order-card rounded-xl p-6 md:p-8 flex flex-col md:flex-row gap-8 items-center">
                    <div className="w-full md:w-48 aspect-[3/4] overflow-hidden rounded-lg bg-surface-container-high flex-shrink-0 border border-outline-variant/10">
                      <img
                        alt={firstItem?.productSnapshot?.name || "Order item"}
                        className="w-full h-full object-cover"
                        src={imageSrc}
                      />
                    </div>
                    <div className="flex-grow w-full grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                      <div className="space-y-1">
                        <span className="font-label-md text-label-md uppercase tracking-widest" style={{ color: THEME_COLORS.global.secondary }}>
                          Order Number
                        </span>
                        <p className="font-headline-sm text-headline-sm text-on-surface truncate">#{order.orderNumber}</p>
                        <p className="text-on-surface-variant text-sm">
                          Placed on {new Date(order.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <span className="font-label-md text-label-md uppercase tracking-widest" style={{ color: THEME_COLORS.global.secondary }}>
                          Status & Total
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: statusColor }} />
                          <p className="font-body-lg text-on-surface font-semibold">{statusLabel}</p>
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
              })}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <Footer />

      {/* Drawer & Modal triggers */}
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
