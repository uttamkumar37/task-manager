import api from "./api";

export async function getTasks(status) {
  const params = status && status !== "ALL" ? { status } : undefined;
  const response = await api.get("/api/tasks", { params });
  return response.data;
}

export async function createTask(payload) {
  const response = await api.post("/api/tasks", payload);
  return response.data;
}

export async function updateTask(id, payload) {
  const response = await api.put(`/api/tasks/${id}`, payload);
  return response.data;
}

export async function deleteTask(id) {
  await api.delete(`/api/tasks/${id}`);
}

