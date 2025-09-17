#!/bin/bash

echo "=== Stopping Weather Dashboard Monitoring Stack ==="

echo "🛑 Stopping Grafana..."
cd grafana
docker-compose down
cd ..

echo "🛑 Stopping Prometheus..."
cd prometheus
docker-compose down
cd ..

echo "🛑 Stopping main services..."
cd ..
docker-compose down

echo ""
echo "✅ All monitoring services stopped!"
echo ""
echo "Note: Docker network 'weather-network' is preserved for future use"
echo "To remove network: docker network rm weather-network"