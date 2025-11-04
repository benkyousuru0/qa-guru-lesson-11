import axios from "axios";
import config from "../playwright.config.js";

function createApiClient(token) {
  const apiClient = axios.create({
    baseURL: config.use.baseURL,
    timeout: 5000,
    headers: { "Content-Type": "application/json" },
  });

  apiClient.interceptors.request.use(config => {
    if (token) {
      config.headers["x-challenger"] = token;
    }
    return config;
  });

  return apiClient;
};

export default createApiClient;