const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL;
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
    return this.request('/fraud/stats');
  }

  async analyzeRepository(projectId) {
    return this.request('/fraud/analyze', {
      method: 'POST',
      body: JSON.stringify({ project_id: projectId }),
    });
  }

  async getRepositoryRisk(projectId) {
    return this.request(`/fraud/repositories/${projectId}/risk`);
  }

  async scanRepository(projectId, depth = 50) {
    return this.request(`/fraud/repositories/${projectId}/scan`, {
      method: 'POST',
      body: JSON.stringify({ depth }),
    });
  }

  async checkMLHealth() {
    return this.request('/fraud/health/ml');
  }

  // Alerts endpoints
  async getRecentAlerts(limit = 50) {
    return this.request(`/alerts/recent?limit=${limit}`);
  }

  async resolveAlert(alertId) {
    return this.request(`/alerts/${alertId}/resolve`, {
      method: 'PUT',
    });
  }

  async getAlertsSummary() {
    return this.request('/alerts/summary');
  }

  async testSlackNotification() {
    return this.request('/alerts/test/slack', {
      method: 'POST',
    });
  }

  async testEmailNotification() {
    return this.request('/alerts/test/email', {
      method: 'POST',
    });
  }

  async escalateAlert(alertId, priority = 'high') {
    return this.request(`/alerts/escalate/${alertId}`, {
      method: 'POST',
      body: JSON.stringify({ priority }),
    });
  }

  // Webhook endpoints
  async testWebhook() {
    return this.request('/webhook/test');
  }
}

// Export a singleton instance
const apiClient = new ApiClient();
export default apiClient;