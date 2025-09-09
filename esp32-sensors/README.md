# ESP32 Weather Sensor Integration for Vercel

This ESP32 project reads temperature and humidity data from analog sensors and sends it to your Vercel-hosted weather dashboard.

## 📋 Hardware Setup

### Required Components:
- ESP32 Development Board
- Temperature Sensor (connected to GPIO 9)
- Humidity Sensor (connected to GPIO 2)
- Breadboard
- Jumper Wires
- USB Cable

### Wiring Diagram:
```
Temperature Sensor  →    ESP32 Board
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
VCC (Red)          →    3.3V
GND (Black)        →    GND
Signal (Yellow)    →    GPIO 9

Humidity Sensor    →    ESP32 Board
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
VCC (Red)         →    3.3V
GND (Black)       →    GND
Signal (Yellow)   →    GPIO 2
```

## ⚙️ Software Setup

### 1. Install PlatformIO Extension
- Already installed in your VS Code!

### 2. Configure WiFi and Vercel Settings
Edit `src/main.cpp` and update:
```cpp
const char* ssid = "YOUR_WIFI_NAME";
const char* password = "YOUR_WIFI_PASSWORD";
const char* serverURL = "https://your-app-name.vercel.app/api/sensors/data";
```

### 3. Deploy to Vercel First
1. Follow the `../VERCEL_DEPLOYMENT.md` guide
2. Note your Vercel app URL (e.g., `https://weather-dashboard-abc123.vercel.app`)
3. Update the `serverURL` in ESP32 code with your Vercel URL

### 4. Upload Code to ESP32
1. Connect ESP32 to computer via USB
2. In VS Code, click PlatformIO icon
3. Click "Upload" or press Ctrl+Alt+U
4. Open Serial Monitor to see output

## 🌐 Web Dashboard Integration

Your Vercel-hosted dashboard will automatically:
- ✅ Receive ESP32 sensor data every 60 seconds
- ✅ Display live temperature and humidity
- ✅ Store sensor history in MongoDB Atlas
- ✅ Show last update timestamp
- ✅ Work globally with HTTPS security

## 📊 API Endpoints

The ESP32 sends data to:
- `POST /api/sensors/data` - Receive sensor readings

Your dashboard can access:
- `GET /api/sensors/latest` - Get latest sensor data
- `GET /api/sensors/history` - Get sensor history

## 🔧 Troubleshooting

### ESP32 Not Connecting to WiFi:
1. Check WiFi credentials
2. Ensure 2.4GHz network (ESP32 doesn't support 5GHz)
3. Check serial monitor for error messages

### Data Not Appearing on Dashboard:
1. Verify Vercel URL in ESP32 code (must include https://)
2. Check that Vercel app is deployed successfully
3. Ensure internet connection is stable
4. Check MongoDB Atlas connection

### Sensor Reading Errors:
1. Check analog sensor wiring (GPIO 9 & GPIO 2)
2. Verify power supply (3.3V)
3. Calibrate sensor values if needed

## 🔍 Sensor Calibration

The analog sensors may need calibration for accurate readings:

### Temperature Sensor (GPIO 9):
- Default formula: `temp = (analogValue / 4095.0) * 100.0`
- Adjust multiplier based on sensor specifications
- Test against known temperature source

### Humidity Sensor (GPIO 2):
- Default formula: `humidity = (analogValue / 4095.0) * 100.0`
- Adjust multiplier based on sensor specifications
- Test against humidity reference

## 📱 Expected Output

### Serial Monitor Output:
```
=== ESP32 Weather Sensor Starting ===
Analog sensors initialized
Connecting to WiFi........
WiFi connected!
IP address: 192.168.1.150

=== Reading Sensor Data ===
Temperature: 24.50°C
Humidity: 65.20%
Sending data to Vercel:
{"deviceId":"ESP32-ANALOG-001","sensorData":{"temperature":24.5,"humidity":65.2}}
✅ Data uploaded to Vercel successfully!
```

### Web Dashboard Display:
- Live sensor cards showing current temperature and humidity
- Real-time updates every 60 seconds
- Device information and timestamps
- Accessible globally via Vercel URL

## 🎯 Features

- 🌡️ **Real-time monitoring** - Live temperature readings from analog sensor
- 💧 **Humidity tracking** - Environmental humidity from analog sensor  
- 📊 **Data logging** - Historical data stored in MongoDB Atlas
- 🔄 **Auto-updates** - Continuous data streaming every 60 seconds
- 📱 **Mobile friendly** - Responsive web interface
- ⏰ **Timestamps** - Track when data was recorded
- ☁️ **Cloud hosted** - Global access via Vercel deployment
- 🔒 **HTTPS secure** - Encrypted data transmission

## 🚀 Quick Start Checklist

1. ✅ Wire temperature sensor to GPIO 9
2. ✅ Wire humidity sensor to GPIO 2  
3. ✅ Deploy your app to Vercel (follow `../VERCEL_DEPLOYMENT.md`)
4. ✅ Update WiFi credentials in `src/main.cpp`
5. ✅ Update Vercel URL in `src/main.cpp`
6. ✅ Upload code to ESP32 via PlatformIO
7. ✅ Monitor serial output for successful connections
8. ✅ View live data on your Vercel dashboard

Happy sensing with Vercel! 🌤️☁️
