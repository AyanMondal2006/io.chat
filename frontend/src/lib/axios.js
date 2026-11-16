import axios from "axios";

// If VITE_API_URL is provided (e.g. on Vercel pointing to Render: https://your-backend.onrender.com/api), use it.
// In local development, default to http://localhost:5001/api.
// In production without VITE_API_URL, fallback to relative /api.
const BASE_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.MODE === "development" ? "http://localhost:5001/api" : "/api");

export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // send cookies across origins
});

// Interceptor to attach Authorization Bearer token as a fallback
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("iochat_token");
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
