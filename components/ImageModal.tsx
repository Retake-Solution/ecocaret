"use client";

import React from "react";

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  altText: string;
  imageUrls?: string[];
  onSelectImage?: (url: string) => void;
}

export default function ImageModal({ isOpen, onClose, imageUrl, altText, imageUrls, onSelectImage }: ImageModalProps) {
  return (
    <div
      className={`fixed inset-0 z-[1000] transition-opacity duration-300 flex items-center justify-center p-4 md:p-10 ${
        isOpen
          ? "opacity-100 pointer-events-auto"
          : "opacity-0 pointer-events-none"
      }`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
        onClick={onClose}
      />
      {/* Dialog Content */}
      <div
        className={`relative max-w-7xl w-full h-full flex items-center justify-center transition-all duration-300 transform ${
          isOpen ? "scale-100 translate-y-0" : "scale-95 translate-y-8"
        }`}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-white/10 hover:bg-white/30 backdrop-blur-md rounded-full p-2 material-symbols-outlined text-white transition-colors cursor-pointer"
        >
          close
        </button>
        <div className="flex flex-col items-center justify-center h-full w-full max-h-[85vh]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt={altText}
            className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl mb-8"
          />
          
          {/* Thumbnail Strip */}
          {imageUrls && imageUrls.length > 1 && onSelectImage && (
            <div className="flex gap-4 overflow-x-auto max-w-full no-scrollbar pb-2 shrink-0">
              {imageUrls.map((imgUrl, idx) => (
                <button
                  key={imgUrl}
                  onClick={() => onSelectImage(imgUrl)}
                  className={`relative w-20 h-20 shrink-0 rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                    imageUrl === imgUrl
                      ? "border-primary opacity-100 scale-105"
                      : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imgUrl}
                    alt={`${altText} thumbnail ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
