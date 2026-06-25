"use client";

import React, { useRef } from "react";
import Link from "next/link";

interface Product {
  id: string;
  name: string;
  price: string;
  image: string;
  specs: string;
  description: string;
}

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

interface ProductShowcaseProps {
  onProductClick?: (product: Product) => void;
}

export default function ProductShowcase({ onProductClick }: ProductShowcaseProps = {}) {
  const carouselRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -320, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: 320, behavior: "smooth" });
    }
  };

  return (
    <section id="collections" className="py-20 md:py-28 px-margin-mobile md:px-margin-desktop bg-surface">
      <div className="max-w-container-max mx-auto relative">
        {/* Title Area */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-14 gap-6">
          <div className="max-w-xl space-y-4">
            <div className="inline-flex items-center gap-2 bg-secondary-container/10 px-4 py-1 rounded-full border border-secondary-container/20">
              <span className="font-label-sm text-[11px] text-on-secondary-container tracking-widest uppercase font-bold">
                Limited Signatures
              </span>
            </div>
            <h2 className="font-[family:var(--font-playfair-display)] font-semibold text-4xl md:text-5xl text-on-surface leading-tight">
              The Signature <span className="text-secondary italic font-normal">Earth-First</span> Collection
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
              Quiet luxury defined by intentional minimalism, structural geometry, and bio-ethical diamonds.
            </p>
          </div>
          
          <div className="flex items-center space-x-6 shrink-0">
            <Link
              className="font-label-md text-label-md text-secondary border-b border-secondary/30 pb-1 hover:border-secondary transition-all font-bold tracking-wider"
              href="/collections"
            >
              View All Masterpieces
            </Link>
            
            {/* Carousel navigation buttons visible on mobile for swiping helper */}
            <div className="flex space-x-2 md:hidden">
              <button
                onClick={scrollLeft}
                className="w-10 h-10 rounded-full border border-outline-variant/60 flex items-center justify-center text-on-surface hover:bg-surface-container-low transition-colors"
                title="Scroll Left"
              >
                <span className="material-symbols-outlined text-md">chevron_left</span>
              </button>
              <button
                onClick={scrollRight}
                className="w-10 h-10 rounded-full border border-outline-variant/60 flex items-center justify-center text-on-surface hover:bg-surface-container-low transition-colors"
                title="Scroll Right"
              >
                <span className="material-symbols-outlined text-md">chevron_right</span>
              </button>
            </div>
          </div>
        </div>

        {/* Products Grid / Horizontal Slider for Mobile */}
        <div
          ref={carouselRef}
          className="flex overflow-x-auto md:grid md:grid-cols-3 gap-8 md:gap-12 pb-6 md:pb-0 snap-x snap-mandatory no-scrollbar scroll-smooth"
        >
          {products.map((product, idx) => {
            // Asymmetrical offsets for desktop
            const offsetClass =
              idx === 0
                ? "md:pt-8"
                : idx === 2
                  ? "md:pt-20"
                  : "";

            // Unique luxury shapes for card borders
            const imageContainerClass =
              idx === 0
                ? "rounded-t-[120px] rounded-b-2xl"
                : idx === 1
                  ? "rounded-[2rem]"
                  : "rounded-t-2xl rounded-b-[120px]";

            return (
              <div
                key={product.id}
                className={`w-[85vw] sm:w-[50vw] md:w-auto shrink-0 snap-center md:shrink md:snap-align-none space-y-6 transition-all duration-500 hover:-translate-y-1 ${offsetClass}`}
              >
                <Link
                  href={`/collections/${product.id}`}
                  onClick={(e) => {
                    if (onProductClick) {
                      e.preventDefault();
                      onProductClick(product);
                    }
                  }}
                  className="group block space-y-6"
                >
                  {/* Image wrapper with custom shape and subtle border highlight on hover */}
                  <div
                    className={`aspect-[4/5] bg-surface-container-low overflow-hidden relative border border-outline-variant/10 shadow-sm transition-all duration-500 group-hover:border-primary/40 group-hover:shadow-md ${imageContainerClass}`}
                  >
                    <img
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      alt={product.name}
                      src={product.image}
                    />
                    
                    {/* Hover Overlay Button */}
                    <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <span className="bg-white/95 text-on-surface font-label-sm text-[11px] uppercase tracking-wider font-bold px-6 py-3 rounded-full shadow-md backdrop-blur-sm transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                        Explore Masterpiece
                      </span>
                    </div>
                  </div>
                  
                  {/* Text details */}
                  <div className="space-y-1.5 px-1">
                    <div className="flex justify-between items-baseline gap-2">
                      <h4 className="font-[family:var(--font-playfair-display)] text-2xl font-semibold text-on-surface group-hover:text-primary transition-colors duration-300">
                        {product.name}
                      </h4>
                      <span className="font-label-md text-label-md text-secondary font-bold shrink-0">
                        {product.price}
                      </span>
                    </div>
                    <p className="font-label-sm text-[11px] text-on-surface-variant uppercase tracking-widest font-bold">
                      {product.specs}
                    </p>
                    <span className="pt-3 font-label-sm text-[12px] text-primary flex items-center gap-2 group-hover:text-secondary transition-colors font-bold uppercase tracking-wider">
                      Discover Details
                      <span className="material-symbols-outlined text-[14px] group-hover:translate-x-1 transition-transform">
                        east
                      </span>
                    </span>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
