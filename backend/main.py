print("=== Starting DevOps Fraud Shield Backend ===")
print("Python path:", __file__)

from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os
from dotenv import load_dotenv

print("Basic imports completed")

# Import our modules with error handling
logger = None
try:
    
    print("Importing logger and config...")
    from src.utils.logger import get_logger
    from src.utils.config import Config
    print("Logger and config imported successfully")
    logger = get_logger(__name__)
    print("Logger instance created")
except Exception as e:
    print(f"CRITICAL: Failed to import logger: {e}")
    import traceback
    traceback.print_exc()
    import logging
    logging.basicConfig(level=logging.INFO)
    logger = logging.getLogger(__name__)
    print("Fallback logger created")

load_dotenv()

app = FastAPI(title="DevOps Fraud Shield API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify allowed origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers with error handling
print("Including routers...")
try:
    print("Importing webhook router...")
    from src.api.webhook_handler import router as webhook_router
    print("Including webhook router in app...")
    app.include_router(webhook_router, prefix="/api", tags=["webhook"])
    print("Webhook router included successfully")
except Exception as e:
    print(f"Failed to include webhook router: {e}")
    import traceback
    traceback.print_exc()

try:
    print("Importing fraud router...")
    from src.api.fraud_controller import router as fraud_router
    print("Including fraud router in app...")
    app.include_router(fraud_router, prefix="/api/fraud", tags=["fraud"])
    print("Fraud router included successfully")
except Exception as e:
    print(f"Failed to include fraud router: {e}")
    import traceback
    traceback.print_exc()

try:
    print("Importing alerts router...")
    from src.api.alerts_controller import router as alerts_router
    print("Including alerts router in app...")
    app.include_router(alerts_router, prefix="/api/alerts", tags=["alerts"])
    print("Alerts router included successfully")
except Exception as e:
    print(f"Failed to include alerts router: {e}")
    import traceback
    traceback.print_exc()

print("Router inclusion complete")

logger = get_logger(__name__)

@app.get("/")
async def root():
    return {"message": "DevOps Fraud Shield API", "status": "running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)