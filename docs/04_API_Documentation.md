# DevOps Fraud Shield API Documentation

## Overview

The DevOps Fraud Shield provides a RESTful API for integrating fraud detection capabilities into CI/CD pipelines. The API supports webhook integration with GitLab/GitHub and provides endpoints for manual analysis, statistics, and alert management.

## Base URL
```
http://localhost:8000/api
```

## Authentication

Most endpoints require authentication. Use the following methods:

### Webhook Authentication
- **Header**: `X-Gitlab-Token` or `X-Hub-Signature-256`
- **Description**: Webhook signature verification for GitLab/GitHub webhooks

### API Token (Future Implementation)
- **Header**: `Authorization: Bearer <token>`
- **Description**: JWT token for API access

## Endpoints

### Webhook Endpoints

#### POST /webhook
Process incoming webhooks from GitLab/GitHub.

**Headers:**
- `X-Gitlab-Event` or `X-Github-Event`: Event type
- `X-Gitlab-Token` or `X-Hub-Signature-256`: Webhook signature

**Request Body:**
```json
{
  "object_kind": "push",
  "ref": "refs/heads/main",
  "repository": {
    "name": "my-project",
    "url": "https://gitlab.com/user/my-project"
  },
  "commits": [
    {
      "id": "abc123",
      "message": "Add new feature",
      "author": {"name": "John Doe", "email": "john@example.com"},
      "timestamp": "2024-01-01T12:00:00Z"
    }
  ]
}
```

**Response:**
```json
{
  "status": "accepted",
  "message": "Push event queued for analysis"
}
```

**Status Codes:**
- `200`: Webhook accepted
- `400`: Invalid payload
- `401`: Invalid signature

#### GET /webhook/test
Test webhook endpoint functionality.

**Response:**
```json
{
  "status": "ok",
  "message": "Webhook endpoint is active",
  "supported_events": ["push", "merge_request", "pull_request"]
}
```

### Fraud Analysis Endpoints

#### GET /fraud/stats
Get overall fraud detection statistics.

**Response:**
```json
{
  "status": "success",
  "data": {
    "total_analyses": 150,
    "high_risk_analyses": 12,
    "active_alerts": 5,
    "average_risk_score": 0.234
  }
}
```

#### POST /fraud/analyze
Manually trigger fraud analysis for a repository.

**Query Parameters:**
- `project_id` (string, required): GitLab project ID

**Response:**
```json
{
  "status": "completed",
  "project": "my-project",
  "analysis": {
    "repository": "my-project",
    "risk_score": 0.75,
    "ai_analysis": {
      "anomaly_score": 0.8,
      "is_anomaly": true
    },
    "rule_violations": [
      {
        "type": "suspicious_commit_message",
        "severity": "medium",
        "description": "Commit message contains suspicious patterns"
      }
    ],
    "recommendations": [
      "Review recent commits carefully",
      "Monitor contributor activity"
    ]
  }
}
```

#### GET /fraud/repositories/{project_id}/risk
Get risk assessment for a specific repository.

**Path Parameters:**
- `project_id` (string): GitLab project ID

**Response:**
```json
{
  "project_id": "123",
  "current_risk_score": 0.15,
  "last_analysis": 1704067200.0,
  "trend": "stable",
  "recommendations": [
    "Regular code reviews recommended"
  ]
}
```

#### POST /fraud/repositories/{project_id}/scan
Perform a deep scan of repository commits.

**Path Parameters:**
- `project_id` (string): GitLab project ID

**Query Parameters:**
- `depth` (integer, optional): Number of commits to scan (default: 50)

**Response:**
```json
{
  "status": "completed",
  "project_id": "123",
  "total_commits_scanned": 25,
  "high_risk_commits": 2,
  "average_risk_score": 0.123,
  "results": [
    {
      "commit_id": "abc123",
      "risk_score": 0.8,
      "violations": 1
    }
  ]
}
```

#### GET /fraud/health/ml
Check ML model health and status.

**Response:**
```json
{
  "status": "healthy",
  "model_loaded": true,
  "last_updated": "2024-01-01T00:00:00Z",
  "accuracy_score": 0.85
}
```

### Alert Management Endpoints

#### GET /alerts/recent
Get recent security alerts.

**Query Parameters:**
- `limit` (integer, optional): Maximum number of alerts (default: 50)

