import api from "./api";

export async function register(credentials) {
  const response = await api.post("/api/auth/register", credentials);
  return response.data;
}

export async function login(credentials) {
  const response = await api.post("/api/auth/login", credentials);
  const data = response.data;
  if (data.token) {
    localStorage.setItem("token", data.token);
  }
  return data;
}

export async function logout() {
  try {
    await api.post("/api/auth/logout");
  } finally {
    localStorage.removeItem("token");
  }
}

export async function getCurrentUser() {
  const response = await api.get("/api/auth/me");
  return response.data;
}
