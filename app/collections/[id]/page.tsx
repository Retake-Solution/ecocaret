import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchProductById, fetchProducts } from "@/services/api";
import ProductDetailsClient from "./ProductDetailsClient";
import {
  PRODUCT_DETAIL_METADATA_FALLBACK_TITLE,
  PRODUCT_DETAIL_METADATA_TITLE_SUFFIX,
  PRODUCT_DETAIL_NOT_FOUND_TITLE,
  PRODUCT_DETAIL_SUGGESTED_LIMIT,
} from "@/constants/productDetail";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await fetchProductById(id);

  if (!product) {
    return {
      title: PRODUCT_DETAIL_NOT_FOUND_TITLE,
    };
  }

  return {
    title: `${product.metaTitle || product.name || product.title || PRODUCT_DETAIL_METADATA_FALLBACK_TITLE}${PRODUCT_DETAIL_METADATA_TITLE_SUFFIX}`,
    description: product.metaDescription || product.description || product.shortDescription,
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { id } = await params;
  const product = await fetchProductById(id);

  if (!product) {
    notFound();
  }

  // Get other products for recommendation
  const allProducts = await fetchProducts();
  const suggestedProducts = allProducts
    .filter((p) => p._id !== id)
    .slice(0, PRODUCT_DETAIL_SUGGESTED_LIMIT);

  return (
    <ProductDetailsClient
      key={product._id}
      product={product}
      suggestedProducts={suggestedProducts}
    />
  );
}
