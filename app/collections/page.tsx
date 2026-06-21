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

const formatLabel = (value?: string) =>
  value
    ? value
        .replace(/[_-]/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase())
    : "";

const getProductName = (product: ApiProduct) =>
  product.name || product.title || "Untitled Masterpiece";

const getProductImage = (product: ApiProduct) => {
  if (product.images?.[0]) return product.images[0];

  const firstColorImage = product.colorImages?.[0];
  return firstColorImage?.url || firstColorImage?.imageUrl || firstColorImage?.src || "";
};

const getProductPrice = (product: ApiProduct) => {
  if (typeof product.displayPrice === "number") return product.displayPrice;

  const activeMetalOption = product.metalOptions?.find((option) => option.isActive);
  const metalWeight =
    product.sizeMatrix
      ?.find((size) => size.isAvailable)
      ?.weightByPurity.find((weight) => weight.purity === activeMetalOption?.purity)
      ?.metalWeightGrams || 0;
  const metalTotal = (activeMetalOption?.pricePerGram || 0) * metalWeight;
  const stoneTotal =
    product.productStones?.reduce(
      (sum, item) =>
        sum + (item.stone?.priceUSD || 0) * (item.caratWeight || item.stone?.caratWeight || 0),
      0
    ) || 0;
  const subtotal = stoneTotal + metalTotal + (product.makingChargeUSD || 0);
  const discount = product.discountPercent ? subtotal * (product.discountPercent / 100) : 0;

  return Math.max(subtotal - discount, 0);
};

const getMetalSummary = (product: ApiProduct) => {
  const options = product.metalOptions?.filter((option) => option.isActive) || [];
  if (options.length > 0) {
    const colors = Array.from(
      new Set(options.map((option) => formatLabel(option.metalColor)))
    );
    const purities = Array.from(new Set(options.map((option) => option.purity)));
    return `${colors.slice(0, 3).join(", ")} Gold${
      purities.length ? ` · ${purities.join("/")}` : ""
    }`;
  }

  return "";
};

const getProductSpec = (product: ApiProduct) => {
  const caratWeight = product.totalStoneCaratWeight || 0;
  const shape = formatLabel(product.shape);
  const type = formatLabel(product.subCategory || product.category);

  return [caratWeight ? `${caratWeight.toFixed(2)}ct` : "", shape, type]
    .filter(Boolean)
    .join(" · ");
};

const getAvailableSizeCount = (product: ApiProduct) =>
  product.sizeMatrix?.filter((size) => size.isAvailable).length || 0;

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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      const fetchedProducts = await fetchProducts();
      setProducts(fetchedProducts);
      setIsLoading(false);
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

          {isLoading ? (
            <div className="h-[400px] flex flex-col items-center justify-center text-center space-y-4">
              <span className="material-symbols-outlined text-outline-variant text-6xl animate-pulse">
                diamond
              </span>
              <p className="font-headline-sm text-headline-sm text-on-surface">
                Loading Masterpieces
              </p>
            </div>
          ) : sortedProducts.length === 0 ? (
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
                const productName = getProductName(product);
                const productImage = getProductImage(product);
                const price = getProductPrice(product);
                const spec = getProductSpec(product);
                const metalSummary = getMetalSummary(product);
                const availableSizeCount = getAvailableSizeCount(product);

                return (
                  <div
                    key={product._id}
                    style={{ animationDelay: `${index * 80}ms` }}
                    className="grid-item ripple-fade product-card group relative overflow-hidden bg-surface-container-lowest rounded-xl shadow-sm flex flex-col justify-between cursor-pointer"
                  >
                  <Link href={`/collections/${product._id}`} className="flex flex-col justify-between flex-grow h-full">
                    <div className="aspect-[0.75] overflow-hidden relative bg-surface-container">
                      {productImage ? (
                        <img
                          alt={productName}
                          className="parallax-img w-full h-full object-cover"
                          src={productImage}
                        />
                      ) : (
                        <div className="parallax-img w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-surface-container-lowest via-surface-container-low to-secondary-container/30 text-primary">
                          <span className="material-symbols-outlined text-6xl mb-3">
                            diamond
                          </span>
                          <span className="font-label-sm text-label-sm uppercase tracking-widest">
                            Image Coming Soon
                          </span>
                        </div>
                      )}
                      {product.isNewArrival && (
                        <span className="absolute top-4 left-4 bg-secondary text-on-secondary rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest">
                          New
                        </span>
                      )}
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
                          {productName}
                        </h4>
                        <p className="text-on-surface-variant text-[11px] md:font-body-md mb-2 md:mb-4 opacity-80">
                          {formatLabel(product.stoneType)}
                          {metalSummary ? ` · ${metalSummary}` : ""}
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
                              {spec || "Made-to-order jewelry"}
                          </p>
                          {availableSizeCount > 0 && (
                            <p className="text-xs opacity-80 mt-1">
                              {availableSizeCount} sizes available
                            </p>
                          )}
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
