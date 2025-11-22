from fastapi import APIRouter, HTTPException, Query
from ..services.db_service import DBService
from ..services.slack_service import SlackService
from ..services.email_service import EmailService
from ..utils.logger import get_logger
from typing import Optional
import time

router = APIRouter()
logger = get_logger(__name__)
db_service = DBService()
slack_service = SlackService()
email_service = EmailService()

@router.get("/recent")
async def get_recent_alerts(limit: int = Query(50, description="Maximum number of alerts to return")):
    """Get recent security alerts"""
    try:
        alerts = db_service.get_recent_alerts(limit)
        return {
            "status": "success",
            "count": len(alerts),
            "alerts": alerts
        }
    except Exception as e:
        logger.error(f"Error getting recent alerts: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve alerts")

@router.put("/{alert_id}/resolve")
async def resolve_alert(alert_id: int):
    """Mark an alert as resolved"""
    try:
        success = db_service.resolve_alert(alert_id)
        if not success:
            raise HTTPException(status_code=404, detail="Alert not found")

        return {
            "status": "success",
            "message": f"Alert {alert_id} marked as resolved"
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error resolving alert {alert_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to resolve alert")

@router.post("/test/slack")
async def test_slack_notification():
    """Test Slack notification functionality"""
    try:
        success = slack_service.send_alert(
            "🧪 Test Alert from DevOps Fraud Shield\nThis is a test notification to verify Slack integration.",
            severity="low"
        )

        if success:
            return {
                "status": "success",
                "message": "Test Slack notification sent successfully"
            }
        else:
            raise HTTPException(status_code=500, detail="Failed to send Slack notification")

    except Exception as e:
        logger.error(f"Error testing Slack notification: {e}")
        raise HTTPException(status_code=500, detail="Slack test failed")

@router.post("/test/email")
async def test_email_notification():
    """Test email notification functionality"""
    try:
        success = email_service.send_alert(
            "Test Alert",
            "🧪 Test Alert from DevOps Fraud Shield\nThis is a test notification to verify email integration.",
            ["test@example.com"]  # In production, this should be configurable
        )

        if success:
            return {
                "status": "success",
                "message": "Test email sent successfully"
            }
        else:
            raise HTTPException(status_code=500, detail="Failed to send email")

    except Exception as e:
        logger.error(f"Error testing email notification: {e}")
        raise HTTPException(status_code=500, detail="Email test failed")

@router.get("/summary")
async def get_alerts_summary():
    """Get alerts summary statistics"""
    try:
        alerts = db_service.get_recent_alerts(1000)  # Get many for summary

        # Calculate summary statistics
        total_alerts = len(alerts)
        active_alerts = len([a for a in alerts if not a.get("resolved", False)])

        severity_counts = {}
        for alert in alerts:
            severity = alert.get("severity", "unknown")
            severity_counts[severity] = severity_counts.get(severity, 0) + 1

        # Group by type
        type_counts = {}
        for alert in alerts:
            alert_type = alert.get("type", "unknown")
            type_counts[alert_type] = type_counts.get(alert_type, 0) + 1

        return {
            "status": "success",
            "summary": {
                "total_alerts": total_alerts,
                "active_alerts": active_alerts,
                "severity_breakdown": severity_counts,
                "type_breakdown": type_counts,
                "generated_at": time.time()
            }
        }

    except Exception as e:
        logger.error(f"Error getting alerts summary: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate summary")

@router.post("/escalate/{alert_id}")
async def escalate_alert(alert_id: int, priority: Optional[str] = "high"):
    """Escalate an alert with higher priority notifications"""
    try:
        # Get alert details
        alerts = db_service.get_recent_alerts(1000)
        alert = next((a for a in alerts if a["id"] == alert_id), None)

        if not alert:
            raise HTTPException(status_code=404, detail="Alert not found")

        # Send escalated notifications
        message = f"🚨 ESCALATED ALERT 🚨\n\n{alert['message']}\n\nPriority: {priority.upper()}"

        # Send to Slack with high priority
        slack_service.send_alert(message, severity="high")

        # Send email to additional recipients
        email_service.send_alert(
            f"ESCALATED: {alert['type']}",
            message,
            ["security-lead@company.com", "devops-team@company.com"]  # Configurable
        )

        return {
            "status": "success",
            "message": f"Alert {alert_id} escalated with {priority} priority"
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error escalating alert {alert_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to escalate alert")