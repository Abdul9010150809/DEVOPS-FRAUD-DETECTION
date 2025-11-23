import apiClient from "../services/apiClient";

const simulateController = {
  simulateFraud: async () => {
    // FIXED: Added "/api" to match the backend route
    const response = await apiClient.get("/api/simulate");
    return response.data;
  },
};

export default simulateController;