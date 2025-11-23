const API_URL = process.env.REACT_APP_API_URL;

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
    const url = `${this.baseURL}${endpoint}`;

    const config = {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    };

    const response = await fetch(url, config);

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    return response.json();
  }

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

  async testWebhook() {
    return this.get("/api/webhook/test");
  }

  async simulateFraud() {
    return this.get("/simulate");
  }
}

const apiClient = new ApiClient();
export default apiClient;

export const simulateFraud = () => apiClient.simulateFraud();
