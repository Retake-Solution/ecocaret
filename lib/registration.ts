import {
  PROFILE_GENDER_OPTIONS,
  PROFILE_IMAGE_ALLOWED_TYPES,
  PROFILE_IMAGE_MAX_BYTES,
  type ProfileGender,
} from "../constants/profile.ts";
import type { AddressInput } from "../types/api.ts";

export interface RegistrationValues {
  name: string;
  email: string;
  password: string;
  gender?: ProfileGender | "";
  residentialAddress?: AddressInput | null;
  shippingAddresses?: AddressInput[];
}

export interface RegistrationJsonPayload {
  name: string;
  email: string;
  password: string;
  gender?: ProfileGender;
  residentialAddress?: AddressInput;
  shippingAddresses?: AddressInput[];
}

type ImageLike = Pick<File, "size" | "type">;

export const isRegistrationGender = (value?: string | null): value is ProfileGender =>
  Boolean(value && PROFILE_GENDER_OPTIONS.some((option) => option.value === value));

export const validateRegistrationImage = (file: ImageLike | null | undefined) => {
  if (!file) return "";
  if (!PROFILE_IMAGE_ALLOWED_TYPES.includes(file.type as (typeof PROFILE_IMAGE_ALLOWED_TYPES)[number])) {
    return "Please choose a JPEG, PNG, or WebP image.";
  }
  if (file.size > PROFILE_IMAGE_MAX_BYTES) {
    return "Profile image must be 5 MB or smaller.";
  }
  return "";
};

export const buildRegistrationJsonPayload = (values: RegistrationValues): RegistrationJsonPayload => {
  const payload: RegistrationJsonPayload = {
    name: values.name.trim(),
    email: values.email.trim(),
    password: values.password,
  };

  if (isRegistrationGender(values.gender)) {
    payload.gender = values.gender;
  }
  if (values.residentialAddress) {
    payload.residentialAddress = values.residentialAddress;
  }
  if (values.shippingAddresses && values.shippingAddresses.length > 0) {
    payload.shippingAddresses = values.shippingAddresses;
  }

  return payload;
};

export const buildRegistrationRequestBody = (
  values: RegistrationValues,
  selectedImage?: File | null
) => {
  const jsonPayload = buildRegistrationJsonPayload(values);

  if (!selectedImage) {
    return {
      body: jsonPayload,
      isFormData: false,
    };
  }

  const formData = new FormData();
  formData.append("name", jsonPayload.name);
  formData.append("email", jsonPayload.email);
  formData.append("password", jsonPayload.password);
  if (jsonPayload.gender) {
    formData.append("gender", jsonPayload.gender);
  }
  formData.append("profileImage", selectedImage);
  if (jsonPayload.residentialAddress) {
    formData.append("residentialAddress", JSON.stringify(jsonPayload.residentialAddress));
  }
  if (jsonPayload.shippingAddresses && jsonPayload.shippingAddresses.length > 0) {
    formData.append("shippingAddresses", JSON.stringify(jsonPayload.shippingAddresses));
  }

  return {
    body: formData,
    isFormData: true,
  };
};
