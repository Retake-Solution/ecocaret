"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import ProfileDialog from "@/components/ProfileDialog";
import { useAppDispatch, useAppSelector } from "@/lib/store";
import { setCartOpen, removeFromCart } from "@/lib/features/cart/cartSlice";
import { setProfileOpen } from "@/lib/features/profile/profileSlice";
import { THEME_COLORS } from "@/theme/colors";
import { getOrders } from "@/services/api";
import { OrderData, GetOrdersParams } from "@/types";

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

  // Search & Pagination States
  const [search, setSearch] = useState("");
  const [fulfillmentFilter, setFulfillmentFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [pagination, setPagination] = useState({
    totalItems: 0,
    totalPages: 1,
    page: 1,
    limit: 10,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  const fetchOrders = async (paramsObj?: GetOrdersParams) => {
    try {
      setError("");
      const params: GetOrdersParams = {
        page: paramsObj?.page ?? page,
        limit: paramsObj?.limit ?? limit,
      };

      const searchVal = paramsObj?.search !== undefined ? paramsObj.search : search;
      if (searchVal) {
        params.search = searchVal;
      }

      const selectedStatus = paramsObj?.fulfillmentStatus !== undefined ? paramsObj.fulfillmentStatus : fulfillmentFilter;
      if (selectedStatus && selectedStatus !== "All") {
        params.fulfillmentStatus = selectedStatus.toLowerCase();
      }

      const result = await getOrders(params);
      setOrders(result.data);
      if (result.pagination) {
        setPagination({
          totalItems: result.pagination.totalItems,
          totalPages: result.pagination.totalPages,
          page: result.pagination.page,
          limit: result.pagination.limit,
          hasNextPage: result.pagination.hasNextPage || false,
          hasPreviousPage: result.pagination.hasPreviousPage || false,
        });
      }
    } catch (err: any) {
      setError(err.message || "Failed to load order history.");
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setLoading(true);
    fetchOrders({ page, search, fulfillmentStatus: fulfillmentFilter });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setLoading(true);
    fetchOrders({ page: 1, search, fulfillmentStatus: fulfillmentFilter });
  };

  useEffect(() => {
    if (typeof window !== "undefined" && localStorage.getItem("eco_caret_token")) {
      fetchOrders({ page, search, fulfillmentStatus: fulfillmentFilter });
    } else {
      setLoading(false);
    }
  }, [user, page, fulfillmentFilter]);

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
        <div className="mb-12 md:mb-16 text-center md:text-left flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="font-headline-lg text-headline-lg mb-4" style={{ color: THEME_COLORS.global.primary }}>
              Order History
            </h1>
            <p className="text-on-surface-variant font-body-lg max-w-2xl">
              Reflect on your journey of sustainable luxury. Each piece marks a milestone in conscious craftsmanship.
            </p>
          </div>
        </div>

        {token || (typeof window !== "undefined" && localStorage.getItem("eco_caret_token")) ? (
          <>
            {/* Search & Filters Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
              <form onSubmit={handleSearchSubmit} className="w-full md:max-w-md flex gap-2">
                <div className="relative flex-grow">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/60">search</span>
                  <input
                    type="text"
                    placeholder="Search by order number..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    maxLength={100}
                    className="w-full pl-12 pr-4 py-3 bg-surface-container rounded-full border border-outline-variant/10 text-sm text-on-surface focus:outline-none focus:border-primary transition-all"
                  />
                </div>
                <button
                  type="submit"
                  className="px-6 py-3 bg-primary text-white text-xs font-bold uppercase tracking-wider rounded-full hover:bg-secondary transition-all cursor-pointer"
                >
                  Search
                </button>
              </form>

              {/* Quick status filter tabs */}
              <div className="flex flex-wrap gap-2">
                {["All", "Pending", "Shipped", "Delivered", "Cancelled"].map((status) => {
                  const isActive = fulfillmentFilter === status;
                  return (
                    <button
                      key={status}
                      onClick={() => {
                        setFulfillmentFilter(status);
                        setPage(1);
                        setLoading(true);
                      }}
                      className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                        isActive
                          ? "bg-primary text-white shadow-sm"
                          : "bg-surface-container-low hover:bg-surface-container border border-outline-variant/10 text-on-surface-variant"
                      }`}
                    >
                      {status}
                    </button>
                  );
                })}
              </div>
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
              ) : orders.length === 0 ? (
                /* Empty State */
                <div className="text-center py-20 space-y-6 bg-surface-container-low rounded-[2rem] border border-outline-variant/10 p-8 shadow-sm">
                  <div className="w-16 h-16 rounded-full bg-secondary-fixed/30 flex items-center justify-center mx-auto">
                    <span className="material-symbols-outlined text-secondary text-3xl">receipt_long</span>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-playfair text-2xl font-semibold text-on-surface">No Sourcing Records Yet</h4>
                    <p className="text-on-surface-variant text-sm max-w-sm mx-auto leading-relaxed">
                      You haven't placed any orders yet matching these criteria. Explore our masterfully crafted sustainable jewelry collections to start your journey.
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
                <div className="space-y-6 animate-fade-in">
                  {orders.map((order) => {
                    const firstItem = order.items[0];
                    const imageSrc = firstItem?.productSnapshot?.imageUrl;
                    const totalAmount = order.totals.totalMinor / 100;
                    
                    const { label: fulfillLabel, color: fulfillColor, bgColor: fulfillBg } = getFulfillmentBadgeDetails(order.fulfillmentStatus);
                    const { label: payLabel, color: payColor, bgColor: payBg } = getPaymentBadgeDetails(order.paymentStatus);
                    
                    // Sum items count
                    const itemsCount = order.items.reduce((sum, item) => sum + item.quantity.ordered, 0);

                    return (
                      <div key={order.id} className="order-card rounded-xl p-6 md:p-8 flex flex-col md:flex-row gap-8 items-center">
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
                  })}
                </div>
              )}
            </div>

            {/* Pagination Controls */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-12">
                <button
                  disabled={!pagination.hasPreviousPage}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-surface-container-low hover:bg-surface-container border border-outline-variant/10 disabled:opacity-40 transition-all cursor-pointer text-on-surface"
                >
                  <span className="material-symbols-outlined text-sm">chevron_left</span>
                </button>
                <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <button
                  disabled={!pagination.hasNextPage}
                  onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-surface-container-low hover:bg-surface-container border border-outline-variant/10 disabled:opacity-40 transition-all cursor-pointer text-on-surface"
                >
                  <span className="material-symbols-outlined text-sm">chevron_right</span>
                </button>
              </div>
            )}
          </>
        ) : (
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
        )}
      </main>

      {/* Footer */}
      <Footer />

      {/* CartDrawer & ProfileDialog triggers */}
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
