#!/usr/bin/env bash

# Script to build images directly in Minikube for local testing
# This is faster than pushing to Docker Hub

set -e

echo "🐳 Building images in Minikube Docker environment..."

# Configure shell to use Minikube's Docker
echo "🔧 Configuring Docker environment for Minikube..."
eval $(minikube docker-env)

echo ""
echo "🏗️ Building all images in Minikube..."

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
echo "✅ All images built in Minikube!"
echo "🔄 Now restart your Kubernetes deployments:"
echo "   ./scripts/k8s-manage.sh restart"
echo ""
echo "💡 To return to your local Docker environment later, run:"
echo "   eval \$(minikube docker-env -u)"
