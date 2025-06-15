#!/bin/zsh

set -e  # Exit on any error

# Parse command line arguments
IMAGE_TAG=${1:-latest}
BUILD_IMAGES=${2:-true}
SERVICES_TO_UPDATE=${3:-"all"}

# Docker Hub username
DOCKER_USERNAME="lucasestgipleiria"

echo "🚀 Starting Docker Hub build and push with tag: ${IMAGE_TAG}..."

# Get Docker command path
DOCKER_CMD=$(which docker)
if [[ -z "$DOCKER_CMD" ]]; then
  echo "❌ Docker not found in PATH"
  exit 1
fi

# Function to build and push a single image
build_and_push() {
  local service=$1
  local context=$2
  local image_name="docker.io/${DOCKER_USERNAME}/projeto-cn-${service}:${IMAGE_TAG}"
  
  echo "📦 Building and pushing ${service}:${IMAGE_TAG}..."
  cd ${context}
  $DOCKER_CMD buildx build \
    --platform linux/amd64 \
    -t ${image_name} \
    --push \
    .
  cd - > /dev/null
  echo "✅ ${service}:${IMAGE_TAG} build and push completed"
}

# Function to update specific deployment
update_deployment() {
  local service=$1
  local image_name="docker.io/${DOCKER_USERNAME}/projeto-cn-${service}:${IMAGE_TAG}"
  
  echo "🔄 Updating ${service} deployment with ${image_name}..."
  kubectl set image deployment/${service} ${service}=${image_name}
  kubectl rollout status deployment/${service}
  echo "✅ ${service} updated successfully"
}

if [[ "$BUILD_IMAGES" != "skip-build" ]]; then
  echo "🏗️  Building and pushing Docker images to Docker Hub in parallel..."

  # Build all images in parallel with Linux/AMD64 platform
  build_and_push "frontend" "./frontend" &
  build_and_push "backend" "./backend" &
  build_and_push "sockets-middleware" "./middleware" &
  build_and_push "sockets-weather" "./sockets-weather" &
  build_and_push "sockets-jokes" "./sockets-jokes" &
  build_and_push "sockets-open-ai" "./sockets-open-ai" &
  build_and_push "backup-cron" "./scripts" &

  echo "⏳ Waiting for all builds to complete..."
  wait

  echo "✅ All images built and pushed to Docker Hub successfully!"
  echo "🐳 Images available at:"
  echo "   - ${DOCKER_USERNAME}/projeto-cn-frontend:${IMAGE_TAG}"
  echo "   - ${DOCKER_USERNAME}/projeto-cn-backend:${IMAGE_TAG}"
  echo "   - ${DOCKER_USERNAME}/projeto-cn-sockets-middleware:${IMAGE_TAG}"
  echo "   - ${DOCKER_USERNAME}/projeto-cn-sockets-weather:${IMAGE_TAG}"
  echo "   - ${DOCKER_USERNAME}/projeto-cn-sockets-jokes:${IMAGE_TAG}"
  echo "   - ${DOCKER_USERNAME}/projeto-cn-sockets-open-ai:${IMAGE_TAG}"
  echo "   - ${DOCKER_USERNAME}/projeto-cn-backup-cron:${IMAGE_TAG}"
else
  echo "⏭️  Skipping image build, using existing images with tag: ${IMAGE_TAG}"
fi

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

# Update deployments with new images
if [[ "$SERVICES_TO_UPDATE" == "all" ]]; then
  echo "🔄 Updating all deployments with tag: ${IMAGE_TAG}..."
  update_deployment "frontend"
  update_deployment "backend"
  update_deployment "sockets-middleware"
  update_deployment "sockets-jokes"
  update_deployment "sockets-weather"
  update_deployment "sockets-open-ai"
else
  echo "🔄 Updating specific services: ${SERVICES_TO_UPDATE} with tag: ${IMAGE_TAG}..."
  for service in ${(s:,:)SERVICES_TO_UPDATE}; do
    update_deployment "$service"
  done
fi

# Update backup CronJob separately
echo "⏰ Updating backup CronJob..."
kubectl patch cronjob backup-cronjob -p "{\"spec\":{\"jobTemplate\":{\"spec\":{\"template\":{\"spec\":{\"containers\":[{\"name\":\"backup-cron\",\"image\":\"docker.io/${DOCKER_USERNAME}/projeto-cn-backup-cron:${IMAGE_TAG}\"}]}}}}}}"

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

echo "✅ Complete! Images pushed to Docker Hub and deployed to Kubernetes with tag: ${IMAGE_TAG}!"
echo ""
echo "📋 Usage examples:"
echo "   ./deploy-docker-hub.sh                    # Deploy with latest tag"
echo "   ./deploy-docker-hub.sh v1.2.0             # Deploy with specific tag"
echo "   ./deploy-docker-hub.sh v1.2.0 skip-build  # Update deployments without building"
echo "   ./deploy-docker-hub.sh latest true frontend,backend  # Update only specific services"
echo ""
echo "🔧 Starting minikube tunnel (this will run in foreground)..."
echo "💡 Press Ctrl+C to stop the tunnel when done"
minikube tunnel