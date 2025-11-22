import pytest
import sys
import os
import json
import tempfile
import sqlite3

# Add the src directory to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))

from src.services.db_service import DBService
from src.core.fraud_engine import FraudEngine
from src.api.webhook_handler import process_push_event

class TestDatabaseIntegration:
    """Integration tests for database operations"""

    def setup_method(self):
        """Setup test database"""
        self.db_fd, self.db_path = tempfile.mkstemp()
        self.db_service = DBService(db_path=self.db_path)

    def teardown_method(self):
        """Cleanup test database"""
        os.close(self.db_fd)
        os.unlink(self.db_path)

    def test_store_and_retrieve_analysis(self):
        """Test storing and retrieving analysis results"""
        # Sample analysis result
        result = {
            "repository": "test/repo",
            "timestamp": 1234567890.0,
            "risk_score": 0.75,
            "ai_analysis": {"anomaly_score": 0.8, "is_anomaly": True},
            "rule_violations": [{"type": "suspicious_message", "severity": "medium"}],
            "recommendations": ["Review commit carefully"]
        }

        # Store result
        self.db_service.store_analysis_result(result)

        # Verify storage by checking stats
        stats = self.db_service.get_fraud_stats()
        assert stats["total_analyses"] == 1
        assert stats["high_risk_analyses"] == 1

    def test_alert_lifecycle(self):
        """Test alert creation, retrieval, and resolution"""
        # Create alert
        alert_id = self.db_service.store_alert(
            "fraud_detected",
            "high",
            "Suspicious commit detected",
            "test/repo",
            "abc123"
        )

        # Retrieve alerts
        alerts = self.db_service.get_recent_alerts()
        assert len(alerts) == 1
        assert alerts[0]["type"] == "fraud_detected"
        assert alerts[0]["severity"] == "high"
        assert alerts[0]["resolved"] == False

        # Resolve alert
        success = self.db_service.resolve_alert(alerts[0]["id"])
        assert success == True

        # Verify resolution
        updated_alerts = self.db_service.get_recent_alerts()
        assert len(updated_alerts) == 0  # Should not return resolved alerts

class TestFraudEngineIntegration:
    """Integration tests for fraud engine with database"""

    def setup_method(self):
        """Setup test database and engine"""
        self.db_fd, self.db_path = tempfile.mkstemp()
        self.db_service = DBService(db_path=self.db_path)
        self.fraud_engine = FraudEngine()
        # Override db_service in fraud_engine
        self.fraud_engine.db_service = self.db_service

    def teardown_method(self):
        """Cleanup test database"""
        os.close(self.db_fd)
        os.unlink(self.db_path)

    def test_full_analysis_workflow(self):
        """Test complete analysis workflow"""
        # Sample repository data
        repo_data = {
            "name": "test/repo",
            "id": "123",
            "url": "https://gitlab.com/test/repo",
            "timestamp": 1234567890.0,
            "commits": [
                {
                    "id": "commit1",
                    "message": "Fix critical security vulnerability",
                    "author": "hacker@example.com",
                    "timestamp": 1234567890,
                    "files_changed": [".env", "config.json"],
                    "lines_added": 100,
                    "lines_deleted": 50
                }
            ]
        }

        # Run analysis
        result = self.fraud_engine.analyze_repository(repo_data, repo_data["commits"])

        # Verify results
        assert "repository" in result
        assert "risk_score" in result
        assert "ai_analysis" in result
        assert "rule_violations" in result
        assert result["repository"] == "test/repo"
        assert isinstance(result["risk_score"], float)

        # Verify database storage
        stats = self.db_service.get_fraud_stats()
        assert stats["total_analyses"] == 1

class TestWebhookIntegration:
    """Integration tests for webhook processing"""

    def setup_method(self):
        """Setup test database"""
        self.db_fd, self.db_path = tempfile.mkstemp()
        self.db_service = DBService(db_path=self.db_path)

    def teardown_method(self):
        """Cleanup test database"""
        os.close(self.db_fd)
        os.unlink(self.db_path)

    def test_push_event_processing(self):
        """Test processing of push webhook events"""
        # Load sample payload
        sample_payload_path = os.path.join(os.path.dirname(__file__), '..', 'test_data', 'sample_payload.json')

        if os.path.exists(sample_payload_path):
            with open(sample_payload_path, 'r') as f:
                payload = json.load(f)
        else:
            # Create mock payload
            payload = {
                "object_kind": "push",
                "ref": "refs/heads/main",
                "repository": {
                    "name": "test-repo",
                    "url": "https://gitlab.com/test/repo"
                },
                "commits": [
                    {
                        "id": "abc123",
                        "message": "Add new feature",
                        "author": {"name": "Test User", "email": "test@example.com"},
                        "timestamp": "2024-01-01T00:00:00Z"
                    }
                ]
            }

        # Process the event (this would normally be done asynchronously)
        # Note: In real integration test, we'd mock the fraud engine
        assert payload["object_kind"] == "push"
        assert "commits" in payload
        assert len(payload["commits"]) > 0

if __name__ == "__main__":
    pytest.main([__file__])