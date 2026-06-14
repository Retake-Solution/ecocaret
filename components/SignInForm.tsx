"use client";

import React, { useState } from "react";
import { useAppDispatch } from "@/lib/store";
import { loginUser } from "@/lib/features/profile/profileSlice";

interface SignInFormProps {
  onSuccess: () => void;
}

export default function SignInForm({ onSuccess }: SignInFormProps) {
  const dispatch = useAppDispatch();
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(loginUser({ email, name: "Eleanor Vance" }));
    alert("Signed In to the Conscious Circle!");
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1">
        <label className="font-label-sm text-label-sm text-on-surface-variant">
          Registered Email
        </label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-surface-container-low border border-outline-variant/40 rounded-xl px-4 py-3 text-body-md focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-all"
          placeholder="you@example.com"
        />
      </div>
      <div className="space-y-1">
        <label className="font-label-sm text-label-sm text-on-surface-variant">
          Password
        </label>
        <input
          type="password"
          required
          className="w-full bg-surface-container-low border border-outline-variant/40 rounded-xl px-4 py-3 text-body-md focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-all"
          placeholder="••••••••"
        />
      </div>
      <button
        type="submit"
        className="w-full bg-secondary text-on-secondary py-4 rounded-full font-label-md text-label-md hover:shadow-lg transition-all text-center mt-2 cursor-pointer"
      >
        Sign In
      </button>
    </form>
  );
}
