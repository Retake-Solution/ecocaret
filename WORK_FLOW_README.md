# Eco Caret Customer Workflow README

This file gives a visual understanding of the customer storefront workflow in the Eco Caret frontend.

Use this as the quick workflow map. For deeper contracts and payload examples, see:

- `README.md` for the full order-management reference.
- `CHECK_OUT.md` for the detailed checkout and order-status guide.

## Workflow Scope

This workflow covers:

- Browse products and add items to cart.
- Checkout authentication and address entry.
- Order creation with idempotency.
- Order detail ledger.
- Razorpay payment creation, success, dismissal, reconciliation, and retry.
- Customer cancellation for unshipped quantities.
- Customer return request for shipped quantities.
- Refund status tracking.
- Shipment, timeline, and invoice reads.

## Main Customer Journey

```mermaid
flowchart TD
  A["Customer visits storefront"] --> B["Browse collections"]
  B --> C["Open product detail"]
  C --> D["Choose variant and quantity"]
  D --> E["Add item to cart"]
  E --> F["Open checkout"]

  F --> G{"Customer logged in?"}
  G -- "No" --> H["Show login banner only"]
  H --> I["Customer signs in or registers"]
  I --> F

  G -- "Yes" --> J{"Cart has items?"}
  J -- "No" --> K["Show empty cart state"]
  K --> B

  J -- "Yes" --> L["Fill contact and shipping details"]
  L --> M["Validate required fields"]
  M --> N{"Valid?"}
  N -- "No" --> O["Show field errors and scroll to first error"]
  O --> L

  N -- "Yes" --> P["Create order with Idempotency-Key"]
  P --> Q{"Order created?"}
  Q -- "No" --> R["Show safe checkout error"]
  R --> L

  Q -- "Yes" --> S["Clear cart"]
  S --> T["Redirect to /orders/:orderId"]
  T --> U["Customer manages payment, shipment, cancellation, return, invoice"]
```

## Checkout To Order Creation

Checkout creates an order first. Payment happens after redirect on the order detail page.

```mermaid
sequenceDiagram
  autonumber
  participant Customer
  participant Checkout as "/checkout"
  participant Store as "Redux Cart/Profile"
  participant API as "Order API"
  participant OrderPage as "/orders/:id"

  Customer->>Checkout: Open checkout
  Checkout->>Store: Read cart, user, token
  alt Not authenticated
    Checkout-->>Customer: Show login banner only
  else Authenticated
    Customer->>Checkout: Submit contact and shipping details
    Checkout->>Checkout: Validate required fields
    Checkout->>Checkout: Build PlaceOrderPayload
    Checkout->>API: POST /api/v1/orders with Idempotency-Key
    API-->>Checkout: Order id and order summary
    Checkout->>Store: clearCart()
    Checkout->>OrderPage: Redirect to /orders/:id
  end
```

## Checkout Payload Understanding

```mermaid
flowchart LR
  A["Cart item id"] --> B["Parse productId, purity, metalColor, size"]
  B --> C["Derive metalType"]
  C --> D["Create items[] payload"]

  E["Checkout form"] --> F["Build shipping address"]
  F --> G["Reuse as billing address"]

  D --> H["PlaceOrderPayload"]
  G --> H
  H --> I["POST /api/v1/orders"]
```

Key rules:

| Area | Rule |
| --- | --- |
| Final totals | Backend is authoritative after order creation. |
| Cart summary | Checkout display total is only a preview. |
| Idempotency | Same checkout submission reuses the same key until success or mismatch. |
| Auth | Order creation requires bearer authentication. |
| Success | Cart is cleared only after order creation succeeds. |

## Order Detail Page Workflow

The order detail page is the customer ledger. It is the place where the customer pays, checks status, downloads invoices, cancels unshipped items, requests returns, and views shipments.

```mermaid
flowchart TD
  A["Open /orders/:id"] --> B["Load order details"]
  A --> C["Load order events"]
  A --> D["Load shipments"]
  A --> E["Load return requests"]

  B --> F["Render fulfillment and payment status"]
  C --> G["Render timeline"]
  D --> H["Render shipment panel"]
  E --> I["Render returns panel"]

  F --> J{"Amount due and payable?"}
  J -- "Yes" --> K["Show Pay Now"]
  J -- "No" --> L["Hide payment action"]

  F --> M{"Unshipped cancellable quantity?"}
  M -- "Yes" --> N["Show Cancel Unshipped Items"]
  M -- "No" --> O["Hide cancellation action"]

  F --> P{"Shipped returnable quantity?"}
  P -- "Yes" --> Q["Show Request Return"]
  P -- "No" --> R["Hide return action"]
```

