#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <time.h>
#include <DHT.h>

// WiFi credentials
const char* ssid = "Jessica13";         // ⬅️ Your WiFi network name
const char* password = "Thesiri01";  // ⬅️ Your WiFi password

// Server configuration for Vercel deployment
const char* serverURL = "https://weather-dashboardrapeesiri.vercel.app/api"; // ✅ Your Vercel URL
const unsigned long uploadInterval = 60000; // Upload every 60 seconds

// NTP configuration
const char* ntpServer = "pool.ntp.org";
const long gmtOffset_sec = 7 * 3600;     // GMT+7 (Thailand timezone)
const int daylightOffset_sec = 0;        // Thailand doesn't use daylight saving time

// Asair Temperature and Humidity sensor configuration
#define DHT_PIN 2          // Asair sensor connected to GPIO 2
#define DHT_TYPE DHT11     // DHT11 - Asair sensor type

// Initialize DHT sensor
DHT dht(DHT_PIN, DHT_TYPE);

// Timing variables
unsigned long lastUpload = 0;

void setup() {
  Serial.begin(115200);
  Serial.println("=== ESP32 Weather Sensor Starting ===");
  
  // Initialize Asair DHT sensor
  dht.begin();
  Serial.println("Asair DHT11 Temperature and Humidity sensor initialized");
  Serial.printf("DHT11 sensor connected to GPIO %d\n", DHT_PIN);
  
  // Give DHT11 time to stabilize (important for reliable readings)
  Serial.println("Waiting for DHT11 to stabilize...");
  delay(2000);
  
  // Connect to WiFi
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  
  Serial.println();
  Serial.println("WiFi connected!");
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());
  Serial.print("Server URL: ");
  Serial.println(serverURL);
  
  // Initialize and get the time
  configTime(gmtOffset_sec, daylightOffset_sec, ntpServer);
  Serial.println("Time synchronization started...");
  
  // Wait for time to be set (up to 10 seconds)
  int retries = 0;
  struct tm timeinfo;
  while (!getLocalTime(&timeinfo) && retries < 20) {
    delay(500);
    retries++;
    Serial.print(".");
  }
  
  if (retries >= 20) {
    Serial.println("\nFailed to obtain time - will use relative timestamps");
  } else {
    Serial.println("\nTime synchronized successfully!");
    Serial.print("Thailand time (GMT+7): ");
    Serial.println(&timeinfo, "%A, %B %d %Y %H:%M:%S");
    
    // Print the actual Unix timestamp for debugging
    time_t now;
    time(&now);
    Serial.printf("Unix timestamp: %lu\n", now);
  }
}

void loop() {
  unsigned long currentTime = millis();
  
  // Check if it's time to read and upload data
  if (currentTime - lastUpload >= uploadInterval) {
    readAndUploadSensorData();
    lastUpload = currentTime;
  }
  
  // Small delay to prevent watchdog issues
  delay(1000);
}

void readAndUploadSensorData() {
  Serial.println("\n=== Reading Asair DHT11 Sensor Data ===");
  
  // Try to read sensor data with retries
  float humidity = NAN;
  float temperature = NAN;
  int retryCount = 0;
  const int maxRetries = 3;
  
  while (retryCount < maxRetries && (isnan(humidity) || isnan(temperature))) {
    if (retryCount > 0) {
      Serial.printf("Retry attempt %d/%d...\n", retryCount, maxRetries - 1);
      delay(2000); // Wait 2 seconds between retries for DHT11
    }
    
    // Read temperature and humidity from DHT sensor
    humidity = dht.readHumidity();
    temperature = dht.readTemperature();
    
    retryCount++;
  }
  
  // Check if reading was successful after retries
  if (isnan(humidity) || isnan(temperature)) {
    Serial.printf("❌ Failed to read from Asair DHT11 sensor after %d attempts!\n", maxRetries);
    Serial.println("   Check wiring and sensor connections.");
    return;
  }
  
  // Display readings clearly
  Serial.println("--- ASAIR DHT11 SENSOR VALUES ---");
  Serial.printf("🌡️  Temperature: %.1f°C\n", temperature);  // DHT11 has 1°C resolution
  Serial.printf("💧 Humidity: %.0f%%\n", humidity);         // DHT11 has 1% resolution
  Serial.println("--------------------------------");
  
  // Send data to server
  if (WiFi.status() == WL_CONNECTED) {
    sendDataToServer(temperature, humidity);
  } else {
    Serial.println("ERROR: WiFi not connected!");
    // Try to reconnect
    WiFi.reconnect();
  }
}

// Get current Unix timestamp
unsigned long getCurrentTimestamp() {
  time_t now;
  time(&now);
  if (now < 1000000000) { // If time is not properly set (before year 2001)
    // Return current time in seconds since boot as fallback
    return millis() / 1000;
  }
  return now;
}

void sendDataToServer(float temperature, float humidity) {
  HTTPClient http;
  http.begin(String(serverURL) + "/sensors/data");
  http.addHeader("Content-Type", "application/json");
  
  // Create JSON payload
  StaticJsonDocument<200> doc;
  doc["deviceId"] = "ESP32-DHT22-001";
  doc["location"]["name"] = "ESP32 Sensor";
  doc["location"]["latitude"] = 0.0;  // Set your actual coordinates
  doc["location"]["longitude"] = 0.0;
  doc["sensorData"]["temperature"] = temperature;
  doc["sensorData"]["humidity"] = humidity;
  // Let the server set the timestamp to ensure accuracy
  doc["sensorData"]["source"] = "ESP32";
  
  String jsonString;
  serializeJson(doc, jsonString);
  
  Serial.println("Sending data to server:");
  Serial.println(jsonString);
  
  // Send POST request
  int httpResponseCode = http.POST(jsonString);
  
  if (httpResponseCode > 0) {
    String response = http.getString();
    Serial.printf("Server response code: %d\n", httpResponseCode);
    Serial.println("Server response: " + response);
    
    if (httpResponseCode == 200) {
      Serial.println("✅ Data uploaded successfully!");
    }
  } else {
    Serial.printf("❌ Error sending data. Code: %d\n", httpResponseCode);
  }
  
  http.end();
}

void printWiFiStatus() {
  Serial.print("WiFi Status: ");
  switch(WiFi.status()) {
    case WL_CONNECTED:
      Serial.println("Connected");
      break;
    case WL_NO_SSID_AVAIL:
      Serial.println("SSID not available");
      break;
    case WL_CONNECT_FAILED:
      Serial.println("Connection failed");
      break;
    case WL_CONNECTION_LOST:
      Serial.println("Connection lost");
      break;
    case WL_DISCONNECTED:
      Serial.println("Disconnected");
      break;
    default:
      Serial.println("Unknown status");
      break;
  }
}
