import api from "./api";

export async function register(credentials) {
  const response = await api.post("/api/auth/register", credentials);
  return response.data;
}

export async function login(credentials) {
  const response = await api.post("/api/auth/login", credentials);
  return response.data;
}

export async function logout() {
  const response = await api.post("/api/auth/logout");
  return response.data;
}

export async function getCurrentUser() {
  const response = await api.get("/api/auth/me");
  return response.data;
}

