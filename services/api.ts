import apiClient from './apiClient';

import { ApiProduct } from '@/types';

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

export const fetchProductList = async (filters?: ProductFilters): Promise<ProductListResult> => {
  try {
    const response = await apiClient.get('/products', {
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
    const response = await apiClient.get(`/products/${id}`);
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
