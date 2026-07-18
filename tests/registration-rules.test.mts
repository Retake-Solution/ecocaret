import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  buildRegistrationRequestBody,
  validateRegistrationImage,
  type RegistrationValues,
} from "../lib/registration.ts";
import { PROFILE_IMAGE_MAX_BYTES } from "../constants/profile.ts";

const serviceSource = readFileSync(new URL("../services/api.ts", import.meta.url), "utf8");
const signUpSource = readFileSync(new URL("../components/SignUpForm.tsx", import.meta.url), "utf8");
const profileSliceSource = readFileSync(new URL("../lib/features/profile/profileSlice.ts", import.meta.url), "utf8");
const registerSource = serviceSource.slice(
  serviceSource.indexOf("export const register"),
  serviceSource.indexOf("export const fetchProductList")
);

const residentialAddress = {
  name: "Jane Customer",
  line1: "12 Green Lane",
  city: "Austin",
  state: "TX",
  postalCode: "78701",
  country: "US",
  phone: "+15551234567",
};

const baseValues: RegistrationValues = {
  name: " Jane Customer ",
  email: " jane@example.com ",
  password: "Password123",
};

test("registration uses JSON without gender or image", () => {
  const request = buildRegistrationRequestBody(baseValues, null);

  assert.equal(request.isFormData, false);
  assert.deepEqual(request.body, {
    name: "Jane Customer",
    email: "jane@example.com",
    password: "Password123",
  });
});

test("registration includes selected gender in JSON", () => {
  const request = buildRegistrationRequestBody({ ...baseValues, gender: "female" }, null);

  assert.equal(request.isFormData, false);
  assert.deepEqual(request.body, {
    name: "Jane Customer",
    email: "jane@example.com",
    password: "Password123",
    gender: "female",
  });
});

test("registration omits empty gender", () => {
  const request = buildRegistrationRequestBody({ ...baseValues, gender: "" }, null);

  assert.equal(request.isFormData, false);
  assert.equal("gender" in (request.body as unknown as Record<string, unknown>), false);
});

test("registration image validation rejects unsupported formats and oversized files", () => {
  assert.equal(
    validateRegistrationImage({ type: "image/gif", size: 10 }),
    "Please choose a JPEG, PNG, or WebP image."
  );
  assert.equal(
    validateRegistrationImage({ type: "image/webp", size: PROFILE_IMAGE_MAX_BYTES + 1 }),
    "Profile image must be 5 MB or smaller."
  );
});

test("registration uses FormData when an image is selected", () => {
  const image = new Blob(["avatar"], { type: "image/png" }) as unknown as File;
  const request = buildRegistrationRequestBody(
    {
      ...baseValues,
      gender: "prefer_not_to_say",
      residentialAddress,
      shippingAddresses: [{ ...residentialAddress, isDefault: true }],
    },
    image
  );

  assert.equal(request.isFormData, true);
  assert.equal(request.body instanceof FormData, true);
  const formData = request.body as FormData;
  assert.equal(formData.get("name"), "Jane Customer");
  assert.equal(formData.get("email"), "jane@example.com");
  assert.equal(formData.get("password"), "Password123");
  assert.equal(formData.get("gender"), "prefer_not_to_say");
  assert.equal(formData.get("profileImage") instanceof Blob, true);
  assert.deepEqual(JSON.parse(String(formData.get("residentialAddress"))), residentialAddress);
  assert.deepEqual(JSON.parse(String(formData.get("shippingAddresses"))), [
    { ...residentialAddress, isDefault: true },
  ]);
});

test("registration multipart request does not assign Content-Type manually", () => {
  assert.match(registerSource, /apiClient\.post\("\/api\/v1\/auth\/register", request\.body\)/);
  assert.doesNotMatch(registerSource, /Content-Type/);
});

test("confirm password remains frontend-only", () => {
  assert.match(signUpSource, /confirmPassword/);
  assert.doesNotMatch(signUpSource, /confirmPassword,\s*$/m);
  assert.doesNotMatch(signUpSource, /confirmPassword:/);
});

test("successful registration stores returned token and user", () => {
  assert.match(signUpSource, /dispatch\(loginUser\(\{ \.\.\.result\.user, token: result\.token \}\)\)/);
  assert.match(profileSliceSource, /localStorage\.setItem\("eco_caret_user", JSON\.stringify\(user\)\)/);
  assert.match(profileSliceSource, /localStorage\.setItem\("eco_caret_token", token\)/);
});

test("returned gender and profile image are retained in the authenticated user type", () => {
  assert.match(profileSliceSource, /gender\?: ProfileGender \| null/);
  assert.match(profileSliceSource, /profileImage\?: ProfileImage \| null/);
  assert.match(profileSliceSource, /interface ProfileImage/);
  assert.match(profileSliceSource, /url: string/);
});

test("registration UI previews images, displays API errors, and prevents duplicate submissions", () => {
  assert.match(signUpSource, /URL\.createObjectURL\(file\)/);
  assert.match(signUpSource, /URL\.revokeObjectURL/);
  assert.match(signUpSource, /apiError\.status === 409/);
  assert.match(signUpSource, /apiError\.status === 413/);
  assert.match(signUpSource, /error\.status === 422/);
  assert.match(signUpSource, /if \(isSubmitting\) return/);
  assert.match(signUpSource, /disabled=\{isSubmitting\}/);
});
