const API_URL = process.env.REACT_APP_API_URL;

class ApiClient {
  constructor() {
    this.baseURL = API_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Fraud analysis endpoints
  async getFraudStats() {
    return this.request('/api/fraud/stats');
  }

  async analyzeRepository(projectId) {
    return this.request('/api/fraud/analyze', {
      method: 'POST',
      body: JSON.stringify({ project_id: projectId }),
    });
  }

  async getRepositoryRisk(projectId) {
    return this.request(`/api/fraud/repositories/${projectId}/risk`);
  }

  async scanRepository(projectId, depth = 50) {
    return this.request(`/api/fraud/repositories/${projectId}/scan`, {
      method: 'POST',
      body: JSON.stringify({ depth }),
    });
  }

  async checkMLHealth() {
    return this.request('/api/fraud/health/ml');
  }

  // Alerts endpoints
  async getRecentAlerts(limit = 50) {
    return this.request(`/api/alerts/recent?limit=${limit}`);
  }

  async resolveAlert(alertId) {
    return this.request(`/api/alerts/${alertId}/resolve`, {
      method: 'PUT',
    });
  }

  async getAlertsSummary() {
    return this.request('/api/alerts/summary');
  }

  async testSlackNotification() {
    return this.request('/api/alerts/test/slack', {
      method: 'POST',
    });
  }

  async testEmailNotification() {
    return this.request('/api/alerts/test/email', {
      method: 'POST',
    });
  }

  async escalateAlert(alertId, priority = 'high') {
    return this.request(`/api/alerts/escalate/${alertId}`, {
      method: 'POST',
      body: JSON.stringify({ priority }),
    });
  }

  // Webhook endpoints
  async testWebhook() {
    return this.request('/api/webhook/test');
  }
}

// Export a singleton instance
const apiClient = new ApiClient();
export const simulateFraud = () => apiClient.get("/simulate");
export default apiClient;