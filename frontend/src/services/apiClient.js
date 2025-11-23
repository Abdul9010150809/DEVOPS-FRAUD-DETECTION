// ================================
//  API CLIENT (FINAL VERSION)
// ================================

const API_URL =
  process.env.REACT_APP_API_URL?.trim().replace(/\/$/, "") || "";

// CLIENT
class ApiClient {
  constructor() {
    this.baseURL = API_URL;
  }

  async get(endpoint) {
    return this.request(endpoint, { method: "GET" });
  }

  async post(endpoint, body = {}) {
    return this.request(endpoint, {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  async request(endpoint, options = {}) {
    if (!this.baseURL) {
      console.error("❌ ERROR: REACT_APP_API_URL is not set!");
      throw new Error("Backend URL not configured");
    }

    const url = `${this.baseURL}${endpoint}`;

    const config = {
      method: options.method || "GET",
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      ...(options.body ? { body: options.body } : {}),
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errBody = await response.text().catch(() => "No details");
        throw new Error(
          `HTTP ${response.status} → ${url}\nDetails: ${errBody}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error(`🚨 API request failed (${endpoint}):`, error);
      throw error;
    }
  }

  // ----- FRAUD -----
  async getFraudStats() {
    return this.get("/api/fraud/stats");
  }

  async analyzeRepository(projectId) {
    return this.post("/api/fraud/analyze", { project_id: projectId });
  }

  async getRepositoryRisk(projectId) {
    return this.get(`/api/fraud/repositories/${projectId}/risk`);
  }

  async scanRepository(projectId, depth = 50) {
    return this.post(`/api/fraud/repositories/${projectId}/scan`, { depth });
  }

  async checkMLHealth() {
    return this.get("/api/fraud/health/ml");
  }

  // ----- ALERTS -----
  async getRecentAlerts(limit = 50) {
    return this.get(`/api/alerts/recent?limit=${limit}`);
  }

  async resolveAlert(alertId) {
    return this.post(`/api/alerts/${alertId}/resolve`);
  }

  async getAlertsSummary() {
    return this.get("/api/alerts/summary");
  }

  async testSlackNotification() {
    return this.post("/api/alerts/test/slack");
  }

  async testEmailNotification() {
    return this.post("/api/alerts/test/email");
  }

  async escalateAlert(alertId, priority = "high") {
    return this.post(`/api/alerts/escalate/${alertId}`, { priority });
  }

  // ----- WEBHOOK -----
  async testWebhook() {
    return this.get("/api/webhook/test");
  }

  // ----- SIMULATION -----
  async simulateFraud() {
    return this.get("/simulate");
  }
}

// DEFAULT EXPORT FOR ALL IMPORTS
const apiClient = new ApiClient();
export default apiClient;

// NAMED EXPORT FOR simulateController.js
export const simulateFraud = () => apiClient.simulateFraud();
