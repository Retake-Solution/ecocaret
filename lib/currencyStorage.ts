import type { CurrencyCode } from "@/types";

export const CUSTOMER_CURRENCY_STORAGE_KEY = "customer.currencyCode";
const CURRENCY_CODE_PATTERN = /^[A-Z]{3}$/;

let activeCurrencyCode: CurrencyCode | null = null;

export const normalizeCurrencyCode = (value: unknown): CurrencyCode | null => {
  const code = String(value || "").trim().toUpperCase();
  return CURRENCY_CODE_PATTERN.test(code) ? code : null;
};

export const getStoredCurrencyCode = (): CurrencyCode | null => {
  if (typeof window === "undefined") return activeCurrencyCode;

  try {
    return normalizeCurrencyCode(window.localStorage.getItem(CUSTOMER_CURRENCY_STORAGE_KEY));
  } catch {
    return null;
  }
};

export const persistCurrencyCode = (code: CurrencyCode) => {
  const normalized = normalizeCurrencyCode(code);
  if (!normalized) return;
  activeCurrencyCode = normalized;

  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CUSTOMER_CURRENCY_STORAGE_KEY, normalized);
  } catch {
    // Browser storage can be disabled; keep the in-memory request header fallback.
  }
};

export const clearStoredCurrencyCode = () => {
  activeCurrencyCode = null;
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(CUSTOMER_CURRENCY_STORAGE_KEY);
  } catch {
    // Nothing else to clear.
  }
};

export const setActiveCurrencyCode = (code: CurrencyCode | null) => {
  activeCurrencyCode = normalizeCurrencyCode(code);
};

export const getActiveCurrencyCode = () => activeCurrencyCode || getStoredCurrencyCode();
