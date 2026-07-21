import axios from "axios";
import {
  clearStoredCurrencyCode,
  getActiveCurrencyCode,
  normalizeCurrencyCode,
} from "@/lib/currencyStorage";

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  headers: {
    Accept: "*/*",
  }
});

const CURRENCY_DISCOVERY_PATTERN = /^\/api\/v1\/currencies(?:\/[A-Za-z]{3})?\/?$/;
const RECOVERABLE_CURRENCY_ERROR_CODES = new Set([
  "CURRENCY_CODE_INVALID",
  "CURRENCY_NOT_SUPPORTED",
  "CURRENCY_NOT_ACTIVE",
  "CURRENCY_DEFAULT_UNAVAILABLE",
  "CURRENCY_NOT_AVAILABLE",
  "CURRENCY_HEADER_REQUIRED",
  "CURRENCY_HEADER_AMBIGUOUS",
]);

const isAbsoluteExternalUrl = (url?: string) =>
  Boolean(url && /^https?:\/\//i.test(url));

const getPathname = (url?: string) => {
  if (!url) return "";
  try {
    if (isAbsoluteExternalUrl(url)) {
      return new URL(url).pathname;
    }
    return new URL(url, "http://localhost").pathname;
  } catch {
    return url;
  }
};

const shouldAttachCurrencyHeader = (url?: string) => {
  if (isAbsoluteExternalUrl(url)) return false;
  const pathname = getPathname(url);
  return !CURRENCY_DISCOVERY_PATTERN.test(pathname);
};

const dispatchCurrencyEvent = (name: string, detail: Record<string, unknown>) => {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(name, { detail }));
};

apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("eco_caret_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  const currencyCode = normalizeCurrencyCode(getActiveCurrencyCode());
  if (currencyCode && shouldAttachCurrencyHeader(config.url)) {
    config.headers["X-Currency-Code"] = currencyCode;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => {
    const resolvedCurrency = normalizeCurrencyCode(response.headers["x-currency-code"]);
    const rateVersion = response.headers["x-currency-rate-version"];
    if (resolvedCurrency) {
      dispatchCurrencyEvent("customer-currency-resolved", {
        code: resolvedCurrency,
        rateVersion: typeof rateVersion === "string" ? rateVersion : null,
      });
    }

    return response;
  },
  (error) => {
    const code = error?.response?.data?.code || error?.response?.data?.error;
    if (RECOVERABLE_CURRENCY_ERROR_CODES.has(code)) {
      clearStoredCurrencyCode();
      dispatchCurrencyEvent("customer-currency-error", { code });
    }

    return Promise.reject(error);
  }
);

export default apiClient;
