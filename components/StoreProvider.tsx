"use client";

import React, { useState, useEffect } from "react";
import { Provider } from "react-redux";
import { makeStore } from "@/lib/store";
import { loadCartState } from "@/lib/features/cart/cartSlice";
import {
  reconcileResolvedCurrency,
  refreshCurrencies,
  selectCurrency,
} from "@/lib/features/currency/currencySlice";
import { loadProfileState } from "@/lib/features/profile/profileSlice";
import {
  CUSTOMER_CURRENCY_STORAGE_KEY,
  normalizeCurrencyCode,
} from "@/lib/currencyStorage";

export default function StoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [store] = useState(() => makeStore());

  useEffect(() => {
    store.dispatch(loadCartState());
    store.dispatch(loadProfileState());
    store.dispatch(refreshCurrencies());

    const handleResolvedCurrency = (event: Event) => {
      const detail = (event as CustomEvent<{ code?: string; rateVersion?: string | null }>).detail;
      if (!detail?.code) return;
      store.dispatch(reconcileResolvedCurrency({
        code: detail.code,
        rateVersion: detail.rateVersion,
      }));
    };

    const handleCurrencyError = () => {
      store.dispatch(refreshCurrencies());
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key !== CUSTOMER_CURRENCY_STORAGE_KEY) return;
      const code = normalizeCurrencyCode(event.newValue);
      if (code) store.dispatch(selectCurrency(code));
      else store.dispatch(refreshCurrencies());
    };

    window.addEventListener("customer-currency-resolved", handleResolvedCurrency);
    window.addEventListener("customer-currency-error", handleCurrencyError);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("customer-currency-resolved", handleResolvedCurrency);
      window.removeEventListener("customer-currency-error", handleCurrencyError);
      window.removeEventListener("storage", handleStorage);
    };
  }, [store]);

  return <Provider store={store}>{children}</Provider>;
}
