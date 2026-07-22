"use client";

import React, { useCallback, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import ProfileDialog from "@/components/ProfileDialog";
import OrderCard from "@/components/OrderCard";
import Button from "@/components/Button";
import PaginationControls from "@/components/PaginationControls";
import { useAppDispatch, useAppSelector } from "@/lib/store";
import { setCartOpen, removeFromCart } from "@/lib/features/cart/cartSlice";
import { setProfileOpen } from "@/lib/features/profile/profileSlice";
import { THEME_COLORS } from "@/theme/colors";
import { getOrders } from "@/services/api";
import { OrderData, GetOrdersParams } from "@/types";

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

  const fetchOrders = useCallback(async (paramsObj?: GetOrdersParams) => {
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
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load order history.");
    } finally {
      setLoading(false);
    }
  }, [fulfillmentFilter, limit, page, search]);

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
      const timer = window.setTimeout(() => {
        void fetchOrders({ page, search, fulfillmentStatus: fulfillmentFilter });
      }, 0);
      return () => window.clearTimeout(timer);
    } else {
      const timer = window.setTimeout(() => setLoading(false), 0);
      return () => window.clearTimeout(timer);
    }
  }, [fetchOrders, user, page, search, fulfillmentFilter]);

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
                <Button
                  unstyled
                  type="submit"
                  className="px-6 py-3 bg-primary text-white text-xs font-bold uppercase tracking-wider rounded-full hover:bg-secondary transition-all cursor-pointer"
                >
                  Search
                </Button>
              </form>

              {/* Quick status filter tabs */}
              <div className="flex flex-wrap gap-2">
                {["All", "Pending", "Shipped", "Delivered", "Cancelled"].map((status) => {
                  const isActive = fulfillmentFilter === status;
                  return (
                    <Button
                      unstyled
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
                    </Button>
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
                  <Button
                    unstyled
                    onClick={handleRetry}
                    className="bg-primary text-white px-6 py-2.5 rounded-full text-xs font-bold uppercase hover:bg-secondary transition-all cursor-pointer"
                  >
                    Retry
                  </Button>
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
                      You haven&apos;t placed any orders yet matching these criteria. Explore our masterfully crafted sustainable jewelry collections to start your journey.
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
                  {orders.map((order) => (
                    <OrderCard key={order.id} order={order} />
                  ))}
                </div>
              )}
            </div>

            <PaginationControls
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              hasPreviousPage={pagination.hasPreviousPage}
              hasNextPage={pagination.hasNextPage}
              onPrevious={() => setPage((p) => Math.max(1, p - 1))}
              onNext={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
            />
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
            <Button
              unstyled
              onClick={() => dispatch(setProfileOpen(true))}
              className="bg-primary text-white px-8 py-3.5 rounded-full font-label-md text-label-md hover:bg-secondary transition-all duration-300 shadow-md uppercase tracking-wider font-bold cursor-pointer"
            >
              Sign In / Register
            </Button>
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
