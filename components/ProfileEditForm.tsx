"use client";

import React, { useEffect, useRef, useState } from "react";
import Button from "@/components/Button";
import { PROFILE_GENDER_OPTIONS } from "@/constants/profile";
import { updateProfileUser, type ProfileAddress, type ProfileUser } from "@/lib/features/profile/profileSlice";
import { useAppDispatch } from "@/lib/store";
import {
  emptyAddress,
  getProfileAvatarDisplay,
  getProfileEditInitialValues,
  type ProfileEditValues,
  validateProfileImage,
} from "@/lib/profileEdit";
import { ApiRequestError, updateCurrentUser } from "@/services/api";

interface ProfileEditFormProps {
  user: ProfileUser;
  className?: string;
  onCancel?: () => void;
  onSuccess?: () => void;
  showIntro?: boolean;
}

type FieldErrors = Record<string, string>;

const inputClasses =
  "w-full bg-surface-container border border-outline-variant/40 rounded-xl px-4 py-3 text-body-md focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-all";
const labelClasses = "font-label-sm text-label-sm text-on-surface-variant";

const getErrorMessage = (error: unknown) => {
  if (error instanceof ApiRequestError) {
    if (error.status === 401) return "Your session expired. Please sign in again.";
    if (error.status === 413) return "Profile image is too large. Please choose an image under 5 MB.";
    if (error.status === 422) return "Please review the highlighted fields and try again.";
    return error.message || "Unable to update profile. Please try again.";
  }

  return error instanceof Error && error.message
    ? error.message
    : "Network error. Please check your connection and try again.";
};

