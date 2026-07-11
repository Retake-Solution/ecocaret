"use client";

import React, { useState } from "react";
import { useAppDispatch } from "@/lib/store";
import { loginUser } from "@/lib/features/profile/profileSlice";
import { register } from "@/services/api";

interface SignUpFormProps {
  onSuccess: () => void;
}

export default function SignUpForm({ onSuccess }: SignUpFormProps) {
  const dispatch = useAppDispatch();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await register({ name, email, password });
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

      {error && (
        <p className="rounded-xl bg-error-container/40 px-4 py-3 text-label-sm font-label-sm text-on-error-container">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-secondary text-on-secondary py-4 rounded-full font-label-md text-label-md hover:shadow-lg transition-all text-center mt-2 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Creating Account..." : "Create Account"}
      </button>
    </form>
  );
}
