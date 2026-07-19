#!/bin/bash

set -e

echo "Creating namespace..."
kubectl apply -f k8s/namespace.yml

echo "Deploying ConfigMaps..."
kubectl apply -f k8s/configmap/

echo "Deploying Secrets..."
kubectl apply -f k8s/secret/

echo "Deploying PostgreSQL..."
kubectl apply -f k8s/postgres/

echo "Deploying Backend..."
kubectl apply -f k8s/backend/

echo "Deploying Frontend..."
kubectl apply -f k8s/frontend/

echo "Deploying Ingress..."
kubectl apply -f k8s/ingress/

echo "Deployment completed."