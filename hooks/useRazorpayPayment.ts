import { useCallback, useEffect, useRef, useState } from "react";
import {
  ApiRequestError,
  createRazorpayPayment,
  getOrderPayment,
  listOrderPayments,
  verifyRazorpayPayment,
} from "@/services/api";
import { openRazorpayCheckout } from "@/lib/razorpayCheckout";
import {
  CustomerPayment,
  CustomerPaymentStatus,
  RazorpayCheckoutAction,
} from "@/types";

type PaymentMessageType = "idle" | "info" | "success" | "warning" | "error";

interface PaymentMessage {
  type: PaymentMessageType;
  text: string;
}

interface StartPaymentOptions {
  orderId: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
}

interface UseRazorpayPaymentOptions {
  onPaid?: (payment: CustomerPayment) => void;
  onPending?: (payment: CustomerPayment) => void;
}

const ACTIVE_PAYMENT_STATUSES: CustomerPaymentStatus[] = [
  "created",
  "requires_action",
  "processing",
  "authorized",
  "unknown",
  "review_required",
];

const TERMINAL_PAYMENT_STATUSES: CustomerPaymentStatus[] = [
  "paid",
  "failed",
  "cancelled",
  "expired",
];

const isTerminalPayment = (status: CustomerPaymentStatus) =>
  TERMINAL_PAYMENT_STATUSES.includes(status);

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
    if (error.status === 409 && error.code === "PAYMENT_ACTIVE_ATTEMPT_EXISTS") {
      return "An active Razorpay payment already exists. We are recovering it now.";
    }
    if (error.code === "PAYMENT_PROVIDER_DISABLED") {
      return "Razorpay payments are not available right now. Please try again later.";
    }
    if (error.code === "ORDER_RESERVATION_EXPIRED") {
      return "This order reservation expired. Please review your bag before trying again.";
    }
    if (error.code === "PAYMENT_CONFIRMATION_MISMATCH") {
      return "Payment confirmation did not match this order. Please check payment status or contact support.";
    }
  }

  if (error instanceof Error && error.message) return error.message;
  return "Payment could not be completed. Please try again.";
};

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

