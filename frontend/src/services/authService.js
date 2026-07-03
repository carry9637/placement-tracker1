import apiClient from "./apiClient";

export const authService = {
  async login(payload) {
    const response = await apiClient.post("/auth/login", payload);
    return response.data.data;
  },

  async register(payload) {
    const response = await apiClient.post("/auth/register", payload);
    return response.data.data;
  },

  async me() {
    const response = await apiClient.get("/auth/me");
    return response.data.data.user;
  },

  async updateMe(payload) {
    const response = await apiClient.patch("/auth/me", payload);
    return response.data.data.user;
  },

  async uploadResume(file) {
    const formData = new FormData();
    formData.append("resume", file);

    const response = await apiClient.post("/auth/me/resume", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return response.data.data.user;
  },

  async logout() {
    await apiClient.post("/auth/logout");
  },
};
