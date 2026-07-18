"use client";

import React, { useEffect, useRef, useState } from "react";
import Button from "@/components/Button";
import SignUpAddressForm from "@/components/SignUpAddressForm";
import { PROFILE_GENDER_OPTIONS, type ProfileGender } from "@/constants/profile";
import { loginUser } from "@/lib/features/profile/profileSlice";
import { useAppDispatch } from "@/lib/store";
import { validateRegistrationImage } from "@/lib/registration";
import { ApiRequestError, register } from "@/services/api";
import type { AddressInput } from "@/types";

interface SignUpFormProps {
  onSuccess: () => void;
}

type FieldErrors = Record<string, string>;

const inputClasses =
  "w-full bg-surface-container-low border border-outline-variant/40 rounded-xl px-4 py-3 text-body-md focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-all";
const labelClasses = "font-label-sm text-label-sm text-on-surface-variant";

const getErrorMessage = (error: unknown) => {
  if (error instanceof ApiRequestError) {
    if (error.status === 409) return error.message || "A user with this email already exists.";
    if (error.status === 413) return "Profile image is too large. Please choose an image under 5 MB.";
    if (error.status === 422) return "Please review the highlighted fields and try again.";
    if (error.status === 500) return error.message || "Unable to create account. Please try again.";
    return error.message || "Unable to create account. Please try again.";
  }

  return error instanceof Error && error.message
    ? error.message
    : "Network error. Please check your connection and try again.";
};

const hasAnyValue = (...values: string[]) => values.some((value) => value.trim().length > 0);

