#!/usr/bin/env python3
"""
Test script to check if all imports work correctly
"""
import sys
import os

# Add src to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

def test_imports():
    print("Testing imports...")

    try:
        # Test core imports
        from core.fraud_engine import FraudEngine
        print("✓ FraudEngine imported")

        from core.ai_analyzer import AIAnalyzer
        print("✓ AIAnalyzer imported")

        from core.rule_engine import RuleEngine
        print("✓ RuleEngine imported")

        from core.risk_scorer import RiskScorer
        print("✓ RiskScorer imported")

        # Test service imports
        from services.db_service import DBService
        print("✓ DBService imported")

        from services.gitlab_service import GitLabService
        print("✓ GitLabService imported")

        # Test API router imports
        from api.webhook_handler import router as webhook_router
        print("✓ Webhook router imported")

        from api.fraud_controller import router as fraud_router
        print("✓ Fraud router imported")

        from api.alerts_controller import router as alerts_router
        print("✓ Alerts router imported")

        # Test utils
        from utils.logger import get_logger
        print("✓ Logger imported")

        from utils.config import Config
        print("✓ Config imported")

        print("\n🎉 All imports successful!")

        # Test router contents
        print(f"\nRouter contents:")
        print(f"Webhook routes: {len(webhook_router.routes)}")
        print(f"Fraud routes: {len(fraud_router.routes)}")
        print(f"Alerts routes: {len(alerts_router.routes)}")

        return True

    except Exception as e:
        print(f"❌ Import failed: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    test_imports()