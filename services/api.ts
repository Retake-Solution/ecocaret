import apiClient from "./apiClient";
import axios from "axios";
import {
  ApiProduct,
  LoginCredentials,
  RegisterCredentials,
  LoginResult,
  ProductFilters,
  ProductListResult,
  PlaceOrderPayload,
  PlaceOrderResult,
  GetOrdersParams,
  GetOrdersResult,
  SingleOrderResult,
  GetOrderEventsParams,
  GetOrderEventsResult,
  GetOrderShipmentsParams,
  GetOrderShipmentsResult,
  CancelOrderPayload,
  CancelOrderResult,
  CreateReturnPayload,
  CustomerReturnResult,
  ListReturnsParams,
  ListReturnsResult,
  CreatePaymentPayload,
  CustomerPaymentListResult,
  CustomerPaymentResult,
  VerifyRazorpayPayload,
} from "@/types";
import { buildProfileUpdateBody, type ProfileEditValues } from "@/lib/profileEdit";
import { buildRegistrationRequestBody } from "@/lib/registration";
import type { ProfileUser } from "@/lib/features/profile/profileSlice";

export interface ApiFieldError {
  field: string;
  message: string;
}

export class ApiRequestError extends Error {
  status?: number;
  code?: string;
  fieldErrors?: ApiFieldError[];

  constructor(message: string, status?: number, code?: string, fieldErrors?: ApiFieldError[]) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
    this.code = code;
    this.fieldErrors = fieldErrors;
  }
}

const getApiError = (error: unknown, fallback: string) => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as {
      message?: string;
      code?: string;
      error?: string;
      errors?: ApiFieldError[];
    } | undefined;
    const firstFieldError = data?.errors?.[0]?.message;
    return new ApiRequestError(
      data?.message || firstFieldError || fallback,
      error.response?.status,
      data?.code || data?.error,
      data?.errors
    );
  }

  if (error instanceof Error) return error;
  return new Error(fallback);
};

const toQueryParams = (filters?: ProductFilters) => {
  if (!filters) return undefined;

  return Object.fromEntries(
    Object.entries(filters).filter(([, value]) => value !== "" && value !== undefined)
  );
};

export const login = async ({ email, password }: LoginCredentials): Promise<LoginResult> => {
  try {
    const response = await apiClient.post("/api/v1/auth/login", {
      email,
      password,
    });
    const json = response.data;

    if (!json?.success || !json?.data || !json?.token) {
      throw new Error(json?.message || "Unable to sign in. Please try again.");
    }

    return {
      user: json.data,
      token: json.token,
    };
  } catch (error) {
    throw getApiError(error, "Unable to sign in. Please try again.");
  }
};

export const register = async (
  credentials: RegisterCredentials,
  selectedImage?: File | null
): Promise<LoginResult> => {
  try {
    const request = buildRegistrationRequestBody(credentials, selectedImage);
    const response = await apiClient.post("/api/v1/auth/register", request.body);
    const json = response.data;

    if (!json?.success || !json?.data || !json?.token) {
      throw new Error(json?.message || "Unable to create account. Please try again.");
    }

    return {
      user: json.data,
      token: json.token,
    };
  } catch (error) {
    throw getApiError(error, "Unable to create account. Please try again.");
  }
};

export const fetchProductList = async (filters?: ProductFilters): Promise<ProductListResult> => {
  try {
    const response = await apiClient.get("/api/v1/products", {
      params: toQueryParams(filters),
    });
    const json = response.data;
    if (json.success && Array.isArray(json.data)) {
      return {
        products: json.data,
        total: Number(json.total ?? json.data.length),
        page: Number(json.page ?? filters?.page ?? 1),
        limit: Number(json.limit ?? filters?.limit ?? json.data.length),
      };
    }
    if (json.success && Array.isArray(json.data?.products)) {
      return {
        products: json.data.products,
        total: Number(json.data.total ?? json.total ?? json.data.products.length),
        page: Number(json.data.page ?? json.page ?? filters?.page ?? 1),
        limit: Number(json.data.limit ?? json.limit ?? filters?.limit ?? json.data.products.length),
      };
    }
    return {
      products: [],
      total: 0,
      page: filters?.page ?? 1,
      limit: filters?.limit ?? 20,
    };
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return {
      products: [],
      total: 0,
      page: filters?.page ?? 1,
      limit: filters?.limit ?? 20,
    };
  }
};

