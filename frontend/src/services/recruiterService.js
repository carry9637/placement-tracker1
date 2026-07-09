import apiClient from "./apiClient";

const unwrap = (response) => response.data;

export const recruiterService = {
  async getCompany(id) {
    const response = await apiClient.get("/companies/" + id);
    return unwrap(response);
  },

  async getJobs(params = {}) {
    const response = await apiClient.get("/jobs", { params });
    return unwrap(response);
  },

  async createJob(payload) {
    const response = await apiClient.post("/jobs", payload);
    return unwrap(response);
  },

  async updateJob(id, payload) {
    const response = await apiClient.patch("/jobs/" + id, payload);
    return unwrap(response);
  },

  async getApplications(params = {}) {
    const response = await apiClient.get("/applications", { params });
    return unwrap(response);
  },

  async getApplication(id) {
    const response = await apiClient.get("/applications/" + id);
    return unwrap(response);
  },

  async updateApplicationStatus(id, payload) {
    const response = await apiClient.patch("/applications/" + id + "/status", payload);
    return unwrap(response);
  },

  async getInterviews(params = {}) {
    const response = await apiClient.get("/interviews", { params });
    return unwrap(response);
  },

  async createInterview(payload) {
    const response = await apiClient.post("/interviews", payload);
    return unwrap(response);
  },

  async updateInterview(id, payload) {
    const response = await apiClient.patch("/interviews/" + id, payload);
    return unwrap(response);
  },

  async updateInterviewFeedback(id, payload) {
    const response = await apiClient.patch("/interviews/" + id + "/feedback", payload);
    return unwrap(response);
  },

  async getNotifications(params = {}) {
    const response = await apiClient.get("/notifications", { params });
    return unwrap(response);
  },
};
