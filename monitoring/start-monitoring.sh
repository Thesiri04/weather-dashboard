#!/bin/bash

echo "=== Starting Weather Dashboard Monitoring Stack ==="

# Function to check if network exists
check_network() {
    if ! docker network ls | grep -q weather-network; then
        echo "Creating weather-network..."
        docker network create weather-network
    else
        echo "✅ weather-network already exists"
    fi
}

echo "🔧 Setting up Docker network..."
check_network

echo ""
echo "🚀 Starting main services (MongoDB + MongoDB Exporter)..."
docker-compose up -d

echo ""
echo "⏳ Waiting for main services to be ready..."
sleep 5

echo ""
echo "📊 Starting Prometheus..."
cd monitoring/prometheus
docker-compose up -d
cd ../..

echo ""
echo "⏳ Waiting for Prometheus to be ready..."
sleep 3

echo ""
echo "📈 Starting Grafana..."
cd monitoring/grafana
docker-compose up -d
cd ../..

echo ""
echo "⏳ Waiting for all services to be ready..."
sleep 5

echo ""
echo "=== ✅ All services started successfully! ==="
echo ""
echo "🌐 Access URLs:"
echo "📊 MongoDB Exporter Metrics: http://localhost:9216/metrics"
echo "🔍 Prometheus:               http://localhost:9090"
echo "📈 Grafana:                  http://localhost:3001"
echo "   └── Username: admin"
echo "   └── Password: admin123"
echo ""
echo "🔧 Main Application:"
echo "💾 MongoDB:                  localhost:27017"
echo ""
echo "Use 'monitoring/stop-monitoring.sh' to stop all services"