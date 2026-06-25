"use client";

import React from "react";

export default function AtelierJourney() {
  const handleLaunchBespoke = () => {
    alert("Launching Bespoke Jewelry Configurator...");
  };

  const handleTraceLedger = () => {
    alert("Displaying Blockchain Trace Ledger...");
  };

  return (
    <section
      id="atelier"
      className="py-20 md:py-28 px-margin-mobile md:px-margin-desktop bg-surface-container-low"
    >
      <div className="max-w-container-max mx-auto">
        {/* Header */}
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 bg-primary-fixed/20 px-4 py-1.5 rounded-full border border-primary-fixed/30 shadow-sm">
            <span className="font-label-sm text-[11px] text-on-primary-fixed-variant tracking-widest uppercase font-bold">
              The Path of Integrity
            </span>
          </div>
          <h2 className="font-[family:var(--font-playfair-display)] font-semibold text-4xl md:text-5xl text-on-surface leading-tight">
            The Journey of Conscious Luxury
          </h2>
          <div className="w-16 h-0.5 bg-secondary mx-auto"></div>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 auto-rows-auto md:auto-rows-[250px]">
          {/* Card 1: Synthesis (Step 1) - Large Image card */}
          <div className="md:col-span-8 md:row-span-2 group relative overflow-hidden rounded-[2.5rem] border border-outline-variant/30 shadow-md min-h-[420px] md:min-h-0">
            <div className="absolute inset-0 z-0">
              <img
                className="w-full h-full object-cover transition-transform duration-[1000ms] group-hover:scale-105"
                alt="Synthesis laboratory chamber with glowing diamond plasma structures"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDAWlNOc4489-VsatIVLAVFA_vBxJWdiO5hStUnz1rqoMjeu1UFDbMtdKuxVnL8KP4-KasGw9GH0SyFUeoK9Yh5jmMghtWXoy1L-eBn3JoID0SWOf1JxOS2kA_FDhrpIehMoyLHCWWbw-DEEzsmMc7GEjUngp-HqAQ47LlSWwHwpI9fjN4_ok88ItfgM5-SlcwhaFjQlolapYCd9c5dOzjXbp_BVB4je9dhjHv6-KWSBMxcBRQD1Qd-RM4XHy-DVQW7kRDey_tSEhk"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
            </div>
            <div className="absolute bottom-0 left-0 p-8 md:p-10 z-10 space-y-3">
              <span className="font-label-sm text-[11px] text-primary-fixed mb-1 block font-bold uppercase tracking-wider">
                Step 01: Molecular Synthesis
              </span>
              <h3 className="font-[family:var(--font-playfair-display)] text-3xl font-semibold text-white">
                Molecular Brilliance
              </h3>
              <p className="font-body-md text-white/70 max-w-lg leading-relaxed">
                Witness the birth of perfection in our carbon-neutral laboratories. By replicating earth’s natural thermal dynamics, we cultivate diamond gems of supreme atomic purity.
              </p>
            </div>
          </div>

          {/* Card 2: Artisan Cut (Step 2) - Dark premium layout */}
          <div className="md:col-span-4 md:row-span-1 group relative overflow-hidden rounded-[2rem] bg-inverse-surface text-inverse-on-surface border border-outline/10 p-8 flex flex-col justify-between transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
            <div className="flex justify-between items-start">
              <span className="material-symbols-outlined text-primary text-4xl animate-pulse">
                diamond
              </span>
              <span className="font-label-sm text-[10px] bg-primary/20 text-primary-fixed px-3 py-1 rounded-full uppercase tracking-wider font-bold">
                Step 02: Design
              </span>
            </div>
            <div>
              <h3 className="font-[family:var(--font-playfair-display)] text-2xl font-semibold text-white mb-2">
                Artisan Faceting
              </h3>
              <p className="font-label-sm text-label-sm text-inverse-on-surface/70 leading-relaxed">
                Every single facet is hand-polished to perfection by master cutters, ensuring unparalleled scintillation and light performance.
              </p>
            </div>
          </div>

          {/* Card 3: Circular Metallurgy (Step 3) - Tonal Gold style */}
          <div className="md:col-span-4 md:row-span-1 group relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-surface-container to-surface-container-high border border-outline-variant/30 p-8 flex flex-col justify-between transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
            <div className="flex justify-between items-start">
              <span className="material-symbols-outlined text-secondary text-4xl">
                hardware
              </span>
              <span className="font-label-sm text-[10px] bg-secondary-fixed/50 text-on-secondary-fixed-variant px-3 py-1 rounded-full uppercase tracking-wider font-bold">
                Step 03: Metallurgy
              </span>
            </div>
            <div>
              <h3 className="font-[family:var(--font-playfair-display)] text-2xl font-semibold text-on-surface mb-2">
                Circular Metallurgy
              </h3>
              <p className="font-label-sm text-label-sm text-on-surface-variant leading-relaxed">
                We exclusively refine and work with certified 100% recycled 18k Gold and Platinum, entirely eliminating destructive mining practices.
              </p>
            </div>
          </div>

          {/* Card 4: Blockchain Provenance (Step 4) - Detailed step link */}
          <div
            onClick={handleTraceLedger}
            className="md:col-span-5 md:row-span-1 bg-surface rounded-[2rem] border border-outline-variant/30 p-8 flex items-center gap-6 group transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer hover:border-primary/45"
          >
            <div className="w-18 h-18 rounded-2xl bg-surface-container flex-shrink-0 flex items-center justify-center border border-outline-variant/30 group-hover:bg-primary group-hover:text-on-primary transition-all duration-300 shadow-sm">
              <span className="material-symbols-outlined text-secondary text-3xl group-hover:text-on-primary transition-colors">
                verified
              </span>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center space-x-2">
                <h3 className="font-[family:var(--font-playfair-display)] text-xl font-semibold text-on-surface">
                  Blockchain Provenance
                </h3>
                <span className="material-symbols-outlined text-xs text-secondary opacity-0 group-hover:opacity-100 transition-opacity translate-x-[-4px] group-hover:translate-x-0 duration-300">
                  arrow_forward
                </span>
              </div>
              <p className="font-label-sm text-[12px] text-on-surface-variant leading-relaxed">
                Trace every gem’s story from initial seed to final setting. Access your secure digital certificate ledger instantly.
              </p>
            </div>
          </div>

          {/* Card 5: Bespoke Customization CTA */}
          <div
            onClick={handleLaunchBespoke}
            className="md:col-span-7 md:row-span-1 bg-secondary text-on-secondary rounded-[2rem] p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 sm:gap-4 group overflow-hidden cursor-pointer hover:bg-on-secondary-fixed-variant transition-all duration-300 hover:shadow-lg"
          >
            <div className="space-y-3 max-w-md">
              <span className="font-label-sm text-[10px] uppercase tracking-widest font-bold opacity-80 block">
                Bespoke Design Service
              </span>
              <h3 className="font-[family:var(--font-playfair-display)] text-2xl md:text-3xl font-semibold leading-none">
                Curate Your Custom Legacy
              </h3>
              <p className="font-body-md text-sm opacity-80 leading-relaxed">
                Collaborate one-on-one with our master designers to craft a unique handcrafted heirloom.
              </p>
            </div>
            <button className="w-16 h-16 rounded-full bg-white text-secondary flex items-center justify-center group-hover:bg-primary group-hover:text-on-primary group-hover:scale-110 transition-all duration-300 shadow-md shrink-0 self-end sm:self-auto cursor-pointer">
              <span className="material-symbols-outlined">
                arrow_forward
              </span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
