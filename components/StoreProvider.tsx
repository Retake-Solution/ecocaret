"use client";

import React, { useState, useEffect } from "react";
import { Provider } from "react-redux";
import { makeStore } from "@/lib/store";
import { loadCartState } from "@/lib/features/cart/cartSlice";
import { loadProfileState } from "@/lib/features/profile/profileSlice";

export default function StoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [store] = useState(() => makeStore());

  useEffect(() => {
    store.dispatch(loadCartState());
    store.dispatch(loadProfileState());
  }, [store]);

  return <Provider store={store}>{children}</Provider>;
}
