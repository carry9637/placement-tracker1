import apiClient from "./apiClient";

const unwrap = (response) => response.data;

export const studentService = {
  async getJobs(params = {}) {
    const response = await apiClient.get("/jobs", { params });
    return unwrap(response);
  },

  async getJob(id) {
    const response = await apiClient.get(`/jobs/${id}`);
    return unwrap(response);
  },

  async getApplications(params = {}) {
    const response = await apiClient.get("/applications", { params });
    return unwrap(response);
  },

  async applyJob(payload) {
    const response = await apiClient.post("/applications", payload);
    return unwrap(response);
  },

  async updateApplication(id, payload) {
    const response = await apiClient.patch(`/applications/${id}`, payload);
    return unwrap(response);
  },

  async updateApplicationStatus(id, payload) {
    const response = await apiClient.patch(`/applications/${id}/status`, payload);
    return unwrap(response);
  },

  async withdrawApplication(id, note = "Application withdrawn") {
    const response = await apiClient.patch(`/applications/${id}/withdraw`, { note });
    return unwrap(response);
  },

  async getInterviews(params = {}) {
    const response = await apiClient.get("/interviews", { params });
    return unwrap(response);
  },

  async getSkills(params = {}) {
    const response = await apiClient.get("/skills", { params });
    return unwrap(response);
  },

  async getNotifications(params = {}) {
    const response = await apiClient.get("/notifications", { params });
    return unwrap(response);
  },
};
