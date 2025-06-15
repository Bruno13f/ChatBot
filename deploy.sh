#!/bin/zsh

set -e  # Exit on any error

# Parse command line arguments
IMAGE_TAG=${1:-latest}
BUILD_IMAGES=${2:-true}
SERVICES_TO_UPDATE=${3:-"all"}

echo "🚀 Starting projeto-cn local deployment with tag: ${IMAGE_TAG}..."

# Check if Docker is available through minikube
if ! command -v minikube &> /dev/null; then
  echo "❌ Minikube not found in PATH"
  exit 1
fi

# Check if minikube is running, start if not
if ! minikube status > /dev/null 2>&1; then
  echo "📦 Starting minikube..."
  minikube start
else
  echo "📦 Minikube is already running"
fi

# Build all Docker images
if [[ "$BUILD_IMAGES" != "skip-build" ]]; then
  echo "🏗️  Building Docker images in parallel..."
  echo "📦 Images to be built:"
  echo "   - projeto-cn-frontend:${IMAGE_TAG}"
  echo "   - projeto-cn-backend:${IMAGE_TAG}"
  echo "   - projeto-cn-sockets-middleware:${IMAGE_TAG}"
  echo "   - projeto-cn-sockets-weather:${IMAGE_TAG}"
  echo "   - projeto-cn-sockets-jokes:${IMAGE_TAG}"
  echo "   - projeto-cn-sockets-open-ai:${IMAGE_TAG}"
  echo "   - projeto-cn-backup-cron:${IMAGE_TAG}"
  echo ""
  
  # Build all images in parallel
  minikube image build -t projeto-cn-frontend:${IMAGE_TAG} ./frontend &
  minikube image build -t projeto-cn-backend:${IMAGE_TAG} ./backend &
  minikube image build -t projeto-cn-sockets-middleware:${IMAGE_TAG} ./middleware &
  minikube image build -t projeto-cn-sockets-weather:${IMAGE_TAG} ./sockets-weather &
  minikube image build -t projeto-cn-sockets-jokes:${IMAGE_TAG} ./sockets-jokes &
  minikube image build -t projeto-cn-sockets-open-ai:${IMAGE_TAG} ./sockets-open-ai &
  minikube image build -t projeto-cn-backup-cron:${IMAGE_TAG} ./scripts &
  
  echo "⏳ Waiting for all builds to complete..."
  wait
  
  echo "✅ All local images built successfully!"
else
  echo "⏭️  Skipping image build, using existing images with tag: ${IMAGE_TAG}"
fi

# Apply ConfigMap
echo "⚙️  Applying ConfigMap..."
kubectl apply -f configmap.yaml

# Install Keel if not already installed
echo "🎯 Setting up Keel for automated deployments..."
if ! kubectl get namespace keel > /dev/null 2>&1; then
  echo "📦 Installing Keel..."
  kubectl apply -f keel/keel-install.yaml
  echo "⏳ Waiting for Keel to be ready..."
  kubectl wait --for=condition=ready pod -l app=keel -n keel --timeout=120s
else
  echo "✅ Keel already installed"
fi

# Apply MongoDB storage and database
echo "🗄️  Deploying MongoDB..."
kubectl apply -f mongodb/mongodb-pvc.yaml
kubectl apply -f mongodb/mongodb-service.yaml
kubectl apply -f mongodb/mongodb-deployment.yaml

# Apply MongoDB Backup storage and database
echo "🗄️  Deploying MongoDB Backup..."
kubectl apply -f mongodb_backup/mongodb-pvc.yaml
kubectl apply -f mongodb_backup/mongodb-service.yaml
kubectl apply -f mongodb_backup/mongodb-deployment.yaml

# Wait for MongoDB to be ready
echo "⏳ Waiting for MongoDB to be ready..."
kubectl wait --for=condition=ready pod -l app=mongodb --timeout=300s

# Wait for MongoDB Backup to be ready
echo "⏳ Waiting for MongoDB Backup to be ready..."
kubectl wait --for=condition=ready pod -l app=mongodb-backup --timeout=300s

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

# Function to update specific deployment with local images
update_deployment() {
  local service=$1
  local local_image_name="projeto-cn-${service}:${IMAGE_TAG}"
  
  echo "🔄 Updating ${service} deployment with local image ${local_image_name}..."
  kubectl set image deployment/${service} ${service}=${local_image_name}
  kubectl rollout status deployment/${service}
  echo "✅ ${service} updated successfully"
}

# Update deployments with local images
if [[ "$SERVICES_TO_UPDATE" == "all" ]]; then
  echo "🔄 Updating all deployments with local images (tag: ${IMAGE_TAG})..."
  update_deployment "frontend"
  update_deployment "backend"
  update_deployment "sockets-middleware"
  update_deployment "sockets-jokes"
  update_deployment "sockets-weather"
  update_deployment "sockets-open-ai"
else
  echo "🔄 Updating specific services: ${SERVICES_TO_UPDATE} with local images (tag: ${IMAGE_TAG})..."
  for service in ${(s:,:)SERVICES_TO_UPDATE}; do
    update_deployment "$service"
  done
fi

# Update backup CronJob separately
echo "⏰ Updating backup CronJob with local image..."
kubectl patch cronjob backup-cronjob -p "{\"spec\":{\"jobTemplate\":{\"spec\":{\"template\":{\"spec\":{\"containers\":[{\"name\":\"backup-cron\",\"image\":\"projeto-cn-backup-cron:${IMAGE_TAG}\"}]}}}}}}"


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

echo "✅ Local deployment complete with tag: ${IMAGE_TAG}!"
echo ""
echo "📋 Usage examples:"
echo "   ./deploy.sh                        # Deploy with latest tag"
echo "   ./deploy.sh v1.2.0                 # Deploy with specific tag"
echo "   ./deploy.sh v1.2.0 skip-build      # Update deployments without building"
echo "   ./deploy.sh latest true frontend,backend  # Update only specific services"
echo ""
echo "🔧 Starting minikube tunnel (this will run in foreground)..."
echo "💡 Press Ctrl+C to stop the tunnel when done"
minikube tunnel