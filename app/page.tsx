"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SignInForm from "@/components/SignInForm";
import ProfileDialog from "@/components/ProfileDialog";
import CartDrawer from "@/components/CartDrawer";
import Hero from "@/components/Hero";
import AtelierJourney from "@/components/AtelierJourney";
import ProductShowcase from "@/components/ProductShowcase";
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
        <Hero />

        {/* Collections Category Grid */}
        <section className="py-16 md:py-24 px-margin-mobile md:px-margin-desktop bg-white">
          <div className="max-w-container-max mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {[
                { name: "Pendants", icon: "workspace_premium", href: "/collections?category=pendants" },
                { name: "Chains", icon: "link", href: "/collections?category=chains" },
                { name: "Rings", icon: "diamond", href: "/collections?category=rings" },
                { name: "Earrings", icon: "flare", href: "/collections?category=earrings" },
                { name: "Bracelets", icon: "toll", href: "/collections?category=bracelets" },
                { name: "Necklaces", icon: "auto_awesome", href: "/collections?category=necklaces" },
              ].map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="group flex flex-col items-center justify-center p-8 rounded-3xl bg-surface-container-low border border-outline-variant/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:bg-primary/5 hover:border-primary/50 cursor-pointer animate-fade-in"
                >
                  <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center text-secondary mb-4 transition-all duration-300 group-hover:bg-primary group-hover:text-on-primary group-hover:scale-110">
                    <span className="material-symbols-outlined text-3xl">
                      {item.icon}
                    </span>
                  </div>
                  <span className="font-label-md text-label-md text-on-surface font-semibold tracking-wider text-center transition-colors group-hover:text-primary">
                    {item.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <AtelierJourney />

        {/* Product Showcase: Asymmetric Layout */}
        <ProductShowcase onProductClick={(product) => setSelectedProduct(product)} />

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
