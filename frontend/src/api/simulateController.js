import apiClient from "../services/apiClient";

const simulateController = {
  simulateFraud: () => apiClient.get("/simulate"),   // ✅ CORRECT ENDPOINT
};

export default simulateController;
