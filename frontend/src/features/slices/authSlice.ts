import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface AuthState {
  user: {
    username: string;
    email: string;
    role: string;
  } | null;
  token: string | null;
  isLoading: boolean;
  error: any;
  isTokenExpired: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: false,
  error: null,
  isTokenExpired: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setTokenExpired: (state, action) => {
      state.isTokenExpired = action.payload;
    },
    loginSuccess: (
      state,
      action: PayloadAction<{ user: AuthState["user"]; token: string }>
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isTokenExpired = false;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isTokenExpired = false;
    },
  },
});

export const { setTokenExpired, loginSuccess, logout } = authSlice.actions;

export default authSlice.reducer;