export default function ProfileEditForm({
  user,
  className,
  onCancel,
  onSuccess,
  showIntro = true,
}: ProfileEditFormProps) {
  const dispatch = useAppDispatch();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const previewObjectUrlRef = useRef("");
  const [values, setValues] = useState<ProfileEditValues>(() => getProfileEditInitialValues(user));
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [notice, setNotice] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const avatar = getProfileAvatarDisplay(user);
  const residentialAddress = values.residentialAddress || emptyAddress(values.name);
  const primaryShippingAddress = values.shippingAddresses[0] || emptyAddress(values.name);

  const revokePreviewUrl = () => {
    if (previewObjectUrlRef.current) {
      URL.revokeObjectURL(previewObjectUrlRef.current);
      previewObjectUrlRef.current = "";
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      revokePreviewUrl();
      setValues(getProfileEditInitialValues(user));
      setSelectedFile(null);
      setPreviewUrl("");
      setFieldErrors({});
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, [user]);

  useEffect(() => () => revokePreviewUrl(), []);

  const setFieldValue = (field: keyof ProfileEditValues, value: ProfileEditValues[keyof ProfileEditValues]) => {
    setValues((current) => ({
      ...current,
      [field]: value,
    }));
    setFieldErrors((current) => ({ ...current, [field]: "" }));
  };

  const setResidentialField = (field: keyof ProfileAddress, value: string) => {
    setValues((current) => ({
      ...current,
      residentialAddress: {
        ...(current.residentialAddress || emptyAddress(current.name)),
        [field]: value,
      },
    }));
    setFieldErrors((current) => ({ ...current, [`residentialAddress.${field}`]: "" }));
  };

  const setShippingField = (field: keyof ProfileAddress, value: string) => {
    setValues((current) => {
      const nextAddresses = [...current.shippingAddresses];
      nextAddresses[0] = {
        ...(nextAddresses[0] || emptyAddress(current.name)),
        [field]: value,
        isDefault: true,
      };
      return {
        ...current,
        shippingAddresses: nextAddresses,
      };
    });
    setFieldErrors((current) => ({ ...current, [`shippingAddresses.0.${field}`]: "" }));
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setNotice(null);
    setFieldErrors((current) => ({ ...current, profileImage: "" }));

    if (!file) {
      revokePreviewUrl();
      setSelectedFile(null);
      setPreviewUrl("");
      return;
    }

    const imageError = validateProfileImage(file);
    if (imageError) {
      revokePreviewUrl();
      setSelectedFile(null);
      setPreviewUrl("");
      setFieldErrors((current) => ({ ...current, profileImage: imageError }));
      event.target.value = "";
      return;
    }

    revokePreviewUrl();
    const objectUrl = URL.createObjectURL(file);
    previewObjectUrlRef.current = objectUrl;
    setSelectedFile(file);
    setPreviewUrl(objectUrl);
  };

  const resetForm = () => {
    revokePreviewUrl();
    setValues(getProfileEditInitialValues(user));
    setSelectedFile(null);
    setPreviewUrl("");
    setFieldErrors({});
    setNotice(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleCancel = () => {
    resetForm();
    onCancel?.();
  };

  const applyApiFieldErrors = (error: ApiRequestError) => {
    const nextErrors: FieldErrors = {};
    error.fieldErrors?.forEach((fieldError) => {
      nextErrors[fieldError.field] = fieldError.message;
    });
    if (error.status === 413) {
      nextErrors.profileImage = "Profile image is too large. Please choose an image under 5 MB.";
    }
    setFieldErrors(nextErrors);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (isSubmitting) return;

    const nextErrors: FieldErrors = {};
    if (!values.name.trim()) {
      nextErrors.name = "Full name is required.";
    }
    const imageError = validateProfileImage(selectedFile);
    if (imageError) {
      nextErrors.profileImage = imageError;
    }
    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      setNotice({ type: "error", message: "Please review the highlighted fields." });
      return;
    }

    setIsSubmitting(true);
    setNotice(null);
    setFieldErrors({});

    try {
      const updatedUser = await updateCurrentUser(values, selectedFile);
      dispatch(updateProfileUser(updatedUser));
      revokePreviewUrl();
      setSelectedFile(null);
      setPreviewUrl("");
      setValues(getProfileEditInitialValues(updatedUser));
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setNotice({ type: "success", message: "Profile updated successfully." });
      onSuccess?.();
    } catch (error) {
      if (error instanceof ApiRequestError) {
        applyApiFieldErrors(error);
      }
      setNotice({ type: "error", message: getErrorMessage(error) });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderFieldError = (field: string) =>
    fieldErrors[field] ? (
      <p id={`${field}-error`} className="text-xs text-error font-medium">
        {fieldErrors[field]}
      </p>
    ) : null;

  const renderAddressFields = (
    prefix: "residentialAddress" | "shippingAddresses.0",
    address: ProfileAddress,
    onChange: (field: keyof ProfileAddress, value: string) => void
  ) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-1.5 md:col-span-2">
        <label htmlFor={`${prefix}.name`} className={labelClasses}>Recipient Name</label>
        <input
          id={`${prefix}.name`}
          value={address.name}
          onChange={(event) => onChange("name", event.target.value)}
          className={inputClasses}
          aria-invalid={Boolean(fieldErrors[`${prefix}.name`])}
          aria-describedby={fieldErrors[`${prefix}.name`] ? `${prefix}.name-error` : undefined}
        />
        {renderFieldError(`${prefix}.name`)}
      </div>
      <div className="space-y-1.5 md:col-span-2">
        <label htmlFor={`${prefix}.line1`} className={labelClasses}>Street Address</label>
        <input
          id={`${prefix}.line1`}
          value={address.line1}
          onChange={(event) => onChange("line1", event.target.value)}
          className={inputClasses}
          aria-invalid={Boolean(fieldErrors[`${prefix}.line1`])}
          aria-describedby={fieldErrors[`${prefix}.line1`] ? `${prefix}.line1-error` : undefined}
        />
        {renderFieldError(`${prefix}.line1`)}
      </div>
      <div className="space-y-1.5 md:col-span-2">
        <label htmlFor={`${prefix}.line2`} className={labelClasses}>Apt, Suite, etc.</label>
        <input
          id={`${prefix}.line2`}
          value={address.line2 || ""}
          onChange={(event) => onChange("line2", event.target.value)}
          className={inputClasses}
        />
      </div>
      <div className="space-y-1.5">
        <label htmlFor={`${prefix}.city`} className={labelClasses}>City</label>
        <input
          id={`${prefix}.city`}
          value={address.city}
          onChange={(event) => onChange("city", event.target.value)}
          className={inputClasses}
          aria-invalid={Boolean(fieldErrors[`${prefix}.city`])}
          aria-describedby={fieldErrors[`${prefix}.city`] ? `${prefix}.city-error` : undefined}
        />
        {renderFieldError(`${prefix}.city`)}
      </div>
      <div className="space-y-1.5">
        <label htmlFor={`${prefix}.state`} className={labelClasses}>State</label>
        <input
          id={`${prefix}.state`}
          value={address.state}
          onChange={(event) => onChange("state", event.target.value)}
          className={inputClasses}
          aria-invalid={Boolean(fieldErrors[`${prefix}.state`])}
          aria-describedby={fieldErrors[`${prefix}.state`] ? `${prefix}.state-error` : undefined}
        />
        {renderFieldError(`${prefix}.state`)}
      </div>
      <div className="space-y-1.5">
        <label htmlFor={`${prefix}.postalCode`} className={labelClasses}>Postal Code</label>
        <input
          id={`${prefix}.postalCode`}
          value={address.postalCode}
          onChange={(event) => onChange("postalCode", event.target.value)}
          className={inputClasses}
          aria-invalid={Boolean(fieldErrors[`${prefix}.postalCode`])}
          aria-describedby={fieldErrors[`${prefix}.postalCode`] ? `${prefix}.postalCode-error` : undefined}
        />
        {renderFieldError(`${prefix}.postalCode`)}
      </div>
      <div className="space-y-1.5">
        <label htmlFor={`${prefix}.country`} className={labelClasses}>Country</label>
        <input
          id={`${prefix}.country`}
          value={address.country}
          onChange={(event) => onChange("country", event.target.value.toUpperCase())}
          className={inputClasses}
          aria-invalid={Boolean(fieldErrors[`${prefix}.country`])}
          aria-describedby={fieldErrors[`${prefix}.country`] ? `${prefix}.country-error` : undefined}
        />
        {renderFieldError(`${prefix}.country`)}
      </div>
      <div className="space-y-1.5 md:col-span-2">
        <label htmlFor={`${prefix}.phone`} className={labelClasses}>Phone</label>
        <input
          id={`${prefix}.phone`}
          value={address.phone}
          onChange={(event) => onChange("phone", event.target.value)}
          className={inputClasses}
          aria-invalid={Boolean(fieldErrors[`${prefix}.phone`])}
          aria-describedby={fieldErrors[`${prefix}.phone`] ? `${prefix}.phone-error` : undefined}
        />
        {renderFieldError(`${prefix}.phone`)}
      </div>
    </div>
  );

  return (
    <form
      onSubmit={handleSubmit}
      className={className || "bg-surface-container-low border border-outline-variant/20 rounded-[2rem] p-6 md:p-8 shadow-sm space-y-8"}
    >
      <div className="flex flex-col md:flex-row gap-6 md:items-center">
        <div className="h-28 w-28 rounded-full overflow-hidden bg-primary/10 text-primary flex items-center justify-center text-3xl font-bold border border-outline-variant/20 shrink-0">
          {previewUrl ? (
            <img src={previewUrl} alt="Selected profile preview" className="w-full h-full object-cover" />
          ) : avatar.type === "image" ? (
            <img src={avatar.url} alt={avatar.alt} className="w-full h-full object-cover" />
          ) : (
            <span aria-label="Profile initials">{avatar.initials}</span>
          )}
        </div>
        <div className="space-y-3 flex-1">
          {showIntro && (
            <div>
              <h3 className="font-playfair text-xl font-semibold text-secondary">Edit Profile</h3>
              <p className="text-sm text-on-surface-variant">
                Update your display name, optional gender, profile image, and saved addresses.
              </p>
            </div>
          )}
          <div className="space-y-1.5">
            <label htmlFor="profileImage" className={labelClasses}>Profile Image</label>
            <input
              ref={fileInputRef}
              id="profileImage"
              name="profileImage"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageChange}
              className="block w-full text-sm text-on-surface-variant file:mr-4 file:rounded-full file:border-0 file:bg-primary file:px-5 file:py-2.5 file:text-xs file:font-bold file:uppercase file:tracking-wider file:text-white hover:file:opacity-90 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#3C9984]/25"
              aria-invalid={Boolean(fieldErrors.profileImage)}
              aria-describedby={fieldErrors.profileImage ? "profileImage-error" : "profileImage-help"}
            />
            <p id="profileImage-help" className="text-xs text-on-surface-variant">
              JPEG, PNG, or WebP. Maximum size 5 MB.
            </p>
            {renderFieldError("profileImage")}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label htmlFor="name" className={labelClasses}>Full Name</label>
          <input
            id="name"
            name="name"
            required
            value={values.name}
            onChange={(event) => setFieldValue("name", event.target.value)}
            className={inputClasses}
            aria-invalid={Boolean(fieldErrors.name)}
            aria-describedby={fieldErrors.name ? "name-error" : undefined}
          />
          {renderFieldError("name")}
        </div>
        <div className="space-y-1.5">
          <label htmlFor="gender" className={labelClasses}>Gender</label>
          <select
            id="gender"
            name="gender"
            value={values.gender}
            onChange={(event) => setFieldValue("gender", event.target.value as ProfileEditValues["gender"])}
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
      </div>

      <div className="space-y-4">
        <h4 className="font-playfair text-lg font-semibold text-secondary">Residential Address</h4>
        {renderAddressFields("residentialAddress", residentialAddress, setResidentialField)}
      </div>

      <div className="space-y-4">
        <h4 className="font-playfair text-lg font-semibold text-secondary">Default Shipping Address</h4>
        {renderAddressFields("shippingAddresses.0", primaryShippingAddress, setShippingField)}
      </div>

      {notice && (
        <p
          role="status"
          className={`rounded-xl px-4 py-3 text-sm font-medium ${
            notice.type === "success"
              ? "bg-primary/10 text-primary"
              : "bg-error-container/40 text-on-error-container"
          }`}
        >
          {notice.message}
        </p>
      )}

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between pt-2">
        <Button
          unstyled
          type="submit"
          disabled={isSubmitting}
          aria-disabled={isSubmitting}
          className="w-full sm:w-auto bg-primary text-white px-8 py-3.5 rounded-full font-label-md text-label-md hover:bg-secondary hover:shadow-lg transition-all text-center cursor-pointer font-bold uppercase tracking-wider disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Saving..." : "Save Changes"}
        </Button>
        <Button
          unstyled
          type="button"
          disabled={isSubmitting}
          onClick={handleCancel}
          className="w-full sm:w-auto border border-outline-variant/40 text-on-surface hover:bg-surface-container-high px-8 py-3.5 rounded-full font-label-md text-label-md transition-all text-center cursor-pointer font-semibold uppercase tracking-wider disabled:opacity-60 disabled:cursor-not-allowed"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
