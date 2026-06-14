"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import ProfileDialog from "@/components/ProfileDialog";
import { ApiProduct } from "@/types";
import { useAppDispatch, useAppSelector } from "@/lib/store";
import { setCartOpen, addToCart, removeFromCart, clearCart } from "@/lib/features/cart/cartSlice";
import { setProfileOpen } from "@/lib/features/profile/profileSlice";

interface ProductDetailsClientProps {
  product: ApiProduct;
  suggestedProducts: ApiProduct[];
}

export default function ProductDetailsClient({
  product,
  suggestedProducts,
}: ProductDetailsClientProps) {
  const dispatch = useAppDispatch();
  const cartOpen = useAppSelector((state) => state.cart.isOpen);
  const profileOpen = useAppSelector((state) => state.profile.isOpen);
  const cartItems = useAppSelector((state) => state.cart.items);

  const [scrolled, setScrolled] = useState(false);
  const [selectedImage, setSelectedImage] = useState(product.images?.[0] || "");
  const [selectedMetal, setSelectedMetal] = useState(product.metal?.[0]?.name || "");
  const [selectedSize, setSelectedSize] = useState("Select your size");

  // Keep thumbnail image updated if product changes
  useEffect(() => {
    setSelectedImage(product.images?.[0] || "");
    setSelectedMetal(product.metal?.[0]?.name || "");
    setSelectedSize("Select your size");
  }, [product]);

  // Scroll listener for header solid bg toggling
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const currentMetalWeight = product.sizes?.find(s => s.size === selectedSize)?.metalWeight || product.sizes?.[0]?.metalWeight || 0;
  const currentRatePerGram = product.metal?.find(m => m.name === selectedMetal)?.ratePerGram || product.metal?.[0]?.ratePerGram || 0;
  const currentPurity = product.metal?.find(m => m.name === selectedMetal)?.purity || "";
  const currentColor = product.metal?.find(m => m.name === selectedMetal)?.color || "";
  const uniquePurities = Array.from(new Set(product.metal?.map(m => m.purity) || []));
  const metalsForPurity = product.metal?.filter(m => m.purity === currentPurity) || [];
  const diamondAmount = product.specifications?.[0]?.diamondAmount || 0;
  const currentPrice = diamondAmount + (currentMetalWeight * currentRatePerGram);

  const handleAddToBag = () => {
    if (selectedSize === "Select your size") {
      alert("Please select your ring size before adding to the collection bag.");
      return;
    }
    dispatch(
      addToCart({
        id: product._id,
        name: `${product.title} (${selectedMetal} / Size ${selectedSize})`,
        price: currentPrice,
        image: product.images?.[0] || "",
      })
    );
    dispatch(setCartOpen(true));
  };

  return (
    <div className="bg-surface text-on-surface font-body-md selection:bg-secondary-fixed selection:text-on-secondary-fixed min-h-screen flex flex-col relative overflow-x-hidden">
      {/* Top Fixed Header */}
      <Header
        scrolled={scrolled}
        setCartOpen={(open) => dispatch(setCartOpen(open))}
        setProfileOpen={(open) => dispatch(setProfileOpen(open))}
        cartItemsCount={cartItems.reduce((acc, curr) => acc + curr.quantity, 0)}
      />

      <main className="flex-grow pt-32 pb-24 max-w-container-max mx-auto px-margin-desktop w-full">
        {/* Dynamic Detail Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* Left Side: Images & Gallery switcher */}
          <div className="lg:col-span-7 flex flex-col space-y-gutter">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Gallery Thumbnails List (Left side) */}
              {product.images && product.images.length > 0 && (
                <div className="flex md:flex-col gap-4 order-2 md:order-1 overflow-x-auto md:overflow-y-auto no-scrollbar w-full md:w-20 lg:w-24 shrink-0">
                  {product.images.map((imgUrl, idx) => (
                    <button
                      key={idx}
                      className={`aspect-square w-20 md:w-full rounded-lg border-2 p-1 bg-white overflow-hidden transition-all duration-300 cursor-pointer shrink-0 ${selectedImage === imgUrl
                        ? "border-primary ring-1 ring-primary"
                        : "border-transparent hover:border-outline-variant"
                        }`}
                      onClick={() => setSelectedImage(imgUrl)}
                    >
                      <img
                        alt={`Angle thumbnail ${idx + 1}`}
                        className="w-full h-full object-cover rounded-md"
                        src={imgUrl}
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Main Image */}
              <div className="relative group overflow-hidden rounded-xl bg-surface-container-low aspect-[4/5] md:aspect-square lg:aspect-[4/5] flex-grow order-1 md:order-2 w-full">
                <img
                  alt={`Main view of ${product.title}`}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  src={selectedImage}
                />
              </div>
            </div>


            {/* Product description block */}
            <div className="mb-10 space-y-4">
              <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                {product.description}
              </p>
            </div>
          </div>

          {/* Right Side: Configurations, titles, actions */}
          <div className="lg:col-span-5 flex flex-col justify-start">
            <div className="sticky top-32">
              {/* Breadcrumbs */}
              <nav className="flex items-center space-x-2 mb-6 text-on-surface-variant/60 font-label-sm text-label-sm">
                <Link className="hover:text-primary transition-colors" href="/collections">
                  Collections
                </Link>
                <span>/</span>
                <span className="text-on-surface-variant font-medium">
                  {product.jewelryType}
                </span>
              </nav>

              <h1 className="font-headline-lg text-headline-lg mb-2 text-on-surface leading-tight">
                {product.title}
              </h1>
              <p className="font-body-lg text-body-lg text-secondary mb-8 font-medium">
                ${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              {/* Configurator: Purity */}
              {uniquePurities.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-label-md text-label-md uppercase tracking-widest mb-4">
                    Select Purity
                  </h3>
                  <div className="flex flex-wrap gap-4">
                    {uniquePurities.map(purity => (
                      <button
                        key={purity}
                        className={`px-6 py-2 rounded-lg border-2 transition-all duration-200 cursor-pointer font-label-sm font-bold ${currentPurity === purity
                          ? "border-primary bg-primary text-on-primary"
                          : "border-outline-variant text-on-surface hover:border-primary"
                          }`}
                        onClick={() => {
                          const nextMetal = product.metal?.find(m => m.purity === purity && m.color === currentColor)
                            || product.metal?.find(m => m.purity === purity);
                          if (nextMetal) setSelectedMetal(nextMetal.name);
                        }}
                      >
                        {purity}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Configurator: Metal Color */}
              <div className="mb-10">
                <h3 className="font-label-md text-label-md uppercase tracking-widest mb-4">
                  Select Color
                </h3>
                <div className="flex space-x-4">
                  {metalsForPurity.map((metalObj, idx) => {
                    const getMetalHex = (color: string) => {
                      if (color.includes("White")) return "#E3E4E5";
                      if (color.includes("Yellow")) return "#E5A03A";
                      if (color.includes("Rose")) return "#E0A295";
                      return "#E3E4E5";
                    };
                    return (
                      <button
                        key={metalObj._id}
                        className={`w-12 h-12 rounded-full border-2 p-0.5 transition-all duration-200 hover:scale-110 cursor-pointer ${selectedMetal === metalObj.name
                          ? "border-primary ring-2 ring-primary ring-offset-2 ring-offset-background scale-105"
                          : "border-transparent hover:border-outline-variant"
                          }`}
                        title={metalObj.name}
                        onClick={() => setSelectedMetal(metalObj.name)}
                      >
                        <div
                          className="w-full h-full rounded-full"
                          style={{ backgroundColor: getMetalHex(metalObj.color) }}
                        ></div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Configurator 2: Ring Sizes selection */}
              <div className="mb-12">
                <h3 className="font-label-md text-label-md uppercase tracking-widest mb-4">
                  Ring Size
                </h3>
                <div className="flex flex-wrap gap-3">
                  {product.sizes?.map((sizeObj) => (
                    <button
                      key={sizeObj._id}
                      onClick={() => setSelectedSize(sizeObj.size)}
                      className={`min-w-[4rem] px-4 py-2 rounded-lg border-2 transition-all duration-200 cursor-pointer font-label-sm font-bold text-center ${selectedSize === sizeObj.size
                        ? "border-primary bg-primary text-on-primary"
                        : "border-outline-variant text-on-surface hover:border-primary"
                        }`}
                    >
                      {sizeObj.size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Checkout & Appointment buttons */}
              <button
                onClick={handleAddToBag}
                className="w-full bg-secondary text-white py-5 px-8 rounded-lg font-label-md text-label-md hover:bg-on-secondary-fixed-variant transition-all duration-300 shadow-lg shadow-secondary/10 cursor-pointer text-center"
              >
                Add to Bag
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Specifications Table Section */}
        <section className="mt-16 border-t border-outline-variant/30 pt-20">
          <div className="text-center mb-16">
            <h2 className="font-headline-md text-headline-md mb-4 text-on-surface">
              The {product.jewelryType} Specification
            </h2>
            <div className="w-16 h-0.5 bg-primary mx-auto"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-px bg-outline-variant/40 rounded-xl overflow-hidden border border-outline-variant/40">
            <div className="bg-surface-bright p-10 flex flex-col items-center text-center">
              <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-tighter mb-2">
                Carat Weight
              </p>
              <p className="font-headline-sm text-headline-sm text-on-surface">
                {(product.specifications?.[0]?.diamondWeight || 0).toFixed(2)} {product.specifications?.[0]?.diamondShape || "Diamond"}
              </p>
            </div>
            <div className="bg-surface-bright p-10 flex flex-col items-center text-center">
              <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-tighter mb-2">
                Color Grade
              </p>
              <p className="font-headline-sm text-headline-sm text-on-surface">
                {product.specifications?.[0]?.diamondQuality || "N/A"}
              </p>
            </div>
            <div className="bg-surface-bright p-10 flex flex-col items-center text-center">
              <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-tighter mb-2">
                Certification
              </p>
              <p className="font-headline-sm text-headline-sm text-on-surface">
                IGI Certified
              </p>
            </div>
            <div className="bg-surface-bright p-10 flex flex-col items-center text-center">
              <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-tighter mb-2">
                Stone Origin
              </p>
              <p className="font-headline-sm text-headline-sm text-on-surface">
                {product.stoneType || "Ethical Origin"}
              </p>
            </div>
          </div>
        </section>

        {/* Sustainability & Workbench Section Banner */}
        <section className="mt-32 mb-20 bg-surface-container-high rounded-[2rem] overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <div className="p-12 md:p-20 flex flex-col justify-center">
              <div className="mb-6 flex items-center space-x-2 text-primary">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                  eco
                </span>
                <span className="font-label-md text-label-md uppercase tracking-widest font-semibold">
                  Sustainability First
                </span>
              </div>
              <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg mb-8 text-on-surface">
                The Eco Caret Standard
              </h2>
              <div className="space-y-8">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-primary">
                      local_shipping
                    </span>
                  </div>
                  <div>
                    <h4 className="font-label-md text-label-md text-on-surface font-bold">
                      Complimentary Shipping
                    </h4>
                    <p className="font-body-md text-body-md text-on-surface-variant">
                      Insured overnight delivery in sustainable, biodegradable packaging.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-primary">
                      replay
                    </span>
                  </div>
                  <div>
                    <h4 className="font-label-md text-label-md text-on-surface font-bold">
                      30-Day Returns
                    </h4>
                    <p className="font-body-md text-body-md text-on-surface-variant">
                      Stress-free returns or exchanges with our global care team.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-primary">
                      edit_square
                    </span>
                  </div>
                  <div>
                    <h4 className="font-label-md text-label-md text-on-surface font-bold">
                      Bespoke Engraving
                    </h4>
                    <p className="font-body-md text-body-md text-on-surface-variant">
                      Complimentary personalization handcrafted by our master artisans.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative min-h-[400px]">
              <img
                className="absolute inset-0 w-full h-full object-cover"
                alt="Jeweler workbench close up"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAhitbpzZf4-bkVcTdqzZBGtLvWC_P8hHk3C8AXRPv4VjFTu6-sROpd9b7xxZFkEp0bc1Q0DtvY30QG9OvrGMJCVVtHDA9fs61bNhpPF-RDO33PHhQE0s-XgNnJlHMh90ai1fpZkm7kKDcUCLoR1xkNAyt04VzvSTtkiwepEPr0e79S6F5sDohQ50lgJUnA-ZAM1iOnr1Ahl6fgaprK9nnXUCDUnTJ54bliYzIQZNFdbgv5q_G7ryLxP1dP75rZzlp0UjtgD5cEH_4"
              />
            </div>
          </div>
        </section>

        {/* You May Also Like Recommendations Carousel / Grid */}
        {suggestedProducts && suggestedProducts.length > 0 && (
          <section className="mt-32 pt-20 border-t border-outline-variant/30">
            <div className="text-center mb-16">
              <h2 className="font-headline-md text-headline-md mb-4 text-on-surface">
                You May Also Like
              </h2>
              <div className="w-16 h-0.5 bg-primary mx-auto"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {suggestedProducts.map((p) => {
                const diamondAmount = p.specifications?.[0]?.diamondAmount || 0;
                const metalWeight = p.sizes?.[0]?.metalWeight || 0;
                const ratePerGram = p.metal?.[0]?.ratePerGram || 0;
                const price = diamondAmount + (metalWeight * ratePerGram);

                return (
                  <Link
                    href={`/collections/${p._id}`}
                    key={p._id}
                    className="group block space-y-4 cursor-pointer"
                  >
                    <div className="aspect-[4/5] bg-surface-container overflow-hidden rounded-2xl border border-outline-variant/10 shadow-sm transition-all hover:shadow-md">
                      <img
                        src={p.images?.[0] || ""}
                        alt={p.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div>
                      <h4 className="font-headline-sm text-headline-sm text-on-surface group-hover:text-primary transition-colors duration-300 font-medium">
                        {p.title}
                      </h4>
                      <p className="font-label-sm text-on-surface-variant uppercase tracking-wider mt-1">
                        {p.stoneType || ''} - {p.metal?.[0]?.color || ''}
                      </p>
                      <p className="font-label-md text-secondary font-bold mt-2">
                        ${price.toLocaleString()}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </main>

      {/* Global Footer component */}
      <Footer />

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
