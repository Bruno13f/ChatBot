#!/bin/zsh

set -e  # Exit on any error

echo "🚀 Starting projeto-cn deployment..."

# Start minikube
echo "📦 Starting minikube..."
minikube start

# Build all Docker images
echo "🏗️  Building Docker images..."
minikube image build -t projeto-cn-frontend:latest ./frontend
minikube image build -t projeto-cn-backend:latest ./backend
minikube image build -t projeto-cn-sockets-middleware:latest ./middleware
minikube image build -t projeto-cn-sockets-weather:latest ./sockets-weather
minikube image build -t projeto-cn-sockets-jokes:latest ./sockets-jokes
minikube image build -t projeto-cn-sockets-open-ai:latest ./sockets-open-ai

# Apply ConfigMap
echo "⚙️  Applying ConfigMap..."
kubectl apply -f configmap.yaml

# Apply all services
echo "🔗 Deploying services..."
kubectl apply -f frontend/frontend-service.yaml
kubectl apply -f backend/backend-service.yaml
kubectl apply -f middleware/sockets-middleware-service.yaml
kubectl apply -f sockets-jokes/sockets-jokes-service.yaml
kubectl apply -f sockets-weather/sockets-weather-service.yaml
kubectl apply -f sockets-open-ai/sockets-open-ai-service.yaml

# Apply all deployments
echo "🚢 Deploying applications..."
kubectl apply -f frontend/frontend-deployment.yaml
kubectl apply -f backend/backend-deployment.yaml
kubectl apply -f middleware/sockets-middleware-deployment.yaml
kubectl apply -f sockets-jokes/sockets-jokes-deployment.yaml
kubectl apply -f sockets-weather/sockets-weather-deployment.yaml
kubectl apply -f sockets-open-ai/sockets-open-ai-deployment.yaml

# Enable ingress and apply ingress configuration
echo "🌐 Setting up ingress..."
minikube addons enable ingress
kubectl apply -f ingress.yaml

echo "✅ Deployment complete!"
echo "🔧 Starting minikube tunnel (this will run in foreground)..."
echo "💡 Press Ctrl+C to stop the tunnel when done"
minikube tunnel