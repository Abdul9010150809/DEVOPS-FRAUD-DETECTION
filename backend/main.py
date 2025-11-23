print("=== Starting DevOps Fraud Shield Backend ===")
print("Python path:", __file__)

from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware

import uvicorn
import os
from dotenv import load_dotenv

print("Basic imports completed")

# Import logger safely
try:
    print("Importing logger and config...")
    from src.utils.logger import get_logger
    from src.utils.config import Config
    logger = get_logger(__name__)
    print("Logger and config imported successfully")
except Exception as e:
    print(f"CRITICAL: Failed to import logger: {e}")
    import traceback
    traceback.print_exc()
    import logging
    logging.basicConfig(level=logging.INFO)
    logger = logging.getLogger(__name__)
    print("Fallback logger created")

load_dotenv()

# ✅ CREATE FASTAPI APP FIRST
app = FastAPI(title="DevOps Fraud Shield API", version="1.0.0")

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

print("Including routers...")

# ✅ Include routers AFTER app is created
try:
    print("Importing simulate router...")
    from src.api.simulate import router as simulate_router
    app.include_router(simulate_router, prefix="/api", tags=["simulate"])
    print("Simulate router included successfully")
except Exception as e:
    print(f"Failed to include simulate router: {e}")
    import traceback
    traceback.print_exc()

try:
    print("Importing webhook router...")
    from src.api.webhook_handler import router as webhook_router
    app.include_router(webhook_router, prefix="/api", tags=["webhook"])
    print("Webhook router included successfully")
except Exception as e:
    print(f"Failed to include webhook router: {e}")
    import traceback
    traceback.print_exc()

try:
    print("Importing fraud router...")
    from src.api.fraud_controller import router as fraud_router
    app.include_router(fraud_router, prefix="/api/fraud", tags=["fraud"])
    print("Fraud router included successfully")
except Exception as e:
    print(f"Failed to include fraud router: {e}")
    import traceback
    traceback.print_exc()

try:
    print("Importing alerts router...")
    from src.api.alerts_controller import router as alerts_router
    app.include_router(alerts_router, prefix="/api/alerts", tags=["alerts"])
    print("Alerts router included successfully")
except Exception as e:
    print(f"Failed to include alerts router: {e}")
    import traceback
    traceback.print_exc()

print("Router inclusion complete")

# Base routes
@app.get("/")
async def root():
    return {"message": "DevOps Fraud Shield API", "status": "running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
