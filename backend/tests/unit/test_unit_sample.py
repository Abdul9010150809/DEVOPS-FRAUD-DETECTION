import pytest
import sys
import os

# Add the src directory to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))

from src.core.fraud_engine import FraudEngine
from src.core.rule_engine import RuleEngine
from src.core.risk_scorer import RiskScorer
from src.utils.validator import InputValidator

class TestFraudEngine:
    """Unit tests for FraudEngine"""

    def test_fraud_engine_initialization(self):
        """Test that FraudEngine initializes correctly"""
        engine = FraudEngine()
        assert engine is not None
        assert hasattr(engine, 'ai_analyzer')
        assert hasattr(engine, 'rule_engine')
        assert hasattr(engine, 'risk_scorer')

    def test_analyze_commit_basic(self):
        """Test basic commit analysis"""
        engine = FraudEngine()

        # Mock commit data
        commit = {
            "id": "abc123",
            "message": "Fix bug",
            "author": "test@example.com",
            "timestamp": 1234567890,
            "files_changed": ["file1.py"],
            "lines_added": 10,
            "lines_deleted": 5
        }

        result = engine.analyze_commit(commit)

        assert "commit_id" in result
        assert "risk_score" in result
        assert "ai_analysis" in result
        assert "rule_violations" in result
        assert result["commit_id"] == "abc123"
        assert isinstance(result["risk_score"], (int, float))

class TestRuleEngine:
    """Unit tests for RuleEngine"""

    def test_rule_engine_initialization(self):
        """Test RuleEngine initialization"""
        engine = RuleEngine()
        assert engine is not None
        assert hasattr(engine, 'threat_signatures')

    def test_check_suspicious_message(self):
        """Test suspicious message detection"""
        engine = RuleEngine()

        # Test suspicious message
        suspicious = engine._check_suspicious_message("emergency fix for security bypass")
        assert suspicious == True

        # Test normal message
        normal = engine._check_suspicious_message("fix typo in documentation")
        assert normal == False

    def test_check_large_changes(self):
        """Test large file changes detection"""
        engine = RuleEngine()

        # Large commit
        large_commit = {
            "files_changed": ["file1", "file2", "file3", "file4", "file5", "file6"],
            "lines_added": 1500,
            "lines_deleted": 200
        }
        assert engine._check_large_changes(large_commit) == True

        # Normal commit
        normal_commit = {
            "files_changed": ["file1.py"],
            "lines_added": 10,
            "lines_deleted": 5
        }
        assert engine._check_large_changes(normal_commit) == False

class TestRiskScorer:
    """Unit tests for RiskScorer"""

    def test_risk_scorer_initialization(self):
        """Test RiskScorer initialization"""
        scorer = RiskScorer()
        assert scorer is not None
        assert hasattr(scorer, 'weights')

    def test_calculate_commit_risk(self):
        """Test commit risk calculation"""
        scorer = RiskScorer()

        ai_result = {"anomaly_score": 0.8}
        rule_violations = ["suspicious_message"]

        risk = scorer.calculate_commit_risk(ai_result, rule_violations)

        assert isinstance(risk, float)
        assert 0.0 <= risk <= 1.0
        assert risk > 0.5  # Should be high due to high AI score and violations

class TestInputValidator:
    """Unit tests for InputValidator"""

    def test_validate_email(self):
        """Test email validation"""
        assert InputValidator.validate_email("test@example.com") == True
        assert InputValidator.validate_email("invalid-email") == False
        assert InputValidator.validate_email("") == False

    def test_validate_commit_id(self):
        """Test commit ID validation"""
        assert InputValidator.validate_commit_id("abc123def") == True
        assert InputValidator.validate_commit_id("short") == False
        assert InputValidator.validate_commit_id("invalid@commit") == False

    def test_validate_project_id(self):
        """Test project ID validation"""
        assert InputValidator.validate_project_id("123") == True
        assert InputValidator.validate_project_id("group/project") == True
        assert InputValidator.validate_project_id("") == False

if __name__ == "__main__":
    pytest.main([__file__])