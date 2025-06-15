#!/bin/zsh

set -e  # Exit on any error

echo "🚀 Starting Docker Hub build and push..."

# Docker Hub username
DOCKER_USERNAME="lucasestgipleiria"

# Build and push all Docker images to Docker Hub
echo "🏗️  Building and pushing Docker images to Docker Hub..."

echo "📦 Building and pushing frontend..."
docker build -t ${DOCKER_USERNAME}/projeto-cn-frontend:latest ./frontend
docker push ${DOCKER_USERNAME}/projeto-cn-frontend:latest

echo "📦 Building and pushing backend..."
docker build -t ${DOCKER_USERNAME}/projeto-cn-backend:latest ./backend
docker push ${DOCKER_USERNAME}/projeto-cn-backend:latest

echo "📦 Building and pushing middleware..."
docker build -t ${DOCKER_USERNAME}/projeto-cn-sockets-middleware:latest ./middleware
docker push ${DOCKER_USERNAME}/projeto-cn-sockets-middleware:latest

echo "📦 Building and pushing weather service..."
docker build -t ${DOCKER_USERNAME}/projeto-cn-sockets-weather:latest ./sockets-weather
docker push ${DOCKER_USERNAME}/projeto-cn-sockets-weather:latest

echo "📦 Building and pushing jokes service..."
docker build -t ${DOCKER_USERNAME}/projeto-cn-sockets-jokes:latest ./sockets-jokes
docker push ${DOCKER_USERNAME}/projeto-cn-sockets-jokes:latest

echo "📦 Building and pushing openai service..."
docker build -t ${DOCKER_USERNAME}/projeto-cn-sockets-open-ai:latest ./sockets-open-ai
docker push ${DOCKER_USERNAME}/projeto-cn-sockets-open-ai:latest

echo "📦 Building and pushing backup cron..."
docker build -t ${DOCKER_USERNAME}/projeto-cn-backup-cron:latest ./scripts
docker push ${DOCKER_USERNAME}/projeto-cn-backup-cron:latest

echo "✅ All images built and pushed to Docker Hub successfully!"
echo "🐳 Images available at:"
echo "   - ${DOCKER_USERNAME}/projeto-cn-frontend:latest"
echo "   - ${DOCKER_USERNAME}/projeto-cn-backend:latest"
echo "   - ${DOCKER_USERNAME}/projeto-cn-sockets-middleware:latest"
echo "   - ${DOCKER_USERNAME}/projeto-cn-sockets-weather:latest"
echo "   - ${DOCKER_USERNAME}/projeto-cn-sockets-jokes:latest"
echo "   - ${DOCKER_USERNAME}/projeto-cn-sockets-open-ai:latest"
echo "   - ${DOCKER_USERNAME}/projeto-cn-backup-cron:latest"

echo ""
echo "🚀 Now deploying to Kubernetes..."

# Check if minikube is running, start if not
if ! minikube status > /dev/null 2>&1; then
  echo "📦 Starting minikube..."
  minikube start
else
  echo "📦 Minikube is already running"
fi

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

# Apply backup CronJob
echo "⏰ Deploying backup CronJob..."
kubectl apply -f scripts/backup-cronjob.yaml

# Force rolling restart of all deployments to use new images
echo "🔄 Rolling out updates..."
kubectl rollout restart deployment/frontend
kubectl rollout restart deployment/backend
kubectl rollout restart deployment/sockets-middleware
kubectl rollout restart deployment/sockets-jokes
kubectl rollout restart deployment/sockets-weather
kubectl rollout restart deployment/sockets-open-ai

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

echo "✅ Complete! Images pushed to Docker Hub and deployed to Kubernetes!"
echo "🔧 Starting minikube tunnel (this will run in foreground)..."
echo "💡 Press Ctrl+C to stop the tunnel when done"
minikube tunnel