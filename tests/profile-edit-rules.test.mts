import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  buildProfileUpdateBody,
  getProfileAvatarDisplay,
  getProfileEditInitialValues,
  getProfileInitials,
  validateProfileImage,
  type ProfileEditValues,
} from "../lib/profileEdit.ts";
import { PROFILE_IMAGE_MAX_BYTES } from "../constants/profile.ts";

const profileFormSource = readFileSync(new URL("../components/ProfileEditForm.tsx", import.meta.url), "utf8");
const profileModalSource = readFileSync(new URL("../components/ProfileEditModal.tsx", import.meta.url), "utf8");
const profilePageSource = readFileSync(new URL("../app/profile/page.tsx", import.meta.url), "utf8");
const headerSource = readFileSync(new URL("../components/Header.tsx", import.meta.url), "utf8");
const serviceSource = readFileSync(new URL("../services/api.ts", import.meta.url), "utf8");
const apiClientSource = readFileSync(new URL("../services/apiClient.ts", import.meta.url), "utf8");
const profileSliceSource = readFileSync(new URL("../lib/features/profile/profileSlice.ts", import.meta.url), "utf8");
const updateCurrentUserSource = serviceSource.slice(
  serviceSource.indexOf("export const updateCurrentUser"),
  serviceSource.indexOf("export const abandonOrderPayment")
);

const residentialAddress = {
  name: "Test User",
  line1: "12 Green Lane",
  line2: "Suite 4",
  city: "Austin",
  state: "TX",
  postalCode: "78701",
  country: "US",
  phone: "+15551234567",
  isDefault: true,
};

const editValues: ProfileEditValues = {
  name: " Test User ",
  gender: "female",
  residentialAddress,
  shippingAddresses: [residentialAddress],
};

test("profile form is seeded from the authenticated user", () => {
  const values = getProfileEditInitialValues({
    id: "user_1",
    email: "test@example.com",
    name: "Test User",
    gender: "female",
    residentialAddress,
    shippingAddresses: [residentialAddress],
  });

  assert.equal(values.name, "Test User");
  assert.equal(values.gender, "female");
  assert.equal(values.residentialAddress?.line1, "12 Green Lane");
  assert.equal(values.shippingAddresses[0].city, "Austin");
});

test("profile image display prefers the saved profile image", () => {
  const avatar = getProfileAvatarDisplay({
    email: "test@example.com",
    name: "Test User",
    profileImage: { url: "https://cdn.example.com/profile.webp" },
  });

  assert.equal(avatar.type, "image");
  assert.equal(avatar.url, "https://cdn.example.com/profile.webp");
});

test("profile image display falls back to user initials", () => {
  assert.equal(getProfileInitials("Test User", "test@example.com"), "TU");
  assert.deepEqual(getProfileAvatarDisplay({ email: "test@example.com" }), {
    type: "initials",
    initials: "T",
  });
});

test("profile image validation rejects unsupported formats and oversized files", () => {
  assert.equal(
    validateProfileImage({ type: "image/gif", size: 10 }),
    "Please choose a JPEG, PNG, or WebP image."
  );
  assert.equal(
    validateProfileImage({ type: "image/png", size: PROFILE_IMAGE_MAX_BYTES + 1 }),
    "Profile image must be 5 MB or smaller."
  );
});

test("profile update uses JSON when no image is selected", () => {
  const request = buildProfileUpdateBody({ ...editValues, gender: "" }, null);

  assert.equal(request.isFormData, false);
  assert.deepEqual(request.body, {
    name: "Test User",
    gender: null,
    residentialAddress,
    shippingAddresses: [residentialAddress],
  });
});

test("profile update uses FormData when an image is selected", () => {
  const image = new Blob(["avatar"], { type: "image/png" }) as unknown as File;
  const request = buildProfileUpdateBody(editValues, image);

  assert.equal(request.isFormData, true);
  assert.equal(request.body instanceof FormData, true);
  const formData = request.body as FormData;
  assert.equal(formData.get("name"), "Test User");
  assert.equal(formData.get("gender"), "female");
  assert.equal(formData.get("profileImage") instanceof Blob, true);
  assert.deepEqual(JSON.parse(String(formData.get("residentialAddress"))), residentialAddress);
  assert.deepEqual(JSON.parse(String(formData.get("shippingAddresses"))), [residentialAddress]);
});

test("profile update does not send an empty gender field in FormData", () => {
  const image = new Blob(["avatar"], { type: "image/png" }) as unknown as File;
  const request = buildProfileUpdateBody({ ...editValues, gender: "" }, image);
  const formData = request.body as FormData;

  assert.equal(request.isFormData, true);
  assert.equal(formData.has("gender"), false);
});

test("profile API updates the authenticated user without forcing multipart headers", () => {
  assert.match(updateCurrentUserSource, /apiClient\.put\("\/api\/v1\/auth\/me", request\.body\)/);
  assert.doesNotMatch(updateCurrentUserSource, /Content-Type/);
});

test("profile API includes bearer token through the shared API client", () => {
  assert.match(apiClientSource, /localStorage\.getItem\(['"]eco_caret_token['"]\)/);
  assert.match(apiClientSource, /Authorization = `Bearer \$\{token\}`/);
});

test("successful profile updates are written to Redux and localStorage", () => {
  assert.match(profileFormSource, /dispatch\(updateProfileUser\(updatedUser\)\)/);
  assert.match(profileFormSource, /onSuccess\?\.\(\)/);
  assert.match(profileSliceSource, /updateProfileUser/);
  assert.match(profileSliceSource, /localStorage\.setItem\("eco_caret_user", JSON\.stringify\(state\.user\)\)/);
});

test("profile edit UI handles preview, validation, submit lock, and API errors", () => {
  assert.match(profileFormSource, /URL\.createObjectURL\(file\)/);
  assert.match(profileFormSource, /URL\.revokeObjectURL/);
  assert.match(profileFormSource, /disabled=\{isSubmitting\}/);
  assert.match(profileFormSource, /error\.status === 401/);
  assert.match(profileFormSource, /error\.status === 413/);
  assert.match(profileFormSource, /error\.status === 422/);
  assert.match(profileFormSource, /fieldErrors/);
});

test("profile and header render saved profile images instead of static placeholders", () => {
  assert.match(profilePageSource, /<ProfileEditModal/);
  assert.match(profilePageSource, /setIsEditProfileModalOpen\(true\)/);
  assert.doesNotMatch(profilePageSource, /<ProfileEditForm/);
  assert.match(profileModalSource, /role="dialog"/);
  assert.match(profileModalSource, /<ProfileEditForm/);
  assert.match(profileModalSource, /onSuccess=\{onClose\}/);
  assert.match(profilePageSource, /getProfileAvatarDisplay\(user\)/);
  assert.match(headerSource, /getProfileAvatarDisplay\(user\)/);
  assert.doesNotMatch(headerSource, /Customer profile avatar/);
});
