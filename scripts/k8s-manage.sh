#!/bin/bash

# Kubernetes deployment verification and management script

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

# Function to check if kubectl is available
check_kubectl() {
    if ! command -v kubectl &> /dev/null; then
        print_status $RED "❌ kubectl not found. Please install kubectl first."
        exit 1
    fi
    print_status $GREEN "✅ kubectl is available"
}

# Function to check cluster connection
check_cluster() {
    if kubectl cluster-info &> /dev/null; then
        print_status $GREEN "✅ Connected to Kubernetes cluster"
        kubectl cluster-info
    else
        print_status $RED "❌ Cannot connect to Kubernetes cluster"
        print_status $YELLOW "💡 Make sure your kubeconfig is properly configured"
        exit 1
    fi
}

# Function to show all resources
show_resources() {
    print_status $BLUE "📊 Current Kubernetes Resources:"
    echo ""
    
    print_status $YELLOW "🚀 Deployments:"
    kubectl get deployments -o wide || print_status $RED "No deployments found"
    echo ""
    
    print_status $YELLOW "🌐 Services:"
    kubectl get services -o wide || print_status $RED "No services found"
    echo ""
    
    print_status $YELLOW "🔧 ConfigMaps:"
    kubectl get configmaps || print_status $RED "No configmaps found"
    echo ""
    
    print_status $YELLOW "📦 Pods:"
    kubectl get pods -o wide || print_status $RED "No pods found"
    echo ""
}

# Function to show logs for a specific service
show_logs() {
    local service=$1
    if [[ -z "$service" ]]; then
        print_status $YELLOW "Available deployments:"
        kubectl get deployments --no-headers -o custom-columns=":metadata.name"
        echo ""
        read -p "Enter deployment name to see logs: " service
    fi
    
    print_status $BLUE "📋 Logs for $service:"
    kubectl logs -l app=$service --tail=50 || kubectl logs deployment/$service --tail=50
}

# Function to apply all Kubernetes manifests
deploy_all() {
    print_status $BLUE "🚀 Deploying all Kubernetes manifests..."
    
    # Apply ConfigMap first
    if [[ -f "env-configmap.yaml" ]]; then
        print_status $YELLOW "📄 Applying ConfigMap..."
        kubectl apply -f env-configmap.yaml
    fi
    
    # Apply all deployment and service files
    for dir in backend frontend middleware sockets-jokes sockets-weather sockets-open-ai scripts; do
        if [[ -d "$dir" ]]; then
            print_status $YELLOW "📁 Processing $dir..."
            find "$dir" -name "*-deployment.yaml" -exec kubectl apply -f {} \;
            find "$dir" -name "*-service.yaml" -exec kubectl apply -f {} \;
            find "$dir" -name "*-configmap.yaml" -exec kubectl apply -f {} \;
        fi
    done
    
    print_status $GREEN "✅ All manifests applied"
}

# Function to delete all resources
cleanup() {
    read -p "⚠️  Are you sure you want to delete all resources? (y/N): " confirm
    if [[ $confirm == [yY] || $confirm == [yY][eE][sS] ]]; then
        print_status $YELLOW "🧹 Cleaning up resources..."
        
        # Delete deployments
        kubectl delete deployments --all || true
        
        # Delete services (except kubernetes default)
        kubectl delete services --all --ignore-not-found=true || true
        
        # Delete configmaps (except system ones)
        kubectl delete configmaps --all --ignore-not-found=true || true
        
        print_status $GREEN "✅ Cleanup completed"
    else
        print_status $BLUE "🔄 Cleanup cancelled"
    fi
}

# Function to restart all deployments
restart_all() {
    print_status $BLUE "🔄 Restarting all deployments..."
    kubectl get deployments --no-headers -o custom-columns=":metadata.name" | while read deployment; do
        if [[ -n "$deployment" ]]; then
            print_status $YELLOW "🔄 Restarting $deployment..."
            kubectl rollout restart deployment/$deployment
        fi
    done
    print_status $GREEN "✅ All deployments restarted"
}

# Function to show help
show_help() {
    echo "Kubernetes Deployment Management Script"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  status    - Show all Kubernetes resources"
    echo "  logs      - Show logs for a specific service"
    echo "  deploy    - Deploy all Kubernetes manifests"
    echo "  restart   - Restart all deployments"
    echo "  cleanup   - Delete all resources"
    echo "  help      - Show this help message"
    echo ""
    echo "If no command is provided, 'status' is used by default."
}

# Main script logic
main() {
    local command=${1:-status}
    
    print_status $BLUE "🔧 Kubernetes Management Script"
    echo ""
    
    check_kubectl
    check_cluster
    echo ""
    
    case $command in
        "status")
            show_resources
            ;;
        "logs")
            show_logs $2
            ;;
        "deploy")
            deploy_all
            ;;
        "restart")
            restart_all
            ;;
        "cleanup")
            cleanup
            ;;
        "help")
            show_help
            ;;
        *)
            print_status $RED "❌ Unknown command: $command"
            echo ""
            show_help
            exit 1
            ;;
    esac
}

# Run the main function
main "$@"
