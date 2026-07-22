"use client";

import Link from "next/link";
import {
  PRODUCT_FALLBACK_NAME,
  PRODUCT_FALLBACK_SPEC,
  PRODUCT_TEXT_SEPARATOR,
} from "@/constants/product";
import { formatLegacyUsdMajor, formatMoney } from "@/lib/money";
import { ApiCategory, ApiProduct } from "@/types";

interface ProductCardProps {
  product: ApiProduct;
  index: number;
}

const formatLabel = (value?: string) =>
  value
    ? value
        .replace(/[_-]/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase())
    : "";

const getTaxonomyLabel = (value?: string | ApiCategory) => {
  if (!value) return "";
  return typeof value === "string" ? formatLabel(value) : value.name || formatLabel(value.slug);
};

const getProductName = (product: ApiProduct) =>
  product.name || product.title || PRODUCT_FALLBACK_NAME;

const getProductImage = (product: ApiProduct) => {
  const firstColorImageGroup = product.colorImages?.[0];
  const primaryImage =
    firstColorImageGroup?.images.find((image) => image.isPrimary) ||
    firstColorImageGroup?.images[0];

  return primaryImage?.url || "";
};

const getProductPrice = (product: ApiProduct) => {
  const activeMetalOption = product.metalOptions?.find((option) => option.isActive);
  const metalWeight =
    product.sizeMatrix
      ?.find((size) => size.isAvailable)
      ?.weightByPurity.find((weight) => weight.purity === activeMetalOption?.purity)
      ?.metalWeightGrams || 0;
  const metalTotal = (activeMetalOption?.pricePerGram || 0) * metalWeight;
  const stoneTotal =
    product.productStones?.reduce(
      (sum, item) =>
        sum + (item.stone?.priceUSD || 0) * (item.caratWeight || item.stone?.caratWeight || 0),
      0
    ) || 0;
  const subtotal = stoneTotal + metalTotal + (product.makingChargeUSD || 0);
  const discount = product.discountPercent ? subtotal * (product.discountPercent / 100) : 0;

  return Math.max(subtotal - discount, 0);
};

const getMetalSummary = (product: ApiProduct) => {
  const options = product.metalOptions?.filter((option) => option.isActive) || [];
  if (options.length > 0) {
    const colors = Array.from(new Set(options.map((option) => formatLabel(option.metalColor))));
    const purities = Array.from(new Set(options.map((option) => option.purity)));
    return `${colors.slice(0, 3).join(", ")} Gold${
      purities.length ? `${PRODUCT_TEXT_SEPARATOR}${purities.join("/")}` : ""
    }`;
  }

  return "";
};

const getProductSpec = (product: ApiProduct) => {
  const caratWeight = product.totalStoneCaratWeight || 0;
  const shape = formatLabel(product.shape);
  const type = getTaxonomyLabel(product.subCategory) || getTaxonomyLabel(product.category);

  return [caratWeight ? `${caratWeight.toFixed(2)}ct` : "", shape, type]
    .filter(Boolean)
    .join(PRODUCT_TEXT_SEPARATOR);
};

const getAvailableSizeCount = (product: ApiProduct) =>
  product.sizeMatrix?.filter((size) => size.isAvailable).length || 0;

export default function ProductCard({
  product,
  index,
}: ProductCardProps) {
  const productName = getProductName(product);
  const productImage = getProductImage(product);
  const price = getProductPrice(product);
  const priceLabel = product.pricing?.estimated
    ? formatMoney(product.pricing.estimated)
    : formatLegacyUsdMajor(price);
  const spec = getProductSpec(product);
  const metalSummary = getMetalSummary(product);
  const availableSizeCount = getAvailableSizeCount(product);

  return (
    <div
      style={{ animationDelay: `${index * 80}ms` }}
      className="grid-item ripple-fade product-card group relative overflow-hidden bg-surface-container-lowest rounded-xl shadow-sm flex flex-col justify-between cursor-pointer"
    >
      <Link href={`/collections/${product._id}`} className="flex flex-col justify-between flex-grow h-full">
        <div className="aspect-[0.75] overflow-hidden relative bg-surface-container">
          {productImage ? (
            <img
              alt={productName}
              className="parallax-img w-full h-full object-cover"
              src={productImage}
            />
          ) : (
            <div className="parallax-img w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-surface-container-lowest via-surface-container-low to-secondary-container/30 text-primary">
              <span className="material-symbols-outlined text-6xl mb-3">
                diamond
              </span>
              <span className="font-label-sm text-label-sm uppercase tracking-widest">
                Image Coming Soon
              </span>
            </div>
          )}
          {product.isNewArrival && (
            <span className="absolute top-4 left-4 bg-secondary text-on-secondary rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest">
              New
            </span>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-surface/90 via-surface/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
        </div>
        <div className="p-4 md:p-6 relative flex-grow flex flex-col justify-between">
          <div>
            <h4 className="font-headline-md text-label-md md:text-headline-md text-on-surface mb-1 group-hover:text-primary transition-colors duration-300 line-clamp-2 md:line-clamp-none">
              {productName}
            </h4>
            <p className="text-on-surface-variant text-[11px] md:font-body-md mb-2 md:mb-4 opacity-80">
              {formatLabel(product.stoneType)}
              {metalSummary ? `${PRODUCT_TEXT_SEPARATOR}${metalSummary}` : ""}
            </p>
          </div>
          <p className="text-primary font-bold text-label-md md:text-body-lg">
            {priceLabel}
          </p>

          {/* Hover Details overlay */}
          <div className="absolute inset-x-0 bottom-0 p-4 md:p-6 bg-primary text-on-primary translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out flex justify-between items-center">
            <div className="hidden md:block">
              <p className="text-[10px] uppercase tracking-tighter opacity-80 font-bold">
                Specification
              </p>
              <p className="font-bold text-sm">
                {spec || PRODUCT_FALLBACK_SPEC}
              </p>
              {availableSizeCount > 0 && (
                <p className="text-xs opacity-80 mt-1">
                  {availableSizeCount} sizes available
                </p>
              )}
            </div>
            <span className="font-label-sm uppercase tracking-widest flex items-center gap-1 md:gap-2 group/btn font-bold text-[10px] md:text-xs">
              Shop
              <span className="material-symbols-outlined text-[14px] md:text-sm group-hover/btn:translate-x-1 transition-transform">
                arrow_forward
              </span>
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}
