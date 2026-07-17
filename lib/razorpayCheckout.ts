import { RazorpayCheckoutAction, VerifyRazorpayPayload } from "@/types";

const RAZORPAY_CHECKOUT_SRC = "https://checkout.razorpay.com/v1/checkout.js";

export interface RazorpayOptions {
  key: string;
  order_id: string;
  amount: number;
  currency: string;
  name: string;
  description?: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  handler: (response: RazorpayCheckoutSuccessResponse) => void;
  modal?: {
    ondismiss?: () => void;
  };
  theme?: {
    color?: string;
  };
}

interface RazorpayInstance {
  open: () => void;
  on?: (event: "payment.failed", handler: () => void) => void;
}

interface RazorpayConstructor {
  new (options: RazorpayOptions): RazorpayInstance;
}

interface RazorpayCheckoutSuccessResponse {
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  razorpay_signature?: string;
}

declare global {
  interface Window {
    Razorpay?: RazorpayConstructor;
  }
}

let razorpayScriptPromise: Promise<void> | null = null;

export type RazorpayCheckoutResult =
  | { type: "success"; confirmation: VerifyRazorpayPayload }
  | { type: "dismissed" }
  | { type: "failed" };

export const loadRazorpayCheckout = () => {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Razorpay Checkout can only load in the browser."));
  }

  if (window.Razorpay) {
    return Promise.resolve();
  }

  if (razorpayScriptPromise) {
    return razorpayScriptPromise;
  }

  razorpayScriptPromise = new Promise<void>((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>(
      `script[src="${RAZORPAY_CHECKOUT_SRC}"]`
    );

    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(), { once: true });
      existingScript.addEventListener(
        "error",
        () => {
          razorpayScriptPromise = null;
          reject(new Error("Razorpay Checkout failed to load."));
        },
        { once: true }
      );
      return;
    }

    const script = document.createElement("script");
    script.src = RAZORPAY_CHECKOUT_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      razorpayScriptPromise = null;
      script.remove();
      reject(new Error("Razorpay Checkout failed to load."));
    };
    document.body.appendChild(script);
  });

  return razorpayScriptPromise;
};

export const openRazorpayCheckout = async (
  action: RazorpayCheckoutAction,
  prefill: RazorpayOptions["prefill"],
  orderReference?: string
) => {
  await loadRazorpayCheckout();

  const Razorpay = window.Razorpay;
  if (!Razorpay) {
    throw new Error("Razorpay Checkout is unavailable.");
  }

  return new Promise<RazorpayCheckoutResult>((resolve) => {
    let settled = false;
    const settle = (result: RazorpayCheckoutResult) => {
      if (settled) return;
      settled = true;
      resolve(result);
    };

    const checkout = new Razorpay({
      key: action.keyId,
      order_id: action.providerOrderId,
      amount: action.amountMinor,
      currency: action.currency,
      name: action.merchantName,
      description: orderReference ? `Eco Caret ${orderReference}` : "Eco Caret order payment",
      prefill,
      handler: (response) => {
        settle({
          type: "success",
          confirmation: {
            razorpayOrderId: response.razorpay_order_id || "",
            razorpayPaymentId: response.razorpay_payment_id || "",
            razorpaySignature: response.razorpay_signature || "",
          },
        });
      },
      modal: {
        ondismiss: () => {
          settle({ type: "dismissed" });
        },
      },
      theme: {
        color: "#3C9984",
      },
    });

    checkout.on?.("payment.failed", () => {
      settle({ type: "failed" });
    });

    checkout.open();
  });
};
