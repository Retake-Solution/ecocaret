"use client";

import React, { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import ProfileDialog from "@/components/ProfileDialog";
import { useAppDispatch, useAppSelector } from "@/lib/store";
import { setCartOpen, addToCart, removeFromCart, clearCart } from "@/lib/features/cart/cartSlice";
import { setProfileOpen } from "@/lib/features/profile/profileSlice";

type CutOption = "round" | "oval" | "pear";
type MetalOption = "Rose Gold" | "Platinum" | "Yellow Gold";

interface CutDetail {
  title: string;
  icon: string;
  image: string;
  desc: string;
}

interface MetalDetail {
  name: MetalOption;
  hex: string;
  cost: number;
}

const CUTS: Record<CutOption, CutDetail> = {
  round: {
    title: "Round",
    icon: "circle",
    image: "https://lh3.googleusercontent.com/aida/AP1WRLtYUW-Vc7nSagdGIsLWiUqUrlzb_s9R39aUUG1zd7Bb07tN6aZiQTkMsGQeM_2Isl3CJb10mA92Jffxof-pjjYIj1HpDJu16YAIXeMgUxU-yr-IR1PG46h5bMPuzrqR-9fn_AwoI1eRuOJeLvqgb1PoXeUPFWnBX4WpuFmzh5ojimVVvzvrxx7bsXSAsH8zLIGlxUSGHnRRCkDIKF3ql9UXdaGhQ-xCOJTrTiRfna3UmChmcbGj2WtRZ9A",
    desc: "A 2.15-carat sustainable brilliant-cut diamond set in handcrafted platinum with intricate pavé detailing."
  },
  oval: {
    title: "Oval",
    icon: "egg",
    image: "https://lh3.googleusercontent.com/aida/AP1WRLua0dfoByecNwTJZM_E7G88uPduHJg0Hs73LuqE1kbpYYyYMiBnGOI-_H7pnpabZqyYddE91RBzs2XxzezeHZVAzkyspk2Kg6PF-ulSu7BM-IgUGBcTSjfsMncjPiZSolqedzPlHMNXlJN1XTwYE1IkWmBfYRTSNdOkDcENhisLoaRE5RT2fVQ-7JK1hhZ3fyWwveLmRYEwULZfW_wrIybqUWSDZ_OfRI0YS11FC-sqQ0Bki1r-8Yw4E4Q",
    desc: "A magnificent 2.10-carat sustainable oval-cut diamond set in handcrafted gold with an elegant modern silhouette."
  },
  pear: {
    title: "Pear",
    icon: "water_drop",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDUkaorzslrYslVsDlUte883UsVwZdwvy-QzCeqHJyccKWsjudas3QbOX0Kl-RPK0Gz_GxElFQFifk1-aQd31H68cg67wfLxe8xyAIvXfp-RbfeLky5byGcwC55rPQQdcdf0Xpj4oDay9L48q3pv7Tqt5WHHLkMpoRoloo0aeMFnOWbHlovtR-Wc_pqI-tLgRI4rhsM6W9XR8NanzE2CHy1ZuEpWDiQHN-UoZDJgp3T4FPtz_4GE3KDctn9f4HHVE-bePgiHrCSdxU",
    desc: "A breathtaking 2.50-carat pear-shaped sustainable solitaire set in clean lines, maximizing light flow and sparkle."
  }
};

const METALS: MetalDetail[] = [
  { name: "Rose Gold", hex: "#E6A08A", cost: 450 },
  { name: "Platinum", hex: "#E5E4E2", cost: 0 },
  { name: "Yellow Gold", hex: "#FFD700", cost: 400 }
];

export default function CustomStudio() {
  const dispatch = useAppDispatch();
  const cartOpen = useAppSelector((state) => state.cart.isOpen);
  const profileOpen = useAppSelector((state) => state.profile.isOpen);
  const cartItems = useAppSelector((state) => state.cart.items);

  const [scrolled, setScrolled] = useState(false);
  const [activeSidebarTab, setActiveSidebarTab] = useState<"stones" | "metals" | "engraving" | "settings">("stones");
  const [activeSettingsTab, setActiveSettingsTab] = useState<"Stone" | "Metal" | "Setting">("Stone");
  const [selectedCut, setSelectedCut] = useState<CutOption>("round");
  const [selectedMetal, setSelectedMetal] = useState<MetalOption>("Platinum");
  const [zoomLevel, setZoomLevel] = useState(false);

  // Scroll logic for header solid status
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const basePrice = 12250;
  const metalCost = METALS.find((m) => m.name === selectedMetal)?.cost || 0;
  const estimatedTotal = basePrice + metalCost;

  const currentCutInfo = CUTS[selectedCut];

  const handleReserve = () => {
    // Add custom piece to Redux cart
    dispatch(
      addToCart({
        id: `custom-bespoke-${selectedCut}-${selectedMetal.replace(/\s+/g, "")}`,
        name: `Bespoke Celestia (${currentCutInfo.title} / ${selectedMetal})`,
        price: estimatedTotal,
        image: currentCutInfo.image,
      })
    );
    dispatch(setCartOpen(true));
  };

  return (
    <div className="bg-background text-on-background font-body-md selection:bg-secondary-fixed selection:text-on-secondary-fixed min-h-screen flex flex-col relative overflow-x-hidden">
      {/* Reusable Header */}
      <Header
        scrolled={scrolled}
        setCartOpen={(open) => dispatch(setCartOpen(open))}
        setProfileOpen={(open) => dispatch(setProfileOpen(open))}
        cartItemsCount={cartItems.reduce((acc, curr) => acc + curr.quantity, 0)}
      />

      {/* Main Studio Area */}
      <div className="flex-grow pt-20 min-h-screen flex flex-col lg:flex-row relative">
        {/* Left Sidebar Navigator */}
        <aside className="fixed left-0 top-20 h-[calc(100vh-80px)] w-72 bg-surface-container-low border-r border-surface-container-highest flex flex-col gap-unit py-8 px-4 hidden lg:flex z-20">
          <div className="mb-8">
            <span className="font-label-md text-label-md uppercase tracking-widest text-secondary block font-bold">
              Custom Studio
            </span>
            <span className="font-body-md text-on-surface-variant">
              Handcrafted Excellence
            </span>
          </div>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => {
                setActiveSidebarTab("stones");
                setActiveSettingsTab("Stone");
              }}
              className={`flex items-center gap-3 p-3 rounded-lg font-label-md transition-all active:scale-95 cursor-pointer ${
                activeSidebarTab === "stones"
                  ? "text-on-secondary-container bg-secondary-container font-bold"
                  : "text-on-surface-variant hover:bg-surface-container-high"
              }`}
            >
              <span className="material-symbols-outlined">diamond</span>
              Stones
            </button>
            <button
              onClick={() => {
                setActiveSidebarTab("metals");
                setActiveSettingsTab("Metal");
              }}
              className={`flex items-center gap-3 p-3 rounded-lg font-label-md transition-all active:scale-95 cursor-pointer ${
                activeSidebarTab === "metals"
                  ? "text-on-secondary-container bg-secondary-container font-bold"
                  : "text-on-surface-variant hover:bg-surface-container-high"
              }`}
            >
              <span className="material-symbols-outlined">architecture</span>
              Metals
            </button>
            <button
              onClick={() => {
                setActiveSidebarTab("settings");
                setActiveSettingsTab("Setting");
              }}
              className={`flex items-center gap-3 p-3 rounded-lg font-label-md transition-all active:scale-95 cursor-pointer ${
                activeSidebarTab === "settings"
                  ? "text-on-secondary-container bg-secondary-container font-bold"
                  : "text-on-surface-variant hover:bg-surface-container-high"
              }`}
            >
              <span className="material-symbols-outlined">settings_input_component</span>
              Settings
            </button>
          </div>
          <div className="mt-auto">
            <button
              onClick={handleReserve}
              className="w-full bg-primary text-white py-4 rounded-lg font-label-md hover:bg-primary/90 transition-all font-bold cursor-pointer"
            >
              Review Design
            </button>
          </div>
        </aside>

        {/* Visualizer Canvas Grid */}
        <section className="flex-1 lg:ml-72 flex flex-col md:flex-row min-h-[calc(100vh-80px)]">
          {/* Left Panel: visualizer preview */}
          <div className="relative w-full md:w-3/5 h-[50vh] md:h-auto bg-surface-dim overflow-hidden flex items-center justify-center">
            <img
              alt="The Bespoke Ring View"
              className={`w-full h-full object-cover transition-transform duration-700 ${
                zoomLevel ? "scale-125" : "scale-100"
              }`}
              src={currentCutInfo.image}
            />
            {/* Floating Info Overlay (Details view) */}
            <div className="absolute bottom-8 left-8 p-6 backdrop-blur-md bg-white/70 rounded-xl border border-white/20 shadow-sm max-w-xs transition-opacity duration-300">
              <h1 className="font-headline-sm text-headline-sm text-primary mb-2">
                The Celestia
              </h1>
              <p className="font-body-md text-on-surface-variant text-sm leading-relaxed">
                {currentCutInfo.desc}
              </p>
            </div>

            {/* Action control buttons overlay */}
            <div className="absolute top-8 right-8 flex flex-col gap-4">
              <button
                onClick={() => setZoomLevel(!zoomLevel)}
                className="w-12 h-12 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center text-on-surface border border-white/20 hover:bg-white/50 transition-all cursor-pointer shadow-sm"
              >
                <span className="material-symbols-outlined">
                  {zoomLevel ? "zoom_out" : "zoom_in"}
                </span>
              </button>
              <button
                onClick={() => alert("Rotating 3D Visualizer model...")}
                className="w-12 h-12 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center text-on-surface border border-white/20 hover:bg-white/50 transition-all cursor-pointer shadow-sm"
              >
                <span className="material-symbols-outlined">3d_rotation</span>
              </button>
            </div>
          </div>

          {/* Right Panel: config parameters selectors */}
          <div className="w-full md:w-2/5 p-8 md:p-12 overflow-y-auto bg-surface-container-lowest">
            <div className="max-w-md mx-auto h-full flex flex-col justify-between">
              <div>
                <header className="mb-10">
                  <h2 className="font-headline-md text-headline-md text-secondary mb-2">
                    Your Bespoke Selection
                  </h2>
                  <p className="text-on-surface-variant font-body-md">
                    Configure your one-of-a-kind sustainable heirloom.
                  </p>
                </header>

                {/* Tabs toggler */}
                <div className="flex gap-6 border-b border-outline-variant mb-8 font-medium">
                  <button
                    onClick={() => {
                      setActiveSettingsTab("Stone");
                      setActiveSidebarTab("stones");
                    }}
                    className={`pb-4 border-b-2 font-label-md cursor-pointer transition-all ${
                      activeSettingsTab === "Stone"
                        ? "border-primary text-primary font-bold"
                        : "border-transparent text-on-surface-variant hover:text-primary"
                    }`}
                  >
                    Stone
                  </button>
                  <button
                    onClick={() => {
                      setActiveSettingsTab("Metal");
                      setActiveSidebarTab("metals");
                    }}
                    className={`pb-4 border-b-2 font-label-md cursor-pointer transition-all ${
                      activeSettingsTab === "Metal"
                        ? "border-primary text-primary font-bold"
                        : "border-transparent text-on-surface-variant hover:text-primary"
                    }`}
                  >
                    Metal
                  </button>
                  <button
                    onClick={() => {
                      setActiveSettingsTab("Setting");
                      setActiveSidebarTab("settings");
                    }}
                    className={`pb-4 border-b-2 font-label-md cursor-pointer transition-all ${
                      activeSettingsTab === "Setting"
                        ? "border-primary text-primary font-bold"
                        : "border-transparent text-on-surface-variant hover:text-primary"
                    }`}
                  >
                    Setting
                  </button>
                </div>

                {/* Cuts Selection Grid */}
                <div className="space-y-8">
                  {activeSettingsTab === "Stone" && (
                    <div>
                      <label className="font-label-md text-label-md text-secondary uppercase mb-4 block font-semibold">
                        Select Cut
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {(Object.keys(CUTS) as CutOption[]).map((key) => {
                          const cut = CUTS[key];
                          const active = selectedCut === key;
                          return (
                            <div
                              key={key}
                              onClick={() => setSelectedCut(key)}
                              className={`cursor-pointer border-2 p-4 rounded-xl flex flex-col items-center gap-2 transition-all active:scale-95 ${
                                active
                                  ? "border-primary bg-primary-fixed"
                                  : "border-outline-variant hover:border-secondary bg-transparent"
                              }`}
                            >
                              <span
                                className={`material-symbols-outlined scale-125 ${
                                  active ? "text-primary" : "text-secondary"
                                }`}
                                style={{
                                  fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0"
                                }}
                              >
                                {cut.icon}
                              </span>
                              <span className="font-label-sm text-label-sm font-semibold">
                                {cut.title}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Metal Selection List */}
                  {activeSettingsTab === "Metal" && (
                    <div>
                      <label className="font-label-md text-label-md text-secondary uppercase mb-4 block font-semibold">
                        Choose Metal
                      </label>
                      <div className="space-y-3">
                        {METALS.map((metalObj, idx) => {
                          const active = selectedMetal === metalObj.name;
                          return (
                            <div
                              key={idx}
                              onClick={() => setSelectedMetal(metalObj.name)}
                              className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-all active:scale-[0.99] ${
                                active
                                  ? "border-2 border-primary bg-primary-fixed"
                                  : "border-outline-variant hover:bg-surface-container bg-transparent"
                              }`}
                            >
                              <div className="flex items-center gap-4">
                                <div
                                  className="w-8 h-8 rounded-full shadow-inner border border-black/10"
                                  style={{ backgroundColor: metalObj.hex }}
                                ></div>
                                <span className="font-label-md font-semibold">
                                  {metalObj.name}
                                </span>
                              </div>
                              <span
                                className={`font-label-md ${
                                  active ? "text-primary font-bold" : "text-on-surface-variant text-sm"
                                }`}
                              >
                                {metalObj.cost === 0 ? "Included" : `+$${metalObj.cost}`}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Setting Description / Options */}
                  {activeSettingsTab === "Setting" && (
                    <div>
                      <label className="font-label-md text-label-md text-secondary uppercase mb-4 block font-semibold">
                        Choose Setting Style
                      </label>
                      <div className="p-4 bg-surface-container-low rounded-xl border border-outline-variant/30 space-y-4">
                        <h4 className="font-label-md text-label-md text-on-surface font-bold">
                          Artisan Prong Setting
                        </h4>
                        <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                          Intricately hand-forged prongs configured to lock the diamond seed
                          securely while elevating it to capture overhead brilliance. Includes
                          signature micro-pave detailing.
                        </p>
                        <div className="text-secondary font-label-sm uppercase tracking-wider font-semibold">
                          Certified Recycled Gold & Platinum
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Pricing Summary & Checkout Button */}
              <div className="mt-12 pt-8 border-t border-outline-variant">
                <div className="flex justify-between items-end mb-6">
                  <div>
                    <span className="font-label-sm text-label-sm text-on-surface-variant block uppercase tracking-wider mb-1 font-semibold">
                      Estimated Total
                    </span>
                    <span className="font-headline-md text-headline-md text-primary font-bold">
                      ${estimatedTotal.toLocaleString()}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-label-sm text-label-sm text-tertiary block font-medium">
                      Free Shipping
                    </span>
                    <span className="font-label-sm text-label-sm text-tertiary font-medium">
                      30-Day Returns
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleReserve}
                  className="w-full bg-secondary text-white py-5 rounded-lg font-label-md hover:bg-secondary/90 transition-all shadow-lg active:scale-[0.98] cursor-pointer font-bold text-center"
                >
                  Reserve Atelier Consultation
                </button>
                <p className="text-center mt-4 text-on-surface-variant font-label-sm">
                  Secure your spot for a personalized design review.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Global Footer */}
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
