"use client";

import React from "react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full mt-24 bg-surface-container">
      <div className="flex flex-col md:flex-row justify-between items-center w-full px-margin-desktop py-12 gap-gutter max-w-container-max mx-auto">
        <div className="flex flex-col items-center md:items-start gap-4">
          <p className="font-headline-sm text-headline-sm text-primary">
            Eco Caret
          </p>
          <p className="font-label-sm text-label-sm text-secondary">
            © 2026 Eco Caret. Handcrafted Sustainability.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-8">
          <Link
            className="font-label-sm text-label-sm text-on-surface-variant hover:text-secondary underline decoration-secondary/30 transition-opacity duration-200 hover:opacity-80"
            href="#"
          >
            Sustainability Report
          </Link>
          <Link
            className="font-label-sm text-label-sm text-on-surface-variant hover:text-secondary underline decoration-secondary/30 transition-opacity duration-200 hover:opacity-80"
            href="#"
          >
            Care Guide
          </Link>
          <Link
            className="font-label-sm text-label-sm text-on-surface-variant hover:text-secondary underline decoration-secondary/30 transition-opacity duration-200 hover:opacity-80"
            href="#"
          >
            Shipping
          </Link>
          <Link
            className="font-label-sm text-label-sm text-on-surface-variant hover:text-secondary underline decoration-secondary/30 transition-opacity duration-200 hover:opacity-80"
            href="/terms-and-conditions"
          >
            Terms
          </Link>
          <Link
            className="font-label-sm text-label-sm text-on-surface-variant hover:text-secondary underline decoration-secondary/30 transition-opacity duration-200 hover:opacity-80"
            href="/privacy-policy"
          >
            Privacy
          </Link>
        </div>
        <div className="flex gap-4">
          <span
            onClick={() => alert("Eco Caret Global Reach")}
            className="material-symbols-outlined text-secondary cursor-pointer hover:opacity-70 transition-opacity"
          >
            public
          </span>
          <span
            onClick={() => alert("Our Spa & Relaxation Partner")}
            className="material-symbols-outlined text-secondary cursor-pointer hover:opacity-70 transition-opacity"
          >
            spa
          </span>
          <span
            onClick={() => alert("Made with Love")}
            className="material-symbols-outlined text-secondary cursor-pointer hover:opacity-70 transition-opacity"
          >
            favorite
          </span>
        </div>
      </div>
    </footer>
  );
}
