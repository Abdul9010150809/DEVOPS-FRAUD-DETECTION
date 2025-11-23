print("=== Starting DevOps Fraud Shield Backend ===")
print("Python path:", __file__)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os
from dotenv import load_dotenv

print("Basic imports completed")

# ------- Logger Safe Import -------
try:
    from src.utils.logger import get_logger
    from src.utils.config import Config
    logger = get_logger(__name__)
    print("Logger loaded")
except Exception as e:
    print("Logger failed:", e)
    import logging
    logging.basicConfig(level=logging.INFO)
    logger = logging.getLogger(__name__)

load_dotenv()

# ------- Create FastAPI App -------
app = FastAPI(title="DevOps Fraud Shield API", version="1.0.0")

# ------- CORS -------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

print("Including routers...")

# ------- Routers -------
# ---- SIMULATE ROUTER ----
try:
    from src.api import simulate_routes
    
    app.include_router(
        simulate_routes.router, 
        prefix="/api/simulate", 
        tags=["simulation"]
    )
    print("Simulate router loaded successfully (New File)")
except Exception as e:
    print("CRITICAL ERROR loading Simulate Router:", e)

try:
    from src.api.webhook_handler import router as webhook_router
    app.include_router(webhook_router, prefix="/api", tags=["webhook"])
except Exception as e:
    print("Webhook router error:", e)

try:
    from src.api.fraud_controller import router as fraud_router
    app.include_router(fraud_router, prefix="/api/fraud", tags=["fraud"])
except Exception as e:
    print("Fraud router error:", e)

try:
    from src.api.alerts_controller import router as alerts_router
    app.include_router(alerts_router, prefix="/api/alerts", tags=["alerts"])
except Exception as e:
    print("Alerts router error:", e)

print("Routers loaded successfully")

# ------- Base Routes -------
@app.get("/")
async def root():
    return {"message": "DevOps Fraud Shield API", "status": "running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

# ------- Start Server -------
if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
