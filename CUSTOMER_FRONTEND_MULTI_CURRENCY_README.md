# Customer Frontend Multi-Currency Integration

This document defines the production implementation contract for adding multi-currency behavior to the Customer Frontend. It covers currency discovery and selection, catalog pricing, checkout and order creation, payment initiation, Razorpay confirmation, historical order display, refunds, invoices, idempotency, error handling, security, testing, and rollout.

Backend architecture and financial rules remain authoritative in `README.md`, `ORDER_MANAGEMENT_README.md`, `PAYMENT_SERVICE_README.md`, and `INVOICE_README.md`.

Document control:

- Last reviewed: `2026-07-22`
- Scope: Customer Frontend only
- Base currency: USD
- Exchange-rate owner: Admin-managed backend configuration
- Payment-provider default: Razorpay supports INR when configured; provider availability is determined by the backend

## Objectives

The Customer Frontend must:

- allow customers to select an active currency returned by the backend;
- send the selected ISO currency code through `X-Currency-Code` on currency-aware API requests;
- display backend-calculated catalog and checkout money without performing authoritative conversion;
- create an order in the currency resolved by the backend;
- preserve that order currency through payment, cancellation, return, refund, invoice, and historical display;
- use each response's explicit `currency` and `exponent` when formatting money;
- prevent duplicate payment attempts through stable frontend idempotency state;
- handle unsupported, disabled, mismatched, and legacy currency states safely.

## Non-Goals

The Customer Frontend must not:

- fetch exchange rates from Razorpay, Stripe, or another provider;
- calculate authoritative catalog, checkout, payment, or refund values;
- submit exchange rates, exponents, item prices, totals, payment amounts, or refund amounts;
- assume every currency has two decimal places;
- change the currency of an existing order;
- convert or relabel historical financial records when the global selector changes;
- interpret a Razorpay callback as proof of payment without backend verification.

## Core Financial Contract

One order has exactly one immutable transaction currency.

```txt
Customer preference
    -> X-Currency-Code
    -> backend catalog/checkout calculation
    -> immutable order currency and exponent
    -> payment/capture/refund/invoice in that same currency
```

The global customer preference affects catalog pricing and future orders. After an order is created, the following records always use the order's stored currency and exponent:

- order item price snapshots and totals;
- payment accounts and payment attempts;
- authorization and capture transactions;
- cancellations and returns;
- partial and full refunds;
- disputes and reconciliation;
- invoices and order history.

The frontend must treat backend money as self-describing data:

```ts
export interface Money {
  amountMinor: number;
  currency: string;
  exponent: number;
}
```

## Backend API Summary

### Public currency discovery

```http
GET /api/v1/currencies
```

Use the response as the only selectable-currency source. Do not maintain a separate hard-coded list for business availability. The frontend may use local ISO metadata for presentation only, but backend status and returned codes remain authoritative.

Disabled currencies are not selectable for new catalog or order activity.

### Currency-aware requests

Send one normalized uppercase ISO code:

```http
X-Currency-Code: INR
```

Do not send multiple values, lowercase values, names, symbols, or locale strings.

Typical currency-aware endpoints include:

- product listing, search, and details;
- checkout quote or server-side order pricing;
- order creation;
- payment creation for an existing order.

### Historical reads

Order, payment, refund, and invoice records expose their stored financial currency. The current selector must not change those values.

## Currency State Management

Create one currency store/context responsible for:

```ts
interface CustomerCurrencyState {
  currencies: CurrencyOption[];
  selectedCode?: string;
  defaultCode?: string;
  loading: boolean;
  error?: string;
}

interface CurrencyOption {
  code: string;
  name: string;
  symbol: string;
  exponent: number;
  isDefault?: boolean;
}
```

Recommended initialization:

1. Fetch active currencies from `GET /api/v1/currencies`.
2. Read the locally persisted preference.
3. Use it only if it still appears in the active response.
4. Otherwise use the backend default.
5. Persist only the selected code, not an exchange rate.
6. Attach the code through the shared HTTP client.

Use a stable storage key such as:

```txt
customer.preferredCurrency
```

If a previously selected currency becomes disabled, replace it with the current backend default and refresh currency-sensitive catalog data. Historical records remain unchanged.

## Shared HTTP Client

