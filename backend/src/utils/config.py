import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    """Central configuration management"""

    # Server settings
    PORT = int(os.getenv("PORT", "8000"))
    HOST = os.getenv("HOST", "0.0.0.0")

    # Database settings
    DB_PATH = os.getenv("DB_PATH", "database/fraud_logs.db")

    # GitLab settings
    GITLAB_URL = os.getenv("GITLAB_URL", "https://gitlab.com/api/v4")
    GITLAB_TOKEN = os.getenv("GITLAB_TOKEN", "")

    # Slack settings
    SLACK_WEBHOOK_URL = os.getenv("SLACK_WEBHOOK_URL", "")
    SLACK_CHANNEL = os.getenv("SLACK_CHANNEL", "#security-alerts")

    # Email settings
    SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
    SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
    SMTP_USE_TLS = os.getenv("SMTP_USE_TLS", "true").lower() == "true"
    SENDER_EMAIL = os.getenv("SENDER_EMAIL", "")
    SENDER_PASSWORD = os.getenv("SENDER_PASSWORD", "")

    # Security settings
    WEBHOOK_SECRET = os.getenv("WEBHOOK_SECRET", "")
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key-change-in-production")

    # ML settings
    ML_MODEL_PATH = os.path.join(os.path.dirname(__file__), "../../ml/models/anomaly_model.pkl")
    ML_RETRAIN_INTERVAL = int(os.getenv("ML_RETRAIN_INTERVAL", "86400"))  # 24 hours

    # Logging settings
    LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
    LOG_FILE = os.getenv("LOG_FILE", "logs/fraud_shield.log")

    # Alert thresholds
    HIGH_RISK_THRESHOLD = float(os.getenv("HIGH_RISK_THRESHOLD", "0.7"))
    CRITICAL_RISK_THRESHOLD = float(os.getenv("CRITICAL_RISK_THRESHOLD", "0.9"))

    # API rate limiting
    RATE_LIMIT_REQUESTS = int(os.getenv("RATE_LIMIT_REQUESTS", "100"))
    RATE_LIMIT_WINDOW = int(os.getenv("RATE_LIMIT_WINDOW", "60"))  # seconds

    # CORS settings
    CORS_ORIGINS = os.getenv("CORS_ORIGINS", "*").split(",")

    @classmethod
    def is_production(cls):
        """Check if running in production environment"""
        return os.getenv("ENVIRONMENT", "development").lower() == "production"

    @classmethod
    def validate_required_settings(cls):
        """Validate that required settings are configured"""
        required = []
        if not cls.GITLAB_TOKEN:
            required.append("GITLAB_TOKEN")
        if not cls.DB_PATH:
            required.append("DB_PATH")

        if required:
            raise ValueError(f"Missing required configuration: {', '.join(required)}")

        return True

    @classmethod
    def get_database_url(cls):
        """Get database connection URL"""
        if cls.DB_PATH.endswith('.db'):
            return f"sqlite:///{cls.DB_PATH}"
        else:
            # For other databases like PostgreSQL
            return os.getenv("DATABASE_URL", f"sqlite:///{cls.DB_PATH}")

    @classmethod
    def get_alert_recipients(cls):
        """Get list of email recipients for alerts"""
        recipients = os.getenv("ALERT_RECIPIENTS", "")
        if recipients:
            return [email.strip() for email in recipients.split(",")]
        return ["security@company.com"]  # Default

    @classmethod
    def get_slack_settings(cls):
        """Get Slack configuration as dict"""
        return {
            "webhook_url": cls.SLACK_WEBHOOK_URL,
            "channel": cls.SLACK_CHANNEL,
            "enabled": bool(cls.SLACK_WEBHOOK_URL)
        }

    @classmethod
    def get_email_settings(cls):
        """Get email configuration as dict"""
        return {
            "smtp_server": cls.SMTP_SERVER,
            "smtp_port": cls.SMTP_PORT,
            "use_tls": cls.SMTP_USE_TLS,
            "sender_email": cls.SENDER_EMAIL,
            "sender_password": cls.SENDER_PASSWORD,
            "enabled": bool(cls.SENDER_EMAIL and cls.SENDER_PASSWORD)
        }