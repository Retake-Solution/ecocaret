"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import CartDrawer from "@/components/CartDrawer";
import CurrencySelectionModal from "@/components/CurrencySelectionModal";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import ProfileDialog from "@/components/ProfileDialog";
import { removeFromCart, setCartOpen } from "@/lib/features/cart/cartSlice";
import { selectCurrency } from "@/lib/features/currency/currencySlice";
import { setProfileOpen } from "@/lib/features/profile/profileSlice";
import { useAppDispatch, useAppSelector } from "@/lib/store";
import type { CurrencyCode } from "@/types";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const cartOpen = useAppSelector((state) => state.cart.isOpen);
  const profileOpen = useAppSelector((state) => state.profile.isOpen);
  const cartItems = useAppSelector((state) => state.cart.items);
  const currencies = useAppSelector((state) => state.currency.currencies);
  const selectedCurrencyCode = useAppSelector((state) => state.currency.selectedCode);
  const [scrolled, setScrolled] = useState(false);
  const [currencyModalOpen, setCurrencyModalOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const cartItemsCount = cartItems.reduce((acc, curr) => acc + curr.quantity, 0);

  const handleCurrencySelect = (code: CurrencyCode) => {
    dispatch(selectCurrency(code));
    setCurrencyModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-background text-on-background selection:bg-secondary-container selection:text-on-secondary-container flex flex-col overflow-x-hidden">
      <Header
        scrolled={scrolled}
        setCartOpen={() => dispatch(setCartOpen(!cartOpen))}
        setProfileOpen={(open) => dispatch(setProfileOpen(open))}
        cartItemsCount={cartItemsCount}
        onCurrencySelectOpen={() => setCurrencyModalOpen(true)}
      />

      <main className="flex-1 min-h-[calc(100vh-5rem)]">{children}</main>

      <Footer />

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

      <CurrencySelectionModal
        currencies={currencies}
        isOpen={currencyModalOpen}
        onClose={() => setCurrencyModalOpen(false)}
        onSelect={handleCurrencySelect}
        selectedCode={selectedCurrencyCode}
        showCurrentSelection
      />
    </div>
  );
}
