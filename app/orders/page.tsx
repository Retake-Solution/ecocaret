"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import ProfileDialog from "@/components/ProfileDialog";
import { useAppDispatch, useAppSelector } from "@/lib/store";
import { setCartOpen, removeFromCart, clearCart } from "@/lib/features/cart/cartSlice";
import { setProfileOpen } from "@/lib/features/profile/profileSlice";
import { THEME_COLORS } from "@/theme/colors";

export default function OrderHistory() {
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

  const handleViewDetails = (orderId: string) => {
    alert(`Order details for ${orderId} verified on eco-blockchain ledger.`);
  };

  return (
    <div className="bg-background text-on-surface font-body-md min-h-screen flex flex-col relative overflow-x-hidden selection:bg-secondary-container">
      {/* Custom Styles using theme/colors.ts variables */}
      <style dangerouslySetInnerHTML={{ __html: `
        .order-card {
          background-color: ${THEME_COLORS.global["surface-container-low"]};
          border: 1px solid rgba(133, 116, 103, 0.1);
          transition: transform 0.3s ease, box-shadow 0.3s ease, background-color 0.3s ease;
        }
        .order-card:hover {
          background-color: ${THEME_COLORS.global["surface-container"]};
          transform: translateY(-4px);
          box-shadow: 0 20px 40px -20px rgba(137, 77, 13, 0.1);
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
          {/* Order Item 1 */}
          <div className="order-card rounded-xl p-6 md:p-8 flex flex-col md:flex-row gap-8 items-center">
            <div className="w-full md:w-48 aspect-[3/4] overflow-hidden rounded-lg bg-surface-container-high flex-shrink-0 border border-outline-variant/10">
              <img
                alt="Celestia Solitaire Diamond Ring"
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida/AP1WRLurFJQ4iSPdztJ-UpOPfXfi-3UabSzn06tAERclG0j87fz_l9RO3Rd-sBpcuukbwu9XETXjdCAlINMskwEsll7ag5Y9dnuAT0W8yk1inPVRk1Kuj1xlvlm5COlBklKeavfM6oEb1lv7lp_Povi8AY0mqsExyG8uOSsL3B_0YR1mDPDdm_GhdrIW9Fv1v_ZRoqQucwdU5ai6YIF9Bg4Gz5sFLq1GQ1eJaghEnt7209yfkNEM-9NuPMharDM"
              />
            </div>
            <div className="flex-grow w-full grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              <div className="space-y-1">
                <span className="font-label-md text-label-md uppercase tracking-widest" style={{ color: THEME_COLORS.global.secondary }}>
                  Order Number
                </span>
                <p className="font-headline-sm text-headline-sm text-on-surface">#AUR-882910</p>
                <p className="text-on-surface-variant text-sm">Placed on October 24, 2023</p>
              </div>
              <div className="space-y-1">
                <span className="font-label-md text-label-md uppercase tracking-widest" style={{ color: THEME_COLORS.global.secondary }}>
                  Status
                </span>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: THEME_COLORS.global.primary }} />
                  <p className="font-body-lg text-on-surface font-semibold">Delivered</p>
                </div>
                <p className="text-on-surface-variant text-sm">Signed by J. Sterling</p>
              </div>
              <div className="flex md:justify-end w-full md:w-auto">
                <Link
                  href="/orders/AUR-882910"
                  className="px-8 py-3 text-on-primary rounded-full font-label-md text-label-md hover:opacity-90 transition-all active:scale-95 text-center w-full md:w-auto cursor-pointer block"
                  style={{ backgroundColor: THEME_COLORS.global.primary }}
                >
                  View Details
                </Link>
              </div>
            </div>
          </div>

          {/* Order Item 2 */}
          <div className="order-card rounded-xl p-6 md:p-8 flex flex-col md:flex-row gap-8 items-center">
            <div className="w-full md:w-48 aspect-[3/4] overflow-hidden rounded-lg bg-surface-container-high flex-shrink-0 border border-outline-variant/10">
              <img
                alt="Sophisticated Diamond Tennis Bracelet"
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida/AP1WRLtNLNOmKIh9k73DJcyIy9iUcOU-b62nNBxxcDn8bd-XG_QjyPZ0LirSv9rfqFPvPwGoD6SP0zr3qoYQLDqWtBo0pndXoWV_Sn5TeqlXilBTjT_JbuvFfwKLuegTeBqEVPZqxwfsqd2Jp9JtSpbfDZmw19WjjrPc8YewJSz8bs7jw3aazoXh9H1hY0mS7FZ8Nv8BGejMkb4vRmUkb3MwD-7fIbzoN_JMu4bszZi6_AuZjsf4mDXmbRHGizs"
              />
            </div>
            <div className="flex-grow w-full grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              <div className="space-y-1">
                <span className="font-label-md text-label-md uppercase tracking-widest" style={{ color: THEME_COLORS.global.secondary }}>
                  Order Number
                </span>
                <p className="font-headline-sm text-headline-sm text-on-surface">#AUR-881045</p>
                <p className="text-on-surface-variant text-sm">Placed on August 12, 2023</p>
              </div>
              <div className="space-y-1">
                <span className="font-label-md text-label-md uppercase tracking-widest" style={{ color: THEME_COLORS.global.secondary }}>
                  Status
                </span>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: THEME_COLORS.global.tertiary }} />
                  <p className="font-body-lg text-on-surface font-semibold">Shipped</p>
                </div>
                <p className="text-on-surface-variant text-sm">Estimated Arrival: Aug 15</p>
              </div>
              <div className="flex md:justify-end w-full md:w-auto">
                <Link
                  href="/orders/AUR-881045"
                  className="px-8 py-3 text-on-primary rounded-full font-label-md text-label-md hover:opacity-90 transition-all active:scale-95 text-center w-full md:w-auto cursor-pointer block"
                  style={{ backgroundColor: THEME_COLORS.global.primary }}
                >
                  View Details
                </Link>
              </div>
            </div>
          </div>

          {/* Empty State / Past Orders Placeholder */}
          <div className="border-t border-outline-variant pt-16 mt-16 text-center">
            <h3 className="font-headline-sm text-headline-sm text-on-surface-variant mb-4 italic">
              The archive of your elegance ends here.
            </h3>
            <p className="text-on-surface-variant mb-8 max-w-md mx-auto text-sm leading-relaxed">
              Discover new treasures crafted with the same dedication to ethics and beauty that defines your collection.
            </p>
            <Link
              href="/collections"
              className="inline-flex items-center gap-2 font-label-md text-label-md hover:underline decoration-secondary-container underline-offset-4 font-bold"
              style={{ color: THEME_COLORS.global.primary }}
            >
              Explore New Collections
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </div>
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
          alert("Checkout processed safely. Thank you for selecting ethical luxury!");
          dispatch(clearCart());
          dispatch(setCartOpen(false));
        }}
      />
      <ProfileDialog isOpen={profileOpen} onClose={() => dispatch(setProfileOpen(false))} />
    </div>
  );
}
