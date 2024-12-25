import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const loadAuthToken = () => {
  try {
    const auth = JSON.parse(localStorage.getItem("auth"));
    return auth?.tokens?.access || null;
  } catch {
    return null;
  }
};

// Initialize axios with stored token
const api = axios.create({
  baseURL: API_URL,
  headers: {
    Authorization: `Bearer ${loadAuthToken()}`,
  },
});

export const authApi = {
  setAuthHeader: (token) => {
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common["Authorization"];
    }
  },

  register: async (data) => {
    try {
      const response = await api.post("/api/auth/register/", data);
      return response;
    } catch (error) {
      if (error.response) {
        throw error;
      } else if (error.request) {
        throw new Error("No response from server");
      } else {
        throw new Error("Error setting up request");
      }
    }
  },

  login: async (data) => {
    try {
      const response = await api.post("/api/auth/token/", data);
      // Set the auth header immediately after successful login
      authApi.setAuthHeader(response.data.access);
      return response;
    } catch (error) {
      console.error("Login error:", error.response?.data || error.message);
      throw error;
    }
  },

  logout: () => {
    authApi.setAuthHeader(null);
    // You might want to clear local storage or redux store here
  },

  refreshToken: async (refreshToken) => {
    const response = await api.post("/api/auth/token/refresh/", {
      refresh: refreshToken,
    });
    authApi.setAuthHeader(response.data.access);
    return response;
  },
};

// Add response interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const store = (await import("../store")).default;
        const refreshToken = store.getState().auth.tokens.refresh;
        await authApi.refreshToken(refreshToken);
        return api(originalRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
