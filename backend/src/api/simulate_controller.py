# backend/src/api/simulate_controller.py

from fastapi import APIRouter
from datetime import datetime
import random

router = APIRouter(
    prefix="/api",
    tags=["simulation"]
)

@router.get("/simulate")
async def simulate_fraud_event():
    """
    Simulates a fraudulent commit event for testing
    the dashboard & fraud detection pipeline.
    """

    event = {
        "event_id": random.randint(1000, 9999),
        "timestamp": datetime.utcnow().isoformat(),
        "risk_score": round(random.uniform(0.75, 1.0), 2),
        "message": "Simulated fraudulent commit detected",
        "activity": {
            "commit_id": f"sim-{random.randint(10000, 99999)}",
            "author": "unknown_user",
            "changes_detected": ["config.yaml", "credentials.txt"],
            "flags": [
                "suspicious_file_change",
                "high_entropy_data"
            ]
        }
    }

    return {
        "status": "success",
        "fraud_event": event
    }
