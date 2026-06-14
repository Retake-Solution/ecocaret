"use client";

import React from "react";
import SignInForm from "@/components/SignInForm";

interface ProfileDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfileDialog({ isOpen, onClose }: ProfileDialogProps) {
  return (
    <div
      className={`fixed inset-0 z-[200] transition-opacity duration-300 flex items-center justify-center p-4 ${
        isOpen
          ? "opacity-100 pointer-events-auto"
          : "opacity-0 pointer-events-none"
      }`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Dialog Content */}
      <div
        className={`relative bg-surface rounded-[40px] border border-outline-variant/20 max-w-md w-full p-8 shadow-2xl transition-all duration-300 transform ${
          isOpen ? "scale-100 translate-y-0" : "scale-95 translate-y-4"
        }`}
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
        >
          close
        </button>
        <div className="text-center space-y-4 mb-6">
          <span className="material-symbols-outlined text-secondary text-5xl bg-secondary-container/20 p-4 rounded-full">
            person
          </span>
          <h3 className="font-headline-sm text-headline-sm text-on-surface">
            The Conscious Circle
          </h3>
          <p className="font-label-sm text-label-sm text-on-surface-variant">
            Log in to access certified blockchain ledgers, bespoke orders, and
            private collections.
          </p>
        </div>

        <SignInForm onSuccess={onClose} />

        <div className="text-center pt-6 border-t border-outline-variant/20 mt-6">
          <p className="font-label-sm text-label-sm text-on-surface-variant">
            New to Eco Caret?{" "}
            <button
              onClick={() => {
                alert("Registration page coming soon!");
                onClose();
              }}
              className="text-primary hover:underline font-semibold"
            >
              Create Account
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
