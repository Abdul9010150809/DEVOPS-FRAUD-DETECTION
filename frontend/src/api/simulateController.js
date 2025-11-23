import apiClient from "../services/apiClient";

const simulateController = {
  simulateFraud: async () => {
    // FIXED: Added "/api" to match the backend route
    return await apiClient.get("/api/simulate");
  },
};

export default simulateController;