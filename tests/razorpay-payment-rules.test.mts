import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  getPaymentAbandonIdempotencyKey,
  isPollablePayment,
  shouldPollPaymentStatus,
  TERMINAL_RETRY_PAYMENT_STATUSES,
} from "../lib/paymentStatusRules.ts";

const serviceSource = readFileSync(new URL("../services/api.ts", import.meta.url), "utf8");
const hookSource = readFileSync(new URL("../hooks/useRazorpayPayment.ts", import.meta.url), "utf8");
const checkoutSource = readFileSync(new URL("../lib/razorpayCheckout.ts", import.meta.url), "utf8");

test("stable abandon idempotency key uses the internal payment id", () => {
  assert.equal(
    getPaymentAbandonIdempotencyKey("pay_internal_123"),
    "payment-abandon:pay_internal_123"
  );
});

test("HTTP 202 starts polling even when returned status is terminal-looking", () => {
  assert.equal(shouldPollPaymentStatus("expired", 202), true);
});

test("non-terminal statuses keep the payment in polling/reconciliation", () => {
  for (const status of ["created", "requires_action", "processing", "authorized", "unknown", "review_required"] as const) {
    assert.equal(isPollablePayment(status), true);
    assert.equal(shouldPollPaymentStatus(status, 200), true);
  }
});

test("HTTP 200 expired enables retry by staying out of pollable statuses", () => {
  assert.equal(TERMINAL_RETRY_PAYMENT_STATUSES.includes("expired"), true);
  assert.equal(shouldPollPaymentStatus("expired", 200), false);
});

test("HTTP 200 paid follows the success flow without polling", () => {
  assert.equal(shouldPollPaymentStatus("paid", 200), false);
});

test("abandon endpoint uses the internal backend payment id and stable header", () => {
  assert.match(serviceSource, /payments\/\$\{paymentId\}\/abandon/);
  assert.match(serviceSource, /"Idempotency-Key": idempotencyKey/);
  assert.match(serviceSource, /"Content-Type": "application\/json"/);
});

test("Razorpay Checkout preserves modal dismiss handling with confirm close", () => {
  assert.match(checkoutSource, /confirm_close: true/);
  assert.match(checkoutSource, /ondismiss: \(\) =>/);
  assert.match(checkoutSource, /callbacks\?\.onDismiss\?\.\(\)/);
});

test("success callback is recorded before backend verification can race with abandon", () => {
  assert.match(checkoutSource, /callbacks\?\.onSuccessStart\?\.\(\)/);
  assert.match(hookSource, /paymentCallbackStartedRef\.current = true/);
  assert.match(hookSource, /if \(paymentCallbackStartedRef\.current\) return/);
});

test("repeated dismiss callbacks are guarded against duplicate abandon requests", () => {
  assert.match(hookSource, /abandonmentStartedRef/);
  assert.match(hookSource, /if \(abandonmentStartedRef\.current\) return/);
  assert.match(hookSource, /abandonmentStartedRef\.current = true/);
});

test("polling timeout keeps the payment non-terminal and exposes manual status checking", () => {
  assert.match(hookSource, /60_000/);
  assert.match(hookSource, /Payment verification is taking longer than expected/);
  assert.match(hookSource, /checkPaymentStatus/);
});
