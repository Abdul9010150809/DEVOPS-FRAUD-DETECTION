// Frontend webhook handler - for testing webhook endpoints
import apiClient from '../services/apiClient';
import logger from '../utils/logger';

class WebhookHandler {
  async testWebhook() {
    try {
      logger.info('Testing webhook endpoint');
      return await apiClient.testWebhook();
    } catch (error) {
      logger.error('Error testing webhook:', error);
      throw error;
    }
  }

  // Simulate webhook payload for testing
  generateTestPayload(eventType = 'push') {
    const basePayload = {
      object_kind: eventType,
      event_name: eventType,
      project: {
        id: 123,
        name: 'test-project',
        web_url: 'https://gitlab.com/test/test-project'
      }
    };

    if (eventType === 'push') {
      return {
        ...basePayload,
        ref: 'refs/heads/main',
        commits: [
          {
            id: 'abc123def456',
            message: 'Add new feature\n\nThis commit adds authentication',
            author: { name: 'Test User', email: 'test@example.com' },
            timestamp: new Date().toISOString()
          }
        ]
      };
    }

    return basePayload;
  }

  // Validate webhook payload structure
  validatePayload(payload) {
    if (!payload || typeof payload !== 'object') {
      return { valid: false, error: 'Invalid payload format' };
    }

    if (!payload.object_kind) {
      return { valid: false, error: 'Missing object_kind' };
    }

    return { valid: true };
  }
}

export default new WebhookHandler();