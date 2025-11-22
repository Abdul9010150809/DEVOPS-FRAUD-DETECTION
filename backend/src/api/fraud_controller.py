from fastapi import APIRouter, HTTPException, Query
from ..core.fraud_engine import FraudEngine
from ..services.gitlab_service import GitLabService
from ..services.db_service import DBService
from ..utils.logger import get_logger
from typing import Optional
import time

router = APIRouter()
logger = get_logger(__name__)
fraud_engine = FraudEngine()
gitlab_service = GitLabService()
db_service = DBService()

@router.post("/analyze")
async def analyze_repository(project_id: str = Query(..., description="GitLab project ID")):
    """Manually trigger fraud analysis for a repository"""
    try:
        logger.info(f"Manual analysis requested for project {project_id}")

        # Get project information
        project_info = gitlab_service.get_project_info(project_id)
        if not project_info:
            raise HTTPException(status_code=404, detail="Project not found")

        # Get recent commits
        commits = gitlab_service.get_project_commits(project_id)
        if not commits:
            return {
                "status": "no_commits",
                "message": "No commits found for analysis",
                "project": project_info["name"]
            }

        # Get detailed commit information
        detailed_commits = []
        for commit in commits[:10]:  # Limit to last 10 commits for performance
            details = gitlab_service.get_commit_details(project_id, commit["id"])
            if details:
                detailed_commits.append(details)

        # Get contributors
        contributors = gitlab_service.get_project_contributors(project_id)

        # Prepare repository data
        repo_data = {
            "name": project_info["name"],
            "id": project_id,
            "url": project_info["web_url"],
            "timestamp": time.time(),
            "commits": detailed_commits,
            "contributors": contributors
        }

        # Run analysis
        result = fraud_engine.analyze_repository(repo_data, detailed_commits)

        return {
            "status": "completed",
            "project": project_info["name"],
            "analysis": result
        }

    except Exception as e:
        logger.error(f"Error in manual analysis: {e}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@router.get("/stats")
async def get_fraud_stats():
    """Get overall fraud detection statistics"""
    try:
        stats = db_service.get_fraud_stats()
        return {
            "status": "success",
            "data": stats
        }
    except Exception as e:
        logger.error(f"Error getting fraud stats: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve statistics")

@router.get("/repositories/{project_id}/risk")
async def get_repository_risk(project_id: str):
    """Get risk assessment for a specific repository"""
    try:
        # Get recent analysis for this repository
        # This is a simplified version - in a real implementation you'd query the database
        # for the most recent analysis of this specific repository

        # For now, return mock data
        return {
            "project_id": project_id,
            "current_risk_score": 0.15,
            "last_analysis": time.time() - 3600,  # 1 hour ago
            "trend": "stable",
            "recommendations": [
                "Regular code reviews recommended",
                "Monitor contributor activity"
            ]
        }

    except Exception as e:
        logger.error(f"Error getting repository risk: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve risk assessment")

@router.post("/repositories/{project_id}/scan")
async def scan_repository(project_id: str, depth: Optional[int] = 50):
    """Perform a deep scan of repository commits"""
    try:
        logger.info(f"Deep scan requested for project {project_id} with depth {depth}")

        # Get commits with specified depth
        commits = gitlab_service.get_project_commits(project_id)
        commits = commits[:depth] if commits else []

        if not commits:
            raise HTTPException(status_code=404, detail="No commits found")

        # Analyze each commit individually
        results = []
        for commit in commits:
            details = gitlab_service.get_commit_details(project_id, commit["id"])
            if details:
                result = fraud_engine.analyze_commit(details)
                results.append({
                    "commit_id": commit["id"],
                    "risk_score": result["risk_score"],
                    "violations": len(result["rule_violations"])
                })

        # Calculate aggregate statistics
        total_commits = len(results)
        high_risk_commits = len([r for r in results if r["risk_score"] > 0.7])
        avg_risk = sum(r["risk_score"] for r in results) / total_commits if total_commits > 0 else 0

        return {
            "status": "completed",
            "project_id": project_id,
            "total_commits_scanned": total_commits,
            "high_risk_commits": high_risk_commits,
            "average_risk_score": round(avg_risk, 3),
            "results": results[:10]  # Return top 10 results
        }

    except Exception as e:
        logger.error(f"Error in repository scan: {e}")
        raise HTTPException(status_code=500, detail=f"Scan failed: {str(e)}")

@router.get("/health/ml")
async def check_ml_health():
    """Check ML model health and status"""
    try:
        # Simple health check - in production you'd check model loading, accuracy, etc.
        return {
            "status": "healthy",
            "model_loaded": True,
            "last_updated": "2024-01-01T00:00:00Z",  # Mock timestamp
            "accuracy_score": 0.85
        }
    except Exception as e:
        logger.error(f"ML health check failed: {e}")
        return {
            "status": "unhealthy",
            "error": str(e)
        }