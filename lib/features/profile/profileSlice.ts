import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface ProfileUser {
  id?: string;
  email: string;
  name?: string;
  role?: string;
  permissions?: string[];
  isActive?: boolean;
}

interface ProfileState {
  isOpen: boolean;
  user: ProfileUser | null;
  token: string | null;
}

const initialState: ProfileState = {
  isOpen: false,
  user: null,
  token: null,
};

export const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    setProfileOpen: (state, action: PayloadAction<boolean>) => {
      state.isOpen = action.payload;
    },
    loginUser: (state, action: PayloadAction<ProfileUser & { token?: string }>) => {
      const { token, ...user } = action.payload;
      state.user = user;
      state.token = token || null;
      if (typeof window !== "undefined") {
        localStorage.setItem("eco_caret_user", JSON.stringify(user));
        if (token) {
          localStorage.setItem("eco_caret_token", token);
        } else {
          localStorage.removeItem("eco_caret_token");
        }
      }
    },
    logoutUser: (state) => {
      state.user = null;
      state.token = null;
      if (typeof window !== "undefined") {
        localStorage.removeItem("eco_caret_user");
        localStorage.removeItem("eco_caret_token");
      }
    },
    loadProfileState: (state) => {
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem("eco_caret_user");
        const savedToken = localStorage.getItem("eco_caret_token");
        if (saved) {
          try {
            state.user = JSON.parse(saved);
            state.token = savedToken;
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
