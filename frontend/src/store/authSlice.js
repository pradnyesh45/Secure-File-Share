import { createSlice } from "@reduxjs/toolkit";

// Load initial state from localStorage
const loadState = () => {
  try {
    const serializedState = localStorage.getItem("auth");
    if (serializedState === null) {
      return {
        user: null,
        tokens: { access: null, refresh: null },
        error: null,
        isAuthenticated: false,
      };
    }
    return JSON.parse(serializedState);
  } catch {
    return {
      user: null,
      tokens: { access: null, refresh: null },
      error: null,
      isAuthenticated: false,
    };
  }
};

const authSlice = createSlice({
  name: "auth",
  initialState: loadState(),
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
      localStorage.setItem("auth", JSON.stringify(state));
    },
    setToken: (state, action) => {
      state.tokens = action.payload;
      state.isAuthenticated = !!action.payload.access;
      localStorage.setItem("auth", JSON.stringify(state));
    },
    setError: (state, action) => {
      state.error = action.payload;
      localStorage.setItem("auth", JSON.stringify(state));
    },
    logout: (state) => {
      state.user = null;
      state.tokens = { access: null, refresh: null };
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem("auth");
    },
  },
});

export const { setUser, setToken, setError, logout } = authSlice.actions;
export default authSlice.reducer;
