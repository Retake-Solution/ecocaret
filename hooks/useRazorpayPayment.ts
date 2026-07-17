import { useCallback, useEffect, useRef, useState } from "react";
import {
  ApiRequestError,
  createOrderPayment,
  getOrderPayment,
  listOrderPayments,
  verifyRazorpayPayment,
} from "@/services/api";
import { openRazorpayCheckout } from "@/lib/razorpayCheckout";
import { CustomerPayment, CustomerPaymentStatus } from "@/types";

type PaymentMessageType = "idle" | "info" | "success" | "warning" | "error";

interface PaymentMessage {
  type: PaymentMessageType;
  text: string;
}

interface StartPaymentOptions {
  orderId: string;
  orderReference?: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
}

interface UseRazorpayPaymentOptions {
  onPaid?: (payment: CustomerPayment) => void;
  onPending?: (payment: CustomerPayment) => void;
  onTerminal?: (payment: CustomerPayment) => void;
  onOrderRefresh?: () => void | Promise<unknown>;
}

const ACTIVE_PAYMENT_STATUSES: CustomerPaymentStatus[] = [
  "created",
  "requires_action",
  "processing",
  "authorized",
  "unknown",
];

const POLLABLE_PAYMENT_STATUSES: CustomerPaymentStatus[] = [
  "processing",
  "authorized",
  "unknown",
];

const isPollablePayment = (status: CustomerPaymentStatus) =>
  POLLABLE_PAYMENT_STATUSES.includes(status);

const isActiveRazorpayPayment = (payment: CustomerPayment) =>
  payment.provider === "razorpay" && ACTIVE_PAYMENT_STATUSES.includes(payment.status);

const sessionKey = (orderId: string) => `eco_caret_razorpay_attempt_${orderId}`;

