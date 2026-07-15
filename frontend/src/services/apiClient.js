import axios from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);

export const getApiErrorMessage = (error) =>
  error.response?.data?.message || error.message || "Something went wrong";

export const buildApiUrl = (path, params = {}) => {
  const baseURL = apiClient.defaults.baseURL || "";
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(`${baseURL.replace(/\/$/, "")}${normalizedPath}`);

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, value);
    }
  });

  return url.toString();
};

export default apiClient;
