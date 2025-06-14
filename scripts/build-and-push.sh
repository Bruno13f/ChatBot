#!/usr/bin/env bash

# Script to build and push all Docker images for local testing

set -e

echo "🐳 Building and pushing Docker images..."

# Make sure you're logged in to Docker Hub
echo "🔑 Logging in to Docker Hub..."
read -p "Enter your Docker Hub username: " DOCKER_USERNAME
echo "Please login to Docker Hub:"
docker login

echo ""
echo "🏗️ Building all images..."

# Build Frontend
echo "📦 Building frontend..."
docker build -f frontend/Dockerfile \
  --build-arg BACKEND_URL=http://backend:9000 \
  --build-arg SOCKETS_URL=http://sockets-middleware:8000 \
  --build-arg BACKEND_PORT=9000 \
  --build-arg SOCKETS_PORT=8000 \
  --build-arg IS_PRODUCTION=true \
  -t lucasremigio/chatbot-frontend:latest ./frontend

# Build Backend
echo "📦 Building backend..."
docker build -f backend/Dockerfile \
  -t lucasremigio/chatbot-backend:latest ./backend

# Build Middleware
echo "📦 Building middleware..."
docker build -f middleware/Dockerfile \
  -t lucasremigio/chatbot-middleware:latest ./middleware

# Build Socket Services
echo "📦 Building socket services..."
docker build -f sockets-jokes/Dockerfile \
  -t lucasremigio/chatbot-sockets-jokes:latest ./sockets-jokes

docker build -f sockets-weather/Dockerfile \
  -t lucasremigio/chatbot-sockets-weather:latest ./sockets-weather

docker build -f sockets-open-ai/Dockerfile \
  -t lucasremigio/chatbot-sockets-openai:latest ./sockets-open-ai

# Build Backup Cron
echo "📦 Building backup cron..."
docker build -f scripts/Dockerfile \
  -t lucasremigio/chatbot-backup-cron:latest ./scripts

echo ""
echo "🚀 Pushing all images to Docker Hub..."

# Push all images
docker push lucasremigio/chatbot-frontend:latest
docker push lucasremigio/chatbot-backend:latest
docker push lucasremigio/chatbot-middleware:latest
docker push lucasremigio/chatbot-sockets-jokes:latest
docker push lucasremigio/chatbot-sockets-weather:latest
docker push lucasremigio/chatbot-sockets-openai:latest
docker push lucasremigio/chatbot-backup-cron:latest

echo ""
echo "✅ All images built and pushed successfully!"
echo "🔄 Now restart your Kubernetes deployments:"
echo "   ./scripts/k8s-manage.sh restart"
