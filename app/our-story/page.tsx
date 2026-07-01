"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProfileDialog from "@/components/ProfileDialog";
import CartDrawer from "@/components/CartDrawer";
import { useAppDispatch, useAppSelector } from "@/lib/store";
import { setCartOpen, removeFromCart, clearCart } from "@/lib/features/cart/cartSlice";
import { setProfileOpen } from "@/lib/features/profile/profileSlice";

export default function OurStoryPage() {
  const dispatch = useAppDispatch();
  const cartOpen = useAppSelector((state) => state.cart.isOpen);
  const profileOpen = useAppSelector((state) => state.profile.isOpen);
  const cartItems = useAppSelector((state) => state.cart.items);
  const [navScrolled, setNavScrolled] = useState(false);

  // Form states
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

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

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    setSubscribed(true);
    setEmail("");
    setTimeout(() => setSubscribed(false), 4000);
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-x-hidden bg-background text-on-background selection:bg-secondary-container selection:text-on-secondary-container">
      {/* Local custom styling overrides */}
      <style dangerouslySetInnerHTML={{ __html: `
        .glass-card {
            background: rgba(247, 255, 252, 0.72);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
        }
        .copper-gradient {
            background: linear-gradient(135deg, #3C9984 0%, #2f6f73 100%);
        }
        .tonal-elevation {
            box-shadow: 0 24px 48px -12px rgba(60, 153, 132, 0.12);
        }
        .font-playfair {
            font-family: var(--font-playfair-display), serif;
        }
        .organic-artisan-shape {
            border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%;
        }
      `}} />
      
      <Header
        scrolled={navScrolled}
        setCartOpen={(open) => dispatch(setCartOpen(open))}
        setProfileOpen={(open) => dispatch(setProfileOpen(open))}
        cartItemsCount={cartItems.reduce((acc, curr) => acc + curr.quantity, 0)}
      />

      <main className="flex-grow">
        {/* Hero: The Vision of Conscious Brilliance */}
        <section className="relative min-h-[90vh] md:min-h-screen flex items-center overflow-hidden px-margin-mobile md:px-margin-desktop py-24 bg-surface">
          <div className="absolute inset-0 z-0">
            <img 
              alt="Macro close-up of a diamond" 
              className="w-full h-full object-cover grayscale-[15%] brightness-95 opacity-90 transition-transform duration-10000" 
              src="https://lh3.googleusercontent.com/aida/AP1WRLt0zyESo6pHkVilif4cjlRYBG-P06jrYSEWGr9H_UtHY8zLNEVfPRPINOhbApKi40CG9gcZs6LzfaanB_f0PtWX4y3gmpVnR-cSyLpL3PufPtmHnj2fGf9wC-f2peHAJyNr36TiXH-n-q4cgW6U9TxcEPi3E-78gDneVnjP6SPAn8UAPURBbSEHcc_M_4dCpagmbN23JS5jzMqqjNxj3k7LIRSeFxSkK7BcaeOXshq8JoBtX4Wd_n8lSNw"
            />
            {/* Elegant double overlay wash */}
            <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/60 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent"></div>
          </div>
          
          <div className="relative z-10 max-w-container-max mx-auto w-full">
            <div className="max-w-3xl space-y-6">
              <div className="inline-flex items-center gap-2 bg-secondary-container/10 px-4.5 py-1.5 rounded-full border border-secondary-container/20 shadow-sm">
                <span className="w-1.5 h-1.5 bg-secondary rounded-full animate-ping"></span>
                <span className="font-label-sm text-[11px] text-on-secondary-container tracking-widest uppercase font-bold">The Vision</span>
              </div>
              <h1 className="font-playfair text-5xl md:text-7xl font-semibold text-on-surface leading-[1.08] tracking-tight max-w-2xl">
                Redefining <span className="text-secondary italic font-normal">Luxury</span> through Ethics & Science.
              </h1>
              <p className="font-body-lg text-body-md md:text-body-lg text-on-surface-variant max-w-xl leading-relaxed">
                We believe that true beauty shouldn&apos;t come at the cost of our planet. Eco Caret bridges the gap between timeless craftsmanship and futuristic molecular innovation.
              </p>
              
              <div className="pt-6 flex flex-col sm:flex-row gap-4">
                <Link 
                  href="/collections" 
                  className="bg-secondary text-on-secondary px-10 py-4.5 rounded-full font-label-md text-label-md hover:bg-on-secondary-fixed-variant hover:scale-105 active:scale-95 transition-all text-center font-bold tracking-wider shadow-lg shadow-secondary/15"
                >
                  Explore Collections
                </Link>
              </div>
            </div>
          </div>

          {/* Asymmetric border frame accents */}
          <div className="absolute bottom-0 right-0 w-1/3 h-24 border-t border-l border-outline-variant/30 hidden lg:block rounded-tl-[60px]" />
          
          {/* Scroll Indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-on-surface-variant/40 animate-bounce">
            <span className="text-[10px] font-bold tracking-widest uppercase">Scroll Down</span>
            <span className="material-symbols-outlined text-sm">expand_more</span>
          </div>
        </section>

        {/* The Genesis: Laboratory Artistry */}
        <section className="py-24 md:py-36 bg-surface">
          <div className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
              
              {/* Left Column (Visual Arch Frame + Gold Ring Token Overlay) */}
              <div className="lg:col-span-6 order-2 lg:order-1 relative flex justify-center">
                <div className="relative w-[90%] sm:w-[80%] aspect-[4/5] overflow-hidden rounded-t-[140px] rounded-b-3xl border border-outline-variant/30 shadow-xl group hover:scale-[1.01] transition-transform duration-700">
                  <img 
                    alt="Lab grown diamond process" 
                    className="w-full h-full object-cover transition-transform duration-[1200ms] group-hover:scale-105" 
                    src="https://lh3.googleusercontent.com/aida/AP1WRLsvk8wW-v6NGesvrahUuVR8eohLUVJKTpCPWbK5cY9UhmGg8OD46eJ60ess0iUTpY7IVZ9JjGyBGIMLbKknNvnjiTZ06nTCCIQRPRdYhm9-AGE7QNExFXI9Sui3EpPKRvOxxWT7S5YNWkl2ShnmnnGXUzlwRGd31PhijpmiXMUlRk3QacCvpz7AwsBLPlvaPuEvWPwnn1vQtPTmy5dsOEPPXGuLXmvCXX8n1Xbzy6RrbNtxc9ii1c0uOTo"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                </div>
                
                {/* Floating Gold Coin Accent */}
                <div className="absolute -bottom-6 -right-2 md:right-8 w-24 h-24 rounded-full bg-secondary-fixed shadow-lg border border-outline-variant/30 flex flex-col items-center justify-center text-center animate-pulse duration-4000">
                  <span className="material-symbols-outlined text-secondary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                    diamond
                  </span>
                  <span className="text-[9px] font-bold tracking-widest text-on-secondary-fixed uppercase mt-1">
                    Pure gold
                  </span>
                </div>
              </div>

              {/* Right Column (Editorial Copy + Capsule Stats) */}
              <div className="lg:col-span-6 order-1 lg:order-2 space-y-8">
                <div className="space-y-4">
                  <span className="font-label-md text-label-md text-secondary uppercase tracking-[0.2em] mb-2 block">The Genesis</span>
                  <h2 className="font-playfair text-4xl md:text-5xl font-semibold text-on-surface leading-tight">
                    Molecular Artistry: <br />
                    Born of Heat, Pure as Light.
                  </h2>
                </div>
                
                <div className="space-y-6 font-body-md text-body-md text-on-surface-variant leading-relaxed">
                  <p>
                    Our journey begins in the lab, where we replicate the immense heat and pressure of the Earth&apos;s mantle. This is not &quot;artificial&quot;&mdash;it is identical. Atom for atom, our diamonds possess the same chemical, physical, and optical properties as mined stones.
                  </p>
                  <p>
                    By choosing laboratory artistry, we bypass the environmental devastation and human rights concerns of traditional mining, delivering a stone of unparalleled purity and a conscience that shines just as bright.
                  </p>
                </div>

                <div className="pt-6 grid grid-cols-2 gap-6">
                  <div className="glass-card border border-outline-variant/20 p-5 rounded-2xl flex items-center space-x-4 hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-primary">eco</span>
                    </div>
                    <div>
                      <h4 className="font-playfair text-2xl font-bold text-primary">0%</h4>
                      <p className="text-[11px] font-bold tracking-wider text-on-surface-variant uppercase">Mining Impact</p>
                    </div>
                  </div>
                  <div className="glass-card border border-outline-variant/20 p-5 rounded-2xl flex items-center space-x-4 hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-primary">verified</span>
                    </div>
                    <div>
                      <h4 className="font-playfair text-2xl font-bold text-primary">100%</h4>
                      <p className="text-[11px] font-bold tracking-wider text-on-surface-variant uppercase">Traceable Origin</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* The Craft: Artisanal Heritage */}
        <section className="py-24 md:py-36 bg-surface-container-low overflow-hidden">
          <div className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
            <div className="flex flex-col lg:flex-row items-center gap-16">
              
              {/* Left Column (Details & Interactive Process Rows) */}
              <div className="w-full lg:w-1/2 space-y-8">
                <div className="max-w-md space-y-4">
                  <span className="font-label-md text-label-md text-primary uppercase tracking-[0.2em] mb-2 block">The Craft</span>
                  <h2 className="font-playfair text-4xl md:text-5xl font-semibold text-on-surface leading-tight">
                    Antwerp to London: <br />
                    Handcrafted Heritage
                  </h2>
                  <p className="font-body-lg text-body-md md:text-body-lg text-on-surface-variant leading-relaxed">
                    While science creates the stone, the human hand breathes life into the jewelry. Our master jewelers in Antwerp and London bring decades of heritage to every piece.
                  </p>
                </div>

                <div className="space-y-4 max-w-lg">
                  {[
                    {
                      icon: "draw",
                      title: "Hand-Sketched Originals",
                      desc: "Every collection begins as a conceptual drawing, balancing mathematical symmetry with organic beauty."
                    },
                    {
                      icon: "precision_manufacturing",
                      title: "100% Recycled Precious Metals",
                      desc: "We exclusively refine certified recycled Gold and Platinum, preventing further open-cast gold panning."
                    },
                    {
                      icon: "temp_preferences_custom",
                      title: "Made-to-Order Customization",
                      desc: "No overproduction. Each heirloom piece is custom forged, sized, and hand-mounted upon client order."
                    }
                  ].map((item, idx) => (
                    <div 
                      key={idx} 
                      className="p-5 rounded-2xl border border-outline-variant/10 bg-surface/50 hover:bg-surface hover:border-secondary/30 transition-all duration-300 group flex items-start space-x-4 cursor-pointer hover:shadow-sm"
                    >
                      <div className="w-10 h-10 rounded-full bg-secondary-container/10 flex items-center justify-center text-secondary group-hover:bg-secondary group-hover:text-on-secondary transition-all shrink-0">
                        <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                          {item.icon}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-label-md text-label-md font-bold text-on-surface group-hover:text-primary transition-colors">
                          {item.title}
                        </h4>
                        <p className="text-body-sm text-on-surface-variant/80 leading-relaxed">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column (Artisan Collage with Organic Canvas Shape) */}
              <div className="w-full lg:w-1/2 relative flex justify-center lg:justify-end">
                <div className="aspect-square bg-surface-container-high rounded-full absolute -right-20 -top-20 w-80 h-80 z-0"></div>
                <div className="relative z-10 glass-card p-5 rounded-[3rem] border border-white/50 shadow-xl max-w-md w-full">
                  <div className="organic-artisan-shape overflow-hidden aspect-[4/5] border border-outline-variant/20 shadow-inner group">
                    <img 
                      alt="Artisan at work" 
                      className="w-full h-full object-cover transition-transform duration-[1500ms] group-hover:scale-105" 
                      src="https://lh3.googleusercontent.com/aida/AP1WRLtDa-xJ0m-Ux1OPoxE3hInEDxJQgPTKhTMKpqEATJfNNjb31uS5kn1eOPBfB6AgVGveDCW5stL6t-ysiCI5RzwsDC3cTzMZlpIXP7qsnnArqYy8SY8iE_Ic9TOpAJ1KjpBgwuL6eooUeV5hES9zbTyYHbqfo855UfVkCr5O4TRs2_4qOBRuoIglOM2zoGm_FrMJgz1A0DxcZ4yj1LMN0WerFb47tX0MPiELtGHUw_cp2muikUlAxgSjakw"
                    />
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* The Commitment: Radical Transparency */}
        <section className="py-24 md:py-36 bg-background">
          <div className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto text-center mb-16 space-y-4">
            <span className="font-label-md text-label-md text-secondary uppercase tracking-[0.2em] mb-2 block">The Commitment</span>
            <h2 className="font-playfair text-4xl md:text-5xl font-semibold text-on-surface">Radical Transparency</h2>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl mx-auto leading-relaxed">
              We don&apos;t just claim sustainability; we certify it. Every diamond over 0.5ct comes with a full GIA certification report and a digital provenance passport tracking its molecular birth.
            </p>
          </div>
          
          <div className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: "eco",
                title: "Carbon Neutral",
                desc: "Our labs are powered by 100% renewable wind and solar energy, making our diamond crystallization process carbon-positive."
              },
              {
                icon: "verified",
                title: "GIA Certified",
                desc: "Rigorous third-party certification ensures the 4Cs of your lab-grown diamond meet the highest world standards."
              },
              {
                icon: "history_edu",
                title: "Conflict-Free Sourcing",
                desc: "100% guaranteed ethical provenance with zero ties to armed conflict, environmental destruction, or exploitative labor."
              }
            ].map((pillar, idx) => (
              <div 
                key={idx} 
                className="p-8 rounded-3xl bg-surface-container-low border border-outline-variant/30 hover:border-secondary/45 hover:-translate-y-2 hover:shadow-xl transition-all duration-300 group relative overflow-hidden"
              >
                <div className="w-14 h-14 rounded-full bg-secondary-fixed flex items-center justify-center mb-6 group-hover:scale-110 transition-transform relative">
                  <div className="absolute inset-0 rounded-full bg-secondary/10 blur-sm group-hover:blur-md transition-all" />
                  <span className="material-symbols-outlined text-on-secondary-fixed-variant text-2xl relative z-10">
                    {pillar.icon}
                  </span>
                </div>
                <h3 className="font-playfair text-2xl font-semibold text-on-surface mb-4">
                  {pillar.title}
                </h3>
                <p className="font-body-md text-body-sm md:text-body-md text-on-surface-variant leading-relaxed mb-6">
                  {pillar.desc}
                </p>
                <div className="h-[2px] w-12 bg-secondary/20 rounded-full group-hover:w-20 transition-all duration-300" />
              </div>
            ))}
          </div>
        </section>

        {/* Newsletter / CTA */}
        <section className="py-24 bg-surface-container-high relative overflow-hidden">
          {/* Subtle background wash */}
          <div className="absolute inset-0 bg-gradient-to-br from-secondary-container/5 via-transparent to-primary-container/5 pointer-events-none" />
          
          <div className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto text-center relative z-10">
            <div className="max-w-3xl mx-auto glass-card p-12 md:p-20 rounded-[3rem] border border-white/50 shadow-xl space-y-6">
              <h2 className="font-playfair text-4xl md:text-5xl font-semibold text-on-surface leading-tight">
                Be Part of the Story
              </h2>
              <p className="font-body-lg text-body-md md:text-body-lg text-on-surface-variant max-w-xl mx-auto leading-relaxed">
                Join our inner circle for exclusive previews of new collection drops and molecular stories from our master artisans.
              </p>
              
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto pt-6">
                <input 
                  className="flex-grow bg-surface-container-low border border-outline-variant/40 rounded-xl px-6 py-4 font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant/40 outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all" 
                  placeholder="Your email address" 
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <button 
                  className="bg-primary text-on-primary px-10 py-4.5 rounded-full font-label-md text-label-md hover:shadow-lg transition-all font-bold tracking-wider cursor-pointer hover:bg-primary-container" 
                  type="submit"
                >
                  Subscribe
                </button>
              </form>

              {/* Toast Subscription Success Alert */}
              {subscribed && (
                <div className="bg-secondary text-white px-6 py-3 rounded-full text-label-md font-medium shadow-md transition-opacity animate-bounce max-w-sm mx-auto mt-4">
                  Thank you for joining the Conscious Circle!
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
      
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
