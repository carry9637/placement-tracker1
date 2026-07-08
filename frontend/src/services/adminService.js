import apiClient from "./apiClient";

const unwrap = (response) => response.data;

export const adminService = {
  async getCompanies(params = {}) {
    const response = await apiClient.get("/companies", { params });
    return unwrap(response);
  },

  async createCompany(payload) {
    const response = await apiClient.post("/companies", payload);
    return unwrap(response);
  },

  async updateCompany(id, payload) {
    const response = await apiClient.patch("/companies/" + id, payload);
    return unwrap(response);
  },

  async deleteCompany(id) {
    const response = await apiClient.delete("/companies/" + id);
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

  async deleteJob(id) {
    const response = await apiClient.delete("/jobs/" + id);
    return unwrap(response);
  },

  async getSkills(params = {}) {
    const response = await apiClient.get("/skills", { params });
    return unwrap(response);
  },

  async createSkill(payload) {
    const response = await apiClient.post("/skills", payload);
    return unwrap(response);
  },

  async updateSkill(id, payload) {
    const response = await apiClient.patch("/skills/" + id, payload);
    return unwrap(response);
  },

  async deleteSkill(id) {
    const response = await apiClient.delete("/skills/" + id);
    return unwrap(response);
  },

  async getApplications(params = {}) {
    const response = await apiClient.get("/applications", { params });
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

  async updateInterviewFeedback(id, payload) {
    const response = await apiClient.patch("/interviews/" + id + "/feedback", payload);
    return unwrap(response);
  },

  async getUsers(params = {}) {
    const response = await apiClient.get("/users", { params });
    return unwrap(response);
  },

  async assignMentor(studentId, payload) {
    const response = await apiClient.patch("/users/" + studentId + "/mentor", payload);
    return unwrap(response);
  },

  async approveRecruiter(recruiterId, payload) {
    const response = await apiClient.patch("/users/" + recruiterId + "/approve-recruiter", payload);
    return unwrap(response);
  },

  async getPlacementDrives(params = {}) {
    const response = await apiClient.get("/placement-drives", { params });
    return unwrap(response);
  },

  async createPlacementDrive(payload) {
    const response = await apiClient.post("/placement-drives", payload);
    return unwrap(response);
  },

  async updatePlacementDrive(id, payload) {
    const response = await apiClient.patch("/placement-drives/" + id, payload);
    return unwrap(response);
  },
};
