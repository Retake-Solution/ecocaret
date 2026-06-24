export interface ApiCategory {
  _id: string;
  name: string;
  slug: string;
  parentId?: string | null;
  parentSlug?: string | null;
  level?: number;
  isActive?: boolean;
  sortOrder?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiProduct {
  ratings?: {
    average: number;
    count: number;
  };
  _id: string;
  sku: string;
  name?: string;
  slug: string;
  title?: string;
  description: string;
  shortDescription?: string;
  sourceUrl?: string;
  categoryId?: string;
  category?: string | ApiCategory;
  subCategory?: string | ApiCategory;
  collectionIds?: string[];
  collection?: string[];
  gender: string;
  shape?: string;
  occasion?: string[];
  tags?: string[];
  stoneType: string;
  totalStoneCaratWeight?: number;
  discountPercent?: number;
  makingChargeUSD?: number;
  isActive?: boolean;
  isFeatured?: boolean;
  isMadeToOrder?: boolean;
  isNewArrival?: boolean;
  isReadyToShip?: boolean;
  allowEngraving?: boolean;
  engravingMaxChars?: number;
  estimatedDeliveryDays?: number;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  createdAt?: string;
  updatedAt?: string;
  images?: string[];
  colorImages?: Array<{
    metalColor: string,
    images: Array<{
      url: string,
      publicId: string,
      altText: string,
      isPrimary: boolean,
      metalColor: string
    }>
  }>;
  videos?: string[];
  metalOptions?: {
    _id?: string;
    metalType: string;
    metalColor: string;
    purity: string;
    pricePerGram: number;
    purityMultiplier: number;
    isActive: boolean;
  }[];
  productStones?: {
    stone: {
      _id: string;
      name: string;
      slug?: string;
      stoneType: string;
      stoneCount?: number;
      caratWeight: number;
      clarity: string;
      cut: string;
      color: string;
      shape: string;
      settingType: string;
      priceUSD: number;
      isActive: boolean;
    };
    stoneRole: string;
    caratWeight: number;
    displayOrder: number;
  }[];
  sizeMatrix?: {
    size: string;
    sizeLabel: string;
    isAvailable: boolean;
    weightByPurity: {
      purity: string;
      metalWeightGrams: number;
      productWeightGrams: number;
    }[];
    inventory: {
      metalType: string;
      metalColor: string;
      purity: string;
      stock: number;
      sku: string;
    }[];
  }[];
}
