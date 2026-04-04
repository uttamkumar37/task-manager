import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  "https://task-manager-backend-51pf.onrender.com";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach JWT token from localStorage to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export function toApiError(error, fallbackMessage = "Something went wrong") {
  if (!error) {
    return { message: fallbackMessage, status: null };
  }

  const status = error.response?.status ?? null;
  const responseData = error.response?.data;

  if (typeof responseData === "string" && responseData.trim()) {
    return { message: responseData, status };
  }

  if (responseData?.message) {
    return { message: responseData.message, status };
  }

  if (error.message) {
    return { message: error.message, status };
  }

  return { message: fallbackMessage, status };
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401) {
      localStorage.removeItem("token");
      window.dispatchEvent(new CustomEvent("auth:unauthorized"));
    }

    return Promise.reject(error);
  }
);

export default api;

