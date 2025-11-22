#!/bin/bash

# DevOps Fraud Shield Deployment Script
# This script builds and deploys the application using Docker Compose

set -e

echo "🚀 Starting DevOps Fraud Shield deployment..."

# Check if Docker and Docker Compose are installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create necessary directories
echo "📁 Creating necessary directories..."
mkdir -p backend/database
mkdir -p logs

# Build and start services
echo "🏗️ Building and starting services..."
sudo docker-compose down --remove-orphans
sudo docker-compose build --no-cache
sudo docker-compose up -d

# Wait for services to be healthy
echo "⏳ Waiting for services to start..."
sleep 10

# Check if services are running
if docker-compose ps | grep -q "Up"; then
    echo "✅ Services are running successfully!"
    echo ""
    echo "🌐 Access points:"
    echo "  - Frontend: http://localhost:3000"
    echo "  - Backend API: http://localhost:8000"
    echo "  - API Documentation: http://localhost:8000/docs (if available)"
    echo ""
    echo "📊 To view logs: sudo docker-compose logs -f"
    echo "🛑 To stop: sudo docker-compose down"
else
    echo "❌ Some services failed to start. Check logs with: docker-compose logs"
    exit 1
fi

echo "🎉 Deployment completed successfully!"