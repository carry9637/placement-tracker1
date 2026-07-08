import apiClient from "./apiClient";

const unwrap = (response) => response.data;

export const mentorService = {
  async getApplications(params = {}) {
    const response = await apiClient.get("/applications", { params });
    return unwrap(response);
  },

  async getApplication(id) {
    const response = await apiClient.get(`/applications/${id}`);
    return unwrap(response);
  },

  async updateApplicationStatus(id, payload) {
    const response = await apiClient.patch(`/applications/${id}/status`, payload);
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
    const response = await apiClient.patch(`/interviews/${id}`, payload);
    return unwrap(response);
  },

  async updateInterviewFeedback(id, payload) {
    const response = await apiClient.patch(`/interviews/${id}/feedback`, payload);
    return unwrap(response);
  },

  async getNotes(params = {}) {
    const response = await apiClient.get("/mentor-notes", { params });
    return unwrap(response);
  },

  async createNote(payload) {
    const response = await apiClient.post("/mentor-notes", payload);
    return unwrap(response);
  },

  async updateNote(id, payload) {
    const response = await apiClient.patch(`/mentor-notes/${id}`, payload);
    return unwrap(response);
  },

  async deleteNote(id) {
    const response = await apiClient.delete(`/mentor-notes/${id}`);
    return unwrap(response);
  },

  async getSkills(params = {}) {
    const response = await apiClient.get("/skills", { params });
    return unwrap(response);
  },
};
