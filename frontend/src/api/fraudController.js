// Frontend fraud controller - delegates to API client
import apiClient from '../services/apiClient';
import logger from '../utils/logger';

class FraudController {
  async getFraudStats() {
    try {
      logger.info('Fetching fraud statistics');
      return await apiClient.getFraudStats();
    } catch (error) {
      logger.error('Error fetching fraud stats:', error);
      throw error;
    }
  }

  async analyzeRepository(projectId) {
    try {
      logger.info(`Analyzing repository ${projectId}`);
      return await apiClient.analyzeRepository(projectId);
    } catch (error) {
      logger.error(`Error analyzing repository ${projectId}:`, error);
      throw error;
    }
  }

  async getRepositoryRisk(projectId) {
    try {
      logger.info(`Getting risk assessment for repository ${projectId}`);
      return await apiClient.getRepositoryRisk(projectId);
    } catch (error) {
      logger.error(`Error getting risk for repository ${projectId}:`, error);
      throw error;
    }
  }

  async scanRepository(projectId, depth = 50) {
    try {
      logger.info(`Scanning repository ${projectId} with depth ${depth}`);
      return await apiClient.scanRepository(projectId, depth);
    } catch (error) {
      logger.error(`Error scanning repository ${projectId}:`, error);
      throw error;
    }
  }

  async checkMLHealth() {
    try {
      logger.info('Checking ML service health');
      return await apiClient.checkMLHealth();
    } catch (error) {
      logger.error('Error checking ML health:', error);
      throw error;
    }
  }
}

export default new FraudController();