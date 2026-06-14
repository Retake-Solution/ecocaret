import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchProductById, fetchProducts } from "@/services/api";
import ProductDetailsClient from "./ProductDetailsClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await fetchProductById(id);

  if (!product) {
    return {
      title: "Product Not Found | Eco Caret",
    };
  }

  return {
    title: `${product.title} | Eco Caret - Ethical Brilliance`,
    description: product.description,
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
  const suggestedProducts = allProducts.filter((p) => p._id !== id).slice(0, 3);

  return (
    <ProductDetailsClient
      product={product}
      suggestedProducts={suggestedProducts}
    />
  );
}
