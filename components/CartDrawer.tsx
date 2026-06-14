"use client";

import React from "react";

interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onRemoveItem: (id: string) => void;
  onCheckout: () => void;
}

export default function CartDrawer({
  isOpen,
  onClose,
  cartItems,
  onRemoveItem,
  onCheckout,
}: CartDrawerProps) {
  return (
    <div
      className={`fixed inset-0 z-[200] transition-opacity duration-300 ${
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
      {/* Drawer Content */}
      <div
        className={`absolute top-0 right-0 h-full w-full max-w-md bg-surface border-l border-outline-variant/30 p-8 flex flex-col shadow-2xl transition-transform duration-300 transform ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex justify-between items-center pb-6 border-b border-outline-variant/20">
          <h3 className="font-headline-sm text-headline-sm text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined">shopping_bag</span>
            Your Collection Bag
          </h3>
          <button
            onClick={onClose}
            className="material-symbols-outlined text-on-surface hover:text-primary transition-colors cursor-pointer"
          >
            close
          </button>
        </div>

        <div className="flex-grow overflow-y-auto py-6 space-y-6">
          {cartItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
              <span className="material-symbols-outlined text-outline-variant text-6xl">
                drafts
              </span>
              <p className="font-body-lg text-body-lg text-on-surface-variant font-medium">
                Your bag is currently empty.
              </p>
              <button
                onClick={onClose}
                className="text-secondary font-label-md text-label-md border-b border-secondary/30 pb-0.5 hover:border-secondary"
              >
                Start selecting masterpieces
              </button>
            </div>
          ) : (
            cartItems.map((item) => (
              <div
                key={item.id}
                className="flex gap-4 p-4 bg-surface-container-low rounded-2xl border border-outline-variant/10 shadow-sm"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-20 h-20 object-cover rounded-xl"
                />
                <div className="flex-grow flex flex-col justify-between">
                  <div>
                    <h4 className="font-label-md text-label-md text-on-surface font-bold">
                      {item.name}
                    </h4>
                    <p className="font-label-sm text-label-sm text-on-surface-variant">
                      Quantity: {item.quantity}
                    </p>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-label-md text-label-md text-secondary font-bold">
                      ${item.price.toLocaleString()}
                    </span>
                    <button
                      onClick={() => onRemoveItem(item.id)}
                      className="text-error font-label-sm text-label-sm hover:underline cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="pt-6 border-t border-outline-variant/20 space-y-4">
            <div className="flex justify-between font-label-md text-label-md text-on-surface">
              <span>Total Value</span>
              <span className="font-bold text-secondary">
                $
                {cartItems
                  .reduce((sum, item) => sum + item.price * item.quantity, 0)
                  .toLocaleString()}
              </span>
            </div>
            <button
              onClick={onCheckout}
              className="w-full bg-primary text-on-primary py-4 rounded-full font-label-md text-label-md hover:shadow-lg hover:bg-primary/95 transition-all text-center flex items-center justify-center gap-2 cursor-pointer"
            >
              Proceed to Checkout
              <span className="material-symbols-outlined text-sm">
                arrow_forward
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
