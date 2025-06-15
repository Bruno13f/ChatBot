#!/usr/bin/env bash

# Script to update all Kubernetes deployment files with correct image names
# This ensures consistency across all deployment files

set -e

echo "🔧 Updating Kubernetes deployment files..."

# Define image mappings using a simpler approach
update_image() {
    local service=$1
    local image=$2
    local file=$3
    
    if [[ -f "$file" ]]; then
        echo "📝 Updating $file with image: $image"
        sed -i.bak "s|image:.*$service.*|image: $image:latest|g" "$file"
        rm -f "$file.bak"
        echo "✅ Updated $file"
    else
        echo "⚠️  Warning: $file not found"
    fi
}

# Update each deployment file with the correct image
echo "📝 Updating backend deployment..."
update_image "backend" "lucasremigio/chatbot-backend" "backend/backend-deployment.yaml"

echo "📝 Updating frontend deployment..."
update_image "frontend" "lucasremigio/chatbot-frontend" "frontend/frontend-deployment.yaml"

echo "📝 Updating middleware deployment..."
update_image "middleware" "lucasremigio/chatbot-middleware" "middleware/sockets-middleware-deployment.yaml"

echo "📝 Updating jokes socket deployment..."
update_image "jokes" "lucasremigio/chatbot-sockets-jokes" "sockets-jokes/sockets-jokes-deployment.yaml"

echo "📝 Updating weather socket deployment..."
update_image "weather" "lucasremigio/chatbot-sockets-weather" "sockets-weather/sockets-weather-deployment.yaml"

echo "📝 Updating openai socket deployment..."
update_image "openai" "lucasremigio/chatbot-sockets-openai" "sockets-open-ai/sockets-open-ai-deployment.yaml"

echo "📝 Updating backup cron deployment..."
update_image "backup" "lucasremigio/chatbot-backup-cron" "scripts/backup-cron-deployment.yaml"

echo ""
echo "🎉 All deployment files updated successfully!"
echo ""
echo "📋 Summary of image mappings:"
echo "  backend -> lucasremigio/chatbot-backend:latest"
echo "  frontend -> lucasremigio/chatbot-frontend:latest"
echo "  middleware -> lucasremigio/chatbot-middleware:latest"
echo "  sockets-jokes -> lucasremigio/chatbot-sockets-jokes:latest"
echo "  sockets-weather -> lucasremigio/chatbot-sockets-weather:latest"
echo "  sockets-openai -> lucasremigio/chatbot-sockets-openai:latest"
echo "  backup-cron -> lucasremigio/chatbot-backup-cron:latest"
echo ""
echo "🚀 You can now commit these changes and push to trigger the deployment"
