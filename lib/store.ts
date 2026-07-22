import { configureStore } from "@reduxjs/toolkit";
import { useDispatch, useSelector, useStore } from "react-redux";
import cartReducer from "./features/cart/cartSlice";
import currencyReducer from "./features/currency/currencySlice";
import profileReducer from "./features/profile/profileSlice";

export const makeStore = () => {
  return configureStore({
    reducer: {
      cart: cartReducer,
      currency: currencyReducer,
      profile: profileReducer,
    },
  });
};

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>;
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector = <TSelected>(selector: (state: RootState) => TSelected) =>
  useSelector<RootState, TSelected>(selector);
export const useAppStore = () => useStore<AppStore>();