The HTTP client should apply the global selected currency by default while allowing an individual request to override it.

Conceptual example:

```ts
interface CurrencyRequestOptions {
  currencyCode?: string;
}

function currencyHeaders(options?: CurrencyRequestOptions) {
  const code = options?.currencyCode ?? currencyStore.getState().selectedCode;
  return code ? { 'X-Currency-Code': code } : {};
}
```

Requirements:

- normalize the selected code before storage;
- do not overwrite an explicit request-level header;
- do not attach `undefined`, an empty string, or multiple currency values;
- preserve authentication, content type, correlation IDs, and idempotency headers;
- ensure cache/query keys include the selected currency for catalog data;
- cancel or ignore stale catalog requests after the customer changes currency.

## Currency Selector UX

The selector must:

- show only active backend currencies;
- display code and a safe name/symbol;
- indicate the current selection;
- remain keyboard and screen-reader accessible;
- persist the code after successful selection;
- invalidate currency-sensitive catalog and cart queries;
- avoid silently changing an already-created order.

When the customer changes currency before order creation:

1. update the preference;
2. invalidate catalog/product/cart quote data;
3. request fresh backend-calculated prices;
4. display loading state until the new response arrives;
5. create the future order using that selected header.

When an order has already been created, show its stored currency. If the global selector differs, optionally display:

```txt
This order will be paid in INR, the currency selected when it was created.
```

Do not silently recreate or convert the order.

## Catalog and Product Pricing

Every catalog query key must include the selected currency:

```ts
['products', filters, selectedCurrency]
['product', slug, selectedCurrency]
```

Use only the backend pricing response. Do not read raw canonical fields such as `priceUSD` or `makingChargeUSD` for customer-facing converted totals.

Expected money-aware response values include:

```json
{
  "amountMinor": 125000,
  "currency": "INR",
  "exponent": 2
}
```

If a response currency differs from the requested selection, prefer the explicit response value and log a safe diagnostic. Never relabel its amount.

## Cart and Checkout

The cart may retain product and variant identity locally, but authoritative checkout prices must be refreshed from the backend.

Before order creation:

- ensure the latest quote currency matches the selected code;
- invalidate an older quote after a currency change;
- never multiply cached USD values by a frontend rate;
- never submit item unit prices, discounts, shipping, tax, exchange rate, or total;
- prevent order submission while currency-sensitive pricing is stale.

The order-creation request must include:

```http
Idempotency-Key: <stable-logical-order-key>
X-Currency-Code: INR
```

The body contains only customer-selectable order inputs allowed by the backend.

After creation, replace frontend estimates with the returned immutable order snapshot.

## Order Types

Frontend order types must include explicit transaction and base audit information returned by the API:

```ts
interface OrderTotals {
  merchandiseSubtotalMinor: number;
  itemDiscountMinor: number;
  orderDiscountMinor: number;
  shippingMinor: number;
  taxMinor: number;
  totalMinor: number;
  authorizedMinor: number;
  paidMinor: number;
  refundedMinor: number;
  amountDueMinor: number;
  currency: string;
  exponent: number;
  baseCurrency?: 'USD';
  baseExponent?: 2;
  baseTotalMinor?: number;
}
```

Customer-facing screens normally display transaction values. Base values, if exposed, are audit/reporting values and must not replace transaction values.

## Payment Creation

Payment creation is the most important request-level override.

For an existing order, send the order's stored currency—not blindly the current global preference:

```ts
await api.post(
  `/orders/${order.id}/payments`,
  {
    channel: 'web',
    returnPath: 'order-status',
    provider: 'razorpay',
  },
  {
    headers: {
      'Idempotency-Key': paymentAttempt.idempotencyKey,
      'X-Currency-Code': order.totals.currency,
    },
  }
);
```

Valid body:

```json
{
  "channel": "web",
  "returnPath": "order-status",
  "provider": "razorpay"
}
```

Never add these fields:

```txt
currency
exponent
exchangeRate
amount
amountMinor
subtotal
tax
shipping
discount
total
providerAmount
```

Before enabling Pay Now, validate the local response shape:

- `order.totals.currency` matches `^[A-Z]{3}$`;
- `order.totals.exponent` is a safe integer from 0 through 6;
- `order.totals.amountDueMinor` is a non-negative safe integer;
- the order is in a payable state.

