export interface ApiProduct {
  _id: string;
  sku: string;
  slug: string;
  title: string;
  description: string;
  sourceUrl: string;
  categoryId: string;
  collectionIds: string[];
  gender: string;
  stoneType: string;
  images: string[];
  videos: string[];
  metal: {
    _id: string;
    name: string;
    purity: string;
    color: string;
    group: string;
    ratePerGram: number;
    isActive: boolean;
  }[];
  specifications: {
    diamondShape: string;
    diamondPieces: number;
    diamondWeight: number;
    diamondQuality: string;
    settingType: string;
    _id: string;
    diamondAmount: number;
  }[];
  sizes: {
    size: string;
    metalWeight: number;
    _id: string;
  }[];
  jewelryType: string;
  status: string;
  isDeleted: boolean;
}
