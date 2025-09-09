# 🚀 Vercel Deployment Guide for ESP32 Weather Dashboard

## 📊 Data Flow Architecture with Vercel

```
ESP32 Sensors → Vercel API → MongoDB Atlas → Web Frontend
     ↓              ↓           ↓            ↓
GPIO 9,2    →  /api/sensors  →  Cloud DB  →  Live Updates
```

## 🔧 Step 1: Prepare for Vercel Deployment

### Update your Vercel configuration:

1. **Install Vercel CLI** (if not already installed):
```bash
npm i -g vercel
```

2. **Login to Vercel**:
```bash
vercel login
```

3. **Deploy your project**:
```bash
vercel --prod
```

## 🗄️ Step 2: Set up MongoDB Atlas (Cloud Database)

Since Vercel is serverless, you need a cloud database:

1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Create a free cluster
3. Get your connection string
4. Add it to Vercel environment variables

### In Vercel Dashboard:
- Go to your project settings
- Add environment variable:
  - Name: `MONGODB_URI`
  - Value: `mongodb+srv://username:password@cluster.mongodb.net/weatherdb`

## 📱 Step 3: Update ESP32 Code for Vercel

Your ESP32 will send data to your Vercel URL instead of localhost:

### Update main.cpp:
```cpp
// Replace with your actual Vercel URL
const char* serverURL = "https://weather-dashboardrapeesiri.vercel.app/api";
```

## 🌐 Step 4: How Data Travels

### 1. ESP32 → Vercel API
```cpp
// ESP32 sends POST request
POST https://your-app.vercel.app/api/sensors/data
{
  "deviceId": "ESP32-TEMP-HUM-001",
  "sensorData": {
    "temperature": 24.5,
    "humidity": 65.2
  }
}
```

### 2. Vercel API → MongoDB Atlas
```javascript
// API saves to cloud database
await SensorData.save();
```

### 3. Web Frontend → Vercel API
```javascript
// Frontend fetches latest data
fetch('/api/sensors/latest')
```

### 4. Real-time Updates
- ESP32 sends data every 60 seconds
- Web page refreshes sensor data every 30 seconds
- Users see live sensor readings

## 🔌 Hardware Setup for Your Sensors

### Wiring for GPIO 9 and 2:
```
Temperature Sensor  →  ESP32
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
VCC                →  3.3V
GND                →  GND
Signal             →  GPIO 9

Humidity Sensor    →  ESP32
━━━━━━━━━━━━━━━━━━━━━━━━━━━
VCC               →  3.3V
GND               →  GND
Signal            →  GPIO 2
```

## ⚙️ Step 5: Calibrate Your Sensors

Update the conversion functions in main.cpp for your specific sensors:

```cpp
// Adjust these based on your sensor datasheets
float convertToTemperature(int reading) {
  float voltage = reading * (3.3 / 4095.0);
  
  // For LM35: Temperature = voltage * 100
  // For TMP36: Temperature = (voltage - 0.5) * 100
  // For thermistor: Use thermistor equation
  
  float temperature = (voltage - 0.5) * 100; // Adjust this!
  return temperature;
}

float convertToHumidity(int reading) {
  float voltage = reading * (3.3 / 4095.0);
  
  // For capacitive sensors: Usually linear
  // For resistive sensors: May need calibration curve
  
  float humidity = (voltage / 3.3) * 100; // Adjust this!
  return constrain(humidity, 0, 100);
}
```

## 🎯 Step 6: Deploy and Test

### 1. Deploy to Vercel:
```bash
vercel --prod
```

### 2. Get your Vercel URL:
```
https://weather-dashboardrapeesiri.vercel.app
```

### 3. Update ESP32 serverURL:
```cpp
const char* serverURL = "https://weather-dashboardrapeesiri.vercel.app/api";
```

### 4. Upload ESP32 code and test!

## 📊 Expected Results

### Web Dashboard will show:
- 🌡️ **Live Temperature** from GPIO 9 sensor
- 💧 **Live Humidity** from GPIO 2 sensor  
- ⏰ **Last Update Time**
- 📈 **Historical Data Trends**
- 🔄 **Auto-refresh every 30 seconds**

### Serial Monitor Output:
```
=== ESP32 Weather Sensor Starting ===
Temperature sensor on GPIO 9
Humidity sensor on GPIO 2
WiFi connected!
IP address: 192.168.1.150

=== Reading Sensor Data ===
Temperature reading: 2048 (24.50°C)
Humidity reading: 2730 (65.20%)
Sending data to server:
✅ Data uploaded successfully!
Server response code: 200
```

## 🔧 Troubleshooting

### ESP32 Issues:
- ✅ Check WiFi credentials
- ✅ Verify sensor wiring
- ✅ Check Vercel URL in code
- ✅ Monitor serial output

### Vercel Issues:
- ✅ Check environment variables
- ✅ Verify MongoDB Atlas connection
- ✅ Check Vercel function logs

### Sensor Calibration:
- ✅ Compare with known temperature/humidity
- ✅ Adjust conversion formulas
- ✅ Account for sensor specifications

## 🎉 Benefits of Vercel Hosting

✅ **Global CDN** - Fast worldwide access  
✅ **Automatic HTTPS** - Secure connections  
✅ **Serverless** - Scales automatically  
✅ **Free Tier** - Perfect for projects  
✅ **Git Integration** - Deploy on push  

Your ESP32 weather dashboard is now globally accessible! 🌍🌤️
