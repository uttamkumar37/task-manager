import api from "./api";

export async function getVisitorCount() {
  const response = await api.get("/api/public/visitors");
  return response.data;
}

export async function registerVisitor() {
  const response = await api.post("/api/public/visitors/register");
  return response.data;
}

export async function leaveMessage(payload) {
  const response = await api.post("/api/public/messages", payload);
  return response.data;
}

export async function getMessages() {
  const response = await api.get("/api/messages");
  return response.data;
}

