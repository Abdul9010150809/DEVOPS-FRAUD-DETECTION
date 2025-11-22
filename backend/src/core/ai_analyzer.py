import random
import os
from ..utils.logger import get_logger

logger = get_logger(__name__)

class AIAnalyzer:
    def __init__(self):
        self.model_path = os.path.join(os.path.dirname(__file__), '../../../ml/models/anomaly_model.pkl')
        logger.info("AI Analyzer initialized with mock model")

    def preprocess_commit_data(self, commits):
        """Preprocess commit data for analysis"""
        features = []
        for commit in commits:
            # Extract features from commit data
            feature_vector = [
                len(commit.get('message', '')),
                len(commit.get('files_changed', [])),
                commit.get('lines_added', 0),
                commit.get('lines_deleted', 0),
                len(commit.get('author', '')),
            ]
            features.append(feature_vector)
        return features

    def analyze_commits(self, commits):
        """Analyze commits for anomalies using heuristic-based approach"""
        if not commits:
            return {"anomaly_score": 0.0, "is_anomaly": False}

        try:
            total_score = 0.0
            anomalous_commits = 0

            for commit in commits:
                commit_score = self._analyze_single_commit(commit)
                total_score += commit_score
                if commit_score > 0.7:
                    anomalous_commits += 1

            # Average score across all commits
            anomaly_score = min(1.0, total_score / len(commits))

            return {
                "anomaly_score": float(anomaly_score),
                "is_anomaly": anomaly_score > 0.6,
                "details": {
                    "total_commits": len(commits),
                    "anomalous_commits": anomalous_commits
                }
            }
        except Exception as e:
            logger.error(f"Error in AI analysis: {e}")
            return {"anomaly_score": 0.0, "is_anomaly": False, "error": str(e)}

    def _analyze_single_commit(self, commit):
        """Analyze a single commit for suspicious patterns"""
        score = 0.0

        message = commit.get('message', '').lower()
        author = commit.get('author', '')
        files_changed = commit.get('files_changed', [])
        lines_added = commit.get('lines_added', 0)
        lines_deleted = commit.get('lines_deleted', 0)

        # Suspicious message patterns
        suspicious_words = ['hack', 'exploit', 'bypass', 'emergency', 'urgent', 'fix security']
        for word in suspicious_words:
            if word in message:
                score += 0.3

        # Large number of files changed
        if len(files_changed) > 20:
            score += 0.2

        # Large code changes
        if lines_added + lines_deleted > 500:
            score += 0.15

        # Sensitive files modified
        sensitive_files = ['.env', 'config.json', 'secrets', 'password', 'key']
        for file in files_changed:
            for sensitive in sensitive_files:
                if sensitive in file.lower():
                    score += 0.4
                    break

        # Unusual timing (if available)
        timestamp = commit.get('timestamp')
        if timestamp:
            import datetime
            dt = datetime.datetime.fromtimestamp(timestamp)
            # Commits at exact hours might be suspicious
            if dt.minute == 0 and dt.second == 0:
                score += 0.1

        # Add some randomness to simulate ML variability
        score += random.uniform(-0.1, 0.1)

        return max(0.0, min(1.0, score))

    def retrain_model(self, historical_data):
        """Mock retraining - in real implementation would update ML model"""
        logger.info(f"Mock retraining with {len(historical_data)} historical commits")
        # In a real implementation, this would retrain the ML model
        return True