export const useRazorpayPayment = ({ onPaid, onPending }: UseRazorpayPaymentOptions = {}) => {
  const [payment, setPayment] = useState<CustomerPayment | null>(null);
  const [message, setMessage] = useState<PaymentMessage>({ type: "idle", text: "" });
  const [busy, setBusy] = useState(false);
  const [polling, setPolling] = useState(false);
  const activeCheckoutRef = useRef(false);
  const pollTimerRef = useRef<number | null>(null);
  const pollStartRef = useRef(0);

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
        setMessage({ type: "success", text: "Payment verified successfully." });
        clearStoredAttempt(nextPayment.orderId);
        onPaid?.(nextPayment);
        return;
      }

      if (nextPayment.status === "review_required") {
        setMessage({ type: "warning", text: "Payment is being reviewed. We will update this order after verification." });
        onPending?.(nextPayment);
        return;
      }

      if (["processing", "authorized", "unknown"].includes(nextPayment.status)) {
        setMessage({ type: "info", text: "Payment confirmation is pending. We are checking the backend status." });
        onPending?.(nextPayment);
        return;
      }

      if (nextPayment.status === "failed") {
        setMessage({ type: "error", text: "Payment failed. You can start a fresh Razorpay attempt." });
        clearStoredAttempt(nextPayment.orderId);
        return;
      }

      if (nextPayment.status === "cancelled" || nextPayment.status === "expired") {
        setMessage({ type: "warning", text: "This payment attempt is closed. You can start a new attempt." });
        clearStoredAttempt(nextPayment.orderId);
      }
    },
    [onPaid, onPending]
  );

  const pollPaymentStatus = useCallback(
    (orderId: string, paymentId: string) => {
      stopPolling();
      setPolling(true);
      pollStartRef.current = Date.now();

      const poll = async () => {
        try {
          const result = await getOrderPayment(orderId, paymentId);
          handlePaymentState(result.data);

          if (isTerminalPayment(result.data.status) || result.data.status === "review_required") {
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

          pollTimerRef.current = window.setTimeout(poll, 2500);
        } catch (error) {
          stopPolling();
          setMessage({ type: "warning", text: safePaymentMessage(error) });
        }
      };

      pollTimerRef.current = window.setTimeout(poll, 2500);
    },
    [handlePaymentState, stopPolling]
  );

  const openCheckout = useCallback(
    async (paymentForCheckout: CustomerPayment, prefill: StartPaymentOptions["prefill"]) => {
      if (paymentForCheckout.clientAction?.type !== "razorpay_checkout") {
        handlePaymentState(paymentForCheckout);
        if (!isTerminalPayment(paymentForCheckout.status)) {
          pollPaymentStatus(paymentForCheckout.orderId, paymentForCheckout.id);
        }
        return paymentForCheckout;
      }

      if (activeCheckoutRef.current) return paymentForCheckout;
      activeCheckoutRef.current = true;
      setMessage({ type: "info", text: "Opening Razorpay Checkout..." });

      try {
        const action = paymentForCheckout.clientAction as RazorpayCheckoutAction;
        const checkoutResponse = await openRazorpayCheckout(action, prefill, () => {
          activeCheckoutRef.current = false;
          setMessage({
            type: "warning",
            text: "Checkout was closed. This is not a failed payment until the backend reports it.",
          });
        });

        if (!checkoutResponse) {
          return paymentForCheckout;
        }

        setMessage({ type: "info", text: "Verifying payment with Eco Caret..." });
        const verified = await verifyRazorpayPayment(
          paymentForCheckout.orderId,
          paymentForCheckout.id,
          checkoutResponse
        );
        handlePaymentState(verified.data);

        if (verified.data.status !== "paid") {
          pollPaymentStatus(verified.data.orderId, verified.data.id);
        }

        return verified.data;
      } finally {
        activeCheckoutRef.current = false;
      }
    },
    [handlePaymentState, pollPaymentStatus]
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
    async ({ orderId, prefill }: StartPaymentOptions) => {
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
          const result = await createRazorpayPayment(orderId, stored.key);
          createdPayment = result.data;
        } catch (error) {
          if (error instanceof ApiRequestError && error.status === 409 && error.code === "PAYMENT_ACTIVE_ATTEMPT_EXISTS") {
            setMessage({ type: "info", text: "Recovering your active Razorpay payment..." });
            const recovered = await recoverActivePayment(orderId);
            if (!recovered) throw error;
            createdPayment = recovered;
          } else {
            throw error;
          }
        }

        writeStoredAttempt(orderId, stored.key, createdPayment.id);
        setPayment(createdPayment);
        return await openCheckout(createdPayment, prefill);
      } catch (error) {
        setMessage({ type: "error", text: safePaymentMessage(error) });
        return null;
      } finally {
        setBusy(false);
      }
    },
    [busy, openCheckout, payment, recoverActivePayment]
  );

  const resumePayment = useCallback(
    async (orderId: string, prefill?: StartPaymentOptions["prefill"]) => {
      if (busy || activeCheckoutRef.current) return payment;

      setBusy(true);
      try {
        const stored = readStoredAttempt(orderId);
        const recovered = stored.paymentId
          ? (await getOrderPayment(orderId, stored.paymentId)).data
          : await recoverActivePayment(orderId);

        if (!recovered) {
          setMessage({ type: "warning", text: "No active Razorpay payment attempt was found." });
          return null;
        }

        setPayment(recovered);
        if (recovered.status === "requires_action" || recovered.status === "created") {
          return await openCheckout(recovered, prefill);
        }

        if (!isTerminalPayment(recovered.status)) {
          pollPaymentStatus(recovered.orderId, recovered.id);
        }
        handlePaymentState(recovered);
        return recovered;
      } catch (error) {
        setMessage({ type: "error", text: safePaymentMessage(error) });
        return null;
      } finally {
        setBusy(false);
      }
    },
    [busy, handlePaymentState, openCheckout, payment, pollPaymentStatus, recoverActivePayment]
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
