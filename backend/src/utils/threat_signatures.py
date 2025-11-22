import json
import os
from .logger import get_logger

logger = get_logger(__name__)

class ThreatSignatures:
    """Manages threat signatures and patterns for fraud detection"""

    def __init__(self, signatures_file=None):
        self.signatures_file = signatures_file or os.path.join(
            os.path.dirname(__file__), 'threat_signatures.json'
        )
        self.signatures = self._load_signatures()

    def _load_signatures(self):
        """Load threat signatures from JSON file"""
        try:
            with open(self.signatures_file, 'r') as f:
                return json.load(f)
        except FileNotFoundError:
            logger.warning(f"Threat signatures file not found: {self.signatures_file}")
            return self._get_default_signatures()
        except json.JSONDecodeError as e:
            logger.error(f"Error parsing threat signatures JSON: {e}")
            return self._get_default_signatures()

    def _get_default_signatures(self):
        """Return default threat signatures if file is missing"""
        return {
            "code_injection_patterns": ["eval", "exec", "system"],
            "suspicious_keywords": ["hack", "exploit", "malware"],
            "sensitive_files": [".env", "config.json", "secrets.json"],
            "suspicious_file_extensions": [".exe", ".bat", ".scr"],
            "high_risk_directories": ["/etc", "/bin", "/tmp"],
            "malicious_commit_messages": ["emergency fix", "bypass", "override"]
        }

    def get_code_injection_patterns(self):
        """Get code injection patterns"""
        return self.signatures.get("code_injection_patterns", [])

    def get_suspicious_keywords(self):
        """Get suspicious keywords"""
        return self.signatures.get("suspicious_keywords", [])

    def get_sensitive_files(self):
        """Get sensitive file patterns"""
        return self.signatures.get("sensitive_files", [])

    def get_suspicious_extensions(self):
        """Get suspicious file extensions"""
        return self.signatures.get("suspicious_file_extensions", [])

    def get_high_risk_directories(self):
        """Get high-risk directory patterns"""
        return self.signatures.get("high_risk_directories", [])

    def get_malicious_messages(self):
        """Get malicious commit message patterns"""
        return self.signatures.get("malicious_commit_messages", [])

    def update_signatures(self, new_signatures):
        """Update threat signatures"""
        try:
            self.signatures.update(new_signatures)
            with open(self.signatures_file, 'w') as f:
                json.dump(self.signatures, f, indent=2)
            logger.info("Threat signatures updated successfully")
            return True
        except Exception as e:
            logger.error(f"Error updating threat signatures: {e}")
            return False

    def add_pattern(self, category, pattern):
        """Add a new pattern to a category"""
        if category not in self.signatures:
            self.signatures[category] = []

        if pattern not in self.signatures[category]:
            self.signatures[category].append(pattern)
            self.update_signatures({category: self.signatures[category]})
            return True
        return False

    def remove_pattern(self, category, pattern):
        """Remove a pattern from a category"""
        if category in self.signatures and pattern in self.signatures[category]:
            self.signatures[category].remove(pattern)
            self.update_signatures({category: self.signatures[category]})
            return True
        return False

    def reload_signatures(self):
        """Reload signatures from file"""
        self.signatures = self._load_signatures()
        logger.info("Threat signatures reloaded")