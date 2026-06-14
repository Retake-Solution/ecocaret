"use client";

import React, { useRef, useEffect } from "react";
import { Provider } from "react-redux";
import { makeStore, AppStore } from "@/lib/store";
import { loadCartState } from "@/lib/features/cart/cartSlice";
import { loadWishlistState } from "@/lib/features/wishlist/wishlistSlice";
import { loadProfileState } from "@/lib/features/profile/profileSlice";

export default function StoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const storeRef = useRef<AppStore | null>(null);

  if (!storeRef.current) {
    // Create the store instance the first time this renders
    storeRef.current = makeStore();
  }

  useEffect(() => {
    if (storeRef.current) {
      storeRef.current.dispatch(loadCartState());
      storeRef.current.dispatch(loadWishlistState());
      storeRef.current.dispatch(loadProfileState());
    }
  }, []);

  return <Provider store={storeRef.current}>{children}</Provider>;
}