export default function SignUpForm({ onSuccess }: SignUpFormProps) {
  const dispatch = useAppDispatch();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const previewObjectUrlRef = useRef("");
  const [step, setStep] = useState(1);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [gender, setGender] = useState<ProfileGender | "">("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [resLine1, setResLine1] = useState("");
  const [resLine2, setResLine2] = useState("");
  const [resCity, setResCity] = useState("");
  const [resState, setResState] = useState("");
  const [resPostalCode, setResPostalCode] = useState("");
  const [resCountry, setResCountry] = useState("US");
  const [resPhone, setResPhone] = useState("");

  const [sameAsResidential, setSameAsResidential] = useState(true);
  const [shipName, setShipName] = useState("");
  const [shipLine1, setShipLine1] = useState("");
  const [shipCity, setShipCity] = useState("");
  const [shipState, setShipState] = useState("");
  const [shipPostalCode, setShipPostalCode] = useState("");
  const [shipCountry, setShipCountry] = useState("US");
  const [shipPhone, setShipPhone] = useState("");

  const revokePreviewUrl = () => {
    if (previewObjectUrlRef.current) {
      URL.revokeObjectURL(previewObjectUrlRef.current);
      previewObjectUrlRef.current = "";
    }
  };

  useEffect(() => () => revokePreviewUrl(), []);

  const clearFieldError = (field: string) => {
    setFieldErrors((current) => ({ ...current, [field]: "" }));
  };

  const renderFieldError = (field: string) =>
    fieldErrors[field] ? (
      <p id={`${field}-error`} className="text-xs text-error font-medium">
        {fieldErrors[field]}
      </p>
    ) : null;

  const getAccountErrors = () => {
    const nextErrors: FieldErrors = {};
    if (!name.trim()) nextErrors.name = "Full name is required.";
    if (!email.trim()) nextErrors.email = "Email address is required.";
    if (!password) nextErrors.password = "Password is required.";
    if (password && password.length < 8) nextErrors.password = "Password must be at least 8 characters.";
    if (!confirmPassword) nextErrors.confirmPassword = "Please confirm your password.";
    if (password && confirmPassword && password !== confirmPassword) {
      nextErrors.confirmPassword = "Passwords do not match.";
    }

    const imageError = validateRegistrationImage(selectedImage);
    if (imageError) nextErrors.profileImage = imageError;
    return nextErrors;
  };

  const buildOptionalAddresses = () => {
    const nextErrors: FieldErrors = {};
    const hasResidentialAddress = hasAnyValue(
      resLine1,
      resLine2,
      resCity,
      resState,
      resPostalCode,
      resPhone
    );

    let residentialAddress: AddressInput | null = null;
    if (hasResidentialAddress) {
      if (!resLine1.trim()) nextErrors["residentialAddress.line1"] = "Street address is required.";
      if (!resCity.trim()) nextErrors["residentialAddress.city"] = "City is required.";
      if (!resState.trim()) nextErrors["residentialAddress.state"] = "State is required.";
      if (!resPostalCode.trim()) nextErrors["residentialAddress.postalCode"] = "Postal code is required.";
      if (!resCountry.trim()) nextErrors["residentialAddress.country"] = "Country is required.";
      if (!resPhone.trim()) nextErrors["residentialAddress.phone"] = "Phone is required.";

      residentialAddress = {
        name: name.trim(),
        line1: resLine1.trim(),
        line2: resLine2.trim() || undefined,
        city: resCity.trim(),
        state: resState.trim(),
        postalCode: resPostalCode.trim(),
        country: resCountry.trim().toUpperCase(),
        phone: resPhone.trim(),
      };
    }

    const hasShippingAddress = hasAnyValue(
      shipName,
      shipLine1,
      shipCity,
      shipState,
      shipPostalCode,
      shipPhone
    );
    let shippingAddresses: AddressInput[] = [];

    if (sameAsResidential && residentialAddress) {
      shippingAddresses = [{ ...residentialAddress, isDefault: true }];
    }

    if (!sameAsResidential && hasShippingAddress) {
      if (!shipLine1.trim()) nextErrors["shippingAddresses.0.line1"] = "Street address is required.";
      if (!shipCity.trim()) nextErrors["shippingAddresses.0.city"] = "City is required.";
      if (!shipState.trim()) nextErrors["shippingAddresses.0.state"] = "State is required.";
      if (!shipPostalCode.trim()) nextErrors["shippingAddresses.0.postalCode"] = "Postal code is required.";
      if (!shipCountry.trim()) nextErrors["shippingAddresses.0.country"] = "Country is required.";
      if (!shipPhone.trim()) nextErrors["shippingAddresses.0.phone"] = "Phone is required.";

      shippingAddresses = [
        {
          name: shipName.trim() || name.trim(),
          line1: shipLine1.trim(),
          city: shipCity.trim(),
          state: shipState.trim(),
          postalCode: shipPostalCode.trim(),
          country: shipCountry.trim().toUpperCase(),
          phone: shipPhone.trim(),
          isDefault: true,
        },
      ];
    }

    return { residentialAddress, shippingAddresses, errors: nextErrors };
  };

  const applyApiFieldErrors = (apiError: ApiRequestError) => {
    const nextErrors: FieldErrors = {};
    apiError.fieldErrors?.forEach((fieldError) => {
      nextErrors[fieldError.field] = fieldError.message;
    });
    if (apiError.status === 409) {
      nextErrors.email = apiError.message || "A user with this email already exists.";
    }
    if (apiError.status === 413) {
      nextErrors.profileImage = "Profile image is too large. Please choose an image under 5 MB.";
    }
    setFieldErrors(nextErrors);

    if (nextErrors.name || nextErrors.email || nextErrors.password || nextErrors.gender || nextErrors.profileImage) {
      setStep(1);
    }
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setError("");
    clearFieldError("profileImage");

    if (!file) {
      revokePreviewUrl();
      setSelectedImage(null);
      setPreviewUrl("");
      return;
    }

    const imageError = validateRegistrationImage(file);
    if (imageError) {
      revokePreviewUrl();
      setSelectedImage(null);
      setPreviewUrl("");
      setFieldErrors((current) => ({ ...current, profileImage: imageError }));
      event.target.value = "";
      return;
    }

    revokePreviewUrl();
    const objectUrl = URL.createObjectURL(file);
    previewObjectUrlRef.current = objectUrl;
    setSelectedImage(file);
    setPreviewUrl(objectUrl);
  };

  const handleNext = (event: React.MouseEvent) => {
    event.preventDefault();
    setError("");

    const nextErrors = getAccountErrors();
    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      setError("Please review the highlighted fields.");
      return;
    }

    setFieldErrors({});
    setStep(2);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (isSubmitting) return;

    setError("");
    const accountErrors = getAccountErrors();
    if (Object.keys(accountErrors).length > 0) {
      setFieldErrors(accountErrors);
      setError("Please review the highlighted fields.");
      setStep(1);
      return;
    }

    const addressResult = buildOptionalAddresses();
    if (Object.keys(addressResult.errors).length > 0) {
      setFieldErrors(addressResult.errors);
      setError("Complete address details or leave the address section blank.");
      return;
    }

    setFieldErrors({});
    setIsSubmitting(true);

    try {
      const result = await register(
        {
          name,
          email,
          password,
          gender,
          residentialAddress: addressResult.residentialAddress,
          shippingAddresses: addressResult.shippingAddresses,
        },
        selectedImage
      );
      dispatch(loginUser({ ...result.user, token: result.token }));
      onSuccess();
    } catch (err) {
      if (err instanceof ApiRequestError) {
        applyApiFieldErrors(err);
      }
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-outline-variant/10">
        <span className="text-xs font-bold tracking-widest text-on-surface-variant/60 uppercase">
          Step {step} of 2
        </span>
        <div className="flex gap-1">
          <span className={`w-2 h-2 rounded-full transition-all duration-300 ${step === 1 ? "bg-primary w-4" : "bg-outline-variant/45"}`} />
          <span className={`w-2 h-2 rounded-full transition-all duration-300 ${step === 2 ? "bg-primary w-4" : "bg-outline-variant/45"}`} />
        </div>
      </div>

      <div className="max-h-[430px] overflow-y-auto pr-2 space-y-4 custom-scrollbar">
        {step === 1 ? (
          <div className="space-y-4">
            <div className="space-y-1">
              <label htmlFor="signUpName" className={labelClasses}>
                Full Name
              </label>
              <input
                id="signUpName"
                name="name"
                type="text"
                required
                value={name}
                onChange={(event) => {
                  setName(event.target.value);
                  clearFieldError("name");
                }}
                className={inputClasses}
                placeholder="Your name"
                aria-invalid={Boolean(fieldErrors.name)}
                aria-describedby={fieldErrors.name ? "name-error" : undefined}
              />
              {renderFieldError("name")}
            </div>

            <div className="space-y-1">
              <label htmlFor="signUpEmail" className={labelClasses}>
                Email Address
              </label>
              <input
                id="signUpEmail"
                name="email"
                type="email"
                required
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  clearFieldError("email");
                }}
                className={inputClasses}
                placeholder="you@example.com"
                aria-invalid={Boolean(fieldErrors.email)}
                aria-describedby={fieldErrors.email ? "email-error" : undefined}
              />
              {renderFieldError("email")}
            </div>

            <div className="space-y-1">
              <label htmlFor="signUpPassword" className={labelClasses}>
                Password
              </label>
              <div className="relative">
                <input
                  id="signUpPassword"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={8}
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    clearFieldError("password");
                  }}
                  className="w-full bg-surface-container-low border border-outline-variant/40 rounded-xl px-4 py-3 pr-12 text-body-md focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-all"
                  placeholder="********"
                  aria-invalid={Boolean(fieldErrors.password)}
                  aria-describedby={fieldErrors.password ? "password-error" : undefined}
                />
                <Button
                  unstyled
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((current) => !current)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-[20px] text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
                >
                  {showPassword ? "visibility_off" : "visibility"}
                </Button>
              </div>
              {renderFieldError("password")}
            </div>

            <div className="space-y-1">
              <label htmlFor="signUpConfirmPassword" className={labelClasses}>
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="signUpConfirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  minLength={8}
                  value={confirmPassword}
                  onChange={(event) => {
                    setConfirmPassword(event.target.value);
                    clearFieldError("confirmPassword");
                  }}
                  className="w-full bg-surface-container-low border border-outline-variant/40 rounded-xl px-4 py-3 pr-12 text-body-md focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-all"
                  placeholder="********"
                  aria-invalid={Boolean(fieldErrors.confirmPassword)}
                  aria-describedby={fieldErrors.confirmPassword ? "confirmPassword-error" : undefined}
                />
                <Button
                  unstyled
                  type="button"
                  aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                  onClick={() => setShowConfirmPassword((current) => !current)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-[20px] text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
                >
                  {showConfirmPassword ? "visibility_off" : "visibility"}
                </Button>
              </div>
              {renderFieldError("confirmPassword")}
            </div>

            <div className="space-y-1">
              <label htmlFor="signUpGender" className={labelClasses}>
                Gender (Optional)
              </label>
              <select
                id="signUpGender"
                name="gender"
                value={gender}
                onChange={(event) => {
                  setGender(event.target.value as ProfileGender | "");
                  clearFieldError("gender");
                }}
                className={inputClasses}
                aria-invalid={Boolean(fieldErrors.gender)}
                aria-describedby={fieldErrors.gender ? "gender-error" : undefined}
              >
                <option value="">No saved gender</option>
                {PROFILE_GENDER_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {renderFieldError("gender")}
            </div>

            <div className="space-y-2">
              <label htmlFor="signUpProfileImage" className={labelClasses}>
                Profile Image (Optional)
              </label>
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full border border-outline-variant/30 bg-primary/10 text-primary flex items-center justify-center">
                  {previewUrl ? (
                    <img src={previewUrl} alt="Selected profile image preview" className="h-full w-full object-cover" />
                  ) : (
                    <span className="material-symbols-outlined text-2xl">person</span>
                  )}
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <input
                    ref={fileInputRef}
                    id="signUpProfileImage"
                    name="profileImage"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageChange}
                    className="block w-full text-sm text-on-surface-variant file:mr-3 file:rounded-full file:border-0 file:bg-primary file:px-4 file:py-2 file:text-[10px] file:font-bold file:uppercase file:tracking-wider file:text-white hover:file:opacity-90 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#3C9984]/25"
                    aria-invalid={Boolean(fieldErrors.profileImage)}
                    aria-describedby={fieldErrors.profileImage ? "profileImage-error" : "profileImage-help"}
                  />
                  <p id="profileImage-help" className="text-xs text-on-surface-variant">
                    JPEG, PNG, or WebP. Maximum size 5 MB.
                  </p>
                </div>
              </div>
              {renderFieldError("profileImage")}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="rounded-xl bg-primary/5 px-4 py-3 text-xs leading-relaxed text-on-surface-variant">
              Addresses are optional. Complete the residential section to save it now, or leave it blank and add it later from your profile.
            </p>
            <SignUpAddressForm
              resLine1={resLine1}
              setResLine1={(value) => {
                setResLine1(value);
                clearFieldError("residentialAddress.line1");
              }}
              resLine2={resLine2}
              setResLine2={setResLine2}
              resCity={resCity}
              setResCity={(value) => {
                setResCity(value);
                clearFieldError("residentialAddress.city");
              }}
              resState={resState}
              setResState={(value) => {
                setResState(value);
                clearFieldError("residentialAddress.state");
              }}
              resPostalCode={resPostalCode}
              setResPostalCode={(value) => {
                setResPostalCode(value);
                clearFieldError("residentialAddress.postalCode");
              }}
              resCountry={resCountry}
              setResCountry={(value) => {
                setResCountry(value);
                clearFieldError("residentialAddress.country");
              }}
              resPhone={resPhone}
              setResPhone={(value) => {
                setResPhone(value);
                clearFieldError("residentialAddress.phone");
              }}
              sameAsResidential={sameAsResidential}
              setSameAsResidential={setSameAsResidential}
              shipName={shipName}
              setShipName={setShipName}
              shipLine1={shipLine1}
              setShipLine1={(value) => {
                setShipLine1(value);
                clearFieldError("shippingAddresses.0.line1");
              }}
              shipCity={shipCity}
              setShipCity={(value) => {
                setShipCity(value);
                clearFieldError("shippingAddresses.0.city");
              }}
              shipState={shipState}
              setShipState={(value) => {
                setShipState(value);
                clearFieldError("shippingAddresses.0.state");
              }}
              shipPostalCode={shipPostalCode}
              setShipPostalCode={(value) => {
                setShipPostalCode(value);
                clearFieldError("shippingAddresses.0.postalCode");
              }}
              shipCountry={shipCountry}
              setShipCountry={(value) => {
                setShipCountry(value);
                clearFieldError("shippingAddresses.0.country");
              }}
              shipPhone={shipPhone}
              setShipPhone={(value) => {
                setShipPhone(value);
                clearFieldError("shippingAddresses.0.phone");
              }}
            />
          </div>
        )}
      </div>

      {error && (
        <p className="rounded-xl bg-error-container/40 px-4 py-3 text-label-sm font-label-sm text-on-error-container">
          {error}
        </p>
      )}

      <div className="flex gap-4 pt-2">
        {step === 2 && (
          <Button
            unstyled
            type="button"
            onClick={() => {
              setError("");
              setStep(1);
            }}
            className="flex-1 border border-outline-variant hover:bg-surface-container py-4 rounded-full font-label-md text-label-md transition-all text-center cursor-pointer font-bold tracking-wider"
          >
            Back
          </Button>
        )}

        {step === 1 ? (
          <Button
            unstyled
            type="button"
            onClick={handleNext}
            className="flex-1 bg-secondary text-on-secondary py-4 rounded-full font-label-md text-label-md hover:shadow-lg transition-all text-center cursor-pointer font-bold tracking-wider"
          >
            Next
          </Button>
        ) : (
          <Button
            unstyled
            type="submit"
            disabled={isSubmitting}
            aria-disabled={isSubmitting}
            className="flex-1 bg-secondary text-on-secondary py-4 rounded-full font-label-md text-label-md hover:shadow-lg transition-all text-center cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 font-bold tracking-wider"
          >
            {isSubmitting ? "Creating Account..." : "Create Account"}
          </Button>
        )}
      </div>
    </form>
  );
}
