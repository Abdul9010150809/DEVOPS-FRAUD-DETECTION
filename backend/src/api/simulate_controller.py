# FILE: backend/src/api/simulate_controller.py

from fastapi import APIRouter
from datetime import datetime, timezone
import random

# FIXED: Removed 'backend.' imports causing the crash
# FIXED: Added prefix="/api" so the URL works

router = APIRouter(
    prefix="/api",
    tags=["simulation"]
)

@router.get("/simulate")
async def simulate_fraud_event():
    """
    Simulates a fraudulent commit event.
    Accessible at: GET /api/simulate
    """
    
    event_id = random.randint(1000, 9999)
    commit_suffix = random.randint(10000, 99999)

    event = {
        "event_id": event_id,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "risk_score": round(random.uniform(0.75, 1.0), 2),
        "message": "Simulated fraudulent commit detected",
        "activity": {
            "commit_id": f"sim-{commit_suffix}",
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