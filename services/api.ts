import apiClient from './apiClient';
import axios from 'axios';

import { ApiProduct } from '@/types';
import type { ProfileUser } from '@/lib/features/profile/profileSlice';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AddressInput {
  name: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  isDefault?: boolean;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  residentialAddress: AddressInput;
  shippingAddresses: AddressInput[];
}

export interface LoginResult {
  user: ProfileUser;
  token: string;
}

export interface ProductFilters {
  category?: string;
  subCategory?: string;
  collection?: string;
  metalType?: string;
  metalColor?: string;
  purity?: string;
  gender?: string;
  shape?: string;
  stoneType?: string;
  minPrice?: string;
  maxPrice?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

export interface ProductListResult {
  products: ApiProduct[];
  total: number;
  page: number;
  limit: number;
}

const toQueryParams = (filters?: ProductFilters) => {
  if (!filters) return undefined;

  return Object.fromEntries(
    Object.entries(filters).filter(([, value]) => value !== "" && value !== undefined)
  );
};

export const login = async ({ email, password }: LoginCredentials): Promise<LoginResult> => {
  try {
    const response = await apiClient.post('/api/v1/auth/login', {
      email,
      password,
    });
    const json = response.data;

    if (!json?.success || !json?.data || !json?.token) {
      throw new Error(json?.message || 'Unable to sign in. Please try again.');
    }

    return {
      user: json.data,
      token: json.token,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Unable to sign in. Please try again.');
    }

    throw error;
  }
};

export const register = async (credentials: RegisterCredentials): Promise<LoginResult> => {
  try {
    const response = await apiClient.post('/api/v1/auth/register', credentials);
    const json = response.data;

    if (!json?.success || !json?.data || !json?.token) {
      throw new Error(json?.message || 'Unable to create account. Please try again.');
    }

    return {
      user: json.data,
      token: json.token,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Unable to create account. Please try again.');
    }

    throw error;
  }
};

export const fetchProductList = async (filters?: ProductFilters): Promise<ProductListResult> => {
  try {
    const response = await apiClient.get('/api/v1/products', {
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
    console.error('Failed to fetch products:', error);
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

export interface OrderAddress {
  name: string;
  line1: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
  phone: string;
}

export interface OrderItemInput {
  productId: string;
  metalType: string;
  metalColor: string;
  purity: string;
  size: string;
  quantity: number;
}

export interface PlaceOrderPayload {
  items: OrderItemInput[];
  shippingAddress: OrderAddress;
  billingAddress: OrderAddress;
}

export interface PlaceOrderResult {
  success: boolean;
  data: {
    id: string;
    orderNumber: string;
    customerSnapshot?: {
      name: string;
      email: string;
    };
    [key: string]: any;
  };
}

export const placeOrder = async (
  payload: PlaceOrderPayload,
  idempotencyKey: string
): Promise<PlaceOrderResult> => {
  try {
    const response = await apiClient.post('/api/v1/orders', payload, {
      headers: {
        'Idempotency-Key': idempotencyKey,
      },
    });
    const json = response.data;
    if (!json?.success || !json?.data) {
      throw new Error(json?.message || 'Unable to place order. Please try again.');
    }
    return json;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Unable to place order. Please try again.');
    }
    throw error;
  }
};

export interface OrderItem {
  productSnapshot: {
    name: string;
    sku: string;
    slug: string;
    imageUrl?: string;
  };
  variantSnapshot: {
    metalType: string;
    metalColor: string;
    purity: string;
    size: string;
    sizeLabel: string;
  };
  quantity: {
    ordered: number;
  };
  pricingSnapshot: {
    finalUnitPriceMinor: number;
    subtotalMinor: number;
  };
  fulfillmentStatus: string;
  _id: string;
}

export interface OrderData {
  id: string;
  orderNumber: string;
  customerSnapshot?: {
    name: string;
    email: string;
  };
  items: OrderItem[];
  totals: {
    merchandiseSubtotalMinor: number;
    itemDiscountMinor: number;
    orderDiscountMinor: number;
    shippingMinor: number;
    taxMinor: number;
    totalMinor: number;
    currency: string;
  };
  shippingAddressSnapshot?: AddressInput;
  billingAddressSnapshot?: AddressInput;
  fulfillmentStatus: string;
  paymentStatus: string;
  createdAt: string;
  updatedAt: string;
}

export interface GetOrdersResult {
  success: boolean;
  data: OrderData[];
  pagination?: {
    totalItems: number;
    totalPages: number;
    page: number;
    limit: number;
  };
}

export const getOrders = async (): Promise<GetOrdersResult> => {
  try {
    const response = await apiClient.get('/api/v1/orders');
    const json = response.data;
    if (!json?.success || !json?.data) {
      throw new Error(json?.message || 'Unable to load orders. Please try again.');
    }
    return json;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Unable to load orders. Please try again.');
    }
    throw error;
  }
};

export interface SingleOrderResult {
  success: boolean;
  data: OrderData;
}

export const getOrderById = async (id: string): Promise<SingleOrderResult> => {
  try {
    const response = await apiClient.get(`/api/v1/orders/${id}`);
    const json = response.data;
    if (!json?.success || !json?.data) {
      throw new Error(json?.message || 'Unable to load order details. Please try again.');
    }
    return json;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Unable to load order details. Please try again.');
    }
    throw error;
  }
};

export interface OrderEvent {
  id: string;
  type: string;
  createdAt: string;
  reason?: string;
  previousValue?: string;
  newValue?: string;
  actor?: {
    type: string;
  };
  metadata?: {
    trackingNumber?: string;
    [key: string]: any;
  };
}

export interface GetOrderEventsResult {
  success: boolean;
  data: OrderEvent[];
}

export const getOrderEvents = async (id: string): Promise<GetOrderEventsResult> => {
  try {
    const response = await apiClient.get(`/api/v1/orders/${id}/events`);
    const json = response.data;
    if (!json?.success || !json?.data) {
      throw new Error(json?.message || 'Unable to load order timeline events.');
    }
    return json;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Unable to load order timeline events.');
    }
    throw error;
  }
};
