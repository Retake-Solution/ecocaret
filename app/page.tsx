"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SignInForm from "@/components/SignInForm";
import ProfileDialog from "@/components/ProfileDialog";
import CartDrawer from "@/components/CartDrawer";
import { useAppDispatch, useAppSelector } from "@/lib/store";
import { setCartOpen, addToCart, removeFromCart, clearCart } from "@/lib/features/cart/cartSlice";
import { setProfileOpen } from "@/lib/features/profile/profileSlice";

interface Product {
  id: string;
  name: string;
  price: string;
  image: string;
  specs: string;
  description: string;
}

export default function Home() {
  const dispatch = useAppDispatch();
  const cartOpen = useAppSelector((state) => state.cart.isOpen);
  const profileOpen = useAppSelector((state) => state.profile.isOpen);
  const cartItems = useAppSelector((state) => state.cart.items);

  const [scrolled, setScrolled] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const heroImgRef = useRef<HTMLImageElement>(null);

  // Scroll listener for header
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Parallax effect on mouse move in hero
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const amount = 20;
      const x = (e.clientX / window.innerWidth - 0.5) * amount;
      const y = (e.clientY / window.innerHeight - 0.5) * amount;
      if (heroImgRef.current) {
        heroImgRef.current.style.transform = `scale(1.1) translate(${x}px, ${y}px)`;
      }
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Preset products data
  const products: Product[] = [
    {
      id: "celestial-solitaire",
      name: "Celestial Solitaire",
      price: "$3,200",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDUkaorzslrYslVsDlUte883UsVwZdwvy-QzCeqHJyccKWsjudas3QbOX0Kl-RPK0Gz_GxElFQFifk1-aQd31H68cg67wfLxe8xyAIvXfp-RbfeLky5byGcwC55rPQQdcdf0Xpj4oDay9L48q3pv7Tqt5WHHLkMpoRoloo0aeMFnOWbHlovtR-Wc_pqI-tLgRI4rhsM6W9XR8NanzE2CHy1ZuEpWDiQHN-UoZDJgp3T4FPtz_4GE3KDctn9f4HHVE-bePgiHrCSdxU",
      specs: "2.5ct VVS1 • Recycled 18k Rose Gold",
      description: "An ethereal lab-grown solitaire, meticulously designed with micro-prongs to maximize light entrance and fire brilliance. Crafted from certified 100% recycled 18k gold.",
    },
    {
      id: "provenance-studs",
      name: "Provenance Studs",
      price: "$1,850",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBom3HeTG-D4UXTRkZr0JvDgX_Pa6lpNbiss7DzkB3fBEeYGC2bowmL1CPXlFcEd5aTY3oAvFvvelGsRN90_jkyAQ5Dmj95WB0MuRkARyHslAnwnJO8WLVnqbs7J8PPiQGWDsaJpewTgMsB9gKWbm29lRT_8-TMH3JBf0D-iHYVPdA4hf8Atd33vlnnZuUtlWfvSsTWSOFkVDg-2QHAznl5v-UL3VNHFClzruXm24opR-0AiKlPV_WcJWPLMVGzOCjjTNVpRBGvaQQ",
      specs: "1.0ct t.w. • Artisan Prongs",
      description: "Timeless classic studs boasting surgical perfection and high-grade brilliance. A subtle double-claw setting adds modern charm to zero-carbon synthesized gems.",
    },
    {
      id: "the-terra-drop",
      name: "The Terra Drop",
      price: "$2,400",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCtEGLDC-9MkDh8yRjviZ1ykmGePsNTLJLmZ76TAz9HqAk3gwEAlFqVhHeqwVNFpS5_OhhFj5yb-cyXh5vbaItkpac9yF6K8p8nkDuVFbhlJMPyWr4IGxPSWCN0xy2zwba1QmmgE_NUy-dKRPNygm2a8X_pvQu921TbA59g8ew6DYiRQGcnbx6p0KkIFL4bJh1NMCAII8Oi29UABapAFFrSV9Aw_mZJmwnHxxBmGFIUAaba1ULLquAN0CAbbpG93vifSvPkNGcwoIQ",
      specs: "Marquise Cut • Hand-Forged",
      description: "A gorgeous marquise pendant that floats gracefully. Hand-forged textured gold setting evokes dry terracotta landscapes and geological formations.",
    },
  ];

  // Cart logic handled by Redux

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setTimeout(() => {
        setSubscribed(false);
        setEmail("");
      }, 5000);
    }
  };

  const renderProductCard = (product: Product, idx: number) => {
    // Determine vertical offsets for asymmetrical layout
    const offsetClass =
      idx === 0
        ? "md:pt-12"
        : idx === 2
          ? "md:pt-24"
          : "";

    // Rounded corner variants matching the design mockup
    const imageContainerClass =
      idx === 0
        ? "rounded-t-[120px] rounded-b-2xl"
        : idx === 1
          ? "rounded-3xl"
          : "rounded-t-2xl rounded-b-[120px]";

    return (
      <div key={product.id} className={`space-y-6 ${offsetClass}`}>
        <Link href={`/collections/${product.id}`} className="block space-y-6">
          <div
            className={`aspect-[4/5] bg-surface-container overflow-hidden group border border-outline-variant/10 shadow-sm hover:shadow-md transition-shadow cursor-pointer ${imageContainerClass}`}
          >
            <img
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              alt={product.name}
              src={product.image}
            />
          </div>
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <h4 className="font-headline-sm text-headline-sm text-on-surface group-hover:text-primary transition-colors">
                {product.name}
              </h4>
              <span className="font-label-md text-label-md text-secondary font-bold">
                {product.price}
              </span>
            </div>
            <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest">
              {product.specs}
            </p>
            <span
              className="pt-4 font-label-md text-label-md text-primary flex items-center gap-2 group hover:text-secondary transition-colors font-semibold"
            >
              Discover Details
              <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">
                east
              </span>
            </span>
          </div>
        </Link>
      </div>
    );
  };

  return (
    <div className="bg-background text-on-background font-body-md selection:bg-secondary-container selection:text-on-secondary-container min-h-screen flex flex-col relative overflow-x-hidden">
      {/* TopNavBar */}
      <Header
        scrolled={scrolled}
        setCartOpen={(open) => dispatch(setCartOpen(open))}
        setProfileOpen={(open) => dispatch(setProfileOpen(open))}
        cartItemsCount={cartItems.reduce((acc, curr) => acc + curr.quantity, 0)}
      />

      <main className="flex-grow">
        {/* Hero Section: Sustainable Splendor */}
        <section className="relative min-h-[100svh] md:min-h-[870px] flex items-center overflow-hidden px-margin-mobile md:px-margin-desktop py-12 md:py-24">
          <div className="max-w-container-max mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10 pt-16 md:pt-0">
            <div className="space-y-6 md:space-y-8">
              <div className="inline-flex items-center gap-2 bg-secondary-container/20 px-4 py-1 rounded-full border border-secondary-container/30">
                <span className="w-1.5 h-1.5 bg-secondary rounded-full animate-ping"></span>
                <span className="font-label-sm text-label-sm text-on-secondary-container tracking-widest uppercase">
                  The Ethics of Beauty
                </span>
              </div>
              <h1 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface max-w-xl leading-tight">
                Sustainable Splendor,{" "}
                <span className="text-secondary italic">Handcrafted</span> for
                Eternity
              </h1>
              <p className="font-body-lg text-body-md md:text-body-lg text-on-surface-variant max-w-md">
                Discover jewelry that honors both the wearer and the world. Our
                lab-grown diamonds are set in recycled gold, merging artisan
                heritage with modern conscience.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 pt-4">
                <a
                  href="/collections"
                  className="w-full sm:w-auto bg-secondary text-on-secondary px-10 py-4 rounded-full font-label-md text-label-md shadow-lg shadow-secondary/20 hover:scale-105 active:scale-95 transition-all text-center"
                >
                  Explore Collections
                </a>
                <Link
                  href="/our-story"
                  className="w-full sm:w-auto border border-secondary text-secondary px-10 py-4 rounded-full font-label-md text-label-md hover:bg-secondary/5 transition-all text-center block"
                >
                  Watch Our Story
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="organic-shape-1 w-full aspect-square bg-surface-container-high overflow-hidden relative">
                <img
                  ref={heroImgRef}
                  alt="Featured diamond jewelry"
                  className="w-full h-full object-cover mix-blend-multiply opacity-90 transition-transform duration-300"
                  src="https://lh3.googleusercontent.com/aida/AP1WRLv0F5oGnO0zyuj4Pl4nv6_AUxudLspFfIcGvtQVLPjb1ob1ySDy5K6oWaGN1xqDVY7sFT05MxcDTzxB6p45xx7W7ptq6DrJyxEO3V8sUHD7Plm9cxh7ReU-oQu595kVYA4408qs8WptexfRNMCxeDlzn5yUXWStoFkUUh-US9XU1UY2Kv32Lrb3Vs9ckBDgD2NYDdcCtnQs1OEKKosaMwlM5cmsBpsa1Svco1bEgWgv8S5Swi8Q4lT7kw"
                  style={{ transform: "scale(1.1)" }}
                />
              </div>
              {/* Accent Element */}
              <div className="absolute -bottom-8 -left-8 glass-effect p-6 rounded-2xl border border-outline-variant/30 hidden md:block max-w-[220px] shadow-lg">
                <p className="font-label-md text-label-md text-secondary mb-1">
                  Impact Report
                </p>
                <p className="font-label-sm text-label-sm text-on-surface-variant">
                  Reduced carbon footprint by 84% compared to traditional mining.
                </p>
              </div>
            </div>
          </div>
          {/* Background Decorative Orbs */}
          <div className="absolute top-1/4 -right-24 w-96 h-96 bg-primary-fixed-dim/20 blur-[100px] rounded-full -z-10"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary-fixed/30 blur-[80px] rounded-full -z-10"></div>
        </section>

        {/* Bento Grid: The Atelier Journey */}
        <section
          id="atelier"
          className="py-16 md:py-24 px-margin-mobile md:px-margin-desktop bg-surface-container-lowest"
        >
          <div className="max-w-container-max mx-auto">
            <div className="text-center mb-16 space-y-4">
              <h2 className="font-headline-md text-headline-md text-on-surface">
                The Journey of Conscious Luxury
              </h2>
              <div className="w-12 h-0.5 bg-secondary mx-auto"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter auto-rows-auto md:auto-rows-[240px]">
              {/* Large Feature: Lab to Atelier */}
              <div className="md:col-span-8 md:row-span-2 group relative overflow-hidden rounded-3xl tonal-layer-1 min-h-[400px] md:min-h-0">
                <div className="absolute inset-0 z-0">
                  <img
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    alt="Synthesis laboratory chamber with glowing diamond plasma structures"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDAWlNOc4489-VsatIVLAVFA_vBxJWdiO5hStUnz1rqoMjeu1UFDbMtdKuxVnL8KP4-KasGw9GH0SyFUeoK9Yh5jmMghtWXoy1L-eBn3JoID0SWOf1JxOS2kA_FDhrpIehMoyLHCWWbw-DEEzsmMc7GEjUngp-HqAQ47LlSWwHwpI9fjN4_ok88ItfgM5-SlcwhaFjQlolapYCd9c5dOzjXbp_BVB4je9dhjHv6-KWSBMxcBRQD1Qd-RM4XHy-DVQW7kRDey_tSEhk"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                </div>
                <div className="absolute bottom-0 left-0 p-8 z-10">
                  <span className="font-label-sm text-label-sm text-primary-fixed mb-2 block font-medium">
                    Step 01: Synthesis
                  </span>
                  <h3 className="font-headline-sm text-headline-sm text-white mb-2">
                    Molecular Brilliance
                  </h3>
                  <p className="font-body-md text-body-md text-white/80 max-w-md">
                    Witness the birth of perfection in our carbon-neutral
                    laboratories, where earth's natural process is replicated with
                    surgical precision.
                  </p>
                </div>
              </div>

              {/* Small Feature: Craftsmanship */}
              <div className="md:col-span-4 md:row-span-1 group relative overflow-hidden rounded-3xl bg-surface-container-high border border-outline-variant/20 p-8 flex flex-col justify-end transition-all hover:shadow-md">
                <span className="material-symbols-outlined text-secondary text-4xl mb-auto animate-pulse">
                  diamond
                </span>
                <h3 className="font-headline-sm text-headline-sm text-on-surface mt-4">
                  Artisan Cut
                </h3>
                <p className="font-label-sm text-label-sm text-on-surface-variant">
                  Every facet hand-polished by masters.
                </p>
              </div>

              {/* Small Feature: Setting */}
              <div className="md:col-span-4 md:row-span-1 group relative overflow-hidden rounded-3xl bg-secondary-container/20 border border-secondary-container/30 p-8 transition-all hover:shadow-md">
                <div className="flex flex-col h-full">
                  <div className="flex justify-between items-start">
                    <span className="material-symbols-outlined text-secondary">
                      hardware
                    </span>
                    <span className="font-label-sm text-label-sm text-secondary font-bold tracking-wider">
                      RECYCLED GOLD
                    </span>
                  </div>
                  <div className="mt-auto">
                    <h3 className="font-headline-sm text-headline-sm text-on-surface">
                      Circular Design
                    </h3>
                    <p className="font-label-sm text-label-sm text-on-surface-variant">
                      18k gold salvaged and refined.
                    </p>
                  </div>
                </div>
              </div>

              {/* Medium Feature: Provenance */}
              <div
                id="provenance"
                className="md:col-span-5 md:row-span-1 bg-surface-dim rounded-3xl p-8 flex flex-col md:flex-row items-start md:items-center gap-6 group hover:bg-surface-container-high transition-colors cursor-pointer"
                onClick={() => alert("Displaying Blockchain Trace Ledger...")}
              >
                <div className="w-20 h-20 rounded-full bg-white flex-shrink-0 flex items-center justify-center border border-outline-variant/30 group-hover:scale-105 transition-transform shadow-sm">
                  <span className="material-symbols-outlined text-primary text-3xl">
                    verified
                  </span>
                </div>
                <div>
                  <h3 className="font-label-md text-label-md text-on-surface font-semibold mb-1">
                    Blockchain Provenance
                  </h3>
                  <p className="font-label-sm text-label-sm text-on-surface-variant">
                    Trace every diamond's origin from seed to setting via your
                    digital certificate.
                  </p>
                </div>
              </div>

              {/* Call to Action */}
              <div
                id="bespoke"
                className="md:col-span-7 md:row-span-1 bg-primary text-on-primary rounded-3xl p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 sm:gap-0 group overflow-hidden cursor-pointer hover:bg-primary/95 transition-all"
                onClick={() => alert("Launching Bespoke Jewelry Configurator...")}
              >
                <div className="space-y-2">
                  <h3 className="font-headline-sm text-headline-sm">
                    Curate Your Bespoke Piece
                  </h3>
                  <p className="font-body-md opacity-80">
                    Collaborate with our designers for a unique legacy.
                  </p>
                </div>
                <button className="w-16 h-16 rounded-full bg-white text-primary flex items-center justify-center group-hover:scale-110 transition-transform shadow-md shrink-0 self-end sm:self-auto">
                  <span className="material-symbols-outlined">
                    arrow_forward
                  </span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Product Showcase: Asymmetric Layout */}
        <section id="collections" className="py-16 md:py-24 px-margin-mobile md:px-margin-desktop">
          <div className="max-w-container-max mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
              <div className="max-w-xl">
                <h2 className="font-headline-lg text-headline-lg text-on-surface">
                  The Signature <span className="text-secondary italic">Earth-First</span> Collection
                </h2>
                <p className="font-body-md text-body-md text-on-surface-variant mt-4">
                  Quiet luxury defined by intentional minimalism and biological
                  inspiration.
                </p>
              </div>
              <a
                className="font-label-md text-label-md text-secondary border-b border-secondary/30 pb-1 hover:border-secondary transition-all"
                href="/collections"
              >
                View All Masterpieces
              </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {products.map((product, idx) => renderProductCard(product, idx))}
            </div>
          </div>
        </section>

        {/* Values Section: Glassmorphism Triptych */}
        <section className="py-16 md:py-24 bg-surface-container relative">
          <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-effect p-12 rounded-[40px] border border-white/50 text-center space-y-6 shadow-sm hover:shadow-md transition-shadow duration-300">
              <span className="material-symbols-outlined text-secondary text-5xl">
                nature
              </span>
              <h3 className="font-headline-sm text-headline-sm text-on-surface">
                Zero Impact
              </h3>
              <p className="font-body-md text-body-md text-on-surface-variant">
                We don't just reduce damage; we actively restore ecosystems with
                every purchase.
              </p>
            </div>
            <div className="glass-effect p-12 rounded-[40px] border border-white/50 text-center space-y-6 md:-translate-y-12 shadow-md hover:-translate-y-14 transition-all duration-300">
              <span className="material-symbols-outlined text-secondary text-5xl">
                auto_awesome
              </span>
              <h3 className="font-headline-sm text-headline-sm text-on-surface">
                Conflict-Free
              </h3>
              <p className="font-body-md text-body-md text-on-surface-variant">
                A transparent supply chain that empowers local communities and
                ensures fair labor.
              </p>
            </div>
            <div className="glass-effect p-12 rounded-[40px] border border-white/50 text-center space-y-6 shadow-sm hover:shadow-md transition-shadow duration-300">
              <span className="material-symbols-outlined text-secondary text-5xl">
                all_inclusive
              </span>
              <h3 className="font-headline-sm text-headline-sm text-on-surface">
                Heirloom Quality
              </h3>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Crafted to outlast trends, becoming a legacy piece for
                generations to come.
              </p>
            </div>
          </div>
        </section>

        {/* Newsletter / Community */}
        <section className="py-16 md:py-24 px-margin-mobile md:px-margin-desktop bg-surface">
          <div className="max-w-3xl mx-auto text-center space-y-6 md:space-y-8 relative">
            <h2 className="font-headline-md text-headline-md text-on-surface">
              Join the Conscious Circle
            </h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant">
              Be the first to explore limited drops and receive insights into the
              future of ethical luxury.
            </p>
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-4 mt-8">
              <input
                className="flex-grow bg-surface-container-low border-b-2 border-outline-variant focus:border-secondary focus:ring-0 px-6 py-4 rounded-t-xl font-body-md outline-none transition-all placeholder:text-on-surface-variant/40"
                placeholder="Email address"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button
                type="submit"
                className="bg-primary text-on-primary px-12 py-4 rounded-full font-label-md text-label-md hover:shadow-xl hover:shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
              >
                Subscribe
              </button>
            </form>

            {/* Subscribed Toast Success Alert */}
            {subscribed && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 bg-secondary text-white px-6 py-3 rounded-full text-label-md font-medium shadow-md transition-opacity animate-bounce">
                Thank you for joining the Conscious Circle! Check your inbox.
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
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

      {/* --- PREMIUM INTERACTIVE DIALOG: PRODUCT DETAIL QUICK VIEW --- */}
      <div
        className={`fixed inset-0 z-50 transition-opacity duration-300 flex items-center justify-center p-4 ${selectedProduct
          ? "opacity-100 pointer-events-auto"
          : "opacity-0 pointer-events-none"
          }`}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={() => setSelectedProduct(null)}
        />
        {/* Modal Content */}
        <div
          className={`relative bg-surface rounded-[40px] border border-outline-variant/20 max-w-3xl w-full p-8 md:p-12 shadow-2xl transition-all duration-300 transform grid grid-cols-1 md:grid-cols-2 gap-8 ${selectedProduct
            ? "scale-100 translate-y-0"
            : "scale-95 translate-y-4"
            }`}
        >
          <button
            onClick={() => setSelectedProduct(null)}
            className="absolute top-6 right-6 material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors cursor-pointer z-10"
          >
            close
          </button>

          {selectedProduct && (
            <>
              <div className="aspect-square bg-surface-container rounded-3xl overflow-hidden border border-outline-variant/10 shadow-inner">
                <img
                  src={selectedProduct.image}
                  alt={selectedProduct.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <span className="font-label-sm text-label-sm text-secondary bg-secondary-container/20 px-3 py-1 rounded-full uppercase tracking-wider">
                    Conscious Collection
                  </span>
                  <h3 className="font-headline-md text-headline-md text-on-surface">
                    {selectedProduct.name}
                  </h3>
                  <p className="font-label-md text-label-md text-secondary font-bold text-lg">
                    {selectedProduct.price}
                  </p>
                  <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider border-y border-outline-variant/10 py-2">
                    {selectedProduct.specs}
                  </p>
                  <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                    {selectedProduct.description}
                  </p>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => {
                      dispatch(
                        addToCart({
                          id: selectedProduct.id,
                          name: selectedProduct.name,
                          price: parseFloat(
                            selectedProduct.price.replace(/[$,]/g, "")
                          ),
                          image: selectedProduct.image,
                        })
                      );
                      setSelectedProduct(null);
                      dispatch(setCartOpen(true));
                    }}
                    className="w-full bg-primary text-on-primary py-4 rounded-full font-label-md text-label-md hover:shadow-lg transition-all text-center flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">
                      shopping_bag
                    </span>
                    Add to Collection Bag
                  </button>
                  <button
                    onClick={() => {
                      alert(
                        "Connecting with a private concierge agent for bespoke configuration..."
                      );
                      setSelectedProduct(null);
                    }}
                    className="w-full border border-secondary text-secondary py-4 rounded-full font-label-md text-label-md hover:bg-secondary/5 transition-all text-center flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">
                      support_agent
                    </span>
                    Request Bespoke Customization
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
