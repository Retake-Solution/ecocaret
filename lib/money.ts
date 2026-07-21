import type { Money, PublicCurrency } from "@/types";

const isSafeAmount = (value: number) =>
  Number.isFinite(value) && Number.isSafeInteger(value);

export const getCurrencyExponent = (
  currency: string,
  currencies: PublicCurrency[] = []
) => currencies.find((item) => item.code === currency)?.exponent;

export const formatMoney = (
  money: Money,
  options?: {
    locale?: string;
    currencyDisplay?: "symbol" | "code" | "name" | "narrowSymbol";
  }
) => {
  if (!isSafeAmount(money.amountMinor)) return "Amount unavailable";
  if (!Number.isInteger(money.exponent) || money.exponent < 0 || money.exponent > 3) {
    return "Currency unavailable";
  }

  const amountMajor = money.amountMinor / 10 ** money.exponent;
  if (!Number.isFinite(amountMajor)) return "Amount unavailable";

  return new Intl.NumberFormat(options?.locale, {
    style: "currency",
    currency: money.currency,
    currencyDisplay: options?.currencyDisplay ?? "symbol",
    minimumFractionDigits: money.exponent,
    maximumFractionDigits: money.exponent,
  }).format(amountMajor);
};

export const formatServerMoney = (
  amountMinor: number,
  currency: string,
  currencies: PublicCurrency[] = [],
  options?: {
    locale?: string;
    currencyDisplay?: "symbol" | "code" | "name" | "narrowSymbol";
    fallbackExponent?: number;
  }
) =>
  formatMoney(
    {
      amountMinor,
      currency,
      exponent: getCurrencyExponent(currency, currencies) ?? options?.fallbackExponent ?? 2,
    },
    options
  );

export const formatLegacyUsdMajor = (amountMajor: number) => {
  if (!Number.isFinite(amountMajor)) return "USD price unavailable";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    currencyDisplay: "code",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amountMajor);
};
