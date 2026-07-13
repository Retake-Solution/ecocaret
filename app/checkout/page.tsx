"use client";

import React, { useCallback, useRef, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProfileDialog from "@/components/ProfileDialog";
import { useAppDispatch, useAppSelector } from "@/lib/store";
import { clearCart, setCartOpen } from "@/lib/features/cart/cartSlice";
import { setProfileOpen } from "@/lib/features/profile/profileSlice";
import { THEME_COLORS } from "@/theme/colors";
import { placeOrder } from "@/services/api";
import { useRazorpayPayment } from "@/hooks/useRazorpayPayment";

const CHECKOUT_ORDER_STORAGE_KEY = "eco_caret_checkout_order";

const mapCountryCodeToName = (code?: string) => {
  if (!code) return "United Kingdom";
  const norm = code.toUpperCase();
  if (norm === "US") return "United States";
  if (norm === "GB" || norm === "UK") return "United Kingdom";
  if (norm === "BE") return "Belgium";
  if (norm === "FR") return "France";
  if (norm === "DE") return "Germany";
  return "United Kingdom";
};

const readStoredCheckoutOrder = () => {
  if (typeof window === "undefined") return { id: "", number: "" };
  try {
    const raw = sessionStorage.getItem(CHECKOUT_ORDER_STORAGE_KEY);
    if (!raw) return { id: "", number: "" };
    const parsed = JSON.parse(raw) as { id?: string; number?: string };
    return { id: parsed.id || "", number: parsed.number || "" };
  } catch {
    return { id: "", number: "" };
  }
};

const writeStoredCheckoutOrder = (id: string, number: string) => {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(CHECKOUT_ORDER_STORAGE_KEY, JSON.stringify({ id, number }));
};

const clearStoredCheckoutOrder = () => {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(CHECKOUT_ORDER_STORAGE_KEY);
};

export default function CheckoutPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const cartItems = useAppSelector((state) => state.cart.items);
  const profileOpen = useAppSelector((state) => state.profile.isOpen);
  const user = useAppSelector((state) => state.profile.user);
  const token = useAppSelector((state) => state.profile.token);
  const isLoggedIn = Boolean(
    user ||
    token ||
    (typeof window !== "undefined" && localStorage.getItem("eco_caret_token"))
  );

  const [scrolled, setScrolled] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitPhase, setSubmitPhase] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const storedCheckoutOrder = readStoredCheckoutOrder();
  const [orderNumber, setOrderNumber] = useState(storedCheckoutOrder.number);
  const [createdOrderId, setCreatedOrderId] = useState(storedCheckoutOrder.id);
  const [selectedAddressIndex, setSelectedAddressIndex] = useState<number | null>(null);
  const [idempotencyKey, setIdempotencyKey] = useState<string>("");
  const restoredPaymentRef = useRef(false);
  const paymentFlow = useRazorpayPayment({
    onPaid: () => {
      setIsSubmitting(false);
      setSubmitPhase("");
      setIsSuccess(true);
      setIdempotencyKey("");
      clearStoredCheckoutOrder();
      dispatch(clearCart());
    },
    onPending: () => {
      setIsSubmitting(false);
    },
  });

  // Form State
  const [form, setForm] = useState({
    email: user?.email || "",
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    postalCode: "",
    country: "United Kingdom",
    phone: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    const effectiveEmail = form.email || user?.email || "";
    if (!effectiveEmail) newErrors.email = "Email is required";
    if (!form.firstName) newErrors.firstName = "First name is required";
    if (!form.lastName) newErrors.lastName = "Last name is required";
    if (!form.address) newErrors.address = "Address is required";
    if (!form.city) newErrors.city = "City is required";
    if (!form.postalCode) newErrors.postalCode = "Postal code is required";
    if (!form.phone) newErrors.phone = "Phone number is required";

    setErrors(newErrors);
    return newErrors;
  };

  const getPaymentPrefill = useCallback(() => ({
    name: `${form.firstName} ${form.lastName}`.trim() || user?.name || "",
    email: form.email || user?.email || "",
    contact: form.phone,
  }), [form.email, form.firstName, form.lastName, form.phone, user?.email, user?.name]);

  useEffect(() => {
    if (!isLoggedIn || !createdOrderId || restoredPaymentRef.current || isSuccess) return;

    restoredPaymentRef.current = true;
    const timer = window.setTimeout(() => {
      void paymentFlow.resumePayment(createdOrderId, getPaymentPrefill());
    }, 0);

    return () => window.clearTimeout(timer);
  }, [createdOrderId, getPaymentPrefill, isLoggedIn, isSuccess, paymentFlow]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (createdOrderId) {
      setIsSubmitting(true);
      setSubmitPhase("Resuming secure Razorpay payment...");
      await paymentFlow.startPayment({ orderId: createdOrderId, prefill: getPaymentPrefill() });
      setIsSubmitting(false);
      return;
    }

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      // Scroll to the first error
      const firstErrorKey = Object.keys(validationErrors)[0];
      const element = document.getElementsByName(firstErrorKey)[0];
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    const savedToken = typeof window !== "undefined" ? localStorage.getItem("eco_caret_token") : null;
    if (!savedToken) {
      alert("Please sign in to place your order.");
      dispatch(setProfileOpen(true));
      return;
    }

    setIsSubmitting(true);
    setSubmitPhase("Establishing secure SSL connection...");

    // Format items payload
    const items = cartItems.map((item) => {
      const parts = item.id.split("-");
      const productId = parts[0];
      const purity = parts[1];
      const metalColor = parts[2];
      const size = parts.slice(3).join("-");
      
      const getMetalType = (p: string) => {
        const norm = p.toLowerCase();
        if (norm.includes("k") || norm.includes("gold")) return "gold";
        if (norm.includes("925") || norm.includes("silver")) return "silver";
        if (norm.includes("pt") || norm.includes("950") || norm.includes("platinum")) return "platinum";
        return "gold";
      };

      return {
        productId,
        metalType: getMetalType(purity),
        metalColor: metalColor.toLowerCase(),
        purity,
        size,
        quantity: item.quantity,
      };
    });

    const address = {
      name: `${form.firstName} ${form.lastName}`,
      line1: form.address,
      city: form.city,
      state: form.city,
      postalCode: form.postalCode,
      country: form.country === "United Kingdom" ? "GB" : form.country === "United States" ? "US" : form.country === "Belgium" ? "BE" : form.country === "France" ? "FR" : "DE",
      phone: form.phone,
    };

    const payload = {
      items,
      shippingAddress: address,
      billingAddress: address,
    };

    let currentKey = idempotencyKey;
    if (!currentKey) {
      if (typeof window !== "undefined" && window.crypto && window.crypto.randomUUID) {
        currentKey = window.crypto.randomUUID();
      } else {
        currentKey = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
          const r = (Math.random() * 16) | 0;
          const v = c === "x" ? r : (r & 0x3) | 0x8;
          return v.toString(16);
        });
      }
      setIdempotencyKey(currentKey);
    }

    try {
      setSubmitPhase("Transmitting order details...");
      const result = await placeOrder(payload, currentKey);

      const nextOrderNumber = result.data.orderNumber || `ORD-${Date.now()}`;
      setOrderNumber(nextOrderNumber);
      setCreatedOrderId(result.data.id);
      writeStoredCheckoutOrder(result.data.id, nextOrderNumber);
      setSubmitPhase("Opening Razorpay Checkout...");
      await paymentFlow.startPayment({
        orderId: result.data.id,
        prefill: getPaymentPrefill(),
      });
      setIsSubmitting(false);
    } catch (err: unknown) {
      setIsSubmitting(false);
      const errMsg = err instanceof Error ? err.message : "";
      if (errMsg.includes("ORDER_IDEMPOTENCY_IN_PROGRESS")) {
        alert("Your request is being processed. Please wait.");
      } else if (errMsg.includes("ORDER_INVENTORY_CONFLICT")) {
        alert("Sorry, one or more items are no longer available.");
        router.push("/cart");
      } else if (errMsg.includes("ORDER_IDEMPOTENCY_MISMATCH")) {
        const newKey = typeof window !== "undefined" && window.crypto && window.crypto.randomUUID
          ? window.crypto.randomUUID()
          : "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
              const r = (Math.random() * 16) | 0;
              const v = c === "x" ? r : (r & 0x3) | 0x8;
              return v.toString(16);
            });
        setIdempotencyKey(newKey);
        alert("Session mismatch. We have refreshed the checkout session, please try placing the order again.");
      } else {
        alert(errMsg || "An error occurred while placing your order. Please try again.");
      }
    }
  };

  const subtotal = cartItems.reduce((acc, curr) => acc + curr.price * curr.quantity, 0);
  const tax = subtotal * 0.08; // 8% simulated tax
  const shipping = subtotal > 5000 || subtotal === 0 ? 0 : 50;
  const total = subtotal + tax + shipping;

  return (
    <div className="bg-background text-on-surface font-body-md min-h-screen flex flex-col relative overflow-x-hidden selection:bg-secondary-container">
      <style dangerouslySetInnerHTML={{ __html: `
        .checkout-card {
          background-color: ${THEME_COLORS.global["surface-container-low"]};
          border: 1px solid rgba(109, 128, 122, 0.14);
        }
        .font-playfair {
          font-family: var(--font-playfair-display), serif;
        }
        .organic-shadow {
          box-shadow: 0 10px 30px -10px rgba(60, 153, 132, 0.12);
        }
      `}} />

      {/* Header */}
      <Header
        scrolled={scrolled}
        setCartOpen={(open) => dispatch(setCartOpen(open))}
        setProfileOpen={(open) => dispatch(setProfileOpen(open))}
        cartItemsCount={cartItems.reduce((acc, curr) => acc + curr.quantity, 0)}
      />

      <main className="flex-grow max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-16 pt-28 w-full">
        {!isLoggedIn ? (
          <div className="max-w-2xl mx-auto py-16 md:py-24">
            <div className="rounded-3xl border border-primary/20 bg-primary/5 p-8 md:p-10 text-center space-y-6 shadow-sm">
              <span
                className="material-symbols-outlined text-6xl text-primary"
                style={{ color: THEME_COLORS.global.primary }}
              >
                lock_person
              </span>
              <div className="space-y-3">
                <h1 className="font-headline-lg text-headline-lg text-on-surface font-bold">
                  Login required
                </h1>
                <p className="text-on-surface-variant font-body-md text-body-md max-w-lg mx-auto leading-relaxed">
                  Please sign in before checkout so we can reserve inventory and verify payment securely.
                </p>
              </div>
              <button
                type="button"
                onClick={() => dispatch(setProfileOpen(true))}
                className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-primary text-on-primary font-label-md text-label-md font-bold uppercase tracking-wider hover:bg-primary/90 transition-all cursor-pointer"
                style={{ backgroundColor: THEME_COLORS.global.primary }}
              >
                Sign In / Register
              </button>
            </div>
          </div>
        ) : isSuccess ? (
          /* Order Confirmation Screen */
          <div className="max-w-2xl mx-auto text-center py-12 md:py-20 space-y-8">
            <span className="material-symbols-outlined text-7xl bg-primary-container/20 p-6 rounded-full inline-block animate-pulse" style={{ color: THEME_COLORS.global.primary }}>
              workspace_premium
            </span>
            <div className="space-y-4">
              <h1 className="font-playfair text-display-md font-bold tracking-tight text-on-surface">
                Order Completed Successfully
              </h1>
              <p className="text-on-surface-variant font-body-lg max-w-lg mx-auto">
                Thank you for selecting conscious craftsmanship. Your order has been securely processed, and the certificate of origin is registered.
              </p>
            </div>

            <div className="checkout-card rounded-2xl p-8 max-w-md mx-auto space-y-4 text-left shadow-sm">
              <h3 className="font-label-md text-label-md uppercase tracking-wider text-secondary font-bold">
                Transaction Details
              </h3>
              <div className="flex justify-between border-b border-outline-variant/10 pb-2">
                <span className="text-on-surface-variant">Order Number</span>
                <span className="font-bold text-on-surface">{orderNumber}</span>
              </div>
              <div className="flex justify-between border-b border-outline-variant/10 pb-2">
                <span className="text-on-surface-variant">Shipping To</span>
                <span className="font-bold text-on-surface">{form.firstName} {form.lastName}</span>
              </div>
              <div className="flex justify-between border-b border-outline-variant/10 pb-2">
                <span className="text-on-surface-variant">Destination</span>
                <span className="font-bold text-on-surface">{form.city}, {form.country}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Total Value Paid</span>
                <span className="font-bold text-primary font-label-md">${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/collections"
                className="px-8 py-4 bg-primary text-on-primary rounded-full font-label-md text-label-md hover:opacity-90 transition-all text-center font-bold tracking-wider w-full sm:w-auto shadow-md"
              >
                Continue Exploring
              </Link>
              <Link
                href="/orders"
                className="px-8 py-4 border border-outline-variant text-on-surface hover:bg-surface-container rounded-full font-label-md text-label-md transition-all text-center font-bold tracking-wider w-full sm:w-auto"
              >
                View Order History
              </Link>
            </div>
          </div>
        ) : isSubmitting ? (
          /* Processing Screen */
          <div className="max-w-md mx-auto text-center py-24 space-y-8">
            <div className="relative w-24 h-24 mx-auto">
              <div className="absolute inset-0 rounded-full border-4 border-outline-variant/20"></div>
              <div className="absolute inset-0 rounded-full border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent animate-spin" style={{ borderTopColor: THEME_COLORS.global.primary }}></div>
              <span className="absolute inset-0 flex items-center justify-center material-symbols-outlined text-4xl text-primary animate-pulse" style={{ color: THEME_COLORS.global.primary }}>
                shield_with_heart
              </span>
            </div>
            <div className="space-y-3">
              <h2 className="font-headline-md text-headline-md text-on-surface font-semibold">
                Securing Order Transaction
              </h2>
              <p className="text-on-surface-variant animate-pulse font-label-sm tracking-wide uppercase text-xs">
                {paymentFlow.message.text || submitPhase}
              </p>
            </div>
          </div>
        ) : cartItems.length === 0 ? (
          /* Empty Cart State */
          <div className="max-w-md mx-auto text-center py-20 space-y-6">
            <span className="material-symbols-outlined text-7xl text-outline-variant">
              shopping_cart_checkout
            </span>
            <div className="space-y-2">
              <h1 className="font-playfair text-headline-lg font-bold text-on-surface">
                Empty Collection Bag
              </h1>
              <p className="text-on-surface-variant">
                You must add items to your cart before proceeding to checkout.
              </p>
            </div>
            <Link
              href="/collections"
              className="px-8 py-4 bg-primary text-on-primary rounded-full font-label-md text-label-md inline-block hover:opacity-90 transition-all font-bold tracking-wider"
            >
              Discover Masterpieces
            </Link>
          </div>
        ) : (
          /* Checkout Layout */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Left Column: Form Details */}
            <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-10">
              <h1 className="font-playfair text-display-sm font-bold tracking-tight text-on-surface border-b border-outline-variant/10 pb-4">
                Secure Checkout
              </h1>

              {/* Step 1: Customer Contact Info */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs" style={{ color: THEME_COLORS.global.primary, backgroundColor: `${THEME_COLORS.global.primary}15` }}>
                    1
                  </span>
                  <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                    Contact Sourcing Identity
                  </h2>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="email" className="font-label-sm text-label-sm text-on-surface-variant font-semibold">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    className={`w-full rounded-xl border px-5 py-3.5 bg-surface-bright outline-none transition-colors ${
                      errors.email ? "border-error" : "border-outline-variant focus:border-primary"
                    }`}
                    placeholder="sourcing@ecocaret.com"
                  />
                  {errors.email && <span className="text-error text-xs">{errors.email}</span>}
                </div>
              </div>

              {/* Step 2: Shipping Sourcing Info */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs" style={{ color: THEME_COLORS.global.primary, backgroundColor: `${THEME_COLORS.global.primary}15` }}>
                    2
                  </span>
                  <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                    Shipping Destination
                  </h2>
                </div>

                {/* Saved Addresses Cards */}
                {user?.shippingAddresses && user.shippingAddresses.length > 0 && (
                  <div className="space-y-3 mb-6">
                    <label className="font-label-xs text-[10px] text-secondary font-bold uppercase tracking-wider block">
                      Choose Saved Sourcing Address
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {user.shippingAddresses.map((addr, idx) => {
                        const isSelected = selectedAddressIndex === idx;
                        return (
                          <div
                            key={idx}
                            onClick={() => {
                              setSelectedAddressIndex(idx);
                              const nameParts = addr.name.trim().split(/\s+/);
                              const firstName = nameParts[0] || "";
                              const lastName = nameParts.slice(1).join(" ") || "";
                              
                              setForm((prev) => ({
                                ...prev,
                                firstName,
                                lastName,
                                address: addr.line1 + (addr.line2 ? `, ${addr.line2}` : ""),
                                city: addr.city,
                                postalCode: addr.postalCode,
                                country: mapCountryCodeToName(addr.country),
                                phone: addr.phone,
                              }));
                            }}
                            className={`p-5 rounded-[2rem] border transition-all duration-300 cursor-pointer flex flex-col justify-between relative group ${
                              isSelected
                                ? "bg-secondary-container/10 border-primary shadow-sm"
                                : "bg-surface-container-low border-outline-variant/30 hover:border-primary/40 hover:bg-surface-container-high/45"
                            }`}
                            style={{
                              borderColor: isSelected ? THEME_COLORS.global.primary : undefined,
                            }}
                          >
                            <div className="space-y-1.5 text-sm">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-on-surface text-base group-hover:text-primary transition-colors">
                                  {addr.name}
                                </span>
                                {isSelected && (
                                  <span className="material-symbols-outlined text-primary text-xl animate-scale-up" style={{ color: THEME_COLORS.global.primary }}>
                                    check_circle
                                  </span>
                                )}
                              </div>
                              <p className="text-on-surface-variant text-xs leading-relaxed mt-1">
                                {addr.line1}
                                {addr.line2 && `, ${addr.line2}`}
                                <br />
                                {addr.city}, {addr.state} {addr.postalCode}
                                <br />
                                <span className="uppercase font-semibold tracking-wider text-[10px]">{addr.country}</span>
                              </p>
                            </div>
                            <div className="pt-3 border-t border-outline-variant/10 mt-4 flex items-center justify-between text-xs text-on-surface-variant">
                              <span className="flex items-center gap-1 font-medium">
                                <span className="material-symbols-outlined text-sm">call</span>
                                {addr.phone}
                              </span>
                              {addr.isDefault && (
                                <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-[9px] uppercase tracking-wider font-bold" style={{ color: THEME_COLORS.global.primary, backgroundColor: `${THEME_COLORS.global.primary}15` }}>
                                  Default
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="firstName" className="font-label-sm text-label-sm text-on-surface-variant font-semibold">
                      First Name
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={form.firstName}
                      onChange={handleChange}
                      className={`w-full rounded-xl border px-5 py-3.5 bg-surface-bright outline-none transition-colors ${
                        errors.firstName ? "border-error" : "border-outline-variant focus:border-primary"
                      }`}
                      placeholder="Diana"
                    />
                    {errors.firstName && <span className="text-error text-xs">{errors.firstName}</span>}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="lastName" className="font-label-sm text-label-sm text-on-surface-variant font-semibold">
                      Last Name
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={form.lastName}
                      onChange={handleChange}
                      className={`w-full rounded-xl border px-5 py-3.5 bg-surface-bright outline-none transition-colors ${
                        errors.lastName ? "border-error" : "border-outline-variant focus:border-primary"
                      }`}
                      placeholder="Spencer"
                    />
                    {errors.lastName && <span className="text-error text-xs">{errors.lastName}</span>}
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="address" className="font-label-sm text-label-sm text-on-surface-variant font-semibold">
                    Street Address
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    className={`w-full rounded-xl border px-5 py-3.5 bg-surface-bright outline-none transition-colors ${
                      errors.address ? "border-error" : "border-outline-variant focus:border-primary"
                    }`}
                    placeholder="1 Kensington Palace Gardens"
                  />
                  {errors.address && <span className="text-error text-xs">{errors.address}</span>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="city" className="font-label-sm text-label-sm text-on-surface-variant font-semibold">
                      City
                    </label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={form.city}
                      onChange={handleChange}
                      className={`w-full rounded-xl border px-5 py-3.5 bg-surface-bright outline-none transition-colors ${
                        errors.city ? "border-error" : "border-outline-variant focus:border-primary"
                      }`}
                      placeholder="London"
                    />
                    {errors.city && <span className="text-error text-xs">{errors.city}</span>}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="postalCode" className="font-label-sm text-label-sm text-on-surface-variant font-semibold">
                      Postal Code
                    </label>
                    <input
                      type="text"
                      id="postalCode"
                      name="postalCode"
                      value={form.postalCode}
                      onChange={handleChange}
                      className={`w-full rounded-xl border px-5 py-3.5 bg-surface-bright outline-none transition-colors ${
                        errors.postalCode ? "border-error" : "border-outline-variant focus:border-primary"
                      }`}
                      placeholder="W8 4PX"
                    />
                    {errors.postalCode && <span className="text-error text-xs">{errors.postalCode}</span>}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="country" className="font-label-sm text-label-sm text-on-surface-variant font-semibold">
                      Country
                    </label>
                    <select
                      id="country"
                      name="country"
                      value={form.country}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-outline-variant px-5 py-3.5 bg-surface-bright outline-none focus:border-primary"
                    >
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="Belgium">Belgium</option>
                      <option value="United States">United States</option>
                      <option value="France">France</option>
                      <option value="Germany">Germany</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="phone" className="font-label-sm text-label-sm text-on-surface-variant font-semibold">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    className={`w-full rounded-xl border px-5 py-3.5 bg-surface-bright outline-none transition-colors ${
                      errors.phone ? "border-error" : "border-outline-variant focus:border-primary"
                    }`}
                    placeholder="+44 20 7930 4832"
                  />
                  {errors.phone && <span className="text-error text-xs">{errors.phone}</span>}
                </div>
              </div>

            </form>

            {/* Right Column: Order Summary */}
            <div className="lg:col-span-5 sticky top-32 space-y-6">
              <div className="checkout-card rounded-2xl p-6 md:p-8 space-y-6 shadow-sm">
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold border-b border-outline-variant/10 pb-4">
                  Order Summary
                </h3>

                {/* Items List */}
                <div className="max-h-[300px] overflow-y-auto pr-2 space-y-4 custom-scrollbar">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex gap-4 items-center">
                      <div className="w-14 h-14 bg-surface-container-high rounded-lg overflow-hidden flex-shrink-0 border border-outline-variant/10">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-grow min-w-0">
                        <h4 className="font-label-sm text-label-sm font-bold text-on-surface truncate">
                          {item.name}
                        </h4>
                        <p className="text-on-surface-variant text-xs">
                          Quantity: {item.quantity}
                        </p>
                      </div>
                      <span className="font-label-sm text-label-sm text-secondary font-bold flex-shrink-0">
                        ${item.price.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Calculation breakdown */}
                <div className="space-y-3 border-t border-outline-variant/10 pt-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">Bag Subtotal</span>
                    <span className="font-bold text-on-surface">${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">Sourcing & Customs Tax (8%)</span>
                    <span className="font-bold text-on-surface">${tax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">Secure Armored Shipping</span>
                    <span className="font-bold text-on-surface">
                      {shipping === 0 ? "Free" : `$${shipping.toLocaleString()}`}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-outline-variant/10 pt-4 font-label-md text-label-md text-on-surface">
                    <span>Grand Total</span>
                    <span className="font-bold text-primary" style={{ color: THEME_COLORS.global.primary }}>
                      ${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                <div className="rounded-2xl border border-outline-variant/10 bg-surface-container-lowest p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-primary" style={{ color: THEME_COLORS.global.primary }}>
                      account_balance_wallet
                    </span>
                    <div>
                      <p className="font-label-md text-label-md font-bold text-on-surface uppercase tracking-wider">
                        Razorpay Payment
                      </p>
                      <p className="text-xs text-on-surface-variant leading-relaxed mt-1">
                        Pay securely with Razorpay. Eco Caret verifies the payment with the backend before marking your order paid.
                      </p>
                    </div>
                  </div>
                  {paymentFlow.payment && (
                    <div className="flex justify-between text-xs border-t border-outline-variant/10 pt-3">
                      <span className="text-on-surface-variant">Payment Status</span>
                      <span className="font-bold text-primary uppercase tracking-wider">
                        {paymentFlow.payment.status.replace(/_/g, " ")}
                      </span>
                    </div>
                  )}
                  {paymentFlow.message.text && (
                    <p
                      role="status"
                      aria-live="polite"
                      className={`text-xs font-semibold rounded-xl p-3 ${
                        paymentFlow.message.type === "error"
                          ? "bg-error-container/30 text-error"
                          : paymentFlow.message.type === "warning"
                          ? "bg-warning-container/40 text-on-warning-container"
                          : "bg-primary/5 text-primary"
                      }`}
                    >
                      {paymentFlow.message.text}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || paymentFlow.busy}
                  onClick={(e) => {
                    e.preventDefault();
                    const formElement = document.querySelector("form");
                    if (formElement) formElement.requestSubmit();
                  }}
                  className="w-full bg-primary text-on-primary py-4 rounded-full font-label-md text-label-md hover:bg-primary/95 transition-all text-center flex items-center justify-center gap-2 cursor-pointer font-bold tracking-wider shadow-md active:scale-99 disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{ backgroundColor: THEME_COLORS.global.primary }}
                >
                  {createdOrderId ? "Resume Razorpay Payment" : "Place Order & Pay"}
                  <span className="material-symbols-outlined text-sm">
                    lock
                  </span>
                </button>
              </div>

              <div className="flex gap-4 p-4 border border-outline-variant/10 rounded-2xl bg-surface-container-lowest text-xs text-on-surface-variant items-start">
                <span className="material-symbols-outlined text-primary font-bold" style={{ color: THEME_COLORS.global.primary }}>
                  verified_user
                </span>
                <p className="leading-relaxed">
                  Eco Caret transactions are authorized through secure AES-256 ledgers. Sourcing certificates are registered on public blockchain registries upon successful fulfillment.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer />

      {/* Profile Dialog */}
      <ProfileDialog isOpen={profileOpen} onClose={() => dispatch(setProfileOpen(false))} />
    </div>
  );
}
