#!/usr/bin/env python3
"""
DevOps Fraud Shield Database Seeding Script
This script populates the database with sample data for testing and development.
"""

import sqlite3
import json
import random
from datetime import datetime, timedelta
import os
import sys

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from src.utils.logger import get_logger

logger = get_logger(__name__)

def get_db_connection():
    """Get database connection"""
    db_path = os.path.join(os.path.dirname(__file__), '..', 'backend', 'database', 'fraud_logs.db')
    return sqlite3.connect(db_path)

def seed_analysis_results(conn):
    """Seed analysis results table"""
    logger.info("Seeding analysis results...")

    # Sample repositories
    repositories = [
        "example/frontend-app",
        "example/backend-api",
        "example/mobile-app",
        "example/data-pipeline",
        "example/devops-tools"
    ]

    analyses = []
    base_time = datetime.now() - timedelta(days=30)

    for i in range(50):
        repo = random.choice(repositories)
        timestamp = base_time + timedelta(days=random.randint(0, 30), hours=random.randint(0, 23))

        # Generate realistic risk scores
        base_risk = random.uniform(0.1, 0.9)
        ai_score = min(1.0, base_risk + random.uniform(-0.2, 0.2))

        analysis = {
            "repository": repo,
            "timestamp": timestamp.timestamp(),
            "risk_score": round(base_risk, 3),
            "ai_analysis": json.dumps({
                "anomaly_score": round(ai_score, 3),
                "is_anomaly": ai_score > 0.7,
                "details": {
                    "total_commits": random.randint(1, 20),
                    "anomalous_commits": random.randint(0, 5)
                }
            }),
            "rule_violations": json.dumps(
                random.sample([
                    {"type": "suspicious_commit_message", "severity": "medium"},
                    {"type": "large_file_changes", "severity": "low"},
                    {"type": "sensitive_file_modification", "severity": "high"}
                ], random.randint(0, 2))
            ),
            "recommendations": json.dumps([
                "Review recent commits carefully",
                "Monitor contributor activity",
                "Consider additional security measures"
            ])
        }
        analyses.append(analysis)

    cursor = conn.cursor()
    for analysis in analyses:
        cursor.execute('''
            INSERT INTO analysis_results
            (repository, timestamp, risk_score, ai_analysis, rule_violations, recommendations)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (
            analysis["repository"],
            analysis["timestamp"],
            analysis["risk_score"],
            analysis["ai_analysis"],
            analysis["rule_violations"],
            analysis["recommendations"]
        ))

    conn.commit()
    logger.info(f"Inserted {len(analyses)} analysis results")

def seed_alerts(conn):
    """Seed alerts table"""
    logger.info("Seeding alerts...")

    alert_types = [
        "fraud_detected",
        "suspicious_activity",
        "high_risk_commit",
        "security_violation",
        "anomaly_detected"
    ]

    severities = ["low", "medium", "high", "critical"]
    repositories = ["example/frontend-app", "example/backend-api", "example/devops-tools"]

    alerts = []
    base_time = datetime.now() - timedelta(days=7)

    for i in range(25):
        timestamp = base_time + timedelta(days=random.randint(0, 7), hours=random.randint(0, 23))

        alert = {
            "type": random.choice(alert_types),
            "severity": random.choice(severities),
            "message": f"Security alert: {random.choice(alert_types).replace('_', ' ')} detected",
            "repository": random.choice(repositories),
            "commit_id": f"{random.randint(100000, 999999)}abc",
            "resolved": random.choice([True, False])
        }
        alerts.append((alert, timestamp.timestamp()))

    cursor = conn.cursor()
    for alert, timestamp in alerts:
        cursor.execute('''
            INSERT INTO alerts
            (type, severity, message, repository, commit_id, resolved, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (
            alert["type"],
            alert["severity"],
            alert["message"],
            alert["repository"],
            alert["commit_id"],
            alert["resolved"],
            timestamp
        ))

    conn.commit()
    logger.info(f"Inserted {len(alerts)} alerts")

def seed_commit_analysis(conn):
    """Seed commit analysis table"""
    logger.info("Seeding commit analysis...")

    commits = []
    repositories = ["example/frontend-app", "example/backend-api"]

    for i in range(30):
        commit = {
            "commit_id": f"commit_{random.randint(100000, 999999)}",
            "risk_score": round(random.uniform(0.0, 1.0), 3),
            "ai_analysis": json.dumps({
                "anomaly_score": round(random.uniform(0.0, 1.0), 3),
                "is_anomaly": random.choice([True, False])
            }),
            "rule_violations": json.dumps(
                random.sample([
                    {"type": "suspicious_message", "severity": "low"},
                    {"type": "code_injection", "severity": "high"}
                ], random.randint(0, 1))
            ),
            "repository": random.choice(repositories),
            "author": random.choice(["alice@example.com", "bob@example.com", "charlie@example.com"]),
            "message": random.choice([
                "Fix bug in authentication",
                "Add new feature",
                "Update dependencies",
                "Refactor code",
                "Emergency security fix"
            ])
        }
        commits.append(commit)

    cursor = conn.cursor()
    for commit in commits:
        cursor.execute('''
            INSERT INTO commit_analysis
            (commit_id, risk_score, ai_analysis, rule_violations, repository, author, message)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (
            commit["commit_id"],
            commit["risk_score"],
            commit["ai_analysis"],
            commit["rule_violations"],
            commit["repository"],
            commit["author"],
            commit["message"]
        ))

    conn.commit()
    logger.info(f"Inserted {len(commits)} commit analyses")

def main():
    """Main seeding function"""
    logger.info("Starting database seeding...")

    try:
        conn = get_db_connection()

        # Seed data
        seed_analysis_results(conn)
        seed_alerts(conn)
        seed_commit_analysis(conn)

        conn.close()

        logger.info("Database seeding completed successfully!")

    except Exception as e:
        logger.error(f"Error during database seeding: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()