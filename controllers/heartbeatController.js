import createApiClient from "../helpers/apiClient.js";

let apiClient = createApiClient(null);

const heartbeatController = {
  setToken: (token) => {
    apiClient = createApiClient(token);
  },
  deleteHeartbeat: () => apiClient.delete("/heartbeat"),
  patchHeartbeat: () => apiClient.patch("/heartbeat")
};

export default heartbeatController;
