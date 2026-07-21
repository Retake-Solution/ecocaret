import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { normalizeCurrencyCode, CUSTOMER_CURRENCY_STORAGE_KEY } from "../lib/currencyStorage.ts";
import { formatMoney, formatServerMoney } from "../lib/money.ts";

const apiClientSource = readFileSync(new URL("../services/apiClient.ts", import.meta.url), "utf8");
const apiSource = readFileSync(new URL("../services/api.ts", import.meta.url), "utf8");
const headerSource = readFileSync(new URL("../components/Header.tsx", import.meta.url), "utf8");
const checkoutSource = readFileSync(new URL("../app/checkout/page.tsx", import.meta.url), "utf8");

test("customer currency storage persists only the selected ISO code", () => {
  assert.equal(CUSTOMER_CURRENCY_STORAGE_KEY, "customer.currencyCode");
  assert.equal(normalizeCurrencyCode(" usd "), "USD");
  assert.equal(normalizeCurrencyCode("US"), null);
  assert.equal(normalizeCurrencyCode("USDT"), null);
});

test("money formatter uses integer minor units and each currency exponent", () => {
  assert.equal(formatMoney({ amountMinor: 123456, currency: "USD", exponent: 2 }, { locale: "en-US" }), "$1,234.56");
  assert.equal(formatMoney({ amountMinor: 123456, currency: "BHD", exponent: 3 }, { locale: "en-US" }), "BHD\u00a0123.456");
  assert.equal(formatMoney({ amountMinor: 123456, currency: "JPY", exponent: 0 }, { locale: "en-US" }), "¥123,456");
});

test("server money formatter falls back to known metadata before defaulting exponent", () => {
  assert.equal(
    formatServerMoney(
      123456,
      "BHD",
      [{
        code: "BHD",
        name: "Bahraini Dinar",
        symbol: "BD",
        exponent: 3,
        isDefault: false,
        displayOrder: 10,
      }],
      { locale: "en-US" }
    ),
    "BHD\u00a0123.456"
  );
});

test("public currency API is limited to customer-safe discovery endpoints", () => {
  assert.match(apiSource, /api\/v1\/currencies/);
  assert.match(apiSource, /api\/v1\/currencies\/\$\{code\}/);
  assert.doesNotMatch(apiSource, /api\/v1\/currencies\/.*(?:rates|rate-history|approvals|providers)/i);
});

test("shared API client attaches selected currency only to customer API requests", () => {
  assert.match(apiClientSource, /"X-Currency-Code"/);
  assert.match(apiClientSource, /CURRENCY_DISCOVERY_PATTERN/);
  assert.match(apiClientSource, /x-currency-code/);
  assert.match(apiClientSource, /x-currency-rate-version/);
  assert.match(apiClientSource, /customer-currency-resolved/);
});

test("global header exposes the customer currency selector", () => {
  assert.match(headerSource, /CurrencySelector/);
  assert.match(headerSource, /Currency/);
});

test("checkout displays backend-provided converted cart money and does not display simulated taxes", () => {
  assert.match(checkoutSource, /priceMoney/);
  assert.match(checkoutSource, /formatMoney/);
  assert.match(checkoutSource, /Calculated by backend/);
  assert.doesNotMatch(checkoutSource, /subtotal \* 0\.08/);
  assert.doesNotMatch(checkoutSource, /currently available in USD only/);
});
