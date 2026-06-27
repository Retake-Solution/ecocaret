"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

import { RoundSVG, PrincessSVG, EmeraldSVG, OvalSVG } from "../assets/DiamondShapes";

const DIAMOND_SHAPES = [
  {
    name: "Round Brilliant",
    icon: <RoundSVG />,
  },
  {
    name: "Princess Cut",
    icon: <PrincessSVG />,
  },
  {
    name: "Emerald Cut",
    icon: <EmeraldSVG />,
  },
  {
    name: "Oval Cut",
    icon: <OvalSVG />,
  }
];

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Carousel auto-play
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % DIAMOND_SHAPES.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative min-h-[100svh] md:min-h-[890px] flex items-center overflow-hidden px-margin-mobile md:px-margin-desktop py-16 md:py-24 bg-surface">
      <div className="max-w-container-max mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center relative z-10 pt-20 lg:pt-0">
        {/* Left Content Column */}
        <div className="lg:col-span-6 space-y-8 text-left">
          <div className="inline-flex items-center gap-2 bg-secondary-container/10 px-4.5 py-1.5 rounded-full border border-secondary-container/20 shadow-sm">
            <span className="w-1.5 h-1.5 bg-secondary rounded-full animate-ping"></span>
            <span className="font-label-sm text-[11px] text-on-secondary-container tracking-widest uppercase font-bold">
              The New Era of Fine Jewelry
            </span>
          </div>
          <h1 className="font-[family:var(--font-playfair-display)] font-medium text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-on-surface leading-[1.15] tracking-tight max-w-3xl">
            Sustainable <span className="text-secondary italic font-[family:var(--font-playfair-display)] font-normal">Splendor</span>,
            <br className="hidden md:inline" /> Handcrafted for Eternity
          </h1>
          <p className="font-body-lg text-body-md md:text-body-lg text-on-surface-variant max-w-md leading-relaxed">
            Discover jewelry that honors both the wearer and the world. Our
            lab-grown diamonds are set in certified 100% recycled gold, merging artisan
            heritage with modern conscience.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 pt-2">
            <Link
              href="/collections"
              className="w-full sm:w-auto bg-secondary text-on-secondary px-10 py-4.5 rounded-full font-label-md text-label-md shadow-lg shadow-secondary/15 hover:bg-on-secondary-fixed-variant hover:scale-105 active:scale-95 transition-all text-center font-bold tracking-wider"
            >
              Explore Collections
            </Link>
            <Link
              href="/our-story"
              className="w-full sm:w-auto border border-secondary/40 text-secondary px-10 py-4.5 rounded-full font-label-md text-label-md hover:bg-secondary/5 hover:border-secondary transition-all text-center block font-bold tracking-wider"
            >
              Our Philosophy
            </Link>
          </div>

          {/* Brand Trust Highlights Row */}
          <div className="pt-8 border-t border-outline-variant/30 flex flex-wrap gap-x-8 gap-y-4">
            <div className="flex items-center space-x-2.5">
              <span className="material-symbols-outlined text-secondary text-lg">workspace_premium</span>
              <span className="font-label-sm text-[11px] text-on-surface-variant uppercase tracking-wider font-bold">100% Recycled Gold</span>
            </div>
            <div className="flex items-center space-x-2.5">
              <span className="material-symbols-outlined text-secondary text-lg">science</span>
              <span className="font-label-sm text-[11px] text-on-surface-variant uppercase tracking-wider font-bold">Carbon-Neutral Diamonds</span>
            </div>
            <div className="flex items-center space-x-2.5">
              <span className="material-symbols-outlined text-secondary text-lg">auto_awesome</span>
              <span className="font-label-sm text-[11px] text-on-surface-variant uppercase tracking-wider font-bold">Artisan Handcrafted</span>
            </div>
          </div>
        </div>

        {/* Right Visual Showcase Column */}
        <div className="hidden lg:flex lg:col-span-6 relative justify-center lg:justify-end pr-4">
          {/* Main Visual Image Frame */}
          <div className="relative w-[85%] sm:w-[75%] lg:w-[80%] aspect-[4/5] bg-surface-container-high overflow-hidden rounded-[3rem] border border-outline-variant/20 shadow-xl transition-all duration-700 hover:shadow-2xl">
            <div className="w-full h-full relative">
              {DIAMOND_SHAPES.map((shape, index) => (
                <div 
                  key={shape.name}
                  className={`absolute inset-0 transition-all duration-1000 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                    index === currentSlide ? "opacity-100 scale-100" : "opacity-0 scale-105 pointer-events-none"
                  }`}
                >
                  {/* Render the SVG Icon instead of an Image */}
                  <div className="w-full h-full flex items-center justify-center mix-blend-multiply opacity-90">
                    {shape.icon}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Layered Round Crop Frame (Asymmetrical collage element) */}
          <div className="absolute top-[10%] -left-4 w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-surface bg-surface-container overflow-hidden shadow-lg hidden sm:block hover:scale-105 transition-transform duration-300 cursor-pointer">
            <img
              alt="Detailed diamond solitaire close-up"
              className="w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDUkaorzslrYslVsDlUte883UsVwZdwvy-QzCeqHJyccKWsjudas3QbOX0Kl-RPK0Gz_GxElFQFifk1-aQd31H68cg67wfLxe8xyAIvXfp-RbfeLky5byGcwC55rPQQdcdf0Xpj4oDay9L48q3pv7Tqt5WHHLkMpoRoloo0aeMFnOWbHlovtR-Wc_pqI-tLgRI4rhsM6W9XR8NanzE2CHy1ZuEpWDiQHN-UoZDJgp3T4FPtz_4GE3KDctn9f4HHVE-bePgiHrCSdxU"
            />
          </div>
        </div>
      </div>

      {/* Glowing Mesh Orbs Backdrop */}
      <div className="absolute top-12 -right-48 w-[600px] h-[600px] bg-gradient-to-br from-primary-fixed/15 to-secondary-fixed/15 blur-[120px] rounded-full -z-10 pointer-events-none animate-pulse duration-10000"></div>
      <div className="absolute bottom-12 -left-48 w-[400px] h-[400px] bg-gradient-to-tr from-secondary-fixed/20 to-tertiary-fixed/20 blur-[100px] rounded-full -z-10 pointer-events-none"></div>
    </section>
  );
}
