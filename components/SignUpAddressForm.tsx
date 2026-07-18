"use client";

import React from "react";

interface SignUpAddressFormProps {
  resLine1: string;
  setResLine1: (val: string) => void;
  resLine2: string;
  setResLine2: (val: string) => void;
  resCity: string;
  setResCity: (val: string) => void;
  resState: string;
  setResState: (val: string) => void;
  resPostalCode: string;
  setResPostalCode: (val: string) => void;
  resCountry: string;
  setResCountry: (val: string) => void;
  resPhone: string;
  setResPhone: (val: string) => void;
  sameAsResidential: boolean;
  setSameAsResidential: (val: boolean) => void;
  shipName: string;
  setShipName: (val: string) => void;
  shipLine1: string;
  setShipLine1: (val: string) => void;
  shipCity: string;
  setShipCity: (val: string) => void;
  shipState: string;
  setShipState: (val: string) => void;
  shipPostalCode: string;
  setShipPostalCode: (val: string) => void;
  shipCountry: string;
  setShipCountry: (val: string) => void;
  shipPhone: string;
  setShipPhone: (val: string) => void;
}

export default function SignUpAddressForm({
  resLine1,
  setResLine1,
  resLine2,
  setResLine2,
  resCity,
  setResCity,
  resState,
  setResState,
  resPostalCode,
  setResPostalCode,
  resCountry,
  setResCountry,
  resPhone,
  setResPhone,
  sameAsResidential,
  setSameAsResidential,
  shipName,
  setShipName,
  shipLine1,
  setShipLine1,
  shipCity,
  setShipCity,
  shipState,
  setShipState,
  shipPostalCode,
  setShipPostalCode,
  shipCountry,
  setShipCountry,
  shipPhone,
  setShipPhone,
}: SignUpAddressFormProps) {
  return (
    <div className="space-y-4">
      {/* Residential Address */}
      <div>
        <h4 className="font-label-md text-label-md text-on-surface font-bold mb-3 border-b border-outline-variant/10 pb-1">
          Residential Address
        </h4>
        <div className="space-y-3">
          <div className="space-y-1">
            <label className="font-label-sm text-label-sm text-on-surface-variant">Street Address</label>
            <input
              type="text"
              value={resLine1}
              onChange={(e) => setResLine1(e.target.value)}
              className="w-full bg-surface-container-low border border-outline-variant/40 rounded-xl px-4 py-3 text-body-md outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all"
              placeholder="123 Main St"
            />
          </div>
          <div className="space-y-1">
            <label className="font-label-sm text-label-sm text-on-surface-variant">Apt, Suite, etc. (Optional)</label>
            <input
              type="text"
              value={resLine2}
              onChange={(e) => setResLine2(e.target.value)}
              className="w-full bg-surface-container-low border border-outline-variant/40 rounded-xl px-4 py-3 text-body-md outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all"
              placeholder="Apt 4B"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-label-sm text-label-sm text-on-surface-variant">City</label>
              <input
                type="text"
                value={resCity}
                onChange={(e) => setResCity(e.target.value)}
                className="w-full bg-surface-container-low border border-outline-variant/40 rounded-xl px-4 py-3 text-body-md outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all"
                placeholder="San Francisco"
              />
            </div>
            <div className="space-y-1">
              <label className="font-label-sm text-label-sm text-on-surface-variant">State</label>
              <input
                type="text"
                value={resState}
                onChange={(e) => setResState(e.target.value)}
                className="w-full bg-surface-container-low border border-outline-variant/40 rounded-xl px-4 py-3 text-body-md outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all"
                placeholder="CA"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-label-sm text-label-sm text-on-surface-variant">Postal Code</label>
              <input
                type="text"
                value={resPostalCode}
                onChange={(e) => setResPostalCode(e.target.value)}
                className="w-full bg-surface-container-low border border-outline-variant/40 rounded-xl px-4 py-3 text-body-md outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all"
                placeholder="94105"
              />
            </div>
            <div className="space-y-1">
              <label className="font-label-sm text-label-sm text-on-surface-variant">Country (2-letter ISO)</label>
              <input
                type="text"
                maxLength={2}
                value={resCountry}
                onChange={(e) => setResCountry(e.target.value.toUpperCase())}
                className="w-full bg-surface-container-low border border-outline-variant/40 rounded-xl px-4 py-3 text-body-md outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all"
                placeholder="US"
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="font-label-sm text-label-sm text-on-surface-variant">Phone</label>
            <input
              type="text"
              value={resPhone}
              onChange={(e) => setResPhone(e.target.value)}
              className="w-full bg-surface-container-low border border-outline-variant/40 rounded-xl px-4 py-3 text-body-md outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all"
              placeholder="+1-555-0198"
            />
          </div>
        </div>
      </div>

      {/* Shipping Address Checkbox */}
      <div className="pt-2 flex items-center gap-2">
        <input
          type="checkbox"
          id="sameAsResidential"
          checked={sameAsResidential}
          onChange={(e) => setSameAsResidential(e.target.checked)}
          className="rounded border-outline-variant/40 text-secondary focus:ring-secondary cursor-pointer"
        />
        <label htmlFor="sameAsResidential" className="font-label-sm text-label-sm text-on-surface-variant cursor-pointer select-none">
          Shipping address is the same as residential address
        </label>
      </div>

      {/* Shipping Address Form */}
      {!sameAsResidential && (
        <div className="border-t border-outline-variant/20 pt-4 space-y-3">
          <h4 className="font-label-md text-label-md text-on-surface font-bold mb-3 border-b border-outline-variant/10 pb-1">
            Shipping Address
          </h4>
          <div className="space-y-1">
            <label className="font-label-sm text-label-sm text-on-surface-variant">Recipient Name</label>
            <input
              type="text"
              value={shipName}
              onChange={(e) => setShipName(e.target.value)}
              className="w-full bg-surface-container-low border border-outline-variant/40 rounded-xl px-4 py-3 text-body-md outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all"
              placeholder="John Doe"
            />
          </div>
          <div className="space-y-1">
            <label className="font-label-sm text-label-sm text-on-surface-variant">Street Address</label>
            <input
              type="text"
              value={shipLine1}
              onChange={(e) => setShipLine1(e.target.value)}
              className="w-full bg-surface-container-low border border-outline-variant/40 rounded-xl px-4 py-3 text-body-md outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all"
              placeholder="456 Market St"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-label-sm text-label-sm text-on-surface-variant">City</label>
              <input
                type="text"
                value={shipCity}
                onChange={(e) => setShipCity(e.target.value)}
                className="w-full bg-surface-container-low border border-outline-variant/40 rounded-xl px-4 py-3 text-body-md outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all"
                placeholder="San Francisco"
              />
            </div>
            <div className="space-y-1">
              <label className="font-label-sm text-label-sm text-on-surface-variant">State</label>
              <input
                type="text"
                value={shipState}
                onChange={(e) => setShipState(e.target.value)}
                className="w-full bg-surface-container-low border border-outline-variant/40 rounded-xl px-4 py-3 text-body-md outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all"
                placeholder="CA"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-label-sm text-label-sm text-on-surface-variant">Postal Code</label>
              <input
                type="text"
                value={shipPostalCode}
                onChange={(e) => setShipPostalCode(e.target.value)}
                className="w-full bg-surface-container-low border border-outline-variant/40 rounded-xl px-4 py-3 text-body-md outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all"
                placeholder="94104"
              />
            </div>
            <div className="space-y-1">
              <label className="font-label-sm text-label-sm text-on-surface-variant">Country (2-letter ISO)</label>
              <input
                type="text"
                maxLength={2}
                value={shipCountry}
                onChange={(e) => setShipCountry(e.target.value.toUpperCase())}
                className="w-full bg-surface-container-low border border-outline-variant/40 rounded-xl px-4 py-3 text-body-md outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all"
                placeholder="US"
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="font-label-sm text-label-sm text-on-surface-variant">Phone</label>
            <input
              type="text"
              value={shipPhone}
              onChange={(e) => setShipPhone(e.target.value)}
              className="w-full bg-surface-container-low border border-outline-variant/40 rounded-xl px-4 py-3 text-body-md outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all"
              placeholder="+1-555-0199"
            />
          </div>
        </div>
      )}
    </div>
  );
}
