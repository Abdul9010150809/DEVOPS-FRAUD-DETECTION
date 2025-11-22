from ..utils.logger import get_logger
import math

logger = get_logger(__name__)

class RiskScorer:
    def __init__(self):
        # Risk weights for different factors
        self.weights = {
            "ai_anomaly_score": 0.4,
            "rule_violations": 0.3,
            "commit_frequency": 0.1,
            "contributor_trust": 0.2
        }

    def calculate_risk_score(self, ai_results, rule_violations, repo_data):
        """Calculate overall risk score for repository analysis"""
        try:
            # AI anomaly contribution
            ai_score = ai_results.get("anomaly_score", 0.0)
            ai_contribution = min(ai_score, 1.0) * self.weights["ai_anomaly_score"]

            # Rule violations contribution
            rule_score = min(len(rule_violations) / 10.0, 1.0)  # Normalize by max expected violations
            rule_contribution = rule_score * self.weights["rule_violations"]

            # Commit frequency analysis
            commit_freq_score = self._analyze_commit_frequency(repo_data)
            freq_contribution = commit_freq_score * self.weights["commit_frequency"]

            # Contributor trust score
            trust_score = self._calculate_contributor_trust(repo_data)
            trust_contribution = (1 - trust_score) * self.weights["contributor_trust"]  # Invert: low trust = high risk

            total_score = ai_contribution + rule_contribution + freq_contribution + trust_contribution

            # Ensure score is between 0 and 1
            final_score = max(0.0, min(1.0, total_score))

            logger.debug(f"Risk score calculation: AI={ai_contribution:.3f}, Rules={rule_contribution:.3f}, "
                        f"Freq={freq_contribution:.3f}, Trust={trust_contribution:.3f}, Total={final_score:.3f}")

            return final_score

        except Exception as e:
            logger.error(f"Error calculating risk score: {e}")
            return 0.5  # Default medium risk

    def calculate_commit_risk(self, ai_result, rule_violations):
        """Calculate risk score for a single commit"""
        try:
            ai_score = ai_result.get("anomaly_score", 0.0)
            rule_score = min(len(rule_violations) / 5.0, 1.0)  # Fewer violations expected per commit

            # Weight AI more heavily for individual commits
            score = (ai_score * 0.6) + (rule_score * 0.4)
            return max(0.0, min(1.0, score))

        except Exception as e:
            logger.error(f"Error calculating commit risk: {e}")
            return 0.0

    def _analyze_commit_frequency(self, repo_data):
        """Analyze commit frequency for suspicious patterns"""
        try:
            commits = repo_data.get("commits", [])
            if len(commits) < 2:
                return 0.0

            # Calculate time differences between commits
            timestamps = [c.get("timestamp") for c in commits if c.get("timestamp")]
            if len(timestamps) < 2:
                return 0.0

            timestamps.sort()
            intervals = []
            for i in range(1, len(timestamps)):
                interval = timestamps[i] - timestamps[i-1]
                intervals.append(interval)

            avg_interval = sum(intervals) / len(intervals)
            std_dev = math.sqrt(sum((x - avg_interval)**2 for x in intervals) / len(intervals))

            # High variability in commit timing might indicate automated/bot activity
            variability_score = min(std_dev / avg_interval, 1.0) if avg_interval > 0 else 0.0

            return variability_score

        except Exception as e:
            logger.error(f"Error analyzing commit frequency: {e}")
            return 0.0

    def _calculate_contributor_trust(self, repo_data):
        """Calculate trust score based on contributor history"""
        try:
            contributors = repo_data.get("contributors", [])
            if not contributors:
                return 0.5  # Neutral trust

            # Simple trust calculation based on contributor count and activity
            total_contributions = sum(c.get("contributions", 0) for c in contributors)
            unique_contributors = len(contributors)

            # More contributors with balanced contributions = higher trust
            balance_score = 1.0 / (1.0 + abs(unique_contributors - 3))  # Optimal around 3 contributors

            # High total contributions = higher trust
            activity_score = min(total_contributions / 100.0, 1.0)

            trust_score = (balance_score + activity_score) / 2.0
            return max(0.0, min(1.0, trust_score))

        except Exception as e:
            logger.error(f"Error calculating contributor trust: {e}")
            return 0.5