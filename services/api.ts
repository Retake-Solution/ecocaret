import apiClient from './apiClient';
import axios from 'axios';

import { ApiProduct } from '@/types';
import type { ProfileUser } from '@/lib/features/profile/profileSlice';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
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

export const register = async ({
  name,
  email,
  password,
}: RegisterCredentials): Promise<LoginResult> => {
  try {
    const response = await apiClient.post('/api/v1/auth/register', {
      name,
      email,
      password,
    });
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
