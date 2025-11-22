import logging
import logging.handlers
import os
import sys
from .config import Config

def get_logger(name: str) -> logging.Logger:
    """Get a configured logger instance"""

    logger = logging.getLogger(name)

    # Avoid duplicate handlers
    if logger.handlers:
        return logger

    logger.setLevel(getattr(logging, Config.LOG_LEVEL.upper(), logging.INFO))

    # Create formatters
    formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )

    # Console handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(formatter)
    logger.addHandler(console_handler)

    # File handler (if log file is configured)
    if Config.LOG_FILE:
        try:
            # Ensure log directory exists
            log_dir = os.path.dirname(Config.LOG_FILE)
            if log_dir and not os.path.exists(log_dir):
                os.makedirs(log_dir)

            # Rotating file handler (10MB max, keep 5 backups)
            file_handler = logging.handlers.RotatingFileHandler(
                Config.LOG_FILE,
                maxBytes=10*1024*1024,  # 10MB
                backupCount=5
            )
            file_handler.setFormatter(formatter)
            logger.addHandler(file_handler)

        except Exception as e:
            # If file logging fails, log to console only
            logger.warning(f"Failed to set up file logging: {e}")

    return logger

def setup_logging():
    """Setup global logging configuration"""
    # Configure root logger
    root_logger = logging.getLogger()
    root_logger.setLevel(logging.WARNING)  # Only warnings and above for libraries

    # Configure our application logger
    app_logger = get_logger("devops_fraud_shield")
    app_logger.info("Logging system initialized")

    return app_logger

class SecurityLogger:
    """Specialized logger for security events"""

    def __init__(self):
        self.logger = get_logger("security")

    def log_security_event(self, event_type: str, details: dict, severity: str = "info"):
        """Log a security-related event"""
        message = f"SECURITY EVENT [{event_type.upper()}]: {details}"

        if severity.lower() == "critical":
            self.logger.critical(message)
        elif severity.lower() == "error":
            self.logger.error(message)
        elif severity.lower() == "warning":
            self.logger.warning(message)
        else:
            self.logger.info(message)

    def log_fraud_attempt(self, commit_id: str, risk_score: float, violations: list):
        """Log detected fraud attempt"""
        self.log_security_event(
            "fraud_detected",
            {
                "commit_id": commit_id,
                "risk_score": risk_score,
                "violations_count": len(violations),
                "violations": violations
            },
            "warning" if risk_score > 0.7 else "info"
        )

    def log_alert_triggered(self, alert_type: str, repository: str, severity: str):
        """Log when an alert is triggered"""
        self.log_security_event(
            "alert_triggered",
            {
                "alert_type": alert_type,
                "repository": repository,
                "severity": severity
            },
            severity
        )

    def log_suspicious_activity(self, activity_type: str, details: dict):
        """Log suspicious activity"""
        self.log_security_event(
            "suspicious_activity",
            {
                "activity_type": activity_type,
                **details
            },
            "warning"
        )

# Global security logger instance
security_logger = SecurityLogger()