-- DevOps Fraud Shield Database Schema
-- SQLite database for storing analysis results, alerts, and commit data

-- Analysis results table
-- Stores results of fraud analysis for repositories
CREATE TABLE IF NOT EXISTS analysis_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    repository TEXT NOT NULL,
    timestamp REAL,
    risk_score REAL,
    ai_analysis TEXT,  -- JSON string
    rule_violations TEXT,  -- JSON string
    recommendations TEXT,  -- JSON string
    created_at REAL DEFAULT (datetime('now')),
    updated_at REAL DEFAULT (datetime('now'))
);

-- Commit analysis table
-- Stores individual commit analysis results
CREATE TABLE IF NOT EXISTS commit_analysis (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    commit_id TEXT NOT NULL UNIQUE,
    risk_score REAL,
    ai_analysis TEXT,  -- JSON string
    rule_violations TEXT,  -- JSON string
    repository TEXT,
    author TEXT,
    message TEXT,
    created_at REAL DEFAULT (datetime('now'))
);

-- Alerts table
-- Stores security alerts and notifications
CREATE TABLE IF NOT EXISTS alerts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,  -- e.g., 'fraud_detected', 'suspicious_activity'
    severity TEXT CHECK(severity IN ('low', 'medium', 'high', 'critical')),
    message TEXT NOT NULL,
    repository TEXT,
    commit_id TEXT,
    resolved BOOLEAN DEFAULT FALSE,
    resolved_at REAL,
    created_at REAL DEFAULT (datetime('now')),
    updated_at REAL DEFAULT (datetime('now'))
);

-- Repositories table
-- Stores information about monitored repositories
CREATE TABLE IF NOT EXISTS repositories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    url TEXT,
    platform TEXT CHECK(platform IN ('gitlab', 'github', 'bitbucket')),
    project_id TEXT,
    last_analysis REAL,
    total_commits INTEGER DEFAULT 0,
    risk_trend TEXT,  -- 'increasing', 'decreasing', 'stable'
    created_at REAL DEFAULT (datetime('now')),
    updated_at REAL DEFAULT (datetime('now'))
);

-- Contributors table
-- Stores information about repository contributors
CREATE TABLE IF NOT EXISTS contributors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    repository TEXT NOT NULL,
    username TEXT NOT NULL,
    email TEXT,
    total_commits INTEGER DEFAULT 0,
    risk_score REAL DEFAULT 0.0,
    trust_level TEXT CHECK(trust_level IN ('high', 'medium', 'low', 'unknown')),
    first_seen REAL,
    last_seen REAL,
    created_at REAL DEFAULT (datetime('now')),
    updated_at REAL DEFAULT (datetime('now')),
    UNIQUE(repository, username)
);

-- Webhook logs table
-- Stores incoming webhook payloads for auditing
CREATE TABLE IF NOT EXISTS webhook_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_type TEXT,
    repository TEXT,
    payload TEXT,  -- JSON string
    signature_valid BOOLEAN,
    processed BOOLEAN DEFAULT FALSE,
    processing_time REAL,
    created_at REAL DEFAULT (datetime('now'))
);

-- ML model performance table
-- Tracks ML model accuracy and performance metrics
CREATE TABLE IF NOT EXISTS ml_performance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    model_version TEXT,
    accuracy REAL,
    precision REAL,
    recall REAL,
    f1_score REAL,
    training_data_size INTEGER,
    created_at REAL DEFAULT (datetime('now'))
);

-- Audit log table
-- General audit log for system actions
CREATE TABLE IF NOT EXISTS audit_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    action TEXT NOT NULL,
    user TEXT,  -- if applicable
    resource TEXT,
    details TEXT,  -- JSON string
    ip_address TEXT,
    user_agent TEXT,
    created_at REAL DEFAULT (datetime('now'))
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_analysis_results_repository ON analysis_results(repository);
CREATE INDEX IF NOT EXISTS idx_analysis_results_timestamp ON analysis_results(timestamp);
CREATE INDEX IF NOT EXISTS idx_commit_analysis_commit_id ON commit_analysis(commit_id);
CREATE INDEX IF NOT EXISTS idx_alerts_type ON alerts(type);
CREATE INDEX IF NOT EXISTS idx_alerts_severity ON alerts(severity);
CREATE INDEX IF NOT EXISTS idx_alerts_resolved ON alerts(resolved);
CREATE INDEX IF NOT EXISTS idx_repositories_name ON repositories(name);
CREATE INDEX IF NOT EXISTS idx_contributors_repository ON contributors(repository);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_event_type ON webhook_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON audit_log(action);

-- Views for common queries
CREATE VIEW IF NOT EXISTS recent_alerts AS
SELECT * FROM alerts
WHERE resolved = FALSE
ORDER BY created_at DESC
LIMIT 100;

CREATE VIEW IF NOT EXISTS high_risk_analysis AS
SELECT * FROM analysis_results
WHERE risk_score > 0.7
ORDER BY timestamp DESC;

CREATE VIEW IF NOT EXISTS repository_stats AS
SELECT
    r.name,
    r.total_commits,
    COUNT(ar.id) as analysis_count,
    AVG(ar.risk_score) as avg_risk_score,
    MAX(ar.timestamp) as last_analysis
FROM repositories r
LEFT JOIN analysis_results ar ON r.name = ar.repository
GROUP BY r.name;

-- Triggers for automatic timestamp updates
CREATE TRIGGER IF NOT EXISTS update_analysis_results_timestamp
    AFTER UPDATE ON analysis_results
BEGIN
    UPDATE analysis_results SET updated_at = datetime('now') WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_alerts_timestamp
    AFTER UPDATE ON alerts
BEGIN
    UPDATE alerts SET updated_at = datetime('now') WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_repositories_timestamp
    AFTER UPDATE ON repositories
BEGIN
    UPDATE repositories SET updated_at = datetime('now') WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_contributors_timestamp
    AFTER UPDATE ON contributors
BEGIN
    UPDATE contributors SET updated_at = datetime('now') WHERE id = NEW.id;
END;