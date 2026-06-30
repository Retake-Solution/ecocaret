"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import ProductAccordion from "@/components/ProductAccordion";
import ProductVisuals from "@/components/ProductVisuals";

import CartDrawer from "@/components/CartDrawer";
import ProfileDialog from "@/components/ProfileDialog";
import { ApiCategory, ApiProduct } from "@/types";
import { useAppDispatch, useAppSelector } from "@/lib/store";
import { setCartOpen, addToCart, removeFromCart, clearCart } from "@/lib/features/cart/cartSlice";
import { setProfileOpen } from "@/lib/features/profile/profileSlice";

interface ProductDetailsClientProps {
  product: ApiProduct;
  suggestedProducts: ApiProduct[];
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
  product.name || product.title || "Untitled Masterpiece";

const normalizeMetalColor = (color?: string) =>
  color?.toLowerCase().replace(/[\s_-]/g, "") || "";

const colorImageMatchesMetal = (
  imageGroup: NonNullable<ApiProduct["colorImages"]>[number],
  metalColor: string
) => {
  const imageColor = normalizeMetalColor(imageGroup.metalColor);
  const selectedColor = normalizeMetalColor(metalColor);

  return Boolean(
    imageColor &&
      selectedColor &&
      (imageColor === selectedColor ||
        imageColor.includes(selectedColor) ||
        selectedColor.includes(imageColor))
  );
};

const getColorImageUrls = (product: ApiProduct, metalColor?: string) => {
  const colorImageGroups = product.colorImages || [];
  const matchingGroups = metalColor
    ? colorImageGroups.filter((imageGroup) => colorImageMatchesMetal(imageGroup, metalColor))
    : colorImageGroups;

  return matchingGroups.flatMap((imageGroup) =>
    [...imageGroup.images]
      .sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary))
      .map((image) => image.url)
      .filter(Boolean)
  );
};

const getAvailableSizes = (product: ApiProduct) =>
  product.sizeMatrix?.filter((size) => size.isAvailable) || [];

const getAvailableMetalOptions = (product: ApiProduct) =>
  product.metalOptions?.filter((option) => option.isActive) || [];

const getWeightForSelection = (
  size: NonNullable<ApiProduct["sizeMatrix"]>[number] | undefined,
  purity: string
) => size?.weightByPurity?.find((item) => item.purity === purity);

const getProductPrice = (
  product: ApiProduct,
  selectedSize?: NonNullable<ApiProduct["sizeMatrix"]>[number],
  purity?: string,
  metalColor?: string
) => {
  const activeMetalOptions = getAvailableMetalOptions(product);
  const metalOption =
    activeMetalOptions.find(
      (option) => option.purity === purity && option.metalColor === metalColor
    ) ||
    activeMetalOptions.find((option) => option.purity === purity) ||
    activeMetalOptions[0];
  const size = selectedSize || getAvailableSizes(product)[0];
  const metalWeight = getWeightForSelection(size, metalOption?.purity || "")?.metalWeightGrams || 0;
  const metalTotal = (metalOption?.pricePerGram || 0) * metalWeight;
  const stoneTotal =
    product.productStones?.reduce(
      (sum, item) =>
        sum + (item.stone?.priceUSD || 0) * (item.caratWeight || 0),
      0
    ) || 0;
  const subtotal = stoneTotal + metalTotal + (product.makingChargeUSD || 0) * metalWeight;
  const discount = product.discountPercent ? subtotal * (product.discountPercent / 100) : 0;

  return Math.max(subtotal - discount, 0);
};

const getInitialPurity = (product: ApiProduct) =>
  getAvailableMetalOptions(product)[0]?.purity || "";

const getInitialMetalColor = (product: ApiProduct, purity: string) =>
  getAvailableMetalOptions(product).find((option) => option.purity === purity)?.metalColor ||
  "";

const getInventoryForSelection = (
  size: NonNullable<ApiProduct["sizeMatrix"]>[number],
  purity: string,
  metalColor: string
) =>
  size.inventory?.find(
    (item) => item.purity === purity && item.metalColor === metalColor && item.stock > 0
  );

const getMetalHex = (color: string) => {
  const normalized = color.toLowerCase();
  if (normalized.includes("white")) return "#E3E4E5";
  if (normalized.includes("yellow")) return "#E5A03A";
  if (normalized.includes("rose")) return "#E0A295";
  return "#D8C3B4";
};

const getPrimaryStone = (product: ApiProduct) => product.productStones?.[0]?.stone;

