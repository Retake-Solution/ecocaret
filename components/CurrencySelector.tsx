"use client";

import Button from "@/components/Button";
import { useAppSelector } from "@/lib/store";

interface CurrencySelectorProps {
  compact?: boolean;
  className?: string;
  label?: string;
  onOpenModal?: () => void;
}

export default function CurrencySelector({
  compact = false,
  className = "",
  label,
  onOpenModal,
}: CurrencySelectorProps) {
  const {
    currencies,
    selectedCode,
    loading,
    initialized,
    error,
  } = useAppSelector((state) => state.currency);

  const selectedCurrency =
    currencies.find((currency) => currency.code === selectedCode) || currencies[0];
  const widthClass = compact ? "min-w-[132px]" : "w-full";

  if (!initialized && loading) {
    return (
      <div
        className={`inline-flex h-11 items-center gap-2 rounded-lg border border-outline-variant/30 bg-surface-container-low px-3 text-[11px] font-bold text-on-surface-variant shadow-sm ${className}`}
        aria-live="polite"
      >
        <span className="material-symbols-outlined text-base text-primary/70" aria-hidden="true">
          public
        </span>
        <span>Currency...</span>
      </div>
    );
  }

  if (currencies.length === 0) {
    return (
      <div
        className={`inline-flex h-11 items-center gap-2 rounded-lg border border-error/20 bg-error/5 px-3 text-[11px] font-bold text-error shadow-sm ${className}`}
        title={error || "Currency unavailable"}
      >
        <span className="material-symbols-outlined text-base" aria-hidden="true">
          error
        </span>
        <span>USD</span>
      </div>
    );
  }

  if (currencies.length === 1) {
    const currency = currencies[0];
    return (
      <div
        className={`inline-flex h-11 items-center gap-2 rounded-lg border border-outline-variant/30 bg-surface-container-lowest px-3 text-on-surface shadow-sm ${className}`}
        title={`${currency.name} (${currency.symbol})`}
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
          {currency.symbol}
        </span>
        <span className="flex flex-col leading-none">
          {label && <span className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant/65">{label}</span>}
          <span className="text-[11px] font-bold tracking-wide">{currency.code}</span>
        </span>
      </div>
    );
  }

  return (
    <Button
      unstyled
      type="button"
      onClick={onOpenModal}
      disabled={loading || !onOpenModal}
      className={`group relative inline-flex h-11 items-center rounded-lg border border-outline-variant/35 bg-surface-container-lowest shadow-sm transition-all duration-200 hover:border-primary/45 hover:bg-primary/5 focus:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/15 disabled:cursor-wait disabled:opacity-60 ${widthClass} ${className}`}
      title={
        selectedCurrency
          ? `${selectedCurrency.name} (${selectedCurrency.symbol})`
          : "Select display currency"
      }
      aria-haspopup="dialog"
    >
      <span
        className="ml-2.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[12px] font-bold text-primary transition-colors group-hover:bg-primary group-hover:text-on-primary"
        aria-hidden="true"
      >
        {selectedCurrency?.symbol || "$"}
      </span>
      <span className="flex flex-col items-start leading-none">
        {label && (
          <span className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant/60">
            {label}
          </span>
        )}
        <span className="text-[11px] font-bold tracking-wide text-on-surface">
          {selectedCurrency?.code || selectedCode || "USD"}
        </span>
      </span>
      <span className="material-symbols-outlined pointer-events-none absolute right-2.5 text-base text-on-surface-variant transition-colors group-hover:text-primary">
        expand_more
      </span>
    </Button>
  );
}
