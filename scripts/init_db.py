#!/usr/bin/env python3
"""
Initialize the database with schema
"""
import sqlite3
import os

def init_database():
    # In Docker container, files are in /app
    # Locally, adjust paths accordingly
    if os.path.exists('/app/database/schema.sql'):
        # Docker environment
        db_path = '/app/database/fraud_logs.db'
        schema_path = '/app/database/schema.sql'
    else:
        # Local development
        db_path = os.path.join(os.path.dirname(__file__), '..', 'backend', 'database', 'fraud_logs.db')
        schema_path = os.path.join(os.path.dirname(__file__), '..', 'backend', 'database', 'schema.sql')

    # Create database directory if it doesn't exist
    os.makedirs(os.path.dirname(db_path), exist_ok=True)

    # Connect to database
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # Read and execute schema
    with open(schema_path, 'r') as f:
        schema_sql = f.read()

    cursor.executescript(schema_sql)
    conn.commit()
    conn.close()

    print("Database initialized successfully!")

if __name__ == "__main__":
    init_database()