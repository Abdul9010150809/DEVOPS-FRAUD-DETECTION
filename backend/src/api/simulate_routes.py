from fastapi import APIRouter
from datetime import datetime, timezone
import random

# Router prefix is handled in main.py, so we keep this empty
router = APIRouter() 

@router.get("/")
async def simulate_fraud_event():
    """
    Generates fake fraud data for the dashboard.
    Route: GET /api/simulate/ (via main.py inclusion)
    """
    
    # 1. Randomize Data
    event_id = random.randint(1000, 9999)
    commit_suffix = random.randint(10000, 99999)
    risk_val = round(random.uniform(0.75, 1.0), 2)
    
    # 2. Build the Event Object
    event = {
        "event_id": event_id,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "risk_score": risk_val,
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

    # 3. Return it
    return {
        "status": "success",
        "fraud_event": event
    }