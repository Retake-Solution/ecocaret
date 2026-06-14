import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ProfileState {
  isOpen: boolean;
  user: { email: string; name?: string } | null;
}

const initialState: ProfileState = {
  isOpen: false,
  user: null,
};

export const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    setProfileOpen: (state, action: PayloadAction<boolean>) => {
      state.isOpen = action.payload;
    },
    loginUser: (state, action: PayloadAction<{ email: string; name?: string }>) => {
      state.user = action.payload;
      if (typeof window !== "undefined") {
        localStorage.setItem("eco_caret_user", JSON.stringify(action.payload));
      }
    },
    logoutUser: (state) => {
      state.user = null;
      if (typeof window !== "undefined") {
        localStorage.removeItem("eco_caret_user");
      }
    },
    loadProfileState: (state) => {
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem("eco_caret_user");
        if (saved) {
          try {
            state.user = JSON.parse(saved);
          } catch (e) {
            console.error("Failed to parse user profile", e);
          }
        }
      }
    },
  },
});

export const { setProfileOpen, loginUser, logoutUser, loadProfileState } = profileSlice.actions;

export default profileSlice.reducer;