export default function ProductDetailsClient({
  product,
  suggestedProducts,
}: ProductDetailsClientProps) {
  const dispatch = useAppDispatch();
  const cartOpen = useAppSelector((state) => state.cart.isOpen);
  const profileOpen = useAppSelector((state) => state.profile.isOpen);
  const cartItems = useAppSelector((state) => state.cart.items);

  const productName = getProductName(product);
  const initialPurity = getInitialPurity(product);
  const initialMetalColor = getInitialMetalColor(product, initialPurity);
  const primaryStone = getPrimaryStone(product);
  const initialImageUrls = getColorImageUrls(product, initialMetalColor);

  const [scrolled, setScrolled] = useState(false);
  const [selectedImage, setSelectedImage] = useState(initialImageUrls[0] || "");
  const [selectedPurity, setSelectedPurity] = useState(initialPurity);
  const [selectedMetalColor, setSelectedMetalColor] = useState(initialMetalColor);
  const initialAvailableSizes = getAvailableSizes(product);
  const singleSizeValue =
    initialAvailableSizes.length === 1 ? initialAvailableSizes[0].size : "Select your size";
  const [selectedSize, setSelectedSize] = useState(singleSizeValue);


  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const availableOptions = getAvailableMetalOptions(product);
  const uniquePurities = Array.from(new Set(availableOptions.map((option) => option.purity)));
  const metalsForPurity = availableOptions.filter((option) => option.purity === selectedPurity);
  const imageUrls = getColorImageUrls(product, selectedMetalColor);
  const availableSizes = getAvailableSizes(product);
  const shouldShowSizeSelector = availableSizes.length > 1;
  const fallbackSizeValue =
    availableSizes.length === 1 ? availableSizes[0].size : "Select your size";
  const selectedSizeObj = availableSizes.find((size) => size.size === selectedSize);
  const selectedInventory = selectedSizeObj
    ? getInventoryForSelection(selectedSizeObj, selectedPurity, selectedMetalColor)
    : undefined;
  const currentPrice = getProductPrice(
    product,
    selectedSizeObj,
    selectedPurity,
    selectedMetalColor
  );

  const handleAddToBag = () => {
    if (selectedSize === "Select your size") {
      alert("Please select your ring size before adding to the collection bag.");
      return;
    }

    if (!selectedInventory && product.sizeMatrix?.length) {
      alert("This size, purity, and metal color combination is currently out of stock.");
      return;
    }

    const selectedMetalLabel = `${selectedPurity} ${formatLabel(selectedMetalColor)} Gold`;

    dispatch(
      addToCart({
        id: `${product._id}-${selectedPurity}-${selectedMetalColor}-${selectedSize}`,
        name: `${productName} (${selectedMetalLabel} / Size ${selectedSize})`,
        price: currentPrice,
        image: selectedImage,
      })
    );
    dispatch(setCartOpen(true));
  };



  return (
    <div className="bg-surface text-on-surface font-body-md selection:bg-secondary-fixed selection:text-on-secondary-fixed min-h-screen flex flex-col relative overflow-x-hidden">
      <Header
        scrolled={scrolled}
        setCartOpen={(open) => dispatch(setCartOpen(open))}
        setProfileOpen={(open) => dispatch(setProfileOpen(open))}
        cartItemsCount={cartItems.reduce((acc, curr) => acc + curr.quantity, 0)}
      />

      <main className="flex-grow pt-32 pb-24 max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          <ProductVisuals
            product={product}
            productName={productName}
            imageUrls={imageUrls}
            selectedImage={selectedImage}
            setSelectedImage={setSelectedImage}
            selectedPurity={selectedPurity}
            selectedMetalColor={selectedMetalColor}
          />

          <div className="lg:col-span-5 flex flex-col justify-start">
            <div className="sticky top-32">
              <nav className="flex items-center space-x-2 mb-6 text-on-surface-variant/60 font-label-sm text-label-sm">
                <Link className="hover:text-primary transition-colors" href="/collections">
                  Collections
                </Link>
                <span>/</span>
                <span className="text-on-surface-variant font-medium">
                  {getTaxonomyLabel(product.category)}
                </span>
              </nav>

              <div className="flex flex-wrap gap-2 mb-4">
                {product.isReadyToShip && (
                  <span className="bg-primary-fixed text-on-primary-fixed-variant rounded-full px-3 py-1 text-xs font-bold uppercase tracking-widest">
                    Ready to ship
                  </span>
                )}
                {product.isMadeToOrder && (
                  <span className="bg-secondary-fixed text-on-secondary-fixed-variant rounded-full px-3 py-1 text-xs font-bold uppercase tracking-widest">
                    Made to order
                  </span>
                )}
              </div>

              <h1 className="font-headline-md text-headline-sm md:text-headline-lg mb-2 text-on-surface leading-tight">
                {productName}
              </h1>
              <p className="font-body-md text-body-md text-on-surface-variant mb-4">
                {product.shortDescription || formatLabel(product.stoneType)}
              </p>
              <p className="font-body-lg text-body-lg text-secondary mb-8 font-medium">
                ${currentPrice}
              </p>

              {uniquePurities.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-label-md text-label-md uppercase tracking-widest mb-4">
                    Select Purity
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {uniquePurities.map((purity) => (
                      <button
                        key={purity}
                        className={`px-6 py-2 rounded-lg border-2 transition-all duration-200 cursor-pointer font-label-sm font-bold ${selectedPurity === purity
                          ? "border-primary bg-primary text-on-primary"
                          : "border-outline-variant text-on-surface hover:border-primary"
                          }`}
                        onClick={() => {
                          const nextMetalColor =
                            availableOptions.find(
                              (option) =>
                                option.purity === purity &&
                                option.metalColor === selectedMetalColor
                            )?.metalColor ||
                            availableOptions.find((option) => option.purity === purity)?.metalColor ||
                            "";
                          setSelectedPurity(purity);
                          setSelectedMetalColor(nextMetalColor);
                          setSelectedSize(fallbackSizeValue);
                          setSelectedImage(getColorImageUrls(product, nextMetalColor)[0] || "");
                        }}
                      >
                        {purity}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {metalsForPurity.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-label-md text-label-md uppercase tracking-widest mb-4">
                    Select Color
                  </h3>
                  <div className="flex space-x-4">
                    {metalsForPurity.map((metalObj) => (
                      <button
                        key={`${metalObj.purity}-${metalObj.metalColor}`}
                        className={`w-10 h-10 rounded-full border-2 p-0.5 transition-all duration-200 hover:scale-110 cursor-pointer ${selectedMetalColor === metalObj.metalColor
                          ? "border-primary ring-2 ring-primary ring-offset-2 ring-offset-background scale-105"
                          : "border-transparent hover:border-outline-variant"
                          }`}
                        title={`${metalObj.purity} ${formatLabel(metalObj.metalColor)} ${formatLabel(metalObj.metalType)}`}
                        onClick={() => {
                          setSelectedMetalColor(metalObj.metalColor);
                          setSelectedSize(fallbackSizeValue);
                          setSelectedImage(getColorImageUrls(product, metalObj.metalColor)[0] || "");
                        }}
                      >
                        <div
                          className="w-full h-full rounded-full"
                          style={{ backgroundColor: getMetalHex(metalObj.metalColor) }}
                        ></div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {shouldShowSizeSelector && (
                <div className="mb-6">
                  <h3 className="font-label-md text-label-md uppercase tracking-widest mb-4">
                    {getTaxonomyLabel(product.category) ? `${getTaxonomyLabel(product.category).replace(/s$/i, '')} Size` : "Size"}
                  </h3>
                  <select
                    value={selectedSize}
                    onChange={(event) => setSelectedSize(event.target.value)}
                    className="w-full rounded-lg border-2 border-outline-variant bg-surface-bright px-5 py-4 font-label-md text-label-md text-on-surface outline-none transition-colors focus:border-primary"
                  >
                    <option value="Select your size">Select your size</option>
                    {availableSizes.map((sizeObj) => {
                      const inventory = getInventoryForSelection(
                        sizeObj,
                        selectedPurity,
                        selectedMetalColor
                      );
                      const hasStock = Boolean(inventory) || !product.sizeMatrix?.length;
                      const weight = getWeightForSelection(sizeObj, selectedPurity);
                      const weightLabel = weight?.metalWeightGrams
                        ? ` - ${weight.metalWeightGrams}g`
                        : "";

                      return (
                        <option
                          key={sizeObj.size}
                          value={sizeObj.size}
                          disabled={!hasStock}
                        >
                          {sizeObj.sizeLabel || sizeObj.size}
                          {weightLabel}
                          {!hasStock ? " - Out of stock" : ""}
                        </option>
                      );
                    })}
                  </select>
                  {selectedSize !== "Select your size" && (
                    <p className="mt-3 text-label-sm font-label-sm text-on-surface-variant">
                      {selectedInventory?.stock || 0} in stock for this configuration.
                    </p>
                  )}
                </div>
              )}

              <div className="mb-8">
                <h3 className="font-label-md text-label-md uppercase tracking-widest mb-4">
                  Specification
                </h3>
                <div className="flex flex-wrap gap-2">
                  {[
                    {
                      label: "Carat",
                      value: `${(product.totalStoneCaratWeight || primaryStone?.caratWeight || 0).toFixed(2)}ct`,
                    },
                    {
                      label: "Shape",
                      value: formatLabel(product.shape || primaryStone?.shape || primaryStone?.cut || "N/A"),
                    },
                    {
                      label: "Color / Clarity",
                      value:
                        [primaryStone?.color, primaryStone?.clarity].filter(Boolean).join(" / ") ||
                        "N/A",
                    },
                    {
                      label: "Origin",
                      value: formatLabel(product.stoneType || primaryStone?.stoneType || "Ethical Origin"),
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="rounded-full border border-outline-variant/50 bg-surface-container-low px-4 py-2"
                    >
                      <span className="mr-2 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                        {item.label}
                      </span>
                      <span className="font-label-sm text-label-sm text-on-surface">
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={handleAddToBag}
                className="w-full bg-secondary text-white py-5 px-8 rounded-lg font-label-md text-label-md hover:bg-on-secondary-fixed-variant transition-all duration-300 shadow-lg shadow-secondary/10 cursor-pointer text-center"
              >
                Add to Bag
              </button>

              <div className="lg:hidden mt-8">
                <ProductAccordion
                  product={product}
                  selectedPurity={selectedPurity}
                  selectedMetalColor={selectedMetalColor}
                />
              </div>
            </div>
          </div>
        </div>

        <section className="mt-32 mb-20 bg-surface-container-high rounded-[2rem] overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <div className="p-12 md:p-20 flex flex-col justify-center">
              <div className="mb-6 flex items-center space-x-2 text-primary">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                  eco
                </span>
                <span className="font-label-md text-label-md uppercase tracking-widest font-semibold">
                  Sustainability First
                </span>
              </div>
              <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg mb-8 text-on-surface">
                The Eco Caret Standard
              </h2>
              <div className="space-y-8">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-primary">
                      local_shipping
                    </span>
                  </div>
                  <div>
                    <h4 className="font-label-md text-label-md text-on-surface font-bold">
                      Complimentary Shipping
                    </h4>
                    <p className="font-body-md text-body-md text-on-surface-variant">
                      Insured delivery in sustainable packaging within {product.estimatedDeliveryDays || 10} days.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-primary">
                      replay
                    </span>
                  </div>
                  <div>
                    <h4 className="font-label-md text-label-md text-on-surface font-bold">
                      30-Day Returns
                    </h4>
                    <p className="font-body-md text-body-md text-on-surface-variant">
                      Stress-free returns or exchanges with our global care team.
                    </p>
                  </div>
                </div>
                {product.allowEngraving && (
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-primary">
                        edit_square
                      </span>
                    </div>
                    <div>
                      <h4 className="font-label-md text-label-md text-on-surface font-bold">
                        Bespoke Engraving
                      </h4>
                      <p className="font-body-md text-body-md text-on-surface-variant">
                        Personalize this piece with up to {product.engravingMaxChars || 20} characters.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="relative min-h-[400px]">
              <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-surface-container-lowest via-surface-container-low to-secondary-container/30 text-primary">
                <span className="material-symbols-outlined text-7xl mb-4">
                  diamond
                </span>
                <span className="font-label-md text-label-md uppercase tracking-widest">
                  Crafted for Conscious Luxury
                </span>
              </div>
            </div>
          </div>
        </section>

        {suggestedProducts && suggestedProducts.length > 0 && (
          <section className="mt-32 pt-20 border-t border-outline-variant/30">
            <div className="text-center mb-16">
              <h2 className="font-headline-md text-headline-md mb-4 text-on-surface">
                You May Also Like
              </h2>
              <div className="w-16 h-0.5 bg-primary mx-auto"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {suggestedProducts.map((p) => {
                const suggestionName = getProductName(p);
                const suggestionImage = getColorImageUrls(
                  p,
                  getInitialMetalColor(p, getInitialPurity(p))
                )[0];
                const price = getProductPrice(p);

                return (
                  <Link
                    href={`/collections/${p._id}`}
                    key={p._id}
                    className="group block space-y-4 cursor-pointer"
                  >
                    <div className="aspect-[4/5] bg-surface-container overflow-hidden rounded-2xl border border-outline-variant/10 shadow-sm transition-all hover:shadow-md">
                      {suggestionImage ? (
                        <img
                          src={suggestionImage}
                          alt={suggestionName}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-surface-container-lowest via-surface-container-low to-secondary-container/30 text-primary">
                          <span className="material-symbols-outlined text-5xl mb-3">
                            diamond
                          </span>
                          <span className="font-label-sm text-label-sm uppercase tracking-widest">
                            Image Coming Soon
                          </span>
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="font-headline-sm text-headline-sm text-on-surface group-hover:text-primary transition-colors duration-300 font-medium">
                        {suggestionName}
                      </h4>
                      <p className="font-label-sm text-on-surface-variant uppercase tracking-wider mt-1">
                        {formatLabel(p.stoneType)} - {getTaxonomyLabel(p.subCategory) || getTaxonomyLabel(p.category)}
                      </p>
                      <p className="font-label-md text-secondary font-bold mt-2">
                        ${price.toLocaleString()}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </main>



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

      <ProfileDialog isOpen={profileOpen} onClose={() => dispatch(setProfileOpen(false))} />
    </div>
  );
}
