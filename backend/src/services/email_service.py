import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
from ..utils.logger import get_logger

logger = get_logger(__name__)

class EmailService:
    def __init__(self):
        self.smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
        self.smtp_port = int(os.getenv("SMTP_PORT", "587"))
        self.sender_email = os.getenv("SENDER_EMAIL", "")
        self.sender_password = os.getenv("SENDER_PASSWORD", "")
        self.use_tls = os.getenv("SMTP_USE_TLS", "true").lower() == "true"

    def send_alert(self, subject, message, recipients):
        """Send an alert email"""
        if not self.sender_email or not self.sender_password:
            logger.warning("Email credentials not configured, skipping email alert")
            return False

        try:
            # Create message
            msg = MIMEMultipart()
            msg['From'] = self.sender_email
            msg['To'] = ", ".join(recipients)
            msg['Subject'] = f"🚨 DevOps Fraud Shield Alert: {subject}"

            # Add body
            body = f"""
DevOps Fraud Shield Security Alert

{message}

This is an automated message from the DevOps Fraud Shield system.
Please investigate immediately.

---
DevOps Fraud Shield
Security Monitoring System
"""
            msg.attach(MIMEText(body, 'plain'))

            # Send email
            server = smtplib.SMTP(self.smtp_server, self.smtp_port)
            if self.use_tls:
                server.starttls()
            server.login(self.sender_email, self.sender_password)
            text = msg.as_string()
            server.sendmail(self.sender_email, recipients, text)
            server.quit()

            logger.info(f"Alert email sent to {len(recipients)} recipients")
            return True

        except Exception as e:
            logger.error(f"Error sending email alert: {e}")
            return False

    def send_report(self, subject, report_data, recipients):
        """Send a detailed security report"""
        try:
            message = f"""
DevOps Fraud Shield Security Report

Summary:
- Total Analyses: {report_data.get('total_analyses', 0)}
- High Risk Detections: {report_data.get('high_risk_analyses', 0)}
- Active Alerts: {report_data.get('active_alerts', 0)}
- Average Risk Score: {report_data.get('average_risk_score', 0.0)}

Please review the dashboard for detailed information.
"""
            return self.send_alert(subject, message, recipients)

        except Exception as e:
            logger.error(f"Error sending report email: {e}")
            return False

    def test_connection(self):
        """Test email server connection"""
        try:
            server = smtplib.SMTP(self.smtp_server, self.smtp_port)
            if self.use_tls:
                server.starttls()
            if self.sender_email and self.sender_password:
                server.login(self.sender_email, self.sender_password)
            server.quit()
            logger.info("Email server connection test successful")
            return True
        except Exception as e:
            logger.error(f"Email server connection test failed: {e}")
            return False