import apiClient from "../services/apiClient";

const simulateController = {
  simulateFraud: () => apiClient.get("/simulate"),
};

export default simulateController;
