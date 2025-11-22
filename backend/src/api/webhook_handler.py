from fastapi import APIRouter, Request, HTTPException, BackgroundTasks
from ..core.fraud_engine import FraudEngine
from ..services.gitlab_service import GitLabService
from ..utils.logger import get_logger
from ..utils.validator import WebhookValidator
import hmac
import hashlib
import json

router = APIRouter()
logger = get_logger(__name__)
fraud_engine = FraudEngine()
gitlab_service = GitLabService()
validator = WebhookValidator()

@router.post("/webhook")
async def handle_webhook(request: Request, background_tasks: BackgroundTasks):
    """Handle incoming webhooks from GitLab/GitHub"""
    try:
        # Get raw body for signature verification
        body = await request.body()
        payload = json.loads(body.decode('utf-8'))

        # Verify webhook signature if configured
        signature = request.headers.get('X-Gitlab-Token') or request.headers.get('X-Hub-Signature-256')
        if signature and not validator.verify_signature(body, signature, request.headers.get('X-Gitlab-Event')):
            raise HTTPException(status_code=401, detail="Invalid webhook signature")

        event_type = request.headers.get('X-Gitlab-Event') or request.headers.get('X-Github-Event')

        if event_type == 'push':
            background_tasks.add_task(process_push_event, payload)
            return {"status": "accepted", "message": "Push event queued for analysis"}

        elif event_type == 'merge_request' or event_type == 'pull_request':
            background_tasks.add_task(process_merge_event, payload)
            return {"status": "accepted", "message": "Merge event queued for analysis"}

        else:
            logger.info(f"Unhandled event type: {event_type}")
            return {"status": "ignored", "message": f"Event type {event_type} not processed"}

    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON payload")
    except Exception as e:
        logger.error(f"Error processing webhook: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

def process_push_event(payload):
    """Process push event in background"""
    try:
        logger.info("Processing push event")

        # Extract repository information
        repo = payload.get('repository', {})
        project_id = repo.get('id') or repo.get('full_name', '').replace('/', '%2F')

        # Get commits from the push
        commits = payload.get('commits', [])

        if not commits:
            logger.info("No commits in push event")
            return

        # Transform commits to our format
        transformed_commits = []
        for commit in commits:
            transformed_commits.append({
                "id": commit.get('id'),
                "message": commit.get('message'),
                "author": commit.get('author', {}).get('name'),
                "timestamp": commit.get('timestamp'),
                "files_changed": [],  # Will be filled by detailed fetch if needed
                "lines_added": 0,
                "lines_deleted": 0
            })

        # Get detailed commit information if we have GitLab service
        if project_id and gitlab_service.token:
            for i, commit in enumerate(transformed_commits):
                details = gitlab_service.get_commit_details(project_id, commit['id'])
                if details:
                    transformed_commits[i] = details

        # Prepare repository data
        repo_data = {
            "name": repo.get('name', 'unknown'),
            "id": project_id,
            "url": repo.get('url') or repo.get('html_url'),
            "timestamp": payload.get('timestamp') or __import__('time').time(),
            "commits": transformed_commits
        }

        # Run fraud analysis
        result = fraud_engine.analyze_repository(repo_data, transformed_commits)

        logger.info(f"Push event analysis completed for {repo_data['name']}")

    except Exception as e:
        logger.error(f"Error processing push event: {e}")

def process_merge_event(payload):
    """Process merge/pull request event"""
    try:
        logger.info("Processing merge/pull request event")

        # Extract relevant information
        pr = payload.get('object_attributes', {}) if 'object_attributes' in payload else payload

        if pr.get('state') != 'merged':
            logger.info("PR not merged, skipping analysis")
            return

        # For merged PRs, we could analyze the commits
        # This is a simplified version - in production you'd want more detailed analysis

        logger.info(f"Merged PR analysis completed for {pr.get('title', 'unknown')}")

    except Exception as e:
        logger.error(f"Error processing merge event: {e}")

@router.get("/webhook/test")
async def test_webhook():
    """Test endpoint for webhook functionality"""
    return {
        "status": "ok",
        "message": "Webhook endpoint is active",
        "supported_events": ["push", "merge_request", "pull_request"]
    }