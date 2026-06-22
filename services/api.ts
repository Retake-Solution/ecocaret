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

const toQueryParams = (filters?: ProductFilters) => {
  if (!filters) return undefined;

  return Object.fromEntries(
    Object.entries(filters).filter(([, value]) => value !== "" && value !== undefined)
  );
};

export const fetchProducts = async (filters?: ProductFilters): Promise<ApiProduct[]> => {
  try {
    const response = await apiClient.get('/products', {
      params: toQueryParams(filters),
    });
    const json = response.data;
    if (json.success && Array.isArray(json.data)) {
      return json.data;
    }
    if (json.success && Array.isArray(json.data?.products)) {
      return json.data.products;
    }
    return [];
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return [];
  }
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
