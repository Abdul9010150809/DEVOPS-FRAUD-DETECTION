// Frontend alerts controller - delegates to API client
import apiClient from '../services/apiClient';
import logger from '../utils/logger';

class AlertsController {
  async getRecentAlerts(limit = 50) {
    try {
      logger.info(`Fetching ${limit} recent alerts`);
      return await apiClient.getRecentAlerts(limit);
    } catch (error) {
      logger.error('Error fetching recent alerts:', error);
      throw error;
    }
  }

  async resolveAlert(alertId) {
    try {
      logger.info(`Resolving alert ${alertId}`);
      return await apiClient.resolveAlert(alertId);
    } catch (error) {
      logger.error(`Error resolving alert ${alertId}:`, error);
      throw error;
    }
  }

  async getAlertsSummary() {
    try {
      logger.info('Fetching alerts summary');
      return await apiClient.getAlertsSummary();
    } catch (error) {
      logger.error('Error fetching alerts summary:', error);
      throw error;
    }
  }

  async testSlackNotification() {
    try {
      logger.info('Testing Slack notification');
      return await apiClient.testSlackNotification();
    } catch (error) {
      logger.error('Error testing Slack notification:', error);
      throw error;
    }
  }

  async testEmailNotification() {
    try {
      logger.info('Testing email notification');
      return await apiClient.testEmailNotification();
    } catch (error) {
      logger.error('Error testing email notification:', error);
      throw error;
    }
  }

  async escalateAlert(alertId, priority = 'high') {
    try {
      logger.info(`Escalating alert ${alertId} with priority ${priority}`);
      return await apiClient.escalateAlert(alertId, priority);
    } catch (error) {
      logger.error(`Error escalating alert ${alertId}:`, error);
      throw error;
    }
  }
}

export default new AlertsController();