"use client";

import React, { useState } from "react";
import { ApiProduct } from "@/types";

interface ProductAccordionProps {
  product: ApiProduct;
  selectedPurity: string;
  selectedMetalColor: string;
}

const formatLabel = (value?: string) =>
  value
    ? value
        .replace(/[_-]/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase())
    : "";

export default function ProductAccordion({
  product,
  selectedPurity,
  selectedMetalColor,
}: ProductAccordionProps) {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    description: true,
    specifications: false,
    sustainability: false,
    shippingCare: false,
  });

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const primaryStone = product.productStones?.[0]?.stone;

  return (
    <div className="mt-8 border-t border-outline-variant/30">
      {/* Description Accordion */}
      <div className="border-b border-outline-variant/30">
        <button
          onClick={() => toggleSection("description")}
          className="w-full flex items-center justify-between py-5 text-left focus:outline-none group cursor-pointer"
        >
          <span className="flex items-center space-x-3 text-on-surface font-semibold font-label-md text-label-md group-hover:text-primary transition-colors">
            <span className="material-symbols-outlined text-primary/80">auto_stories</span>
            <span>The Design Story</span>
          </span>
          <span className={`material-symbols-outlined text-on-surface-variant transition-transform duration-300 ${openSections.description ? "rotate-180" : ""}`}>
            expand_more
          </span>
        </button>
        <div className={`grid transition-all duration-300 ease-in-out ${openSections.description ? "grid-rows-[1fr] opacity-100 pb-6" : "grid-rows-[0fr] opacity-0"}`}>
          <div className="overflow-hidden">
            <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
              {product.description || product.shortDescription || "A beautiful, ethically sourced masterpiece designed to bring out classic elegance with modern sustainability."}
            </p>
          </div>
        </div>
      </div>

      {/* Specifications Accordion */}
      <div className="border-b border-outline-variant/30">
        <button
          onClick={() => toggleSection("specifications")}
          className="w-full flex items-center justify-between py-5 text-left focus:outline-none group cursor-pointer"
        >
          <span className="flex items-center space-x-3 text-on-surface font-semibold font-label-md text-label-md group-hover:text-primary transition-colors">
            <span className="material-symbols-outlined text-primary/80">tune</span>
            <span>Specifications & Details</span>
          </span>
          <span className={`material-symbols-outlined text-on-surface-variant transition-transform duration-300 ${openSections.specifications ? "rotate-180" : ""}`}>
            expand_more
          </span>
        </button>
        <div className={`grid transition-all duration-300 ease-in-out ${openSections.specifications ? "grid-rows-[1fr] opacity-100 pb-6" : "grid-rows-[0fr] opacity-0"}`}>
          <div className="overflow-hidden">
            <div className="grid grid-cols-2 gap-x-8 gap-y-3 font-body-sm text-body-sm text-on-surface-variant">
              <div className="flex justify-between border-b border-outline-variant/10 pb-1">
                <span className="font-medium text-on-surface-variant/80">SKU</span>
                <span className="text-on-surface font-medium">{product.sku || "N/A"}</span>
              </div>
              <div className="flex justify-between border-b border-outline-variant/10 pb-1">
                <span className="font-medium text-on-surface-variant/80">Metal</span>
                <span className="text-on-surface font-medium">{selectedPurity} {formatLabel(selectedMetalColor)} Gold</span>
              </div>
              <div className="flex justify-between border-b border-outline-variant/10 pb-1">
                <span className="font-medium text-on-surface-variant/80">Stone Type</span>
                <span className="text-on-surface font-medium">{formatLabel(product.stoneType) || "Ethical Gemstone"}</span>
              </div>
              <div className="flex justify-between border-b border-outline-variant/10 pb-1">
                <span className="font-medium text-on-surface-variant/80">Carat Weight</span>
                <span className="text-on-surface font-medium">{(product.totalStoneCaratWeight || primaryStone?.caratWeight || 0).toFixed(2)} ct</span>
              </div>
              <div className="flex justify-between border-b border-outline-variant/10 pb-1">
                <span className="font-medium text-on-surface-variant/80">Clarity & Color</span>
                <span className="text-on-surface font-medium">{[primaryStone?.color, primaryStone?.clarity].filter(Boolean).join(" / ") || "N/A"}</span>
              </div>
              <div className="flex justify-between border-b border-outline-variant/10 pb-1">
                <span className="font-medium text-on-surface-variant/80">Shape</span>
                <span className="text-on-surface font-medium">{formatLabel(product.shape || primaryStone?.shape || "N/A")}</span>
              </div>
            </div>
            {product.productStones && product.productStones.length > 0 && (
              <div className="mt-4 border-t border-outline-variant/10 pt-4">
                <h4 className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface font-semibold mb-2">Detailed Stone Setup</h4>
                <div className="space-y-2">
                  {product.productStones.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-body-sm text-on-surface-variant">
                      <span>{item.stone.name} ({formatLabel(item.stoneRole)})</span>
                      <span>{item.caratWeight} ct · {item.stone.clarity} · {item.stone.cut}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sustainability Accordion */}
      <div className="border-b border-outline-variant/30">
        <button
          onClick={() => toggleSection("sustainability")}
          className="w-full flex items-center justify-between py-5 text-left focus:outline-none group cursor-pointer"
        >
          <span className="flex items-center space-x-3 text-on-surface font-semibold font-label-md text-label-md group-hover:text-primary transition-colors">
            <span className="material-symbols-outlined text-primary/80">eco</span>
            <span>Ethical Integrity & Sourcing</span>
          </span>
          <span className={`material-symbols-outlined text-on-surface-variant transition-transform duration-300 ${openSections.sustainability ? "rotate-180" : ""}`}>
            expand_more
          </span>
        </button>
        <div className={`grid transition-all duration-300 ease-in-out ${openSections.sustainability ? "grid-rows-[1fr] opacity-100 pb-6" : "grid-rows-[0fr] opacity-0"}`}>
          <div className="overflow-hidden">
            <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed mb-4">
              Eco Caret pieces represent a promise of conflict-free luxury, sustainable sourcing, and minimal carbon footprint.
            </p>
            <ul className="space-y-3 font-body-sm text-body-sm text-on-surface-variant">
              <li className="flex items-start space-x-2.5">
                <span className="material-symbols-outlined text-primary text-lg mt-0.5">check_circle</span>
                <div>
                  <strong className="text-on-surface font-semibold block">100% Conflict-Free Lab Grown Diamonds</strong>
                  <span>Chemically, physically, and optically identical to mined diamonds, without their ecological cost.</span>
                </div>
              </li>
              <li className="flex items-start space-x-2.5">
                <span className="material-symbols-outlined text-primary text-lg mt-0.5">check_circle</span>
                <div>
                  <strong className="text-on-surface font-semibold block">Recycled Precious Metals</strong>
                  <span>We exclusively use 100% recycled Gold and Silver to prevent destructive open-cast mining.</span>
                </div>
              </li>
              <li className="flex items-start space-x-2.5">
                <span className="material-symbols-outlined text-primary text-lg mt-0.5">check_circle</span>
                <div>
                  <strong className="text-on-surface font-semibold block">Eco-Conscious Packaging</strong>
                  <span>Shipped in 100% biodegradable, plastic-free gift packaging made from sustainable wood and hemp fibers.</span>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Delivery & Care Accordion */}
      <div className="border-b border-outline-variant/30">
        <button
          onClick={() => toggleSection("shippingCare")}
          className="w-full flex items-center justify-between py-5 text-left focus:outline-none group cursor-pointer"
        >
          <span className="flex items-center space-x-3 text-on-surface font-semibold font-label-md text-label-md group-hover:text-primary transition-colors">
            <span className="material-symbols-outlined text-primary/80">local_shipping</span>
            <span>Shipping, Returns & Care</span>
          </span>
          <span className={`material-symbols-outlined text-on-surface-variant transition-transform duration-300 ${openSections.shippingCare ? "rotate-180" : ""}`}>
            expand_more
          </span>
        </button>
        <div className={`grid transition-all duration-300 ease-in-out ${openSections.shippingCare ? "grid-rows-[1fr] opacity-100 pb-6" : "grid-rows-[0fr] opacity-0"}`}>
          <div className="overflow-hidden">
            <div className="space-y-4 font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
              <div>
                <h4 className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface font-semibold mb-1">Shipping & Returns</h4>
                <p>
                  Complimentary fully insured shipping on all orders. This piece is {product.isMadeToOrder ? `made-to-order and will be hand-crafted and delivered in approximately ${product.estimatedDeliveryDays || 10} days.` : "ready to ship and will be delivered in 3-5 business days."} We also offer a 30-day stress-free return and exchange policy.
                </p>
              </div>
              <div>
                <h4 className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface font-semibold mb-1">Jewelry Care</h4>
                <p>
                  Avoid exposing your jewelry to harsh household chemicals, perfumes, or chlorine. To clean, soak in warm water with mild dish soap and gently scrub with a soft-bristled toothbrush. Store in its original protective pouch.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
