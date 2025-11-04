import axios from "axios";

function createApiClient(token) {
  const apiClient = axios.create({
    baseURL: "https://apichallenges.herokuapp.com",
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
}

let apiClient = createApiClient(null);

const challengerController = {
  setToken(token) {
    apiClient = createApiClient(token);
  },
  createChallenger: () => apiClient.post("/challenger"),
  getChallenges: (headers = {}) => apiClient.get("/challenges", { headers }),
};

export default challengerController;