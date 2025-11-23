import apiClient from "../services/apiClient";

const simulateController = {
  simulateFraud: async () => {
    return await apiClient.get("/simulate");
  },
};

export default simulateController;
