from .ai_analyzer import AIAnalyzer
from .rule_engine import RuleEngine
from .risk_scorer import RiskScorer
from ..utils.logger import get_logger
from ..services.db_service import DBService
import json

logger = get_logger(__name__)

class FraudEngine:
    def __init__(self):
        self.ai_analyzer = AIAnalyzer()
        self.rule_engine = RuleEngine()
        self.risk_scorer = RiskScorer()
        self.db_service = DBService()

    def analyze_repository(self, repo_data, commits):
        """Comprehensive fraud analysis of a repository"""
        logger.info(f"Starting fraud analysis for repository: {repo_data.get('name', 'unknown')}")

        # AI-based anomaly detection
        ai_results = self.ai_analyzer.analyze_commits(commits)

        # Rule-based checks
        rule_violations = self.rule_engine.check_rules(commits, repo_data)

        # Calculate overall risk score
        risk_score = self.risk_scorer.calculate_risk_score(ai_results, rule_violations, repo_data)

        # Prepare analysis result
        analysis_result = {
            "repository": repo_data.get("name", "unknown"),
            "timestamp": repo_data.get("timestamp"),
            "risk_score": risk_score,
            "ai_analysis": ai_results,
            "rule_violations": rule_violations,
            "recommendations": self._generate_recommendations(risk_score, rule_violations)
        }

        # Store in database
        self.db_service.store_analysis_result(analysis_result)

        # Check if alert should be triggered
        if risk_score > 0.7:  # High risk threshold
            self._trigger_alert(analysis_result)

        logger.info(f"Fraud analysis completed. Risk score: {risk_score}")
        return analysis_result

    def analyze_commit(self, commit_data):
        """Analyze a single commit for fraud indicators"""
        logger.info(f"Analyzing commit: {commit_data.get('id', 'unknown')}")

        # AI analysis
        ai_result = self.ai_analyzer.analyze_commits([commit_data])

        # Rule checks
        rule_violations = self.rule_engine.check_commit_rules(commit_data)

        # Risk scoring
        risk_score = self.risk_scorer.calculate_commit_risk(ai_result, rule_violations)

        result = {
            "commit_id": commit_data.get("id"),
            "risk_score": risk_score,
            "ai_analysis": ai_result,
            "rule_violations": rule_violations
        }

        # Store commit analysis
        self.db_service.store_commit_analysis(result)

        return result

    def _generate_recommendations(self, risk_score, rule_violations):
        """Generate security recommendations based on analysis"""
        recommendations = []

        if risk_score > 0.8:
            recommendations.append("Immediate code review required")
            recommendations.append("Consider rolling back recent commits")
        elif risk_score > 0.6:
            recommendations.append("Enhanced monitoring recommended")
            recommendations.append("Review contributor access permissions")

        if "suspicious_commit_pattern" in rule_violations:
            recommendations.append("Investigate unusual commit frequency")

        if "large_file_changes" in rule_violations:
            recommendations.append("Review large code changes for malicious content")

        return recommendations

    def _trigger_alert(self, analysis_result):
        """Trigger alerts for high-risk findings"""
        from ..services.slack_service import SlackService
        from ..services.email_service import EmailService

        slack = SlackService()
        email = EmailService()

        message = f"🚨 High-risk activity detected in {analysis_result['repository']}\n"
        message += f"Risk Score: {analysis_result['risk_score']:.2f}\n"
        message += f"Violations: {len(analysis_result['rule_violations'])}"

        slack.send_alert(message)
        email.send_alert("High Risk Alert", message, ["security@company.com"])