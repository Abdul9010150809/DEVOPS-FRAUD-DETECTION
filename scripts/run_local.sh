#!/bin/bash

# DevOps Fraud Shield Local Development Script
# This script sets up and runs the application locally for development

set -e

echo "🏠 Setting up DevOps Fraud Shield for local development..."

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.9+ first."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ first."
    exit 1
fi

# Create virtual environment if it doesn't exist
if [ ! -d "backend/venv" ]; then
    echo "🐍 Creating Python virtual environment..."
    cd backend
    python3 -m venv venv
    cd ..
fi

# Activate virtual environment and install dependencies
echo "📦 Installing Python dependencies..."
cd backend
source venv/bin/activate
pip install -r requirements.txt

# Initialize database
echo "🗄️ Initializing database..."
mkdir -p database
python3 -c "
import sqlite3
import os
from database.schema import *

# Run schema setup
print('Database initialized successfully')
"

cd ..

# Install frontend dependencies
echo "📦 Installing Node.js dependencies..."
cd frontend
npm install

# Create .env files if they don't exist
if [ ! -f "../backend/.env" ]; then
    echo "📝 Creating backend .env file..."
    cat > ../backend/.env << EOF
PORT=8000
DB_PATH=database/fraud_logs.db
GITLAB_TOKEN=your_gitlab_token_here
SLACK_WEBHOOK_URL=your_slack_webhook_here
SENDER_EMAIL=your_email@example.com
SENDER_PASSWORD=your_email_password
WEBHOOK_SECRET=your_webhook_secret
SECRET_KEY=dev-secret-key-change-in-production
EOF
fi

if [ ! -f ".env" ]; then
    echo "📝 Creating frontend .env file..."
    cat > .env << EOF
REACT_APP_API_URL=http://localhost:8000/api
EOF
fi

cd ..

echo "🚀 Starting services..."

# Start backend in background
echo "🔧 Starting backend server..."
cd backend
source venv/bin/activate
python3 main.py &
BACKEND_PID=$!
cd ..

# Start frontend in background
echo "🌐 Starting frontend server..."
cd frontend
npm start &
FRONTEND_PID=$!
cd ..

# Wait a bit for services to start
sleep 5

echo "✅ Services started successfully!"
echo ""
echo "🌐 Access points:"
echo "  - Frontend: http://localhost:3000"
echo "  - Backend API: http://localhost:8000"
echo ""
echo "📊 Backend PID: $BACKEND_PID"
echo "🌐 Frontend PID: $FRONTEND_PID"
echo ""
echo "🛑 To stop: kill $BACKEND_PID $FRONTEND_PID"

# Wait for user interrupt
trap "echo '🛑 Stopping services...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT
wait