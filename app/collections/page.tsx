"use client";

import React, { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
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

const getProductName = (product: ApiProduct) =>
  product.name || product.title || "Untitled Masterpiece";

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
    const colors = Array.from(
      new Set(options.map((option) => formatLabel(option.metalColor)))
    );
    const purities = Array.from(new Set(options.map((option) => option.purity)));
    return `${colors.slice(0, 3).join(", ")} Gold${purities.length ? ` · ${purities.join("/")}` : ""
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
  const dispatch = useAppDispatch();
  const router = useRouter();
  const cartOpen = useAppSelector((state) => state.cart.isOpen);
  const profileOpen = useAppSelector((state) => state.profile.isOpen);
  const cartItems = useAppSelector((state) => state.cart.items);
  const wishlistItems = useAppSelector((state) => state.wishlist.items);

  const [navScrolled, setNavScrolled] = useState(false);

  const isInWishlist = (id: string) => wishlistItems.includes(id);

  const [filters, setFilters] = useState<ProductFilters>(() => ({
    ...defaultFilters,
    category: initialCategory,
    subCategory: initialSubCategory,
  }));
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
  }, [filters]);

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
                  {products.map((product, index) => {
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

                {/* Pagination Controls */}
                <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-outline-variant/20 pt-8">
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      disabled={currentPage <= 1 || isLoading}
                      onClick={() => updateFilter("page", Math.max(currentPage - 1, 1))}
                      className="rounded-xl border border-outline-variant/40 px-6 py-2.5 text-label-sm font-bold text-on-surface hover:bg-surface-container-low hover:border-primary/50 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <span className="text-label-sm text-on-surface-variant font-medium">
                      Page {currentPage}
                    </span>
                    <button
                      type="button"
                      disabled={!hasNextPage || isLoading}
                      onClick={() => updateFilter("page", currentPage + 1)}
                      className="rounded-xl border border-outline-variant/40 px-6 py-2.5 text-label-sm font-bold text-on-surface hover:bg-surface-container-low hover:border-primary/50 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                  <label className="flex items-center gap-3">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                      Show
                    </span>
                    <select
                      value={filters.limit || 20}
                      onChange={(event) => updateFilter("limit", Number(event.target.value))}
                      className="h-10 rounded-lg border border-outline-variant/40 bg-surface-container-lowest px-3 text-label-sm text-on-surface outline-none transition-colors focus:border-primary cursor-pointer"
                    >
                      {filterOptions.limit.map((limit) => (
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

      <Footer />
      {/* --- PREMIUM INTERACTIVE DRAWER: SHOPPING CART --- */}
      <CartDrawer
        isOpen={cartOpen}
        onClose={() => dispatch(setCartOpen(false))}
        cartItems={cartItems}
        onRemoveItem={(id) => dispatch(removeFromCart(id))}
        onCheckout={() => {
          dispatch(setCartOpen(false));
          router.push("/checkout");
        }}
      />

      {/* --- PREMIUM INTERACTIVE DIALOG: USER PROFILE --- */}
      <ProfileDialog isOpen={profileOpen} onClose={() => dispatch(setProfileOpen(false))} />
    </div>
  );
}
