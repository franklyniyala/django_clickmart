#!/bin/bash

set -e

echo "Creating namespace..."
kubectl apply -f K8s/namespace.yml

echo "Deploying ConfigMaps..."
kubectl apply -f K8s/configmap/

echo "Deploying Secrets..."
kubectl apply -f K8s/secret/

echo "Deploying PostgreSQL..."
kubectl apply -f K8s/postgres/

echo "Deploying Backend..."
kubectl apply -f K8s/backend/

kubectl rollout restart deployment backend-deployment -n clickmart
kubectl rollout status deployment backend-deployment -n clickmart

echo "Deploying Frontend..."
kubectl apply -f K8s/frontend/

kubectl rollout restart deployment frontend-deployment -n clickmart
kubectl rollout status deployment frontend-deployment -n clickmart

echo "Deploying Ingress..."
kubectl apply -f K8s/ingress/

echo "Deployment completed."