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
} from "@/types";

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
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || "Unable to sign in. Please try again.");
    }

    throw error;
  }
};

export const register = async (credentials: RegisterCredentials): Promise<LoginResult> => {
  try {
    const response = await apiClient.post("/api/v1/auth/register", credentials);
    const json = response.data;

    if (!json?.success || !json?.data || !json?.token) {
      throw new Error(json?.message || "Unable to create account. Please try again.");
    }

    return {
      user: json.data,
      token: json.token,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || "Unable to create account. Please try again.");
    }

    throw error;
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
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || "Unable to place order. Please try again.");
    }
    throw error;
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
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || "Unable to load orders. Please try again.");
    }
    throw error;
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
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || "Unable to load order details. Please try again.");
    }
    throw error;
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
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || "Unable to load order timeline events.");
    }
    throw error;
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
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || "Unable to load shipments.");
    }
    throw error;
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
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || "Unable to cancel order.");
    }
    throw error;
  }
};

export const getOrderInvoice = async (id: string) => {
  return apiClient.get(`/api/v1/orders/${id}/invoice`, {
    responseType: "blob",
  });
};
