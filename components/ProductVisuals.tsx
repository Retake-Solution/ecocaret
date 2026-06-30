import React, { useState } from "react";
import { ApiProduct } from "@/types";
import ProductAccordion from "@/components/ProductAccordion";
import ImageModal from "@/components/ImageModal";

interface ProductVisualsProps {
  product: ApiProduct;
  productName: string;
  imageUrls: string[];
  selectedImage: string;
  setSelectedImage: (url: string) => void;
  selectedPurity: string;
  selectedMetalColor: string;
}

export default function ProductVisuals({
  product,
  productName,
  imageUrls,
  selectedImage,
  setSelectedImage,
  selectedPurity,
  selectedMetalColor,
}: ProductVisualsProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="lg:col-span-7 flex flex-col space-y-gutter">
      <div className="flex flex-col md:flex-row gap-4">
        {imageUrls.length > 1 && (
          <div className="flex md:flex-col gap-4 order-2 md:order-1 overflow-x-auto md:overflow-y-auto no-scrollbar w-full md:w-20 lg:w-24 shrink-0">
            {imageUrls.map((imgUrl, idx) => (
              <button
                key={imgUrl}
                className={`aspect-square w-20 md:w-full rounded-lg border-2 p-1 bg-white overflow-hidden transition-all duration-300 cursor-pointer shrink-0 ${
                  selectedImage === imgUrl
                    ? "border-primary ring-1 ring-primary"
                    : "border-transparent hover:border-outline-variant"
                }`}
                onClick={() => setSelectedImage(imgUrl)}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt={`${productName} thumbnail ${idx + 1}`}
                  className="w-full h-full object-cover rounded-md"
                  src={imgUrl}
                />
              </button>
            ))}
          </div>
        )}

        <div className="relative group overflow-hidden rounded-xl bg-surface-container-low aspect-[4/5] md:aspect-square lg:aspect-[4/5] flex-grow order-1 md:order-2 w-full">
          {selectedImage ? (
            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full h-full cursor-zoom-in"
              aria-label="View full screen image"
            >
              <img
                alt={`Main view of ${productName}`}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                src={selectedImage}
              />
            </button>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-surface-container-lowest via-surface-container-low to-secondary-container/30 text-primary">
              <span className="material-symbols-outlined text-7xl mb-4">
                diamond
              </span>
              <span className="font-label-md text-label-md uppercase tracking-widest">
                Image Coming Soon
              </span>
            </div>
          )}
          {product.isNewArrival && (
            <span className="absolute top-5 left-5 bg-secondary text-on-secondary rounded-full px-4 py-1 text-xs font-bold uppercase tracking-widest">
              New Arrival
            </span>
          )}
        </div>
      </div>

      <div className="hidden lg:block">
        <ProductAccordion
          product={product}
          selectedPurity={selectedPurity}
          selectedMetalColor={selectedMetalColor}
        />
      </div>

      <ImageModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        imageUrl={selectedImage}
        altText={`Main view of ${productName}`}
        imageUrls={imageUrls}
        onSelectImage={setSelectedImage}
      />
    </div>
  );
}
