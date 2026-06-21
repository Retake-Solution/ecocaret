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
  category?: string;
  subCategory?: string;
  collectionIds?: string[];
  collection?: string[];
  gender: string;
  shape?: string;
  occasion?: string[];
  tags?: string[];
  stoneType: string;
  totalStoneCaratWeight?: number;
  displayPrice?: number;
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
    url?: string;
    imageUrl?: string;
    src?: string;
    metalColor?: string;
    color?: string;
    alt?: string;
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
