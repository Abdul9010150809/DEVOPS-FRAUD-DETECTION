from fastapi import APIRouter
from datetime import datetime, timezone
import random

# 1. Define the Router
# We set prefix="/api" here. 
# Since the route below is "/simulate", the final URL will be: /api/simulate
router = APIRouter(
    prefix="/api",
    tags=["simulation"]
)

# 2. Define the Endpoint
@router.get("/simulate")
async def simulate_fraud_event():
    """
    Simulates a fraudulent commit event.
    Accessible at: GET /api/simulate
    """
    
    # Generate a fake event ID and commit ID
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