## Razorpay Payment Workflow

Payment is created against an existing order. The internal backend payment id must be used for all frontend API calls.

```mermaid
sequenceDiagram
  autonumber
  participant Customer
  participant OrderPage as "Order Detail Page"
  participant Hook as "useRazorpayPayment"
  participant API as "Payment API"
  participant RZP as "Razorpay Checkout"

  Customer->>OrderPage: Click Pay Now
  OrderPage->>Hook: startPayment(orderId)
  Hook->>API: POST /orders/:id/payments
  API-->>Hook: Internal payment id + razorpay clientAction
  Hook->>RZP: Open Checkout with providerOrderId

  alt Payment success callback
    RZP-->>Hook: razorpay_order_id, razorpay_payment_id, signature
    Hook->>Hook: paymentCallbackStartedRef = true
    Hook->>API: POST /payments/:paymentId/verify-razorpay
    API-->>Hook: paid or non-terminal status
  else Checkout dismissed
    RZP-->>Hook: modal.ondismiss
    Hook->>Hook: Skip if success already started
    Hook->>Hook: abandonmentStartedRef prevents duplicates
    Hook->>API: POST /payments/:paymentId/abandon
    API-->>Hook: 200 terminal or 202 pending
  else Provider failed event
    RZP-->>Hook: payment.failed
    Hook->>API: GET /payments/:paymentId
  end

  opt Non-terminal or HTTP 202
    Hook->>API: Poll GET /payments/:paymentId every 2.5-3s
  end

  Hook->>OrderPage: Refresh order and update UI
```

## Payment Status Decision Tree

```mermaid
flowchart TD
  A["Payment status received"] --> B{"paid?"}
  B -- "Yes" --> C["Stop polling"]
  C --> D["Clear stored payment attempt"]
  D --> E["Refresh order"]
  E --> F["Show success"]

  B -- "No" --> G{"failed, cancelled, or expired?"}
  G -- "Yes" --> H["Stop polling"]
  H --> I["Show Payment was not completed"]
  I --> J["Refresh order"]
  J --> K["Retry allowed only if order is still payable"]

  G -- "No" --> L{"created, requires_action, processing, authorized, unknown, review_required?"}
  L -- "Yes" --> M["Keep retry disabled"]
  M --> N["Keep cancellation disabled"]
  N --> O["Poll status until terminal, paid, or timeout"]

  O --> P{"Timeout after 60 seconds?"}
  P -- "Yes" --> Q["Keep payment non-terminal"]
  Q --> R["Show Check payment status"]
  P -- "No" --> A
```

## Payment Safety Guards

| Guard | Purpose |
| --- | --- |
| `paymentCallbackStartedRef` | Prevents abandon request after Razorpay success starts. |
| `abandonmentStartedRef` | Prevents duplicate abandon requests from repeated dismiss callbacks. |
| `activeCheckoutRef` | Prevents multiple Checkout windows. |
| `verifyingRef` | Prevents overlapping backend verification. |
| `pollRequestInFlightRef` | Prevents overlapping payment-status polling requests. |
| `AbortController` | Cleans up payment-status request on stop/unmount. |
| `reconciling` | Locks Pay Now and cancellation while payment status is uncertain. |

## Order Cancellation Workflow

Cancellation applies only to unshipped quantities.

```mermaid
flowchart TD
  A["Customer opens order detail"] --> B["Frontend calculates cancelable quantity"]
  B --> C["ordered - cancelled - shipped"]
  C --> D{"Quantity > 0?"}
  D -- "No" --> E["No cancellation button"]
  D -- "Yes" --> F{"Payment reconciling?"}
  F -- "Yes" --> G["Disable cancellation"]
  F -- "No" --> H["Show Cancel Unshipped Items"]

  H --> I["Customer selects quantities and reason"]
  I --> J["POST /orders/:id/cancellations"]
  J --> K{"Success?"}
  K -- "No" --> L["Refresh order on conflict and show safe error"]
  K -- "Yes" --> M["Close modal"]
  M --> N["Refresh order workflow"]
  N --> O["Show refund status if applicable"]
```

Cancellation payload:

```json
{
  "reason": "Customer requested cancellation",
  "expectedVersion": 12,
  "items": [
    {
      "orderItemId": "order-item-id",
      "quantity": 1
    }
  ]
}
```

## Return And Refund Workflow

