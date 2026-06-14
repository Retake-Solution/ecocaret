import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface WishlistState {
  items: string[];
}

const initialState: WishlistState = {
  items: [],
};

export const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    toggleWishlist: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      if (state.items.includes(id)) {
        state.items = state.items.filter((item) => item !== id);
      } else {
        state.items.push(id);
      }
      if (typeof window !== "undefined") {
        localStorage.setItem("eco_caret_wishlist", JSON.stringify(state.items));
      }
    },
    loadWishlistState: (state) => {
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem("eco_caret_wishlist");
        if (saved) {
          try {
            state.items = JSON.parse(saved);
          } catch (e) {
            console.error("Failed to parse wishlist items", e);
          }
        }
      }
    },
  },
});

export const { toggleWishlist, loadWishlistState } = wishlistSlice.actions;

export default wishlistSlice.reducer;