This is client-side integrity checking for UX only. The backend remains authoritative.

## Payment Types

```ts
interface CustomerPayment {
  id: string;
  orderId: string;
  provider: 'stripe' | 'razorpay';
  status:
    | 'created'
    | 'requires_action'
    | 'processing'
    | 'authorized'
    | 'paid'
    | 'failed'
    | 'cancelled'
    | 'expired'
    | 'unknown'
    | 'review_required';
  amountMinor: number;
  currency: string;
  exponent: number;
  captureMethod: 'automatic' | 'manual';
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
  clientAction?: PaymentClientAction;
}

type PaymentClientAction =
  | {
      type: 'razorpay_checkout';
      keyId: string;
      providerOrderId: string;
      amountMinor: number;
      currency: string;
      merchantName: string;
    }
  | {
      type: 'stripe_elements';
      clientSecret: string;
      publishableKey: string;
    };
```

Treat `requires_action`, `processing`, `authorized`, and `unknown` as distinct states. Do not show an order as paid until the backend returns verified paid state.

## Payment Idempotency

Generate one UUID for one logical payment attempt.

Store it by order ID in session state or another intentionally scoped persistent store:

```ts
interface PaymentAttemptState {
  orderId: string;
  idempotencyKey: string;
  startedAt: string;
  status: 'creating' | 'active' | 'uncertain' | 'terminal';
}
```

Rules:

- generate the key when the customer intentionally starts a new attempt;
- reuse it after timeout, refresh, response loss, or another uncertain outcome;
- disable Pay Now while creation is pending;
- prevent duplicate Razorpay windows;
- do not generate keys during render;
- do not replace a key merely because a request took too long;
- clear/replace it only after a safely classified terminal attempt or an intentional new attempt;
- if the backend reports an active attempt, retrieve/reuse that attempt instead of creating another.

API idempotency and Razorpay Checkout IDs solve different problems; preserve both.

## Razorpay Checkout

Use only backend-provided action fields:

```ts
const options = {
  key: action.keyId,
  order_id: action.providerOrderId,
  amount: action.amountMinor,
  currency: action.currency,
  name: action.merchantName,
};
```

Do not convert or recalculate `amount` or `currency`.

After Checkout returns successfully, send the three returned values to the backend:

```http
POST /api/v1/orders/:orderId/payments/:paymentId/verify-razorpay
```

```json
{
  "razorpayOrderId": "order_...",
  "razorpayPaymentId": "pay_...",
  "razorpaySignature": "..."
}
```

The frontend callback is not payment proof. Show a verifying/processing state until backend verification, webhook processing, or reconciliation establishes the authoritative result.

If the Razorpay script fails to load, retain the logical payment attempt and offer a safe retry. Do not create a new attempt automatically.

## Stripe Client Action

When `clientAction.type === 'stripe_elements'`, initialize Stripe with the returned publishable key and client secret. Never expose or request a Stripe secret key. Stripe completion must still be confirmed through backend-owned payment state.

## Money Formatting

Centralize formatting:

```ts
export function formatMoney(amountMinor: number, currency: string, exponent: number): string {
  if (!Number.isSafeInteger(amountMinor)) throw new Error('Invalid minor-unit amount');
  if (!/^[A-Z]{3}$/.test(currency)) throw new Error('Invalid currency');
  if (!Number.isSafeInteger(exponent) || exponent < 0 || exponent > 6)
    throw new Error('Invalid currency exponent');

  const major = amountMinor / 10 ** exponent;
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
    minimumFractionDigits: exponent,
    maximumFractionDigits: exponent,
  }).format(major);
}
```

Expected examples:

| Amount minor | Currency | Exponent | Display meaning |
|---:|---|---:|---|
| `12345` | USD | 2 | USD 123.45 |
| `12345` | INR | 2 | INR 123.45 |
| `12345` | JPY | 0 | JPY 12,345 |
| `12345` | KWD | 3 | KWD 12.345 |

For very large safe integers, avoid a floating-point division path that loses precision; use a decimal/string formatter. Never infer exponent solely from the browser locale.

## Historical Orders, Payments, Refunds, and Invoices

Use the stored record context:

