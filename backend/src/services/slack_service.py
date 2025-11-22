import requests
import json
import os
from ..utils.logger import get_logger

logger = get_logger(__name__)

class SlackService:
    def __init__(self):
        self.webhook_url = os.getenv("SLACK_WEBHOOK_URL", "")
        self.channel = os.getenv("SLACK_CHANNEL", "#security-alerts")

    def send_alert(self, message, severity="medium"):
        """Send an alert to Slack"""
        if not self.webhook_url:
            logger.warning("Slack webhook URL not configured, skipping Slack alert")
            return False

        try:
            # Choose color based on severity
            color_map = {
                "low": "good",
                "medium": "warning",
                "high": "danger",
                "critical": "#FF0000"
            }
            color = color_map.get(severity, "warning")

            # Create Slack message payload
            payload = {
                "channel": self.channel,
                "username": "DevOps Fraud Shield",
                "icon_emoji": ":shield:",
                "attachments": [
                    {
                        "color": color,
                        "title": "Security Alert",
                        "text": message,
                        "fields": [
                            {
                                "title": "Severity",
                                "value": severity.upper(),
                                "short": True
                            },
                            {
                                "title": "Time",
                                "value": "!date^" + str(int(__import__('time').time())) + "^{date} at {time}",
                                "short": True
                            }
                        ],
                        "footer": "DevOps Fraud Shield",
                        "ts": int(__import__('time').time())
                    }
                ]
            }

            response = requests.post(
                self.webhook_url,
                data=json.dumps(payload),
                headers={"Content-Type": "application/json"}
            )
            response.raise_for_status()

            logger.info(f"Slack alert sent with severity {severity}")
            return True

        except Exception as e:
            logger.error(f"Error sending Slack alert: {e}")
            return False

    def send_report(self, title, stats):
        """Send a daily/weekly security report to Slack"""
        try:
            message = f"""
*DevOps Fraud Shield Security Report*

📊 *System Statistics:*
• Total Analyses: {stats.get('total_analyses', 0)}
• High Risk Detections: {stats.get('high_risk_analyses', 0)}
• Active Alerts: {stats.get('active_alerts', 0)}
• Average Risk Score: {stats.get('average_risk_score', 0.0):.3f}

🔍 *Recommendations:*
• Review high-risk repositories immediately
• Investigate active alerts
• Monitor risk score trends
"""

            payload = {
                "channel": self.channel,
                "username": "DevOps Fraud Shield",
                "icon_emoji": ":chart_with_upwards_trend:",
                "text": message
            }

            response = requests.post(
                self.webhook_url,
                data=json.dumps(payload),
                headers={"Content-Type": "application/json"}
            )
            response.raise_for_status()

            logger.info("Security report sent to Slack")
            return True

        except Exception as e:
            logger.error(f"Error sending Slack report: {e}")
            return False

    def test_connection(self):
        """Test Slack webhook connection"""
        try:
            payload = {
                "channel": self.channel,
                "username": "DevOps Fraud Shield",
                "icon_emoji": ":test_tube:",
                "text": "🧪 Connection test - DevOps Fraud Shield is online"
            }

            response = requests.post(
                self.webhook_url,
                data=json.dumps(payload),
                headers={"Content-Type": "application/json"}
            )
            response.raise_for_status()

            logger.info("Slack connection test successful")
            return True

        except Exception as e:
            logger.error(f"Slack connection test failed: {e}")
            return False