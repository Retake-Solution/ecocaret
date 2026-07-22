"use client";

import { useEffect } from "react";
import { motion } from "motion/react";
import Button from "@/components/Button";
import type { CurrencyCode, PublicCurrency } from "@/types";

interface CurrencySelectionModalProps {
  currencies: PublicCurrency[];
  isOpen: boolean;
  onClose: () => void;
  onSelect: (code: CurrencyCode) => void;
  selectedCode: CurrencyCode | null;
  showCurrentSelection?: boolean;
}

export default function CurrencySelectionModal({
  currencies,
  isOpen,
  onClose,
  onSelect,
  selectedCode,
  showCurrentSelection = false,
}: CurrencySelectionModalProps) {
  const selectedCurrency =
    currencies.find((currency) => currency.code === selectedCode) || currencies[0];

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <motion.div
      className="fixed inset-0 z-[300] flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="currency-modal-title"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
    >
      <Button
        unstyled
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="Close currency selector"
        onClick={onClose}
      />
      <motion.div
        className="relative z-[301] w-full max-w-md overflow-hidden rounded-2xl border border-outline-variant/20 bg-surface shadow-2xl"
        initial={{ opacity: 0, y: 18, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.24, ease: "easeOut" }}
      >
        <div className="flex items-start justify-between gap-4 border-b border-outline-variant/15 p-5">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-primary">
              Display Currency
            </p>
            <h2 id="currency-modal-title" className="mt-1 font-headline-sm text-2xl text-on-surface">
              Choose your currency
            </h2>
            {showCurrentSelection && selectedCurrency && (
              <p className="mt-1 text-xs text-on-surface-variant">
                Current selection: {selectedCurrency.symbol} {selectedCurrency.code}
              </p>
            )}
          </div>
          <Button
            unstyled
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-primary/10 hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
            aria-label="Close currency selector"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </Button>
        </div>

        <motion.div
          className="max-h-[60vh] space-y-2 overflow-y-auto p-4"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: {
              transition: {
                delayChildren: 0.08,
                staggerChildren: 0.035,
              },
            },
          }}
        >
          {currencies.map((currency) => {
            const isSelected = currency.code === selectedCode;

            return (
              <motion.div
                key={currency.code}
                variants={{
                  hidden: { opacity: 0, y: 8 },
                  visible: { opacity: 1, y: 0 },
                }}
                transition={{ duration: 0.18, ease: "easeOut" }}
              >
                <Button
                  unstyled
                  type="button"
                  onClick={() => onSelect(currency.code)}
                  className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 ${
                    isSelected
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-outline-variant/20 bg-surface-container-lowest text-on-surface hover:border-primary/40 hover:bg-primary/5"
                  }`}
                >
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                      isSelected
                        ? "bg-primary text-on-primary"
                        : "bg-surface-container-high text-primary"
                    }`}
                  >
                    {currency.symbol}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-bold">{currency.code}</span>
                    <span className="mt-0.5 block truncate text-xs text-on-surface-variant">
                      {currency.name}
                    </span>
                  </span>
                  {isSelected && (
                    <span className="material-symbols-outlined text-xl" aria-hidden="true">
                      check_circle
                    </span>
                  )}
                </Button>
              </motion.div>
            );
          })}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