- order screen: `order.totals.currency` and `order.totals.exponent`;
- payment screen: `payment.currency` and `payment.exponent`;
- refund screen: `refund.currency` and `refund.exponent`;
- invoice: backend-generated historical currency and exponent.

If an INR order is opened while the global selector is USD, continue displaying and paying that order in INR.

Never recalculate a historical order with the current Admin rate.

## Error Handling

Map stable backend codes to safe actions:

| Code | Customer Frontend behavior |
|---|---|
| `CURRENCY_HEADER_AMBIGUOUS` | Send exactly one header value and reset malformed local state. |
| `CURRENCY_CODE_INVALID` | Reset the invalid local preference and reload active currencies. |
| `CURRENCY_HEADER_REQUIRED` | Attach the selected/default code and retry only after currency discovery completes. |
| `CURRENCY_NOT_SUPPORTED` | Remove the unavailable selection and use the backend default. |
| `CURRENCY_NOT_ACTIVE` | Prevent new checkout in that currency and request a new selection. |
| `ORDER_CURRENCY_MISMATCH` | Refresh the order and retry using its stored currency; never convert it. |
| `PAYMENT_CURRENCY_MISMATCH` | Stop checkout, refresh order/payment state, and show a support-safe message. |
| `CURRENCY_PAYMENT_UNAVAILABLE` | Explain that the selected provider is unavailable for the order currency; offer another backend-enabled provider when supported. |
| `PAYMENT_ACTIVE_ATTEMPT_EXISTS` | Fetch and resume the existing attempt. |
| `PAYMENT_ALREADY_PAID` | Refresh and navigate to order status. |
| `PAYMENT_RESERVATION_EXPIRED` | Stop payment and direct the customer back to cart/checkout. |
| `PAYMENT_RECONCILIATION_REQUIRED` | Show processing/verification state and poll safely. |
| `PAYMENT_PROVIDER_UNAVAILABLE` | Preserve the order and show temporary unavailability. |
| `PAYMENT_PROVIDER_TIMEOUT` | Mark the attempt uncertain and reuse the same idempotency key. |

Do not display backend stack traces, internal paths, raw provider errors, authorization tokens, or full idempotency keys.

## Loading, Polling, and Recovery

- Disable payment controls during mutation.
- Use bounded polling with backoff for `processing`, `unknown`, or reconciliation-required states.
- Stop polling on a terminal result, component disposal, logout, or maximum safe duration.
- Resume an active stored attempt after refresh.
- Refresh order state after verified payment or refund changes.
- Do not classify a browser navigation failure as payment failure.
- Do not create another provider operation while the current result is unknown.

## Security

- Keep bearer tokens in the application's approved secure authentication mechanism.
- Never log authorization headers, Razorpay signatures, Stripe client secrets, customer addresses, or full payment payloads.
- Load Razorpay/Stripe scripts only from approved origins with the application's CSP policy.
- Treat provider callbacks as untrusted input until the backend verifies them.
- Do not render raw backend/provider HTML.
- Preserve existing CSRF/CORS/authentication behavior.
- Avoid analytics events containing secret IDs or financial request bodies.

## Accessibility and UX

- Currency controls require accessible labels and keyboard support.
- Announce price refresh and payment processing state changes.
- Preserve focus after selector updates and payment errors.
- Display currency code when a symbol is ambiguous.
- Clearly distinguish `processing`, `authorized`, `paid`, `refund pending`, and `refunded`.
- Do not use color alone to communicate financial status.

## Suggested Frontend Module Layout

Adapt names to the existing application rather than duplicating established abstractions:

```txt
src/
  api/
    client
    currencies
    orders
    payments
  currency/
    CurrencyProvider
    currencyStore
    currencyQueries
    moneyFormatter
  checkout/
    checkoutQueries
    orderCreation
  payments/
    paymentAttemptStore
    paymentService
    RazorpayCheckout
    StripeElements
    PaymentStatus
  types/
    currency
    money
    order
    payment
```

Reuse the current HTTP client, state library, query library, component system, and testing framework.

## Automated Test Plan

### Currency selection

- active currency discovery and default selection;
- persisted active selection restoration;
- disabled/removed selection fallback;
- normalized header attachment;
- catalog cache separation by currency;
- stale response protection after rapid selection changes.

### Checkout and orders

