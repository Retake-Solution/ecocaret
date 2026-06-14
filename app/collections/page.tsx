"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import CartDrawer from "@/components/CartDrawer";
import ProfileDialog from "@/components/ProfileDialog";
import { useAppDispatch, useAppSelector } from "@/lib/store";
import { setCartOpen, removeFromCart, clearCart } from "@/lib/features/cart/cartSlice";
import { setProfileOpen } from "@/lib/features/profile/profileSlice";
import { toggleWishlist } from "@/lib/features/wishlist/wishlistSlice";
import { fetchProducts } from "@/services/api";
import { ApiProduct } from "@/types";

export default function Collections() {
  const dispatch = useAppDispatch();
  const cartOpen = useAppSelector((state) => state.cart.isOpen);
  const profileOpen = useAppSelector((state) => state.profile.isOpen);
  const cartItems = useAppSelector((state) => state.cart.items);
  const wishlistItems = useAppSelector((state) => state.wishlist.items);

  const [navScrolled, setNavScrolled] = useState(false);

  const isInWishlist = (id: string) => wishlistItems.includes(id);

  // Navigation glassmorphism on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setNavScrolled(true);
      } else {
        setNavScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const [products, setProducts] = useState<ApiProduct[]>([]);

  useEffect(() => {
    const loadProducts = async () => {
      const fetchedProducts = await fetchProducts();
      if (fetchedProducts.length > 0) {
        setProducts(fetchedProducts);
      }
    };
    loadProducts();
  }, []);

  const sortedProducts = products;

  return (
    <div className="collections-theme min-h-screen flex flex-col relative overflow-x-hidden selection:bg-secondary-container selection:text-on-secondary-container">
      {/* TopNavBar */}
      <Header
        scrolled={navScrolled}
        setCartOpen={(open) => dispatch(setCartOpen(open))}
        setProfileOpen={(open) => dispatch(setProfileOpen(open))}
        cartItemsCount={cartItems.reduce((acc, curr) => acc + curr.quantity, 0)}
      />

      {/* Main Layout Area */}
      <main className="flex-grow flex flex-col min-h-screen pt-32 pb-24 px-margin-mobile md:px-margin-desktop gap-margin-desktop relative">
        {/* Main Content Area */}
        <section className="flex-grow">
          <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div>
              <h1 className="font-display-lg text-headline-lg text-on-surface leading-tight">
                Curated Collections
              </h1>
              <p className="text-on-surface-variant font-body-md mt-2 max-w-xl">
                Masterpieces forged in sustainability. Every diamond tells a story
                of ethical luxury and precision craftsmanship.
              </p>
            </div>
          </header>

          {sortedProducts.length === 0 ? (
            <div className="h-[400px] flex flex-col items-center justify-center text-center space-y-4">
              <span className="material-symbols-outlined text-outline-variant text-6xl">
                diamond
              </span>
              <p className="font-headline-sm text-headline-sm text-on-surface">
                No Masterpieces Found
              </p>
            </div>
          ) : (
            <div
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-gutter"
              id="product-grid"
            >
              {sortedProducts.map((product, index) => {
                const diamondAmount = product.specifications?.[0]?.diamondAmount || 0;
                const metalWeight = product.sizes?.[0]?.metalWeight || 0;
                const ratePerGram = product.metal?.[0]?.ratePerGram || 0;
                const price = diamondAmount + (metalWeight * ratePerGram);

                return (
                <div
                  key={product._id}
                  style={{ animationDelay: `${index * 80}ms` }}
                  className="grid-item ripple-fade product-card group relative overflow-hidden bg-surface-container-lowest rounded-xl shadow-sm flex flex-col justify-between cursor-pointer"
                >
                  <Link href={`/collections/${product._id}`} className="flex flex-col justify-between flex-grow h-full">
                    <div className="aspect-[0.75] overflow-hidden relative bg-surface-container">
                      <img
                        alt={product.title}
                        className="parallax-img w-full h-full object-cover"
                        src={product.images?.[0] || ''}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-surface/90 via-surface/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          dispatch(toggleWishlist(product._id));
                        }}
                        className="absolute top-4 right-4 text-primary opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-[-10px] group-hover:translate-y-0 cursor-pointer z-10"
                      >
                        <span className={`material-symbols-outlined ${isInWishlist(product._id) ? "fill-[1]" : ""}`}>
                          favorite
                        </span>
                      </button>
                    </div>
                    <div className="p-4 md:p-6 relative flex-grow flex flex-col justify-between">
                      <div>
                        <h4 className="font-headline-md text-label-md md:text-headline-md text-on-surface mb-1 group-hover:text-primary transition-colors duration-300 line-clamp-2 md:line-clamp-none">
                          {product.title}
                        </h4>
                        <p className="text-on-surface-variant text-[11px] md:font-body-md mb-2 md:mb-4 opacity-80">
                          {product.stoneType || ''} - {product.metal?.[0]?.color || ''}
                        </p>
                      </div>
                      <p className="text-primary font-bold text-label-md md:text-body-lg">
                        ${price.toLocaleString()}
                      </p>

                      {/* Hover Details overlay */}
                      <div className="absolute inset-x-0 bottom-0 p-4 md:p-6 bg-primary text-on-primary translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out flex justify-between items-center">
                        <div className="hidden md:block">
                          <p className="text-[10px] uppercase tracking-tighter opacity-80 font-bold">
                            Specification
                          </p>
                          <p className="font-bold text-sm">
                            {(product.specifications?.[0]?.diamondWeight || 0).toFixed(2)}ct • {product.jewelryType || 'Jewelry'}
                          </p>
                        </div>
                        <span className="font-label-sm uppercase tracking-widest flex items-center gap-1 md:gap-2 group/btn font-bold text-[10px] md:text-xs">
                          Shop
                          <span className="material-symbols-outlined text-[14px] md:text-sm group-hover/btn:translate-x-1 transition-transform">
                            arrow_forward
                          </span>
                        </span>
                      </div>
                    </div>
                  </Link>
                </div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full py-20 bg-background border-t border-outline-variant/30 flex flex-col items-center justify-center gap-8 px-margin-desktop text-center">
        <div className="font-display-lg text-display-lg text-primary tracking-tighter">
          Eco Caret
        </div>
        <div className="flex flex-wrap justify-center gap-12 text-on-surface-variant font-body-md font-medium">
          <a className="hover:text-primary transition-colors" href="#">
            Privacy Policy
          </a>
          <a className="hover:text-primary transition-colors" href="#">
            Ethical Sourcing
          </a>
          <a className="hover:text-primary transition-colors" href="#">
            Care Guide
          </a>
          <a className="hover:text-primary transition-colors" href="#">
            Contact
          </a>
        </div>
        <div className="text-on-surface-variant/60 font-label-sm uppercase tracking-widest mt-4">
          © 2026 Eco Caret. Precision Cut. Ethical Soul.
        </div>
      </footer>
      {/* --- PREMIUM INTERACTIVE DRAWER: SHOPPING CART --- */}
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

      {/* --- PREMIUM INTERACTIVE DIALOG: USER PROFILE --- */}
      <ProfileDialog isOpen={profileOpen} onClose={() => dispatch(setProfileOpen(false))} />
    </div>
  );
}
