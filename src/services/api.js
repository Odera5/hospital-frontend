// src/services/api.js
import axios from "axios";

// Use Vite environment variable
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL + "/api", // dynamic backend URL
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Global error handling for unauthorized access
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;