- INR selection produces `X-Currency-Code: INR` on order creation;
- order body contains no currency-owned financial fields;
- changing currency refreshes authoritative prices before order creation;
- created order replaces local estimates with stored snapshots;
- an existing INR order remains INR after global selection changes to USD.

### Payment

- payment creation sends the order currency header;
- global USD preference does not override an INR order;
- payment request body contains no currency, exponent, rate, or amount;
- same logical retry reuses the idempotency key;
- double-click creates only one request and one checkout window;
- active payment is resumed rather than duplicated;
- Razorpay receives backend amount/currency unchanged;
- verification submits only the three Razorpay fields;
- `ORDER_CURRENCY_MISMATCH`, `PAYMENT_CURRENCY_MISMATCH`, and `CURRENCY_PAYMENT_UNAVAILABLE` follow the defined recovery behavior.

### Formatting and history

- exponent 0, 2, and 3 formatting;
- INR, USD, JPY, and KWD examples;
- order/payment/refund components use their own stored context;
- currency selector changes never relabel historical amounts;
- invalid or unsafe money shapes fail safely.

### Resilience and security

- timeout and response-loss recovery preserves the attempt key;
- page refresh resumes an active attempt;
- provider script load failure does not create another payment;
- secrets and sensitive headers are absent from logs and analytics;
- error UI does not expose stack traces.

## Rollout

1. Deploy shared money types and formatter.
2. Add currency discovery and selector state.
3. Add currency-aware catalog cache keys and headers.
4. Update checkout and order creation.
5. Update order/history displays to stored currency/exponent.
6. Add request-level currency override for existing-order payment creation.
7. Add durable logical payment-attempt idempotency state.
8. Update Razorpay/Stripe integrations.
9. Add stable error handling and recovery.
10. Run unit, integration, and browser tests for every enabled provider/currency pair.
11. Release behind an existing safe feature/traffic control when available.
12. Monitor mismatch, unavailable-provider, duplicate-attempt, timeout, and reconciliation rates.

Backend rollout mode remains authoritative. In `usd_only` mode, non-USD requests return `CURRENCY_NOT_SUPPORTED` even if the frontend has stale knowledge of another code. Do not bypass that response. Enable multi-currency UI traffic only when the backend environment is in the intended rollout mode and the complete order/payment path is certified.

Rollback disables new multi-currency checkout/payment UI while preserving access to historical records and existing payment reconciliation. Never rollback by deleting local attempt state while a provider operation may still be active.

## Acceptance Criteria

- A customer can select INR and receive INR catalog prices from the backend.
- A new INR order stores and displays INR with the correct exponent.
- Pay Now for an INR order sends `X-Currency-Code: INR` even when the global selector later changes.
- The frontend never submits or calculates an authoritative exchange rate or payment amount.
- Razorpay Checkout receives the backend amount and INR currency unchanged.
- A retry of the same payment operation uses the same idempotency key.
- Duplicate clicks do not create duplicate payments or checkout windows.
- Existing order/payment/refund/invoice screens always use stored currency and exponent.
- USD and every other backend-enabled currency continue to work without a two-decimal assumption.
- Unsupported provider/currency combinations fail with a controlled customer message.
- Payment success is shown only after authoritative backend verification.
- Type checking, linting, automated tests, and production build pass.

## Implementation Handoff Checklist

- [ ] Review the complete Customer Frontend before editing.
- [ ] Reuse the existing HTTP, state, query, UI, and test architecture.
- [ ] Add backend-driven currency discovery.
- [ ] Persist only the selected currency code.
- [ ] Attach `X-Currency-Code` centrally with request-level override support.
- [ ] Include currency in catalog/query cache keys.
- [ ] Refresh checkout pricing after currency changes.
- [ ] Keep financial fields out of order/payment request bodies.
- [ ] Use order currency for payment creation.
- [ ] Add explicit currency/exponent response types.
- [ ] Centralize exponent-aware money formatting.
- [ ] Preserve one idempotency key per logical payment attempt.
- [ ] Use backend Razorpay/Stripe client actions without conversion.
- [ ] Handle stable currency/payment errors.
- [ ] Preserve historical financial currency.
- [ ] Add unit, integration, and browser tests.
- [ ] Run typecheck, lint, tests, and production build.
- [ ] Report changed files, assumptions, deferred gaps, and verification results.
