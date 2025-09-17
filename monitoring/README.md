# Weather Dashboard Monitoring Setup

This directory contains separate Docker configurations for monitoring services.

## Directory Structure

```
monitoring/
├── prometheus/
│   ├── docker-compose.yml
│   └── prometheus.yml
└── grafana/
    ├── docker-compose.yml
    └── provisioning/
        └── datasources/
            └── prometheus.yml
```

## Setup Instructions

### 1. Create External Network (Run this FIRST)
```bash
docker network create weather-network
```

### 2. Start Main Services (MongoDB + MongoDB Exporter)
```bash
# From project root directory
docker-compose up -d
```

### 3. Start Prometheus
```bash
cd monitoring/prometheus
docker-compose up -d
```

### 4. Start Grafana
```bash
cd monitoring/grafana
docker-compose up -d
```

## Access Points

- **MongoDB Exporter**: http://localhost:9216/metrics
- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3001
  - Username: `admin`
  - Password: `admin123`

## Services Communication

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Main Docker   │    │ Prometheus      │    │    Grafana      │
│                 │    │                 │    │                 │
│ MongoDB         │    │ Scrapes metrics │    │ Queries         │
│ MongoDB Export  │◄───┤ from Exporter   │◄───┤ Prometheus      │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Troubleshooting

### Network Issues
If containers can't communicate:
```bash
# Check if network exists
docker network ls

# Create network if missing
docker network create weather-network

# Restart all services
docker-compose down && docker-compose up -d
```

### View Logs
```bash
# Main services
docker-compose logs -f

# Prometheus logs
cd monitoring/prometheus && docker-compose logs -f

# Grafana logs
cd monitoring/grafana && docker-compose logs -f
```

## Stop All Services

```bash
# Stop Grafana
cd monitoring/grafana && docker-compose down

# Stop Prometheus
cd monitoring/prometheus && docker-compose down

# Stop main services
cd ../../ && docker-compose down
```