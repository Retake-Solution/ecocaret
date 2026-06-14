import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
}

const initialState: CartState = {
  items: [],
  isOpen: false,
};

export const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    setCartOpen: (state, action: PayloadAction<boolean>) => {
      state.isOpen = action.payload;
    },
    addToCart: (state, action: PayloadAction<Omit<CartItem, "quantity">>) => {
      const existingItem = state.items.find((item) => item.id === action.payload.id);
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        state.items.push({ ...action.payload, quantity: 1 });
      }
      // Persistence
      if (typeof window !== "undefined") {
        localStorage.setItem("eco_caret_cart_v2", JSON.stringify(state.items));
      }
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
      // Persistence
      if (typeof window !== "undefined") {
        localStorage.setItem("eco_caret_cart_v2", JSON.stringify(state.items));
      }
    },
    clearCart: (state) => {
      state.items = [];
      // Persistence
      if (typeof window !== "undefined") {
        localStorage.removeItem("eco_caret_cart_v2");
      }
    },
    loadCartState: (state) => {
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem("eco_caret_cart_v2");
        if (saved) {
          try {
            state.items = JSON.parse(saved);
          } catch (e) {
            console.error("Failed to parse saved cart", e);
          }
        }
      }
    },
  },
});

export const { setCartOpen, addToCart, removeFromCart, clearCart, loadCartState } =
  cartSlice.actions;

export default cartSlice.reducer;
