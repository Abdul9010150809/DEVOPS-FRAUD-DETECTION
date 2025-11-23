import apiClient from "../services/apiClient";

const simulateController = {
  simulateFraud: async () => {
    try {
      // 1. Call the correct Backend URL
      const response = await apiClient.get("/api/simulate");

      // 2. Return the FULL response object 
      // (This fixes the "reading 'data' of undefined" error in your Dashboard)
      return response; 
      
    } catch (error) {
      console.error("Simulation API Error:", error);
      throw error; // Let the Dashboard handle the error
    }
  },
};

export default simulateController;