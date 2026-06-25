"use client";

import React, { useState, useEffect } from "react";
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

  return (
    <div className="min-h-screen flex flex-col relative overflow-x-hidden bg-background text-on-background selection:bg-secondary-container selection:text-on-secondary-container">
      <style dangerouslySetInnerHTML={{ __html: `
        .glass-card {
            background: rgba(255, 248, 244, 0.6);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
        }
        .copper-gradient {
            background: linear-gradient(135deg, #894d0d 0%, #8b4e39 100%);
        }
        .tonal-elevation {
            box-shadow: 0 24px 48px -12px rgba(139, 78, 57, 0.08);
        }
      `}} />
      
      <Header
        scrolled={navScrolled}
        setCartOpen={(open) => dispatch(setCartOpen(open))}
        setProfileOpen={(open) => dispatch(setProfileOpen(open))}
        cartItemsCount={cartItems.reduce((acc, curr) => acc + curr.quantity, 0)}
      />

      <main className="flex-grow pt-20">
        {/* Hero: The Vision of Conscious Brilliance */}
        <section className="relative min-h-[921px] flex items-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img alt="Macro close-up of a diamond" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida/AP1WRLt0zyESo6pHkVilif4cjlRYBG-P06jrYSEWGr9H_UtHY8zLNEVfPRPINOhbApKi40CG9gcZs6LzfaanB_f0PtWX4y3gmpVnR-cSyLpL3PufPtmHnj2fGf9wC-f2peHAJyNr36TiXH-n-q4cgW6U9TxcEPi3E-78gDneVnjP6SPAn8UAPURBbSEHcc_M_4dCpagmbN23JS5jzMqqjNxj3k7LIRSeFxSkK7BcaeOXshq8JoBtX4Wd_n8lSNw"/>
            <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-background/20 to-transparent"></div>
          </div>
          <div className="relative z-10 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto w-full">
            <div className="max-w-2xl">
              <span className="font-label-md text-label-md text-primary uppercase tracking-[0.2em] mb-4 block">The Vision</span>
              <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface mb-8">
                Redefining Luxury through Ethics and Science.
              </h1>
              <p className="font-body-lg text-body-lg text-on-surface-variant mb-12 leading-relaxed">
                We believe that true beauty shouldn&apos;t come at the cost of our planet. Eco Caret bridges the gap between timeless craftsmanship and futuristic innovation.
              </p>
              <div className="flex items-center gap-6">
                <button className="bg-secondary text-on-secondary px-8 py-4 rounded-lg font-label-md text-label-md hover:opacity-90 transition-all shadow-lg shadow-secondary/20">
                  Explore Collections
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* The Genesis: Laboratory Artistry */}
        <section className="py-24 md:py-32 bg-surface">
          <div className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
              <div className="order-2 md:order-1">
                <div className="relative">
                  <div className="absolute -top-4 -left-4 w-24 h-24 border-t-2 border-l-2 border-secondary/30"></div>
                  <img alt="Lab grown diamond process" className="rounded-xl w-full aspect-[4/5] object-cover tonal-elevation" src="https://lh3.googleusercontent.com/aida/AP1WRLsvk8wW-v6NGesvrahUuVR8eohLUVJKTpCPWbK5cY9UhmGg8OD46eJ60ess0iUTpY7IVZ9JjGyBGIMLbKknNvnjiTZ06nTCCIQRPRdYhm9-AGE7QNExFXI9Sui3EpPKRvOxxWT7S5YNWkl2ShnmnnGXUzlwRGd31PhijpmiXMUlRk3QacCvpz7AwsBLPlvaPuEvWPwnn1vQtPTmy5dsOEPPXGuLXmvCXX8n1Xbzy6RrbNtxc9ii1c0uOTo"/>
                  <div className="absolute -bottom-4 -right-4 w-24 h-24 border-b-2 border-r-2 border-secondary/30"></div>
                </div>
              </div>
              <div className="order-1 md:order-2">
                <span className="font-label-md text-label-md text-secondary mb-4 block">The Genesis</span>
                <h2 className="font-headline-md text-headline-md text-on-surface mb-8">The Birth of Brilliance</h2>
                <div className="space-y-6">
                  <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                    Our journey begins in the lab, where we replicate the immense heat and pressure of the Earth&apos;s mantle. This is not &quot;artificial&quot;&mdash;it is identical. Atom for atom, our diamonds possess the same chemical, physical, and optical properties as mined stones.
                  </p>
                  <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                    By choosing laboratory artistry, we bypass the environmental devastation and human rights concerns of traditional mining, delivering a stone of unparalleled purity and a conscience that shines just as bright.
                  </p>
                  <div className="pt-8 grid grid-cols-2 gap-8">
                    <div>
                      <h4 className="font-headline-sm text-headline-sm text-primary mb-1">0%</h4>
                      <p className="font-label-sm text-label-sm text-on-surface-variant">Mining Impact</p>
                    </div>
                    <div>
                      <h4 className="font-headline-sm text-headline-sm text-primary mb-1">100%</h4>
                      <p className="font-label-sm text-label-sm text-on-surface-variant">Traceable Origin</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* The Craft: Artisanal Heritage */}
        <section className="py-24 md:py-32 bg-surface-container-low overflow-hidden">
          <div className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
            <div className="flex flex-col md:flex-row items-center gap-16">
              <div className="w-full md:w-1/2">
                <div className="max-w-md">
                  <span className="font-label-md text-label-md text-primary mb-4 block">The Craft</span>
                  <h2 className="font-headline-md text-headline-md text-on-surface mb-8">Artisanal Heritage</h2>
                  <p className="font-body-lg text-body-lg text-on-surface-variant mb-8 leading-relaxed">
                    While science creates the stone, the human hand breathes life into the jewelry. Our master jewelers in Antwerp and London bring decades of heritage to every piece.
                  </p>
                  <ul className="space-y-4 mb-12">
                    <li className="flex items-center gap-3 font-body-md text-body-md text-on-surface">
                      <span className="material-symbols-outlined text-secondary" style={{fontVariationSettings: "'FILL' 1"}}>draw</span>
                      Hand-sketched original designs
                    </li>
                    <li className="flex items-center gap-3 font-body-md text-body-md text-on-surface">
                      <span className="material-symbols-outlined text-secondary" style={{fontVariationSettings: "'FILL' 1"}}>precision_manufacturing</span>
                      Recycled 18k Gold & Platinum
                    </li>
                    <li className="flex items-center gap-3 font-body-md text-body-md text-on-surface">
                      <span className="material-symbols-outlined text-secondary" style={{fontVariationSettings: "'FILL' 1"}}>temp_preferences_custom</span>
                      Made-to-order philosophy
                    </li>
                  </ul>
                  <a className="inline-flex items-center gap-2 text-secondary font-label-md text-label-md hover:underline underline-offset-8 transition-all" href="#">
                    Meet our Artisans
                    <span className="material-symbols-outlined">trending_flat</span>
                  </a>
                </div>
              </div>
              <div className="w-full md:w-1/2 relative">
                <div className="aspect-square bg-surface-container-high rounded-full absolute -right-20 -top-20 w-80 h-80 z-0"></div>
                <div className="relative z-10 glass-card p-4 rounded-2xl tonal-elevation">
                  <img alt="Artisan at work" className="rounded-xl w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida/AP1WRLtDa-xJ0m-Ux1OPoxE3hInEDxJQgPTKhTMKpqEATJfNNjb31uS5kn1eOPBfB6AgVGveDCW5stL6t-ysiCI5RzwsDC3cTzMZlpIXP7qsnnArqYy8SY8iE_Ic9TOpAJ1KjpBgwuL6eooUeV5hES9zbTyYHbqfo855UfVkCr5O4TRs2_4qOBRuoIglOM2zoGm_FrMJgz1A0DxcZ4yj1LMN0WerFb47tX0MPiELtGHUw_cp2muikUlAxgSjakw"/>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* The Commitment: Radical Transparency */}
        <section className="py-24 md:py-32 bg-background">
          <div className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto text-center mb-16">
            <span className="font-label-md text-label-md text-secondary mb-4 block">The Commitment</span>
            <h2 className="font-headline-md text-headline-md text-on-surface">Radical Transparency</h2>
            <p className="mt-4 font-body-md text-body-md text-on-surface-variant max-w-2xl mx-auto">
              We don&apos;t just claim sustainability; we certify it. Every diamond over 0.5ct comes with a full GIA report and a digital provenance passport.
            </p>
          </div>
          <div className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="p-8 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 hover:border-secondary/50 transition-all group">
              <div className="w-12 h-12 rounded-full bg-secondary-fixed flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-on-secondary-fixed-variant">eco</span>
              </div>
              <h3 className="font-headline-sm text-headline-sm text-on-surface mb-4">Carbon Neutral</h3>
              <p className="font-body-md text-body-md text-on-surface-variant mb-6">
                Our labs are powered by 100% renewable wind and solar energy, making our diamonds carbon-positive.
              </p>
              <div className="h-1 w-12 bg-secondary/20 rounded-full"></div>
            </div>
            {/* Card 2 */}
            <div className="p-8 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 hover:border-secondary/50 transition-all group">
              <div className="w-12 h-12 rounded-full bg-secondary-fixed flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-on-secondary-fixed-variant">verified</span>
              </div>
              <h3 className="font-headline-sm text-headline-sm text-on-surface mb-4">GIA Certified</h3>
              <p className="font-body-md text-body-md text-on-surface-variant mb-6">
                Rigorous third-party certification ensures the 4Cs of your diamond meet the highest world standards.
              </p>
              <div className="h-1 w-12 bg-secondary/20 rounded-full"></div>
            </div>
            {/* Card 3 */}
            <div className="p-8 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 hover:border-secondary/50 transition-all group">
              <div className="w-12 h-12 rounded-full bg-secondary-fixed flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-on-secondary-fixed-variant">history_edu</span>
              </div>
              <h3 className="font-headline-sm text-headline-sm text-on-surface mb-4">Conflict-Free</h3>
              <p className="font-body-md text-body-md text-on-surface-variant mb-6">
                100% guaranteed ethical sourcing with zero ties to armed conflict or exploitative labor practices.
              </p>
              <div className="h-1 w-12 bg-secondary/20 rounded-full"></div>
            </div>
          </div>
        </section>

        {/* Newsletter / CTA */}
        <section className="py-24 bg-surface-container-highest">
          <div className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto text-center">
            <div className="max-w-3xl mx-auto glass-card p-12 rounded-3xl border border-white/40">
              <h2 className="font-headline-md text-headline-md text-on-surface mb-4">Be Part of the Story</h2>
              <p className="font-body-md text-body-md text-on-surface-variant mb-8">
                Join our inner circle for exclusive previews of new collections and stories from our atelier.
              </p>
              <form className="flex flex-col md:flex-row gap-4 max-w-lg mx-auto">
                <input className="flex-grow bg-surface border-none border-b border-outline-variant focus:ring-0 focus:border-secondary rounded-lg px-6 py-4 font-body-md text-body-md" placeholder="Your email address" type="email"/>
                <button className="bg-primary text-on-primary px-8 py-4 rounded-lg font-label-md text-label-md hover:opacity-90 transition-all" type="submit">
                  Subscribe
                </button>
              </form>
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
