"use client";

import React from "react";

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmationModal({
  isOpen,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
}: ConfirmationModalProps) {
  return (
    <div
      className={`fixed inset-0 z-[1100] transition-opacity duration-300 flex items-center justify-center p-4 ${
        isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}
    >
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
        onClick={onCancel}
      />

      {/* Modal Dialog Box */}
      <div
        className={`relative bg-surface rounded-[32px] border border-outline-variant/20 max-w-sm w-full p-8 shadow-2xl transition-all duration-300 transform ${
          isOpen ? "scale-100 opacity-100 translate-y-0" : "scale-95 opacity-0 translate-y-4"
        }`}
      >
        <button
          onClick={onCancel}
          className="absolute top-6 right-6 material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
        >
          close
        </button>

        <div className="text-center space-y-4">
          <span className="material-symbols-outlined text-secondary text-5xl bg-secondary-container/20 p-4 rounded-full">
            logout
          </span>
          <h3 className="font-headline-sm text-headline-sm text-on-surface">
            {title}
          </h3>
          <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
            {message}
          </p>
        </div>

        <div className="flex gap-4 mt-8">
          <button
            onClick={onCancel}
            className="flex-1 py-3.5 border border-outline-variant hover:bg-surface-container rounded-full font-label-md text-label-md transition-all text-center font-bold tracking-wider cursor-pointer"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3.5 bg-primary text-on-primary hover:opacity-90 rounded-full font-label-md text-label-md transition-all text-center font-bold tracking-wider shadow-md cursor-pointer"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
