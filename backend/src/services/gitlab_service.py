import requests
import os
from ..utils.logger import get_logger

logger = get_logger(__name__)

class GitLabService:
    def __init__(self):
        self.base_url = os.getenv("GITLAB_URL", "https://gitlab.com/api/v4")
        self.token = os.getenv("GITLAB_TOKEN", "")
        self.headers = {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json"
        }

    def get_project_commits(self, project_id, since=None, until=None, ref_name="main"):
        """Fetch commits for a GitLab project"""
        try:
            url = f"{self.base_url}/projects/{project_id}/repository/commits"
            params = {
                "ref_name": ref_name,
                "per_page": 100
            }
            if since:
                params["since"] = since
            if until:
                params["until"] = until

            response = requests.get(url, headers=self.headers, params=params)
            response.raise_for_status()

            commits = response.json()
            logger.info(f"Fetched {len(commits)} commits for project {project_id}")

            # Transform to our internal format
            transformed_commits = []
            for commit in commits:
                transformed_commits.append({
                    "id": commit["id"],
                    "message": commit["message"],
                    "author": commit["author_name"],
                    "timestamp": commit["created_at"],
                    "url": commit["web_url"]
                })

            return transformed_commits

        except Exception as e:
            logger.error(f"Error fetching commits for project {project_id}: {e}")
            return []

    def get_commit_details(self, project_id, commit_id):
        """Get detailed information about a specific commit"""
        try:
            url = f"{self.base_url}/projects/{project_id}/repository/commits/{commit_id}"
            response = requests.get(url, headers=self.headers)
            response.raise_for_status()

            commit = response.json()

            # Get diff for the commit
            diff_url = f"{self.base_url}/projects/{project_id}/repository/commits/{commit_id}/diff"
            diff_response = requests.get(diff_url, headers=self.headers)
            diff_response.raise_for_status()
            diffs = diff_response.json()

            # Extract file changes
            files_changed = []
            lines_added = 0
            lines_deleted = 0

            for diff in diffs:
                files_changed.append(diff["new_path"])
                # Simple line counting (not perfect but good enough)
                diff_content = diff["diff"]
                added = diff_content.count("\n+") if diff_content else 0
                deleted = diff_content.count("\n-") if diff_content else 0
                lines_added += added
                lines_deleted += deleted

            return {
                "id": commit["id"],
                "message": commit["message"],
                "author": commit["author_name"],
                "timestamp": commit["created_at"],
                "files_changed": files_changed,
                "lines_added": lines_added,
                "lines_deleted": lines_deleted,
                "diff": "\n".join([d["diff"] for d in diffs])
            }

        except Exception as e:
            logger.error(f"Error fetching commit details {commit_id}: {e}")
            return None

    def get_project_info(self, project_id):
        """Get basic project information"""
        try:
            url = f"{self.base_url}/projects/{project_id}"
            response = requests.get(url, headers=self.headers)
            response.raise_for_status()

            project = response.json()
            return {
                "id": project["id"],
                "name": project["name"],
                "description": project["description"],
                "web_url": project["web_url"],
                "created_at": project["created_at"],
                "last_activity_at": project["last_activity_at"],
                "visibility": project["visibility"]
            }

        except Exception as e:
            logger.error(f"Error fetching project info {project_id}: {e}")
            return None

    def get_project_contributors(self, project_id):
        """Get project contributors statistics"""
        try:
            url = f"{self.base_url}/projects/{project_id}/repository/contributors"
            response = requests.get(url, headers=self.headers)
            response.raise_for_status()

            contributors = response.json()
            return [
                {
                    "name": c["name"],
                    "email": c["email"],
                    "commits": c["commits"],
                    "additions": c["additions"],
                    "deletions": c["deletions"]
                }
                for c in contributors
            ]

        except Exception as e:
            logger.error(f"Error fetching contributors for project {project_id}: {e}")
            return []

    def test_connection(self):
        """Test GitLab API connection"""
        try:
            url = f"{self.base_url}/projects"
            params = {"per_page": 1}
            response = requests.get(url, headers=self.headers, params=params)
            response.raise_for_status()
            logger.info("GitLab API connection test successful")
            return True
        except Exception as e:
            logger.error(f"GitLab API connection test failed: {e}")
            return False