const createUUID = () => {
  if (typeof window !== "undefined" && window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }

  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (char) => {
    const random = (Math.random() * 16) | 0;
    const value = char === "x" ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
};

const safePaymentMessage = (error: unknown) => {
  if (error instanceof ApiRequestError) {
    if (error.status === 401) return "Your session expired. Please sign in again to continue payment.";
    if (error.status === 404) return "This order payment is unavailable. Please refresh your order history.";
    if (error.status === 429 || error.code === "PAYMENT_ATTEMPT_LIMIT_EXCEEDED") {
      return "Too many payment attempts were started. Please wait and try again later.";
    }

    switch (error.code) {
      case "PAYMENT_ALREADY_PAID":
        return "This order has already been paid. We refreshed the order state.";
      case "PAYMENT_ACTIVE_ATTEMPT_EXISTS":
        return "An active payment already exists. We are recovering it now.";
      case "PAYMENT_RESERVATION_EXPIRED":
      case "ORDER_RESERVATION_EXPIRED":
        return "This order reservation expired. Please contact support before trying again.";
      case "PAYMENT_NOT_REQUIRED":
        return "This order does not require payment.";
      case "PAYMENT_REVIEW_REQUIRED":
        return "This payment requires support review before another attempt can be made.";
      case "PAYMENT_PROVIDER_UNAVAILABLE":
      case "PAYMENT_PROVIDER_DISABLED":
        return "Razorpay payments are not available right now. Please try again later.";
      case "PAYMENT_CONFIRMATION_MISMATCH":
      case "INVALID_SIGNATURE":
        return "Payment confirmation could not be verified. Please contact support.";
      default:
        return "Payment could not be completed. Please try again.";
    }
  }

  if (error instanceof Error && error.message.includes("Razorpay Checkout")) {
    return "Razorpay Checkout could not be loaded. Please check your connection and try again.";
  }

  return "Payment could not be completed. Please try again.";
};

const shouldRefreshOrderAfterError = (error: unknown) =>
  error instanceof ApiRequestError &&
  [
    "PAYMENT_ALREADY_PAID",
    "PAYMENT_NOT_REQUIRED",
    "PAYMENT_REVIEW_REQUIRED",
    "PAYMENT_RESERVATION_EXPIRED",
    "ORDER_RESERVATION_EXPIRED",
  ].includes(error.code || "");

const shouldClearAttemptAfterError = shouldRefreshOrderAfterError;

const readStoredAttempt = (orderId: string) => {
  if (typeof window === "undefined") return { key: "", paymentId: "" };

  try {
    const raw = sessionStorage.getItem(sessionKey(orderId));
    if (!raw) return { key: "", paymentId: "" };
    const parsed = JSON.parse(raw) as { key?: string; paymentId?: string };
    return {
      key: parsed.key || "",
      paymentId: parsed.paymentId || "",
    };
  } catch {
    return { key: "", paymentId: "" };
  }
};

const writeStoredAttempt = (orderId: string, key: string, paymentId?: string) => {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(sessionKey(orderId), JSON.stringify({ key, paymentId }));
};

const clearStoredAttempt = (orderId: string) => {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(sessionKey(orderId));
};

const newestPayment = (payments: CustomerPayment[]) =>
  [...payments].sort((a, b) => {
    const aTime = new Date(a.updatedAt || a.createdAt || 0).getTime();
    const bTime = new Date(b.updatedAt || b.createdAt || 0).getTime();
    return bTime - aTime;
  })[0];

export const useRazorpayPayment = ({
  onPaid,
  onPending,
  onTerminal,
  onOrderRefresh,
}: UseRazorpayPaymentOptions = {}) => {
  const [payment, setPayment] = useState<CustomerPayment | null>(null);
  const [message, setMessage] = useState<PaymentMessage>({ type: "idle", text: "" });
  const [busy, setBusy] = useState(false);
  const [polling, setPolling] = useState(false);
  const activeCheckoutRef = useRef(false);
  const verifyingRef = useRef(false);
  const pollTimerRef = useRef<number | null>(null);
  const pollStartRef = useRef(0);

  const refreshOrder = useCallback(() => {
    void onOrderRefresh?.();
  }, [onOrderRefresh]);

  const stopPolling = useCallback(() => {
    if (pollTimerRef.current) {
      window.clearTimeout(pollTimerRef.current);
      pollTimerRef.current = null;
    }
    setPolling(false);
  }, []);

  useEffect(() => stopPolling, [stopPolling]);

  const handlePaymentState = useCallback(
    (nextPayment: CustomerPayment) => {
      setPayment(nextPayment);

      if (nextPayment.status === "paid") {
        stopPolling();
        clearStoredAttempt(nextPayment.orderId);
        setMessage({ type: "success", text: "Payment verified successfully." });
        onPaid?.(nextPayment);
        return;
      }

      if (nextPayment.status === "review_required") {
        stopPolling();
        clearStoredAttempt(nextPayment.orderId);
        setMessage({
          type: "warning",
          text: "Payment requires support review. Please contact support before trying again.",
        });
        onTerminal?.(nextPayment);
        return;
      }

      if (isPollablePayment(nextPayment.status)) {
        setMessage({
          type: "info",
          text: "Payment verification in progress. We are checking the backend status.",
        });
        onPending?.(nextPayment);
        return;
      }

      if (nextPayment.status === "created" || nextPayment.status === "requires_action") {
        setMessage({ type: "info", text: "Payment required. Select Pay Now to continue." });
        return;
      }

      if (nextPayment.status === "failed") {
        stopPolling();
        clearStoredAttempt(nextPayment.orderId);
        setMessage({ type: "error", text: "Payment failed. You can start a fresh attempt." });
        onTerminal?.(nextPayment);
        return;
      }

      if (nextPayment.status === "cancelled" || nextPayment.status === "expired") {
        stopPolling();
        clearStoredAttempt(nextPayment.orderId);
        setMessage({
          type: "warning",
          text: nextPayment.status === "expired"
            ? "Payment session expired. Start a new attempt if the order still requires payment."
            : "Payment was cancelled. Start a new attempt if the order still requires payment.",
        });
        onTerminal?.(nextPayment);
      }
    },
    [onPaid, onPending, onTerminal, stopPolling]
  );

  const refreshPaymentState = useCallback(
    async (orderId: string, paymentId: string) => {
      try {
        const result = await getOrderPayment(orderId, paymentId);
        handlePaymentState(result.data);
        return result.data;
      } catch (error) {
        setMessage({ type: "warning", text: safePaymentMessage(error) });
        return null;
      }
    },
    [handlePaymentState]
  );

  const pollPaymentStatus = useCallback(
    (orderId: string, paymentId: string) => {
      stopPolling();
      setPolling(true);
      pollStartRef.current = Date.now();

      const poll = async (attempt: number) => {
        if (typeof document !== "undefined" && document.hidden) {
          stopPolling();
          setMessage({
            type: "warning",
            text: "Payment status checks paused while this tab is inactive. Refresh the order when you return.",
          });
          return;
        }

        try {
          const result = await getOrderPayment(orderId, paymentId);
          handlePaymentState(result.data);

          if (!isPollablePayment(result.data.status)) {
            stopPolling();
            return;
          }

          if (Date.now() - pollStartRef.current > 90_000) {
            stopPolling();
            setMessage({
              type: "warning",
              text: "Payment is still pending. You can refresh this order later without starting a new attempt.",
            });
            return;
          }

          const nextDelay = Math.min(2500 * Math.pow(1.35, attempt), 10_000);
          pollTimerRef.current = window.setTimeout(() => poll(attempt + 1), nextDelay);
        } catch (error) {
          stopPolling();
          setMessage({ type: "warning", text: safePaymentMessage(error) });
        }
      };

      pollTimerRef.current = window.setTimeout(() => poll(0), 2500);
    },
    [handlePaymentState, stopPolling]
  );

  const openCheckout = useCallback(
    async (
      paymentForCheckout: CustomerPayment,
      prefill: StartPaymentOptions["prefill"],
      orderReference?: string
    ) => {
      const action = paymentForCheckout.clientAction;
      const actionType = action?.type;

      if (actionType === "stripe_elements") {
        setPayment(paymentForCheckout);
        setMessage({
          type: "warning",
          text: "Stripe payment details were returned, but Razorpay is currently enabled for checkout.",
        });
        return paymentForCheckout;
      }

      if (actionType && actionType !== "razorpay_checkout") {
        setPayment(paymentForCheckout);
        setMessage({
          type: "error",
          text: "This payment action is not supported in the customer checkout.",
        });
        return paymentForCheckout;
      }

      if (!action || action.type !== "razorpay_checkout") {
        handlePaymentState(paymentForCheckout);
        if (isPollablePayment(paymentForCheckout.status)) {
          pollPaymentStatus(paymentForCheckout.orderId, paymentForCheckout.id);
        }
        return paymentForCheckout;
      }

      if (activeCheckoutRef.current) return paymentForCheckout;
      activeCheckoutRef.current = true;
      setMessage({ type: "info", text: "Opening Razorpay Checkout..." });

      try {
        const checkoutResult = await openRazorpayCheckout(action, prefill, orderReference);

        if (checkoutResult.type === "dismissed") {
          const refreshed = await refreshPaymentState(paymentForCheckout.orderId, paymentForCheckout.id);
          if (!refreshed || refreshed.status === "created" || refreshed.status === "requires_action") {
            setMessage({
              type: "warning",
              text: "Checkout was closed. This is not a failed payment until the backend reports it.",
            });
          }
          return paymentForCheckout;
        }

        if (checkoutResult.type === "failed") {
          const refreshed = await refreshPaymentState(paymentForCheckout.orderId, paymentForCheckout.id);
          if (!refreshed || refreshed.status === "created" || refreshed.status === "requires_action") {
            setMessage({
              type: "error",
              text: "Razorpay reported that this payment attempt failed. We refreshed the backend status.",
            });
          }
          return paymentForCheckout;
        }

        if (verifyingRef.current) return paymentForCheckout;
        verifyingRef.current = true;
        setMessage({ type: "info", text: "Verifying payment with Eco Caret..." });

        try {
          const verified = await verifyRazorpayPayment(
            paymentForCheckout.orderId,
            paymentForCheckout.id,
            checkoutResult.confirmation
          );
          handlePaymentState(verified.data);

          if (isPollablePayment(verified.data.status)) {
            pollPaymentStatus(verified.data.orderId, verified.data.id);
          }

          return verified.data;
        } catch (error) {
          const refreshed = await refreshPaymentState(paymentForCheckout.orderId, paymentForCheckout.id);
          refreshOrder();

          if (refreshed?.status === "paid") {
            return refreshed;
          }

          if (refreshed && isPollablePayment(refreshed.status)) {
            pollPaymentStatus(refreshed.orderId, refreshed.id);
            return refreshed;
          }

          if (refreshed?.status === "review_required") {
            return refreshed;
          }

          setMessage({
            type: "warning",
            text: safePaymentMessage(error),
          });
          return refreshed || paymentForCheckout;
        } finally {
          verifyingRef.current = false;
        }
      } catch (error) {
        setMessage({ type: "error", text: safePaymentMessage(error) });
        if (shouldRefreshOrderAfterError(error)) refreshOrder();
        return paymentForCheckout;
      } finally {
        activeCheckoutRef.current = false;
      }
    },
    [handlePaymentState, pollPaymentStatus, refreshOrder, refreshPaymentState]
  );

  const recoverActivePayment = useCallback(async (orderId: string) => {
    const payments = (await listOrderPayments(orderId)).data;
    const activePayment = newestPayment(payments.filter(isActiveRazorpayPayment));
    if (!activePayment) return null;
    writeStoredAttempt(orderId, readStoredAttempt(orderId).key || createUUID(), activePayment.id);
    setPayment(activePayment);
    return activePayment;
  }, []);

  const startPayment = useCallback(
    async ({ orderId, prefill, orderReference }: StartPaymentOptions) => {
      if (busy || activeCheckoutRef.current) return payment;

      setBusy(true);
      try {
        let stored = readStoredAttempt(orderId);
        if (!stored.key) {
          stored = { key: createUUID(), paymentId: stored.paymentId };
          writeStoredAttempt(orderId, stored.key, stored.paymentId);
        }

        let createdPayment: CustomerPayment;
        try {
          const result = await createOrderPayment(orderId, stored.key);
          createdPayment = result.data;
        } catch (error) {
          if (error instanceof ApiRequestError && error.status === 409 && error.code === "PAYMENT_ACTIVE_ATTEMPT_EXISTS") {
            setMessage({ type: "info", text: "Recovering your active payment attempt..." });
            const recovered = await recoverActivePayment(orderId);
            if (!recovered) throw error;
            createdPayment = recovered;
          } else {
            if (shouldClearAttemptAfterError(error)) clearStoredAttempt(orderId);
            if (shouldRefreshOrderAfterError(error)) refreshOrder();
            throw error;
          }
        }

        writeStoredAttempt(orderId, stored.key, createdPayment.id);
        setPayment(createdPayment);
        return await openCheckout(createdPayment, prefill, orderReference);
      } catch (error) {
        setMessage({ type: "error", text: safePaymentMessage(error) });
        return null;
      } finally {
        setBusy(false);
      }
    },
    [busy, openCheckout, payment, recoverActivePayment, refreshOrder]
  );

  const resumePayment = useCallback(
    async (
      orderId: string,
      prefill?: StartPaymentOptions["prefill"],
      orderReference?: string
    ) => {
      if (busy || activeCheckoutRef.current) return payment;

      setBusy(true);
      try {
        const stored = readStoredAttempt(orderId);
        let recovered: CustomerPayment | null = null;

        if (stored.paymentId) {
          try {
            recovered = (await getOrderPayment(orderId, stored.paymentId)).data;
          } catch (error) {
            if (error instanceof ApiRequestError && error.status === 404) {
              clearStoredAttempt(orderId);
            } else {
              throw error;
            }
          }
        }

        if (!recovered) {
          recovered = await recoverActivePayment(orderId);
        }

        if (!recovered) {
          setMessage({ type: "warning", text: "No active Razorpay payment attempt was found." });
          return null;
        }

        setPayment(recovered);
        if (recovered.status === "requires_action" || recovered.status === "created") {
          return await openCheckout(recovered, prefill, orderReference);
        }

        handlePaymentState(recovered);
        if (isPollablePayment(recovered.status)) {
          pollPaymentStatus(recovered.orderId, recovered.id);
        }
        return recovered;
      } catch (error) {
        setMessage({ type: "error", text: safePaymentMessage(error) });
        if (shouldRefreshOrderAfterError(error)) refreshOrder();
        return null;
      } finally {
        setBusy(false);
      }
    },
    [busy, handlePaymentState, openCheckout, payment, pollPaymentStatus, recoverActivePayment, refreshOrder]
  );

  const resetPaymentAttempt = useCallback((orderId: string) => {
    clearStoredAttempt(orderId);
    setPayment(null);
    setMessage({ type: "idle", text: "" });
  }, []);

  return {
    payment,
    message,
    busy,
    polling,
    startPayment,
    resumePayment,
    resetPaymentAttempt,
  };
};
