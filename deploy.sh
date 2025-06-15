#!/bin/zsh

set -e  # Exit on any error

echo "🚀 Starting projeto-cn deployment..."

# Check if minikube is running, start if not
if ! minikube status > /dev/null 2>&1; then
  echo "📦 Starting minikube..."
  minikube start
else
  echo "📦 Minikube is already running"
fi

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

# Force rolling restart of all deployments to use new images
echo "🔄 Rolling out updates..."
kubectl rollout restart deployment/frontend
kubectl rollout restart deployment/backend
kubectl rollout restart deployment/sockets-middleware
kubectl rollout restart deployment/sockets-jokes
kubectl rollout restart deployment/sockets-weather
kubectl rollout restart deployment/sockets-open-ai

# Wait for rollouts to complete
echo "⏳ Waiting for rollouts to complete..."
kubectl rollout status deployment/frontend
kubectl rollout status deployment/backend
kubectl rollout status deployment/sockets-middleware
kubectl rollout status deployment/sockets-jokes
kubectl rollout status deployment/sockets-weather
kubectl rollout status deployment/sockets-open-ai

# Enable ingress if not already enabled
echo "🌐 Setting up ingress..."
if ! minikube addons list | grep ingress | grep enabled > /dev/null; then
  minikube addons enable ingress
  
  # Wait for ingress controller pods to be ready
  echo "⏳ Waiting for ingress controller to be ready..."
  kubectl wait --namespace ingress-nginx \
    --for=condition=ready pod \
    --selector=app.kubernetes.io/component=controller \
    --timeout=300s
  
  # Wait a bit more for the webhook service to be fully ready
  echo "⏳ Waiting for webhook service to be ready..."
  sleep 2
else
  echo "🌐 Ingress already enabled"
fi

# Apply ingress configuration
echo "🔧 Applying ingress configuration..."
kubectl apply -f ingress.yaml

echo "✅ Deployment complete!"
echo "🔧 Starting minikube tunnel (this will run in foreground)..."
echo "💡 Press Ctrl+C to stop the tunnel when done"
minikube tunnel