Returns apply to shipped quantities. Refund is backend/provider authoritative and may happen after inspection.

```mermaid
stateDiagram-v2
  [*] --> return_requested: Customer requests return
  return_requested --> return_in_transit: Return shipped back
  return_in_transit --> return_received: Warehouse receives item
  return_received --> inspection_approved: Approved
  return_received --> inspection_rejected: Rejected
  inspection_approved --> refund_processing: Refund obligation
  refund_processing --> refunded: Provider/backend confirms refund
  inspection_rejected --> return_rejected: No refund
  return_requested --> cancelled: Return cancelled
```

Returnable quantity:

```ts
returnableQuantity =
  shipped
  - returned
  - outstandingActiveReturnQuantity;
```

Return payload:

```json
{
  "expectedOrderVersion": 12,
  "reason": "Size issue",
  "items": [
    {
      "orderItemId": "order-item-id",
      "quantity": 1
    }
  ]
}
```

Refund statuses shown to the customer:

| Status | Customer meaning |
| --- | --- |
| `not_required` / `not_eligible` | Refund is not required or not eligible. |
| `refund_pending` | Refund obligation exists and is waiting. |
| `partially_refunded` | Some amount has been refunded. |
| `refunded` | Refund is complete. |
| `review_required` | Support or finance review is required. |

## Shipment And Invoice Workflow

```mermaid
flowchart TD
  A["Order detail page"] --> B["Load shipments"]
  B --> C{"Shipment exists?"}
  C -- "No" --> D["Show shipment empty/pending state"]
  C -- "Yes" --> E["Show carrier, service, tracking, status, dates"]

  A --> F["Customer clicks Download Invoice"]
  F --> G["GET /orders/:id/invoice as blob"]
  G --> H["Create temporary object URL"]
  H --> I["Trigger file download"]
```

Shipment and invoice rules:

| Area | Rule |
| --- | --- |
| Shipment source | Backend shipment DTO only. |
| Tracking | Show customer-safe carrier and tracking data. |
| Inventory | Frontend does not commit inventory locally. |
| Invoice | Downloaded as a blob from backend. |

## API Map

```mermaid
flowchart LR
  FE["Customer Frontend"] --> Auth["/api/v1/auth"]
  FE --> Orders["/api/v1/orders"]
  Orders --> OrderDetail["GET /orders/:id"]
  Orders --> Events["GET /orders/:id/events"]
  Orders --> Shipments["GET /orders/:id/shipments"]
  Orders --> Invoice["GET /orders/:id/invoice"]
  Orders --> Payments["/orders/:id/payments"]
  Payments --> Verify["POST /verify-razorpay"]
  Payments --> Abandon["POST /abandon"]
  Payments --> Status["GET /payments/:paymentId"]
  Orders --> Cancel["POST /orders/:id/cancellations"]
  Orders --> Returns["/orders/:id/returns"]
```

## Frontend File Responsibility

| File | Responsibility |
| --- | --- |
| `app/checkout/page.tsx` | Auth gate, checkout form, cart summary, order creation, redirect to order detail. |
| `app/orders/page.tsx` | Customer order list. |
| `app/orders/[id]/page.tsx` | Order ledger, payment UI, cancellation, returns, shipments, invoice, timeline. |
| `services/api.ts` | Typed API functions for orders, payments, returns, shipment, invoice. |
| `hooks/useRazorpayPayment.ts` | Payment attempt creation, verification, abandon, polling, manual status check. |
| `lib/razorpayCheckout.ts` | Razorpay script loading and Checkout configuration. |
| `lib/paymentStatusRules.ts` | Shared payment status helper rules. |
| `lib/idempotency.ts` | Stable idempotency key helper for mutations. |
| `types/api.ts` | Shared frontend DTO and status types. |

## Important Rules To Remember

- Checkout creates the order; payment is handled from order detail.
- Browser payment callbacks are not proof of payment.
- Closing Razorpay Checkout is not payment failure.
- Always use the internal backend payment id for payment API URLs.
- Do not create another payment while the current one is non-terminal.
- Do not allow cancellation while payment status is being reconciled.
- Backend totals, refund values, shipment state, and payment status are authoritative.
- Customer frontend never calls admin-only refund or inspection endpoints.

## Validation

Recommended validation after workflow changes:

```bash
npx.cmd tsc --noEmit --pretty false
npm.cmd run lint
node --test tests/razorpay-payment-rules.test.mts
npm.cmd run build
```

Known note: `npm.cmd run build` may need network access because Next.js fetches Google Fonts during production build.
