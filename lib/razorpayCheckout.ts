import { RazorpayCheckoutAction, VerifyRazorpayPayload } from "@/types";

const RAZORPAY_CHECKOUT_SRC = "https://checkout.razorpay.com/v1/checkout.js";

export interface RazorpayOptions {
  key: string;
  order_id: string;
  amount: number;
  currency: string;
  name: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  handler: (response: VerifyRazorpayPayload) => void;
  modal?: {
    ondismiss?: () => void;
  };
}

interface RazorpayInstance {
  open: () => void;
}

interface RazorpayConstructor {
  new (options: RazorpayOptions): RazorpayInstance;
}

declare global {
  interface Window {
    Razorpay?: RazorpayConstructor;
  }
}

let razorpayScriptPromise: Promise<void> | null = null;

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
  onDismiss: () => void
) => {
  await loadRazorpayCheckout();

  const Razorpay = window.Razorpay;
  if (!Razorpay) {
    throw new Error("Razorpay Checkout is unavailable.");
  }

  return new Promise<VerifyRazorpayPayload | null>((resolve) => {
    let settled = false;
    const checkout = new Razorpay({
      key: action.keyId,
      order_id: action.providerOrderId,
      amount: action.amountMinor,
      currency: action.currency,
      name: action.merchantName,
      prefill,
      handler: (response) => {
        settled = true;
        resolve(response);
      },
      modal: {
        ondismiss: () => {
          if (!settled) {
            onDismiss();
            resolve(null);
          }
        },
      },
    });

    checkout.open();
  });
};
