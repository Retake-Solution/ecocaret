"use client";

import React, { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import PaginationControls from "@/components/PaginationControls";
import { useAppSelector } from "@/lib/store";
import { fetchProductList } from "@/services/api";
import { COLLECTION_FILTER_OPTIONS, DEFAULT_PRODUCT_FILTERS } from "@/constants/collections";
import { ApiProduct, ProductFilters } from "@/types";

const buildApiFilters = (filters: ProductFilters): ProductFilters => ({
  ...filters,
  minPrice: filters.minPrice?.trim(),
  maxPrice: filters.maxPrice?.trim(),
  subCategory: filters.subCategory?.trim(),
  collection: filters.collection?.trim(),
  shape: filters.shape?.trim(),
});

export default function Collections() {
  return (
    <Suspense fallback={<CollectionsFallback />}>
      <CollectionsContent />
    </Suspense>
  );
}

function CollectionsFallback() {
  return (
    <div className="collections-theme min-h-screen flex flex-col items-center justify-center text-center selection:bg-secondary-container selection:text-on-secondary-container">
      <span className="material-symbols-outlined text-outline-variant text-6xl animate-pulse">
        diamond
      </span>
      <p className="mt-4 font-headline-sm text-headline-sm text-on-surface">
        Loading Masterpieces
      </p>
    </div>
  );
}

function CollectionsContent() {
  const searchParams = useSearchParams();
  const urlCategory = searchParams.get("category") || "";
  const urlSubCategory = searchParams.get("subcategory") || searchParams.get("subCategory") || "";

  return (
    <CollectionsList
      key={`${urlCategory}:${urlSubCategory}`}
      initialCategory={urlCategory}
      initialSubCategory={urlSubCategory}
    />
  );
}

function CollectionsList({
  initialCategory,
  initialSubCategory,
}: {
  initialCategory: string;
  initialSubCategory: string;
}) {
  const currencyInitialized = useAppSelector((state) => state.currency.initialized);
  const selectedCurrencyCode = useAppSelector((state) => state.currency.selectedCode);

  const [filters, setFilters] = useState<ProductFilters>(() => ({
    ...DEFAULT_PRODUCT_FILTERS,
    category: initialCategory,
    subCategory: initialSubCategory,
  }));
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const updateFilter = (key: keyof ProductFilters, value: string | number) => {
    setFilters((current) => ({
      ...current,
      [key]: value,
      page: key === "page" ? Number(value) : 1,
    }));
  };

  useEffect(() => {
    if (!currencyInitialized) return;
    let isMounted = true;

    const loadProducts = async () => {
      setIsLoading(true);
      const fetchedProducts = await fetchProductList(buildApiFilters(filters));
      if (isMounted) {
        setProducts(fetchedProducts.products);
        setTotalProducts(fetchedProducts.total);
        setIsLoading(false);
      }
    };
    loadProducts();

    return () => {
      isMounted = false;
    };
  }, [currencyInitialized, filters, selectedCurrencyCode]);

  const currentPage = filters.page || 1;
  const pageSize = filters.limit || 20;
  const totalPages = Math.max(1, Math.ceil(totalProducts / pageSize));
  const hasNextPage = currentPage < totalPages;

  return (
    <div className="collections-theme flex flex-col relative selection:bg-secondary-container selection:text-on-secondary-container">
      {/* Main Layout Area */}
      <main className="flex-grow flex flex-col min-h-screen pt-32 pb-24 px-margin-mobile md:px-margin-desktop gap-margin-desktop relative">
        {/* Main Content Area */}
        <section className="flex-grow">
          <div className="w-full">
            <div className="w-full">
              {isLoading ? (
                <div className="h-[400px] flex flex-col items-center justify-center text-center space-y-4">
                  <span className="material-symbols-outlined text-outline-variant text-6xl animate-pulse">
                    diamond
                  </span>
                  <p className="font-headline-sm text-headline-sm text-on-surface">
                    Loading Masterpieces
                  </p>
                </div>
              ) : products.length === 0 ? (
                <div className="h-[400px] flex flex-col items-center justify-center text-center space-y-4">
                  <span className="material-symbols-outlined text-outline-variant text-6xl">
                    diamond
                  </span>
                  <p className="font-headline-sm text-headline-sm text-on-surface">
                    No Masterpieces Found
                  </p>
                </div>
              ) : (
                <>
                  <div
                    className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-4 md:gap-gutter"
                    id="product-grid"
                  >
                  {products.map((product, index) => (
                    <ProductCard
                      key={product._id}
                      product={product}
                      index={index}
                    />
                  ))}
                </div>

                {/* Pagination Controls */}
                <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-outline-variant/20 pt-8">
                  <PaginationControls
                    currentPage={currentPage}
                    totalPages={totalPages}
                    hasPreviousPage={currentPage > 1 && !isLoading}
                    hasNextPage={hasNextPage && !isLoading}
                    onPrevious={() => updateFilter("page", Math.max(currentPage - 1, 1))}
                    onNext={() => updateFilter("page", currentPage + 1)}
                    variant="text"
                    showTotalPages={false}
                    hideWhenSinglePage={false}
                    withTopMargin={false}
                    alignment="start"
                  />
                  <label className="flex items-center gap-3">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                      Show
                    </span>
                    <select
                      value={filters.limit || 20}
                      onChange={(event) => updateFilter("limit", Number(event.target.value))}
                      className="h-10 rounded-lg border border-outline-variant/40 bg-surface-container-lowest px-3 text-label-sm text-on-surface outline-none transition-colors focus:border-primary cursor-pointer"
                    >
                      {COLLECTION_FILTER_OPTIONS.limit.map((limit) => (
                        <option key={limit} value={limit}>
                          {limit} products
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                </>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
