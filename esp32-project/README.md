# ESP32 DHT11 Weather Sensor - Dual Database Setup

This ESP32 project sends temperature and humidity data to **TWO destinations simultaneously**:

1. **Vercel API** (MongoDB Atlas - Cloud Database) - Production
2. **Local Backend API** (MongoDB Docker - Local Database) - Monitoring

## 🔧 Hardware Setup

- **ESP32 Development Board**
- **DHT11 Temperature & Humidity Sensor**
- **Connection**: DHT11 data pin → GPIO 4

## 📡 Network Configuration

Before uploading the code, you **MUST** update the following in `main/main.c`:

### 1. WiFi Settings
```c
#define WIFI_SSID "Jessica13"
#define WIFI_PASS "Thesiri01"
```

### 2. Server URLs
```c
#define SERVER_URL_VERCEL "https://weather-dashboardrapeesiri.vercel.app/api/sensors/data"
#define SERVER_URL_LOCAL "http://YOUR_LOCAL_IP:5000/api/sensors/data"
```

**Important**: Replace `YOUR_LOCAL_IP` with your actual local IP address!

## 🌐 Finding Your Local IP Address

### Windows:
```cmd
ipconfig
```
Look for "IPv4 Address" under your active network adapter.

### macOS/Linux:
```bash
ifconfig
# or
ip addr show
```

### Example:
If your IP is `192.168.1.100`, change the line to:
```c
#define SERVER_URL_LOCAL "http://192.168.1.100:5000/api/sensors/data"
```

## 🐳 Prerequisites

Before running ESP32, ensure your local services are running:

```bash
# Navigate to project root
cd ~/EmbbedSys

# Start all services
docker-compose up -d

# Verify services are running
docker ps

# Should show:
# - weather-mongodb
# - weather-mongodb-exporter  
# - weather-local-backend

# Test local backend
curl http://localhost:5000/health
```

## 🚀 Building and Flashing

```bash
# Set up ESP-IDF environment
. $HOME/esp/esp-idf/export.sh

# Configure the project
idf.py menuconfig

# Build the project
idf.py build

# Flash to ESP32
idf.py -p /dev/ttyUSB0 flash monitor
```

## 📊 Data Flow

```
ESP32 DHT11 Sensor
       ↓
   WiFi Network
       ↓
┌─────────────────────┐    ┌──────────────────────┐
│    Vercel API       │    │   Local Backend      │
│  (MongoDB Atlas)    │    │  (MongoDB Docker)    │
│   → Production      │    │   → Monitoring       │
└─────────────────────┘    └──────────────────────┘
                                     ↓
                            ┌──────────────────────┐
                            │   MongoDB Exporter   │
                            │         ↓             │
                            │    Prometheus        │
                            │         ↓             │
                            │      Grafana         │
                            └──────────────────────┘
```

## 🔍 Monitoring

The ESP32 will log detailed information about:

- Sensor readings
- WiFi connection status  
- HTTP request status for both destinations
- Success/failure summary for each upload

### Example Log Output:
```
🚀 Starting dual-destination data upload...
📊 Sensor data: Temperature=25.0°C, Humidity=60%

--- Sending to Vercel (MongoDB Atlas) ---
📤 Sending data to Vercel/Atlas: https://weather-dashboard...
✅ Vercel/Atlas: Data uploaded successfully!

--- Sending to Local Backend (Local MongoDB) ---
📤 Sending data to Local/Docker: http://192.168.1.100:5000...
✅ Local/Docker: Data uploaded successfully!

=== UPLOAD SUMMARY ===
📤 Vercel/Atlas:  ✅ SUCCESS
📤 Local/Docker:  ✅ SUCCESS
🎉 ALL destinations uploaded successfully!
```

## ⚠️ Troubleshooting

### "Local/Docker: Connection error: ESP_ERR_HTTP_CONNECT_ERROR"
- Check if local backend is running: `docker ps`
- Verify local IP address is correct
- Ensure ESP32 and computer are on same network
- Test backend manually: `curl http://YOUR_IP:5000/health`

### "Vercel/Atlas: Server returned status 500"
- Check Vercel deployment status
- Verify MongoDB Atlas connection string
- Check Vercel logs for errors

### DHT11 sensor errors:
- Check wiring connections
- Ensure adequate power supply
- DHT11 requires 1-2 second intervals between readings

## 🔄 Upload Frequency

Current configuration: **60 seconds** interval
To change: Modify `UPLOAD_INTERVAL_MS` in `main.c`

## 📈 Monitoring Access

After ESP32 starts sending data:

- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3001 (admin/admin123)
- **MongoDB Exporter**: http://localhost:9216/metrics
- **Local Backend Health**: http://localhost:5000/health