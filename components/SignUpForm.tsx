"use client";

import React, { useState } from "react";
import { useAppDispatch } from "@/lib/store";
import { loginUser } from "@/lib/features/profile/profileSlice";
import { register } from "@/services/api";
import SignUpAddressForm from "@/components/SignUpAddressForm";

interface SignUpFormProps {
  onSuccess: () => void;
}

export default function SignUpForm({ onSuccess }: SignUpFormProps) {
  const dispatch = useAppDispatch();
  const [step, setStep] = useState(1); // Step 1: Account, Step 2: Address
  
  // Step 1 States
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Step 2 States (Residential Address)
  const [resLine1, setResLine1] = useState("");
  const [resLine2, setResLine2] = useState("");
  const [resCity, setResCity] = useState("");
  const [resState, setResState] = useState("");
  const [resPostalCode, setResPostalCode] = useState("");
  const [resCountry, setResCountry] = useState("US");
  const [resPhone, setResPhone] = useState("");

  // Shipping Address Toggle
  const [sameAsResidential, setSameAsResidential] = useState(true);

  // Shipping Address State
  const [shipName, setShipName] = useState("");
  const [shipLine1, setShipLine1] = useState("");
  const [shipCity, setShipCity] = useState("");
  const [shipState, setShipState] = useState("");
  const [shipPostalCode, setShipPostalCode] = useState("");
  const [shipCountry, setShipCountry] = useState("US");
  const [shipPhone, setShipPhone] = useState("");

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    setError("");

    if (!name || !email || !password || !confirmPassword) {
      setError("Please fill out all login fields.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setStep(2);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    // Validate Step 2 details
    if (!resLine1 || !resCity || !resState || !resPostalCode || !resCountry || !resPhone) {
      setError("Please fill out all residential address fields.");
      return;
    }

    if (!sameAsResidential) {
      if (!shipLine1 || !shipCity || !shipState || !shipPostalCode || !shipCountry || !shipPhone) {
        setError("Please fill out all shipping address fields.");
        return;
      }
    }

    setIsSubmitting(true);

    const residentialAddress = {
      name,
      line1: resLine1,
      line2: resLine2 || undefined,
      city: resCity,
      state: resState,
      postalCode: resPostalCode,
      country: resCountry,
      phone: resPhone,
    };

    const shippingAddresses = sameAsResidential ? [
      {
        ...residentialAddress,
        isDefault: true,
      }
    ] : [
      {
        name: shipName || name,
        line1: shipLine1,
        city: shipCity,
        state: shipState,
        postalCode: shipPostalCode,
        country: shipCountry,
        phone: shipPhone,
        isDefault: true,
      }
    ];

    try {
      const result = await register({
        name,
        email,
        password,
        residentialAddress,
        shippingAddresses,
      });
      dispatch(loginUser({ ...result.user, token: result.token }));
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create account. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Step Indicators */}
      <div className="flex items-center justify-between pb-2 border-b border-outline-variant/10">
        <span className="text-xs font-bold tracking-widest text-on-surface-variant/60 uppercase">
          Step {step} of 2
        </span>
        <div className="flex gap-1">
          <span className={`w-2 h-2 rounded-full transition-all duration-300 ${step === 1 ? "bg-primary w-4" : "bg-outline-variant/45"}`} />
          <span className={`w-2 h-2 rounded-full transition-all duration-300 ${step === 2 ? "bg-primary w-4" : "bg-outline-variant/45"}`} />
        </div>
      </div>

      {/* Scrollable container for wizard inputs */}
      <div className="max-h-[350px] overflow-y-auto pr-2 space-y-4 custom-scrollbar">
        {step === 1 ? (
          /* Step 1: Login Account Sourcing Details */
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="font-label-sm text-label-sm text-on-surface-variant">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="w-full bg-surface-container-low border border-outline-variant/40 rounded-xl px-4 py-3 text-body-md focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-all"
                placeholder="Your name"
              />
            </div>

            <div className="space-y-1">
              <label className="font-label-sm text-label-sm text-on-surface-variant">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full bg-surface-container-low border border-outline-variant/40 rounded-xl px-4 py-3 text-body-md focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-all"
                placeholder="you@example.com"
              />
            </div>

            <div className="space-y-1">
              <label className="font-label-sm text-label-sm text-on-surface-variant">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={8}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant/40 rounded-xl px-4 py-3 pr-12 text-body-md focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-all"
                  placeholder="********"
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((current) => !current)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-[20px] text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
                >
                  {showPassword ? "visibility_off" : "visibility"}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-label-sm text-label-sm text-on-surface-variant">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  minLength={8}
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant/40 rounded-xl px-4 py-3 pr-12 text-body-md focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-all"
                  placeholder="********"
                />
                <button
                  type="button"
                  aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                  onClick={() => setShowConfirmPassword((current) => !current)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-[20px] text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
                >
                  {showConfirmPassword ? "visibility_off" : "visibility"}
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Step 2: Address Inputs */
          <SignUpAddressForm
            resLine1={resLine1}
            setResLine1={setResLine1}
            resLine2={resLine2}
            setResLine2={setResLine2}
            resCity={resCity}
            setResCity={setResCity}
            resState={resState}
            setResState={setResState}
            resPostalCode={resPostalCode}
            setResPostalCode={setResPostalCode}
            resCountry={resCountry}
            setResCountry={setResCountry}
            resPhone={resPhone}
            setResPhone={setResPhone}
            sameAsResidential={sameAsResidential}
            setSameAsResidential={setSameAsResidential}
            shipName={shipName}
            setShipName={setShipName}
            shipLine1={shipLine1}
            setShipLine1={setShipLine1}
            shipCity={shipCity}
            setShipCity={setShipCity}
            shipState={shipState}
            setShipState={setShipState}
            shipPostalCode={shipPostalCode}
            setShipPostalCode={setShipPostalCode}
            shipCountry={shipCountry}
            setShipCountry={setShipCountry}
            shipPhone={shipPhone}
            setShipPhone={setShipPhone}
          />
        )}
      </div>

      {error && (
        <p className="rounded-xl bg-error-container/40 px-4 py-3 text-label-sm font-label-sm text-on-error-container">
          {error}
        </p>
      )}

      {/* Button Controls */}
      <div className="flex gap-4 pt-2">
        {step === 2 && (
          <button
            type="button"
            onClick={() => {
              setError("");
              setStep(1);
            }}
            className="flex-1 border border-outline-variant hover:bg-surface-container py-4 rounded-full font-label-md text-label-md transition-all text-center cursor-pointer font-bold tracking-wider"
          >
            Back
          </button>
        )}
        
        {step === 1 ? (
          <button
            type="button"
            onClick={handleNext}
            className="flex-1 bg-secondary text-on-secondary py-4 rounded-full font-label-md text-label-md hover:shadow-lg transition-all text-center cursor-pointer font-bold tracking-wider"
          >
            Next
          </button>
        ) : (
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-secondary text-on-secondary py-4 rounded-full font-label-md text-label-md hover:shadow-lg transition-all text-center cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 font-bold tracking-wider"
          >
            {isSubmitting ? "Creating Account..." : "Create Account"}
          </button>
        )}
      </div>
    </form>
  );
}
