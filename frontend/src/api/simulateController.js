import apiClient, { simulateFraud as simulateFraudFn } from "../services/apiClient";

// OPTION 1 — Use the named export simulateFraud()
const simulateController = {
  simulateFraud: async () => {
    return await simulateFraudFn();
  },
};

export default simulateController;
