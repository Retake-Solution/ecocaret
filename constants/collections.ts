import type { ProductFilters } from "@/types";

export const COLLECTION_FILTER_OPTIONS = {
  gender: ["men", "women", "unisex"],
  metalType: ["gold", "silver"],
  metalColor: ["yellow", "white", "rose"],
  purity: ["10K", "14K", "925"],
  stoneType: ["natural_diamond", "lab_grown_diamond", "gemstone", "none"],
  sort: ["price_asc", "price_desc", "newest", "popular"],
  limit: [10, 20, 40],
};

export const DEFAULT_PRODUCT_FILTERS: ProductFilters = {
  category: "",
  subCategory: "",
  collection: "",
  metalType: "",
  metalColor: "",
  purity: "",
  gender: "",
  shape: "",
  stoneType: "",
  minPrice: "",
  maxPrice: "",
  sort: "",
  page: 1,
  limit: 20,
};
