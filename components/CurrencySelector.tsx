"use client";

import { ChangeEvent } from "react";
import { selectCurrency } from "@/lib/features/currency/currencySlice";
import { useAppDispatch, useAppSelector } from "@/lib/store";

interface CurrencySelectorProps {
  compact?: boolean;
  className?: string;
}

export default function CurrencySelector({
  compact = false,
  className = "",
}: CurrencySelectorProps) {
  const dispatch = useAppDispatch();
  const {
    currencies,
    selectedCode,
    loading,
    initialized,
    error,
  } = useAppSelector((state) => state.currency);

  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    dispatch(selectCurrency(event.target.value));
  };

  if (!initialized && loading) {
    return (
      <div
        className={`h-9 rounded-full border border-outline-variant/30 bg-surface-container-low px-3 flex items-center text-[11px] font-bold text-on-surface-variant ${className}`}
        aria-live="polite"
      >
        Currency...
      </div>
    );
  }

  if (currencies.length === 0) {
    return (
      <div
        className={`h-9 rounded-full border border-error/20 bg-error/5 px-3 flex items-center text-[11px] font-bold text-error ${className}`}
        title={error || "Currency unavailable"}
      >
        USD
      </div>
    );
  }

  if (currencies.length === 1) {
    const currency = currencies[0];
    return (
      <div
        className={`h-9 rounded-full border border-outline-variant/30 bg-surface-container-low px-3 flex items-center gap-1 text-[11px] font-bold text-on-surface ${className}`}
        title={`${currency.name} (${currency.symbol})`}
      >
        <span>{currency.symbol}</span>
        <span>{currency.code}</span>
      </div>
    );
  }

  return (
    <label className={`relative inline-flex items-center ${className}`}>
      <span className="sr-only">Select display currency</span>
      <select
        aria-label="Select display currency"
        value={selectedCode || ""}
        onChange={handleChange}
        disabled={loading}
        className={`h-9 rounded-full border border-outline-variant/35 bg-surface-container-lowest py-0 pl-3 pr-8 text-[11px] font-bold text-on-surface outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:cursor-wait disabled:opacity-60 ${
          compact ? "max-w-[122px]" : "max-w-[170px]"
        }`}
      >
        {currencies.map((currency) => (
          <option key={currency.code} value={currency.code}>
            {compact
              ? `${currency.symbol} ${currency.code}`
              : `${currency.symbol} ${currency.code} - ${currency.name}`}
          </option>
        ))}
      </select>
      <span className="material-symbols-outlined pointer-events-none absolute right-2 text-sm text-on-surface-variant">
        expand_more
      </span>
    </label>
  );
}