**Response:**
```json
{
  "status": "success",
  "count": 5,
  "alerts": [
    {
      "id": 1,
      "type": "fraud_detected",
      "severity": "high",
      "message": "Suspicious commit pattern detected",
      "repository": "my-project",
      "commit_id": "abc123",
      "created_at": 1704067200.0
    }
  ]
}
```

#### PUT /alerts/{alert_id}/resolve
Mark an alert as resolved.

**Path Parameters:**
- `alert_id` (integer): Alert ID

**Response:**
```json
{
  "status": "success",
  "message": "Alert 1 marked as resolved"
}
```

#### GET /alerts/summary
Get alerts summary statistics.

**Response:**
```json
{
  "status": "success",
  "summary": {
    "total_alerts": 25,
    "active_alerts": 5,
    "severity_breakdown": {
      "low": 10,
      "medium": 8,
      "high": 5,
      "critical": 2
    },
    "type_breakdown": {
      "fraud_detected": 15,
      "suspicious_activity": 10
    },
    "generated_at": 1704067200.0
  }
}
```

#### POST /alerts/test/slack
Test Slack notification functionality.

**Response:**
```json
{
  "status": "success",
  "message": "Test Slack notification sent successfully"
}
```

#### POST /alerts/test/email
Test email notification functionality.

**Response:**
```json
{
  "status": "success",
  "message": "Test email sent successfully"
}
```

#### POST /alerts/escalate/{alert_id}
Escalate an alert with higher priority notifications.

**Path Parameters:**
- `alert_id` (integer): Alert ID

**Query Parameters:**
- `priority` (string, optional): Escalation priority (default: "high")

**Response:**
```json
{
  "status": "success",
  "message": "Alert 1 escalated with high priority"
}
```

## Error Responses

All endpoints return errors in the following format:

```json
{
  "detail": "Error description",
  "status_code": 400
}
```

### Common HTTP Status Codes
- `200`: Success
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `422`: Validation Error
- `500`: Internal Server Error

## Rate Limiting

API endpoints are rate limited to prevent abuse:
- 100 requests per minute per IP
- 1000 requests per hour per IP

Rate limit headers are included in responses:
- `X-RateLimit-Limit`: Maximum requests per window
- `X-RateLimit-Remaining`: Remaining requests in current window
- `X-RateLimit-Reset`: Time when limit resets (Unix timestamp)

## Data Types

### Risk Score
- Type: `float`
- Range: `0.0` to `1.0`
- Interpretation:
  - `0.0-0.3`: Low risk
  - `0.3-0.7`: Medium risk
  - `0.7-1.0`: High risk

### Severity Levels
- `low`: Minor issues, informational
- `medium`: Potential security concerns
- `high`: Significant security risks
- `critical`: Immediate action required

### Timestamps
All timestamps are in Unix epoch format (seconds since 1970-01-01 00:00:00 UTC).

## Webhook Integration

### GitLab Setup
1. Go to your GitLab project settings
2. Navigate to Webhooks
3. Add webhook URL: `https://your-domain.com/api/webhook`
4. Set secret token matching `WEBHOOK_SECRET` environment variable
5. Select events: Push events, Merge request events

### GitHub Setup
1. Go to your GitHub repository settings
2. Navigate to Webhooks
3. Add webhook URL: `https://your-domain.com/api/webhook`
4. Set secret matching `WEBHOOK_SECRET` environment variable
5. Select events: Push, Pull requests

## SDKs and Libraries

### Python Client
```python
import requests

class FraudShieldClient:
    def __init__(self, base_url="http://localhost:8000/api"):
        self.base_url = base_url

    def get_stats(self):
        response = requests.get(f"{self.base_url}/fraud/stats")
        return response.json()
```

### JavaScript Client
```javascript
class FraudShieldClient {
  constructor(baseURL = 'http://localhost:8000/api') {
    this.baseURL = baseURL;
  }

  async getStats() {
    const response = await fetch(`${this.baseURL}/fraud/stats`);
    return response.json();
  }
}
```

## Changelog

### v1.0.0
- Initial API release
- Webhook processing
- Fraud analysis endpoints
- Alert management
- Basic statistics

## Support

For API support or questions:
- Email: support@devopsfraudshield.com
- Documentation: https://docs.devopsfraudshield.com
- GitHub Issues: https://github.com/your-org/devops-fraud-shield/issues