export const fetchProducts = async (filters?: ProductFilters): Promise<ApiProduct[]> => {
  const result = await fetchProductList(filters);
  return result.products;
};

export const fetchProductById = async (id: string): Promise<ApiProduct | null> => {
  try {
    const response = await apiClient.get(`/api/v1/products/${id}`);
    const json = response.data;
    if (json.success && json.data) {
      return json.data;
    }
    return null;
  } catch (error) {
    console.error(`Failed to fetch product with id ${id}:`, error);
    return null;
  }
};

export const placeOrder = async (
  payload: PlaceOrderPayload,
  idempotencyKey: string
): Promise<PlaceOrderResult> => {
  try {
    const response = await apiClient.post("/api/v1/orders", payload, {
      headers: {
        "Idempotency-Key": idempotencyKey,
      },
    });
    const json = response.data;
    if (!json?.success || !json?.data) {
      throw new Error(json?.message || "Unable to place order. Please try again.");
    }
    return json;
  } catch (error) {
    throw getApiError(error, "Unable to place order. Please try again.");
  }
};

export const getOrders = async (params?: GetOrdersParams): Promise<GetOrdersResult> => {
  try {
    const response = await apiClient.get("/api/v1/orders", { params });
    const json = response.data;
    if (!json?.success || !json?.data) {
      throw new Error(json?.message || "Unable to load orders. Please try again.");
    }
    return json;
  } catch (error) {
    throw getApiError(error, "Unable to load orders. Please try again.");
  }
};

export const getOrderById = async (id: string): Promise<SingleOrderResult> => {
  try {
    const response = await apiClient.get(`/api/v1/orders/${id}`);
    const json = response.data;
    if (!json?.success || !json?.data) {
      throw new Error(json?.message || "Unable to load order details. Please try again.");
    }
    return json;
  } catch (error) {
    throw getApiError(error, "Unable to load order details. Please try again.");
  }
};

export const getOrderEvents = async (
  id: string,
  params?: GetOrderEventsParams
): Promise<GetOrderEventsResult> => {
  try {
    const response = await apiClient.get(`/api/v1/orders/${id}/events`, { params });
    const json = response.data;
    if (!json?.success || !json?.data) {
      throw new Error(json?.message || "Unable to load order timeline events.");
    }
    return json;
  } catch (error) {
    throw getApiError(error, "Unable to load order timeline events.");
  }
};

export const getOrderShipments = async (
  id: string,
  params?: GetOrderShipmentsParams
): Promise<GetOrderShipmentsResult> => {
  try {
    const response = await apiClient.get(`/api/v1/orders/${id}/shipments`, { params });
    const json = response.data;
    if (!json?.success || !json?.data) {
      throw new Error(json?.message || "Unable to load shipments.");
    }
    return json;
  } catch (error) {
    throw getApiError(error, "Unable to load shipments.");
  }
};

export const cancelOrder = async (
  id: string,
  payload: CancelOrderPayload,
  idempotencyKey: string
): Promise<CancelOrderResult> => {
  try {
    const response = await apiClient.post(`/api/v1/orders/${id}/cancellations`, payload, {
      headers: {
        "Idempotency-Key": idempotencyKey,
      },
    });
    const json = response.data;
    if (!json?.success || !json?.data) {
      throw new Error(json?.message || "Unable to cancel order.");
    }
    return json;
  } catch (error) {
    throw getApiError(error, "Unable to cancel order.");
  }
};

export const createOrderReturn = async (
  orderId: string,
  payload: CreateReturnPayload,
  idempotencyKey: string
): Promise<CustomerReturnResult> => {
  try {
    const response = await apiClient.post(`/api/v1/orders/${orderId}/returns`, payload, {
      headers: {
        "Idempotency-Key": idempotencyKey,
      },
    });
    const json = response.data;
    if (!json?.success || !json?.data) {
      throw new Error(json?.message || "Unable to request return.");
    }
    return json;
  } catch (error) {
    throw getApiError(error, "Unable to request return.");
  }
};

export const listOrderReturns = async (
  orderId: string,
  params?: ListReturnsParams
): Promise<ListReturnsResult> => {
  try {
    const response = await apiClient.get(`/api/v1/orders/${orderId}/returns`, {
      params: {
        limit: params?.limit ?? 20,
        cursor: params?.cursor,
      },
    });
    const json = response.data;
    if (!json?.success || !Array.isArray(json.data)) {
      throw new Error(json?.message || "Unable to load return requests.");
    }
    return json;
  } catch (error) {
    throw getApiError(error, "Unable to load return requests.");
  }
};

