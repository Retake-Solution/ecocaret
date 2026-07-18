import {
  PROFILE_GENDER_OPTIONS,
  PROFILE_IMAGE_ALLOWED_TYPES,
  PROFILE_IMAGE_MAX_BYTES,
  type ProfileGender,
} from "../constants/profile.ts";
import type { ProfileAddress, ProfileUser } from "./features/profile/profileSlice";

export interface ProfileEditValues {
  name: string;
  gender: ProfileGender | "";
  residentialAddress: ProfileAddress | null;
  shippingAddresses: ProfileAddress[];
}

export interface ProfileJsonPayload {
  name: string;
  gender: ProfileGender | null;
  residentialAddress: ProfileAddress | null;
  shippingAddresses: ProfileAddress[];
}

type ImageLike = Pick<File, "size" | "type">;

export const emptyAddress = (name = ""): ProfileAddress => ({
  name,
  line1: "",
  line2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "",
  phone: "",
  isDefault: true,
});

export const isProfileGender = (value?: string | null): value is ProfileGender =>
  Boolean(value && PROFILE_GENDER_OPTIONS.some((option) => option.value === value));

export const getProfileInitials = (name?: string, email?: string) => {
  const source = (name || email || "EC").trim();
  const words = source.includes("@")
    ? [source.split("@")[0]]
    : source.split(/\s+/).filter(Boolean);
  const initials = words
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");

  return initials || "EC";
};

export const getProfileAvatarDisplay = (user: ProfileUser | null) => {
  const url = user?.profileImage?.url;
  if (url) {
    return {
      type: "image" as const,
      url,
      alt: `${user?.name || "Customer"} profile image`,
    };
  }

  return {
    type: "initials" as const,
    initials: getProfileInitials(user?.name, user?.email),
  };
};

export const getProfileEditInitialValues = (user: ProfileUser): ProfileEditValues => ({
  name: user.name || "",
  gender: isProfileGender(user.gender) ? user.gender : "",
  residentialAddress: user.residentialAddress || emptyAddress(user.name || ""),
  shippingAddresses:
    user.shippingAddresses && user.shippingAddresses.length > 0
      ? user.shippingAddresses
      : [emptyAddress(user.name || "")],
});

export const validateProfileImage = (file: ImageLike | null | undefined) => {
  if (!file) return "";
  if (!PROFILE_IMAGE_ALLOWED_TYPES.includes(file.type as (typeof PROFILE_IMAGE_ALLOWED_TYPES)[number])) {
    return "Please choose a JPEG, PNG, or WebP image.";
  }
  if (file.size > PROFILE_IMAGE_MAX_BYTES) {
    return "Profile image must be 5 MB or smaller.";
  }
  return "";
};

export const buildProfileJsonPayload = (values: ProfileEditValues): ProfileJsonPayload => ({
  name: values.name.trim(),
  gender: values.gender || null,
  residentialAddress: values.residentialAddress,
  shippingAddresses: values.shippingAddresses,
});

export const buildProfileUpdateBody = (
  values: ProfileEditValues,
  selectedFile?: File | null
) => {
  const jsonPayload = buildProfileJsonPayload(values);

  if (!selectedFile) {
    return {
      body: jsonPayload,
      isFormData: false,
    };
  }

  const formData = new FormData();
  formData.append("name", jsonPayload.name);
  if (jsonPayload.gender) {
    formData.append("gender", jsonPayload.gender);
  }
  formData.append("profileImage", selectedFile);
  formData.append("residentialAddress", JSON.stringify(jsonPayload.residentialAddress));
  formData.append("shippingAddresses", JSON.stringify(jsonPayload.shippingAddresses));

  return {
    body: formData,
    isFormData: true,
  };
};
