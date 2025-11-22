import sqlite3
import json
import os
from datetime import datetime

class DBService:
    def __init__(self, db_path=None):
        # Use absolute path resolution
        if db_path:
            self.db_path = db_path
        elif os.getenv("DB_PATH"):
            self.db_path = os.getenv("DB_PATH")
        else:
            # From backend/src/services/ -> backend/database/
            self.db_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../database/fraud_logs.db'))

        # Don't initialize database during import - do it lazily
        self._initialized = False
        self._logger = None

    @property
    def logger(self):
        """Lazy logger initialization"""
        if self._logger is None:
            from ..utils.logger import get_logger
            self._logger = get_logger(__name__)
        return self._logger

    def _ensure_tables(self):
        """Create database tables if they don't exist"""
        if self._initialized:
            return

        # Ensure database directory exists
        db_dir = os.path.dirname(self.db_path)
        if db_dir and not os.path.exists(db_dir):
            os.makedirs(db_dir)

        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()

            # Analysis results table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS analysis_results (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    repository TEXT NOT NULL,
                    timestamp REAL,
                    risk_score REAL,
                    ai_analysis TEXT,
                    rule_violations TEXT,
                    recommendations TEXT,
                    created_at REAL DEFAULT (datetime('now'))
                )
            ''')

            # Commit analysis table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS commit_analysis (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    commit_id TEXT NOT NULL,
                    risk_score REAL,
                    ai_analysis TEXT,
                    rule_violations TEXT,
                    created_at REAL DEFAULT (datetime('now'))
                )
            ''')

            # Alerts table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS alerts (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    type TEXT NOT NULL,
                    severity TEXT,
                    message TEXT,
                    repository TEXT,
                    commit_id TEXT,
                    resolved BOOLEAN DEFAULT FALSE,
                    created_at REAL DEFAULT (datetime('now'))
                )
            ''')

            conn.commit()
            self._initialized = True
            self.logger.info("Database tables ensured")

    def store_analysis_result(self, result):
        """Store repository analysis result"""
        self._ensure_tables()
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute('''
                    INSERT INTO analysis_results
                    (repository, timestamp, risk_score, ai_analysis, rule_violations, recommendations)
                    VALUES (?, ?, ?, ?, ?, ?)
                ''', (
                    result.get('repository'),
                    result.get('timestamp'),
                    result.get('risk_score'),
                    json.dumps(result.get('ai_analysis', {})),
                    json.dumps(result.get('rule_violations', [])),
                    json.dumps(result.get('recommendations', []))
                ))
                conn.commit()
                self.logger.info(f"Stored analysis result for {result.get('repository')}")
        except Exception as e:
            self.logger.error(f"Error storing analysis result: {e}")

    def store_commit_analysis(self, result):
        """Store individual commit analysis"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute('''
                    INSERT INTO commit_analysis
                    (commit_id, risk_score, ai_analysis, rule_violations)
                    VALUES (?, ?, ?, ?)
                ''', (
                    result.get('commit_id'),
                    result.get('risk_score'),
                    json.dumps(result.get('ai_analysis', {})),
                    json.dumps(result.get('rule_violations', []))
                ))
                conn.commit()
                self.logger.info(f"Stored commit analysis for {result.get('commit_id')}")
        except Exception as e:
            self.logger.error(f"Error storing commit analysis: {e}")

    def store_alert(self, alert_type, severity, message, repository=None, commit_id=None):
        """Store an alert"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute('''
                    INSERT INTO alerts (type, severity, message, repository, commit_id)
                    VALUES (?, ?, ?, ?, ?)
                ''', (alert_type, severity, message, repository, commit_id))
                conn.commit()
                self.logger.info(f"Stored alert: {alert_type}")
        except Exception as e:
            self.logger.error(f"Error storing alert: {e}")

    def get_recent_alerts(self, limit=50):
        """Get recent alerts"""
        self._ensure_tables()
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute('''
                    SELECT id, type, severity, message, repository, commit_id, created_at
                    FROM alerts
                    WHERE resolved = FALSE
                    ORDER BY created_at DESC
                    LIMIT ?
                ''', (limit,))
                rows = cursor.fetchall()

                alerts = []
                for row in rows:
                    alerts.append({
                        "id": row[0],
                        "type": row[1],
                        "severity": row[2],
                        "message": row[3],
                        "repository": row[4],
                        "commit_id": row[5],
                        "created_at": row[6]
                    })
                return alerts
        except Exception as e:
            self.logger.error(f"Error getting recent alerts: {e}")
            return []

    def get_fraud_stats(self):
        """Get overall fraud statistics"""
        self._ensure_tables()
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()

                # Get total analyses
                cursor.execute('SELECT COUNT(*) FROM analysis_results')
                total_analyses = cursor.fetchone()[0]

                # Get high-risk analyses
                cursor.execute('SELECT COUNT(*) FROM analysis_results WHERE risk_score > 0.7')
                high_risk = cursor.fetchone()[0]

                # Get recent alerts count
                cursor.execute('SELECT COUNT(*) FROM alerts WHERE resolved = FALSE')
                active_alerts = cursor.fetchone()[0]

                # Get average risk score
                cursor.execute('SELECT AVG(risk_score) FROM analysis_results')
                avg_risk = cursor.fetchone()[0] or 0.0

                return {
                    "total_analyses": total_analyses,
                    "high_risk_analyses": high_risk,
                    "active_alerts": active_alerts,
                    "average_risk_score": round(avg_risk, 3)
                }
        except Exception as e:
            self.logger.error(f"Error getting fraud stats: {e}")
            return {
                "total_analyses": 0,
                "high_risk_analyses": 0,
                "active_alerts": 0,
                "average_risk_score": 0.0
            }

    def resolve_alert(self, alert_id):
        """Mark an alert as resolved"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute('UPDATE alerts SET resolved = TRUE WHERE id = ?', (alert_id,))
                conn.commit()
                self.logger.info(f"Resolved alert {alert_id}")
            return True
        except Exception as e:
            self.logger.error(f"Error resolving alert: {e}")
            return False