export const getOrderReturn = async (
  orderId: string,
  returnId: string
): Promise<CustomerReturnResult> => {
  try {
    const response = await apiClient.get(`/api/v1/orders/${orderId}/returns/${returnId}`);
    const json = response.data;
    if (!json?.success || !json?.data) {
      throw new Error(json?.message || "Unable to load return request.");
    }
    return json;
  } catch (error) {
    throw getApiError(error, "Unable to load return request.");
  }
};

export const getOrderInvoice = async (id: string) => {
  return apiClient.get(`/api/v1/orders/${id}/invoice`, {
    responseType: "blob",
  });
};

export const createOrderPayment = async (
  orderId: string,
  idempotencyKey: string
): Promise<CustomerPaymentResult> => {
  try {
    const payload: CreatePaymentPayload = {
      channel: "web",
      returnPath: "order-status",
      provider: "razorpay",
    };
    const response = await apiClient.post(`/api/v1/orders/${orderId}/payments`, payload, {
      headers: {
        "Idempotency-Key": idempotencyKey,
      },
    });
    const json = response.data;
    if (!json?.success || !json?.data) {
      throw new Error(json?.message || "Unable to start payment. Please try again.");
    }
    return json;
  } catch (error) {
    throw getApiError(error, "Unable to start payment. Please try again.");
  }
};

export const createRazorpayPayment = createOrderPayment;

export const listOrderPayments = async (orderId: string): Promise<CustomerPaymentListResult> => {
  try {
    const response = await apiClient.get(`/api/v1/orders/${orderId}/payments`);
    const json = response.data;
    if (!json?.success || !Array.isArray(json.data)) {
      throw new Error(json?.message || "Unable to load payment attempts.");
    }
    return json;
  } catch (error) {
    throw getApiError(error, "Unable to load payment attempts.");
  }
};

export const getOrderPayment = async (
  orderId: string,
  paymentId: string,
  signal?: AbortSignal
): Promise<CustomerPaymentResult> => {
  try {
    const response = await apiClient.get(`/api/v1/orders/${orderId}/payments/${paymentId}`, { signal });
    const json = response.data;
    if (!json?.success || !json?.data) {
      throw new Error(json?.message || "Unable to load payment status.");
    }
    return json;
  } catch (error) {
    throw getApiError(error, "Unable to load payment status.");
  }
};

export const updateCurrentUser = async (
  values: ProfileEditValues,
  selectedFile?: File | null
): Promise<ProfileUser> => {
  try {
    const request = buildProfileUpdateBody(values, selectedFile);
    const response = await apiClient.put("/api/v1/auth/me", request.body);
    const json = response.data;

    if (!json?.success || !json?.data) {
      throw new Error(json?.message || "Unable to update profile. Please try again.");
    }

    return json.data;
  } catch (error) {
    throw getApiError(error, "Unable to update profile. Please try again.");
  }
};

export const abandonOrderPayment = async (
  orderId: string,
  paymentId: string,
  idempotencyKey: string
): Promise<CustomerPaymentResult & { httpStatus: number }> => {
  try {
    const response = await apiClient.post(
      `/api/v1/orders/${orderId}/payments/${paymentId}/abandon`,
      {},
      {
        headers: {
          "Idempotency-Key": idempotencyKey,
          "Content-Type": "application/json",
        },
      }
    );
    const json = response.data;
    if (!json?.success || !json?.data) {
      throw new Error(json?.message || "Unable to check payment status.");
    }
    return { ...json, httpStatus: response.status };
  } catch (error) {
    throw getApiError(error, "Unable to check payment status.");
  }
};

export const verifyRazorpayPayment = async (
  orderId: string,
  paymentId: string,
  payload: VerifyRazorpayPayload
): Promise<CustomerPaymentResult> => {
  try {
    const response = await apiClient.post(
      `/api/v1/orders/${orderId}/payments/${paymentId}/verify-razorpay`,
      payload
    );
    const json = response.data;
    if (!json?.success || !json?.data) {
      throw new Error(json?.message || "Unable to verify payment.");
    }
    return json;
  } catch (error) {
    throw getApiError(error, "Unable to verify payment.");
  }
};
