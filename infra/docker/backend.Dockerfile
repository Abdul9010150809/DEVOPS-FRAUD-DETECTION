# DevOps Fraud Shield Backend Dockerfile
FROM python:3.9-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY backend/requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source code
COPY backend/ .

# Copy init script
COPY scripts/init_db.py .

# Create database directory
RUN mkdir -p database

# Expose port
EXPOSE 8000

# Set environment variables
ENV PYTHONPATH=/app
ENV PYTHONUNBUFFERED=1

# Initialize database and run the application
CMD ["sh", "-c", "echo '=== CONTAINER START ===' && ls -la && echo '=== RUNNING INIT ===' && python -u init_db.py && echo '=== RUNNING MAIN ===' && python -u main.py"]