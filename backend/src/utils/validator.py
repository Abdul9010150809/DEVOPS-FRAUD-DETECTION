import hmac
import hashlib
import os
from .logger import get_logger
from .config import Config

logger = get_logger(__name__)

class WebhookValidator:
    """Validates incoming webhooks from GitLab/GitHub"""

    def __init__(self):
        self.secret = Config.WEBHOOK_SECRET

    def verify_signature(self, payload: bytes, signature: str, event_type: str = None) -> bool:
        """Verify webhook signature"""
        if not self.secret:
            logger.warning("Webhook secret not configured, skipping signature verification")
            return True  # Allow if not configured

        try:
            # Handle different signature formats
            if signature.startswith('sha256='):
                # GitHub format
                expected_signature = 'sha256=' + hmac.new(
                    self.secret.encode(),
                    payload,
                    hashlib.sha256
                ).hexdigest()
                return hmac.compare_digest(signature, expected_signature)

            elif signature.startswith('X-Gitlab-Token:'):
                # GitLab token format (simpler)
                token = signature.replace('X-Gitlab-Token:', '').strip()
                return token == self.secret

            else:
                # Raw token comparison
                return signature == self.secret

        except Exception as e:
            logger.error(f"Error verifying webhook signature: {e}")
            return False

    def validate_gitlab_payload(self, payload: dict) -> bool:
        """Validate GitLab webhook payload structure"""
        try:
            # Check for required fields
            if 'object_kind' not in payload:
                logger.warning("Missing object_kind in GitLab payload")
                return False

            object_kind = payload['object_kind']

            if object_kind == 'push':
                required_fields = ['ref', 'commits', 'repository']
                for field in required_fields:
                    if field not in payload:
                        logger.warning(f"Missing required field '{field}' in push payload")
                        return False

            elif object_kind in ['merge_request', 'note']:
                if 'object_attributes' not in payload:
                    logger.warning("Missing object_attributes in merge request payload")
                    return False

            return True

        except Exception as e:
            logger.error(f"Error validating GitLab payload: {e}")
            return False

    def validate_github_payload(self, payload: dict) -> bool:
        """Validate GitHub webhook payload structure"""
        try:
            # GitHub payloads have different structure
            # Check for common fields
            if 'repository' not in payload:
                logger.warning("Missing repository in GitHub payload")
                return False

            # Additional validation can be added based on event type
            return True

        except Exception as e:
            logger.error(f"Error validating GitHub payload: {e}")
            return False

    def sanitize_payload(self, payload: dict) -> dict:
        """Sanitize webhook payload to prevent injection attacks"""
        # Remove or sanitize potentially dangerous fields
        sanitized = payload.copy()

        # Remove any script tags or dangerous content from strings
        def sanitize_string(value):
            if isinstance(value, str):
                # Basic sanitization - remove script tags
                return value.replace('<script', '').replace('</script>', '')
            return value

        def sanitize_dict(d):
            for key, value in d.items():
                if isinstance(value, dict):
                    sanitize_dict(value)
                elif isinstance(value, list):
                    d[key] = [sanitize_string(item) if isinstance(item, str) else item for item in value]
                elif isinstance(value, str):
                    d[key] = sanitize_string(value)

        sanitize_dict(sanitized)
        return sanitized

class InputValidator:
    """General input validation utilities"""

    @staticmethod
    def validate_project_id(project_id: str) -> bool:
        """Validate GitLab project ID format"""
        if not project_id:
            return False

        # GitLab project IDs can be numeric or URL-encoded paths
        import re
        # Allow numeric IDs or path-like strings
        return bool(re.match(r'^(\d+|[\w\-/%]+)$', project_id))

    @staticmethod
    def validate_email(email: str) -> bool:
        """Validate email address format"""
        import re
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return bool(re.match(pattern, email))

    @staticmethod
    def validate_commit_id(commit_id: str) -> bool:
        """Validate commit ID (SHA) format"""
        import re
        # SHA-1 or SHA-256 hash
        return bool(re.match(r'^[a-f0-9]{7,64}$', commit_id))

    @staticmethod
    def sanitize_sql_input(value: str) -> str:
        """Sanitize input to prevent SQL injection"""
        if not isinstance(value, str):
            return value

        # Basic sanitization - remove quotes and semicolons
        return value.replace("'", "''").replace('"', '""').replace(';', '')

class RateLimiter:
    """Simple rate limiting for API endpoints"""

    def __init__(self):
        self.requests = {}
        self.max_requests = Config.RATE_LIMIT_REQUESTS
        self.window_seconds = Config.RATE_LIMIT_WINDOW

    def is_allowed(self, client_id: str) -> bool:
        """Check if request is allowed under rate limit"""
        import time

        current_time = time.time()
        window_start = current_time - self.window_seconds

        if client_id not in self.requests:
            self.requests[client_id] = []

        # Remove old requests outside the window
        self.requests[client_id] = [
            req_time for req_time in self.requests[client_id]
            if req_time > window_start
        ]

        # Check if under limit
        if len(self.requests[client_id]) < self.max_requests:
            self.requests[client_id].append(current_time)
            return True

        return False

# Global instances
webhook_validator = WebhookValidator()
input_validator = InputValidator()
rate_limiter = RateLimiter()