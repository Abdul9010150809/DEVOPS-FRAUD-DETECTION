import re
from ..utils.logger import get_logger
from ..utils.threat_signatures import ThreatSignatures

logger = get_logger(__name__)

class RuleEngine:
    def __init__(self):
        self.threat_signatures = ThreatSignatures()

    def check_rules(self, commits, repo_data):
        """Check all commits against fraud detection rules"""
        violations = []

        for commit in commits:
            commit_violations = self.check_commit_rules(commit)
            if commit_violations:
                violations.extend(commit_violations)

        # Repository-level checks
        repo_violations = self.check_repository_rules(repo_data)
        violations.extend(repo_violations)

        return violations

    def check_commit_rules(self, commit):
        """Check a single commit against fraud rules"""
        violations = []

        try:
            # Check for suspicious commit messages
            if self._check_suspicious_message(commit.get('message', '')):
                violations.append({
                    "type": "suspicious_commit_message",
                    "commit_id": commit.get('id'),
                    "severity": "medium",
                    "description": "Commit message contains suspicious patterns"
                })

            # Check for large file changes
            if self._check_large_changes(commit):
                violations.append({
                    "type": "large_file_changes",
                    "commit_id": commit.get('id'),
                    "severity": "low",
                    "description": "Unusually large number of files changed"
                })

            # Check for sensitive file modifications
            sensitive_files = self._check_sensitive_files(commit.get('files_changed', []))
            if sensitive_files:
                violations.append({
                    "type": "sensitive_file_modification",
                    "commit_id": commit.get('id'),
                    "severity": "high",
                    "description": f"Modified sensitive files: {', '.join(sensitive_files)}"
                })

            # Check for code injection patterns
            if self._check_code_injection(commit):
                violations.append({
                    "type": "potential_code_injection",
                    "commit_id": commit.get('id'),
                    "severity": "high",
                    "description": "Detected potential code injection patterns"
                })

            # Check commit timing patterns
            if self._check_commit_timing(commit):
                violations.append({
                    "type": "suspicious_timing",
                    "commit_id": commit.get('id'),
                    "severity": "medium",
                    "description": "Commit made at unusual time"
                })

        except Exception as e:
            logger.error(f"Error checking commit rules: {e}")

        return violations

    def check_repository_rules(self, repo_data):
        """Check repository-level rules"""
        violations = []

        try:
            # Check for rapid contributor changes
            if self._check_contributor_changes(repo_data):
                violations.append({
                    "type": "rapid_contributor_changes",
                    "severity": "medium",
                    "description": "Unusual number of contributor changes"
                })

            # Check for branch protection bypass
            if self._check_branch_protection(repo_data):
                violations.append({
                    "type": "branch_protection_bypass",
                    "severity": "high",
                    "description": "Potential branch protection bypass detected"
                })

        except Exception as e:
            logger.error(f"Error checking repository rules: {e}")

        return violations

    def _check_suspicious_message(self, message):
        """Check for suspicious commit messages"""
        suspicious_patterns = [
            r'\b(hack|exploit|malware|virus)\b',
            r'\b(bypass|override|disable)\b.*\b(security|auth|protection)\b',
            r'\b(emergency|urgent|critical)\b.*\b(fix|patch)\b',
            r'\b(test|dummy|fake)\b.*\b(commit|push)\b'
        ]

        message_lower = message.lower()
        for pattern in suspicious_patterns:
            if re.search(pattern, message_lower):
                return True
        return False

    def _check_large_changes(self, commit):
        """Check for unusually large file changes"""
        files_changed = len(commit.get('files_changed', []))
        lines_changed = commit.get('lines_added', 0) + commit.get('lines_deleted', 0)

        # Thresholds for suspicious activity
        return files_changed > 50 or lines_changed > 1000

    def _check_sensitive_files(self, files_changed):
        """Check if sensitive files were modified"""
        sensitive_patterns = [
            r'\.env$',
            r'config\.json$',
            r'secrets\.',
            r'passwords\.',
            r'keys\.',
            r'\.pem$',
            r'\.key$'
        ]

        sensitive_files = []
        for file in files_changed:
            for pattern in sensitive_patterns:
                if re.search(pattern, file, re.IGNORECASE):
                    sensitive_files.append(file)
                    break

        return sensitive_files

    def _check_code_injection(self, commit):
        """Check for potential code injection patterns"""
        injection_patterns = self.threat_signatures.get_code_injection_patterns()

        content = commit.get('diff', '') + commit.get('message', '')
        content_lower = content.lower()

        for pattern in injection_patterns:
            if re.search(pattern, content_lower):
                return True
        return False

    def _check_commit_timing(self, commit):
        """Check for suspicious commit timing"""
        # This would require timezone analysis
        # For now, just check if commit is at exact hour marks (potentially automated)
        timestamp = commit.get('timestamp')
        if timestamp:
            from datetime import datetime
            dt = datetime.fromtimestamp(timestamp)
            # Commits at exact hours might be suspicious
            if dt.minute == 0 and dt.second == 0:
                return True
        return False

    def _check_contributor_changes(self, repo_data):
        """Check for rapid contributor changes"""
        contributors = repo_data.get('contributors', [])
        # Simple check: too many contributors in short time
        return len(contributors) > 20  # Arbitrary threshold

    def _check_branch_protection(self, repo_data):
        """Check for branch protection bypass attempts"""
        # This would check if commits are made to protected branches
        # without proper reviews, but simplified for now
        protected_branches = repo_data.get('protected_branches', [])
        commits_to_protected = repo_data.get('commits_to_protected', [])

        return len(commits_to_protected) > 0  # Simplified check