"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import CartDrawer from "@/components/CartDrawer";
import ProfileDialog from "@/components/ProfileDialog";
import { useAppDispatch, useAppSelector } from "@/lib/store";
import { setCartOpen, removeFromCart, clearCart } from "@/lib/features/cart/cartSlice";
import { setProfileOpen } from "@/lib/features/profile/profileSlice";
import { toggleWishlist } from "@/lib/features/wishlist/wishlistSlice";
import { fetchProductList, ProductFilters } from "@/services/api";
import { ApiCategory, ApiProduct } from "@/types";

const filterOptions = {
  gender: ["men", "women", "unisex"],
  metalType: ["gold", "silver"],
  metalColor: ["yellow", "white", "rose"],
  purity: ["10K", "14K", "925"],
  stoneType: ["natural_diamond", "lab_grown_diamond", "gemstone", "none"],
  sort: ["price_asc", "price_desc", "newest", "popular"],
  limit: [10, 20, 40],
};

type FilterOption = string | { label: string; value: string };
type LabeledFilterOption = Extract<FilterOption, { label: string; value: string }>;

const defaultFilters: ProductFilters = {
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

const getTaxonomyFilterOption = (
  value?: string | ApiCategory
): LabeledFilterOption | null => {
  if (!value) return null;

  if (typeof value === "string") {
    return {
      label: formatLabel(value),
      value,
    };
  }

  return {
    label: value.name || formatLabel(value.slug),
    value: value._id,
  };
};

const mergeFilterOptions = (existing: FilterOption[], incoming: FilterOption[]) => {
  const options = new Map<string, FilterOption>();
  [...existing, ...incoming].forEach((option) => {
    const value = typeof option === "string" ? option : option.value;
    options.set(value, option);
  });
  return Array.from(options.values());
};

const getProductName = (product: ApiProduct) =>
  product.name || product.title || "Untitled Masterpiece";

const getProductImage = (product: ApiProduct) => {
  if (product.images?.[0]) return product.images[0];

  const firstColorImage = product.colorImages?.[0];
  return firstColorImage?.url || firstColorImage?.imageUrl || firstColorImage?.src || "";
};

const getProductPrice = (product: ApiProduct) => {
  if (typeof product.displayPrice === "number") return product.displayPrice;

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
    const colors = Array.from(
      new Set(options.map((option) => formatLabel(option.metalColor)))
    );
    const purities = Array.from(new Set(options.map((option) => option.purity)));
    return `${colors.slice(0, 3).join(", ")} Gold${
      purities.length ? ` · ${purities.join("/")}` : ""
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
    .join(" · ");
};

const getAvailableSizeCount = (product: ApiProduct) =>
  product.sizeMatrix?.filter((size) => size.isAvailable).length || 0;

const buildApiFilters = (filters: ProductFilters): ProductFilters => ({
  ...filters,
  minPrice: filters.minPrice?.trim(),
  maxPrice: filters.maxPrice?.trim(),
  subCategory: filters.subCategory?.trim(),
  collection: filters.collection?.trim(),
  shape: filters.shape?.trim(),
});

const SelectFilter = ({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value?: string;
  options: FilterOption[];
  onChange: (value: string) => void;
}) => (
  <label className="flex flex-col gap-2">
    <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
      {label}
    </span>
    <select
      value={value || ""}
      onChange={(event) => onChange(event.target.value)}
      className="h-11 rounded-lg border border-outline-variant/50 bg-surface-container-lowest px-3 text-label-sm text-on-surface outline-none transition-colors focus:border-primary"
    >
      <option value="">All</option>
      {options.map((option) => (
        <option
          key={typeof option === "string" ? option : option.value}
          value={typeof option === "string" ? option : option.value}
        >
          {typeof option === "string" ? formatLabel(option) : option.label}
        </option>
      ))}
    </select>
  </label>
);

const TextFilter = ({
  label,
  value,
  placeholder,
  type = "text",
  onChange,
}: {
  label: string;
  value?: string;
  placeholder: string;
  type?: "text" | "number";
  onChange: (value: string) => void;
}) => (
  <label className="flex flex-col gap-2">
    <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
      {label}
    </span>
    <input
      type={type}
      min={type === "number" ? 0 : undefined}
      value={value || ""}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
      className="h-11 rounded-lg border border-outline-variant/50 bg-surface-container-lowest px-3 text-label-sm text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/50 focus:border-primary"
    />
  </label>
);

export default function Collections() {
  const dispatch = useAppDispatch();
  const cartOpen = useAppSelector((state) => state.cart.isOpen);
  const profileOpen = useAppSelector((state) => state.profile.isOpen);
  const cartItems = useAppSelector((state) => state.cart.items);
  const wishlistItems = useAppSelector((state) => state.wishlist.items);

  const [navScrolled, setNavScrolled] = useState(false);

  const isInWishlist = (id: string) => wishlistItems.includes(id);

  const [filters, setFilters] = useState<ProductFilters>(defaultFilters);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Navigation glassmorphism on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setNavScrolled(true);
      } else {
        setNavScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<FilterOption[]>([]);
  const [subCategoryOptions, setSubCategoryOptions] = useState<FilterOption[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const updateFilter = (key: keyof ProductFilters, value: string | number) => {
    setFilters((current) => ({
      ...current,
      [key]: value,
      page: key === "page" ? Number(value) : 1,
    }));
  };

  const resetFilters = () => {
    setFilters(defaultFilters);
  };

  useEffect(() => {
    let isMounted = true;

    const loadProducts = async () => {
      setIsLoading(true);
      const fetchedProducts = await fetchProductList(buildApiFilters(filters));
      if (isMounted) {
        setProducts(fetchedProducts.products);
        setCategoryOptions((current) =>
          mergeFilterOptions(
            current,
            fetchedProducts.products
              .map((product) => getTaxonomyFilterOption(product.category))
              .filter((option): option is LabeledFilterOption => Boolean(option))
          )
        );
        setSubCategoryOptions((current) =>
          mergeFilterOptions(
            current,
            fetchedProducts.products
              .map((product) => getTaxonomyFilterOption(product.subCategory))
              .filter((option): option is LabeledFilterOption => Boolean(option))
          )
        );
        setTotalProducts(fetchedProducts.total);
        setIsLoading(false);
      }
    };
    loadProducts();

    return () => {
      isMounted = false;
    };
  }, [filters]);

  const sortedProducts = products;
  const currentPage = filters.page || 1;
  const hasNextPage = currentPage * (filters.limit || 20) < totalProducts;

  return (
    <div className="collections-theme min-h-screen flex flex-col relative overflow-x-hidden selection:bg-secondary-container selection:text-on-secondary-container">
      {/* TopNavBar */}
      <Header
        scrolled={navScrolled}
        setCartOpen={(open) => dispatch(setCartOpen(open))}
        setProfileOpen={(open) => dispatch(setProfileOpen(open))}
        cartItemsCount={cartItems.reduce((acc, curr) => acc + curr.quantity, 0)}
      />

      {/* Main Layout Area */}
      <main className="flex-grow flex flex-col min-h-screen pt-32 pb-24 px-margin-mobile md:px-margin-desktop gap-margin-desktop relative">
        {/* Main Content Area */}
        <section className="flex-grow">
          <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div>
              <h1 className="font-display-lg text-headline-lg text-on-surface leading-tight">
                Curated Collections
              </h1>
              <p className="text-on-surface-variant font-body-md mt-2 max-w-xl">
                Masterpieces forged in sustainability. Every diamond tells a story
                of ethical luxury and precision craftsmanship.
              </p>
            </div>
          </header>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[300px_minmax(0,1fr)]">
          <aside className="lg:sticky lg:top-32 lg:self-start">
          <button
            type="button"
            onClick={() => setFiltersOpen((open) => !open)}
            className="mb-3 flex w-full items-center justify-between rounded-xl border border-outline-variant/40 bg-surface-bright px-4 py-3 text-left lg:hidden"
          >
            <span className="text-[11px] font-bold uppercase tracking-widest text-on-surface">
              Filter Collection
            </span>
            <span className="material-symbols-outlined text-primary">
              {filtersOpen ? "close" : "menu"}
            </span>
          </button>
          <section className={`${filtersOpen ? "block" : "hidden"} rounded-xl border border-outline-variant/30 bg-surface-bright p-3 md:p-4 lg:block`}>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-[11px] font-bold uppercase tracking-widest text-on-surface">
                Filter Collection
              </h2>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={resetFilters}
                  className="rounded-full border border-outline-variant/50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant transition-colors hover:border-primary hover:text-primary"
                >
                  Reset
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <SelectFilter
                label="Category"
                value={filters.category}
                options={categoryOptions}
                onChange={(value) => updateFilter("category", value)}
              />
              <SelectFilter
                label="Metal Type"
                value={filters.metalType}
                options={filterOptions.metalType}
                onChange={(value) => updateFilter("metalType", value)}
              />
              <SelectFilter
                label="Metal Color"
                value={filters.metalColor}
                options={filterOptions.metalColor}
                onChange={(value) => updateFilter("metalColor", value)}
              />
              <SelectFilter
                label="Purity"
                value={filters.purity}
                options={filterOptions.purity}
                onChange={(value) => updateFilter("purity", value)}
              />
              <SelectFilter
                label="Stone Type"
                value={filters.stoneType}
                options={filterOptions.stoneType}
                onChange={(value) => updateFilter("stoneType", value)}
              />
              <SelectFilter
                label="Sort"
                value={filters.sort}
                options={filterOptions.sort}
                onChange={(value) => updateFilter("sort", value)}
              />
            </div>

            <details className="mt-3 rounded-lg border border-outline-variant/30 bg-surface-container-lowest/60">
              <summary className="cursor-pointer px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                More Filters
              </summary>
              <div className="grid grid-cols-1 gap-3 border-t border-outline-variant/30 p-3">
                <SelectFilter
                  label="Sub Category"
                  value={filters.subCategory}
                  options={subCategoryOptions}
                  onChange={(value) => updateFilter("subCategory", value)}
                />
                <TextFilter
                  label="Collection"
                  value={filters.collection}
                  placeholder="solitaire"
                  onChange={(value) => updateFilter("collection", value)}
                />
                <SelectFilter
                  label="Gender"
                  value={filters.gender}
                  options={filterOptions.gender}
                  onChange={(value) => updateFilter("gender", value)}
                />
                <TextFilter
                  label="Shape"
                  value={filters.shape}
                  placeholder="emerald"
                  onChange={(value) => updateFilter("shape", value)}
                />
                <TextFilter
                  label="Min Price"
                  value={filters.minPrice}
                  placeholder="500"
                  type="number"
                  onChange={(value) => updateFilter("minPrice", value)}
                />
                <TextFilter
                  label="Max Price"
                  value={filters.maxPrice}
                  placeholder="2000"
                  type="number"
                  onChange={(value) => updateFilter("maxPrice", value)}
                />
              </div>
            </details>

            <div className="mt-3 flex flex-col gap-3 border-t border-outline-variant/30 pt-3">
              <label className="flex w-full flex-col gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                  Limit
                </span>
                <select
                  value={filters.limit || 20}
                  onChange={(event) => updateFilter("limit", Number(event.target.value))}
                  className="h-11 rounded-lg border border-outline-variant/50 bg-surface-container-lowest px-3 text-label-sm text-on-surface outline-none transition-colors focus:border-primary"
                >
                  {filterOptions.limit.map((limit) => (
                    <option key={limit} value={limit}>
                      {limit} products
                    </option>
                  ))}
                </select>
              </label>
              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  disabled={currentPage <= 1 || isLoading}
                  onClick={() => updateFilter("page", Math.max(currentPage - 1, 1))}
                  className="rounded-lg border border-outline-variant/50 px-4 py-2 text-label-sm font-bold text-on-surface transition-colors disabled:cursor-not-allowed disabled:opacity-40 hover:not-disabled:border-primary hover:not-disabled:text-primary"
                >
                  Previous
                </button>
                <span className="text-label-sm text-on-surface-variant">
                  Page {currentPage}
                </span>
                <button
                  type="button"
                  disabled={!hasNextPage || isLoading}
                  onClick={() => updateFilter("page", currentPage + 1)}
                  className="rounded-lg border border-outline-variant/50 px-4 py-2 text-label-sm font-bold text-on-surface transition-colors disabled:cursor-not-allowed disabled:opacity-40 hover:not-disabled:border-primary hover:not-disabled:text-primary"
                >
                  Next
                </button>
              </div>
            </div>
          </section>
          </aside>

          <div className="min-w-0">
          <div className="mb-4 flex items-center justify-between gap-3">
            <p className="text-label-sm text-on-surface-variant">
              Showing {sortedProducts.length} of {totalProducts} products
            </p>
            <p className="text-label-sm text-on-surface-variant">
              Page {currentPage}
            </p>
          </div>

          {isLoading ? (
            <div className="h-[400px] flex flex-col items-center justify-center text-center space-y-4">
              <span className="material-symbols-outlined text-outline-variant text-6xl animate-pulse">
                diamond
              </span>
              <p className="font-headline-sm text-headline-sm text-on-surface">
                Loading Masterpieces
              </p>
            </div>
          ) : sortedProducts.length === 0 ? (
            <div className="h-[400px] flex flex-col items-center justify-center text-center space-y-4">
              <span className="material-symbols-outlined text-outline-variant text-6xl">
                diamond
              </span>
              <p className="font-headline-sm text-headline-sm text-on-surface">
                No Masterpieces Found
              </p>
            </div>
          ) : (
            <div
              className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-gutter"
              id="product-grid"
            >
              {sortedProducts.map((product, index) => {
                const productName = getProductName(product);
                const productImage = getProductImage(product);
                const price = getProductPrice(product);
                const spec = getProductSpec(product);
                const metalSummary = getMetalSummary(product);
                const availableSizeCount = getAvailableSizeCount(product);

                return (
                  <div
                    key={product._id}
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
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            dispatch(toggleWishlist(product._id));
                          }}
                          className="absolute top-4 right-4 text-primary opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-[-10px] group-hover:translate-y-0 cursor-pointer z-10"
                        >
                          <span className={`material-symbols-outlined ${isInWishlist(product._id) ? "fill-[1]" : ""}`}>
                            favorite
                          </span>
                        </button>
                      </div>
                      <div className="p-4 md:p-6 relative flex-grow flex flex-col justify-between">
                        <div>
                        <h4 className="font-headline-md text-label-md md:text-headline-md text-on-surface mb-1 group-hover:text-primary transition-colors duration-300 line-clamp-2 md:line-clamp-none">
                          {productName}
                        </h4>
                        <p className="text-on-surface-variant text-[11px] md:font-body-md mb-2 md:mb-4 opacity-80">
                          {formatLabel(product.stoneType)}
                          {metalSummary ? ` · ${metalSummary}` : ""}
                        </p>
                        </div>
                        <p className="text-primary font-bold text-label-md md:text-body-lg">
                          ${price.toLocaleString()}
                        </p>

                        {/* Hover Details overlay */}
                        <div className="absolute inset-x-0 bottom-0 p-4 md:p-6 bg-primary text-on-primary translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out flex justify-between items-center">
                          <div className="hidden md:block">
                            <p className="text-[10px] uppercase tracking-tighter opacity-80 font-bold">
                              Specification
                            </p>
                          <p className="font-bold text-sm">
                              {spec || "Made-to-order jewelry"}
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
              })}
            </div>
          )}
          </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full py-20 bg-background border-t border-outline-variant/30 flex flex-col items-center justify-center gap-8 px-margin-desktop text-center">
        <div className="font-display-lg text-display-lg text-primary tracking-tighter">
          Eco Caret
        </div>
        <div className="flex flex-wrap justify-center gap-12 text-on-surface-variant font-body-md font-medium">
          <a className="hover:text-primary transition-colors" href="#">
            Privacy Policy
          </a>
          <a className="hover:text-primary transition-colors" href="#">
            Ethical Sourcing
          </a>
          <a className="hover:text-primary transition-colors" href="#">
            Care Guide
          </a>
          <a className="hover:text-primary transition-colors" href="#">
            Contact
          </a>
        </div>
        <div className="text-on-surface-variant/60 font-label-sm uppercase tracking-widest mt-4">
          © 2026 Eco Caret. Precision Cut. Ethical Soul.
        </div>
      </footer>
      {/* --- PREMIUM INTERACTIVE DRAWER: SHOPPING CART --- */}
      <CartDrawer
        isOpen={cartOpen}
        onClose={() => dispatch(setCartOpen(false))}
        cartItems={cartItems}
        onRemoveItem={(id) => dispatch(removeFromCart(id))}
        onCheckout={() => {
          alert("Checkout processed safely. Thank you for selecting ethical luxury!");
          dispatch(clearCart());
          dispatch(setCartOpen(false));
        }}
      />

      {/* --- PREMIUM INTERACTIVE DIALOG: USER PROFILE --- */}
      <ProfileDialog isOpen={profileOpen} onClose={() => dispatch(setProfileOpen(false))} />
    </div>
  );
}
