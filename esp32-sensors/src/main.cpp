#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// WiFi credentials
const char* ssid = "Jessica13";         // ⬅️ Your WiFi network name
const char* password = "Thesiri01";  // ⬅️ Your WiFi password

// Server configuration for Vercel deployment
const char* serverURL = "https://weather-dashboardrapeesiri.vercel.app/api"; // ✅ Your Vercel URL
const unsigned long uploadInterval = 60000; // Upload every 60 seconds

// Temperature and Humidity sensor configuration
#define TEMP_SENSOR_PIN 9    // Temperature sensor on GPIO 9
#define HUMIDITY_SENSOR_PIN 2 // Humidity sensor on GPIO 2

// Timing variables
unsigned long lastUpload = 0;

void setup() {
  Serial.begin(115200);
  Serial.println("=== ESP32 Weather Sensor Starting ===");
  
  // Initialize analog sensor pins
  pinMode(TEMP_SENSOR_PIN, INPUT);
  pinMode(HUMIDITY_SENSOR_PIN, INPUT);
  Serial.println("Temperature and Humidity sensors initialized");
  Serial.printf("Temperature sensor on GPIO %d\n", TEMP_SENSOR_PIN);
  Serial.printf("Humidity sensor on GPIO %d\n", HUMIDITY_SENSOR_PIN);
  
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
  Serial.println("\n=== Reading Sensor Data ===");
  
  // Read analog values from sensors
  int tempReading = analogRead(TEMP_SENSOR_PIN);
  int humidityReading = analogRead(HUMIDITY_SENSOR_PIN);
  
  // Convert analog readings to actual values
  // Adjust these formulas based on your specific sensors
  float temperature = convertToTemperature(tempReading);
  float humidity = convertToHumidity(humidityReading);
  
  // Display readings
  Serial.printf("Temperature reading: %d (%.2f°C)\n", tempReading, temperature);
  Serial.printf("Humidity reading: %d (%.2f%%)\n", humidityReading, humidity);
  
  // Send data to server
  if (WiFi.status() == WL_CONNECTED) {
    sendDataToServer(temperature, humidity);
  } else {
    Serial.println("ERROR: WiFi not connected!");
    // Try to reconnect
    WiFi.reconnect();
  }
}

// Convert analog reading to temperature (adjust for your sensor)
float convertToTemperature(int reading) {
  // Example conversion for common temperature sensors
  // Adjust this formula based on your specific sensor datasheet
  float voltage = reading * (3.3 / 4095.0); // ESP32 ADC: 12-bit (0-4095)
  float temperature = (voltage - 0.5) * 100; // Example: LM35 or similar
  return temperature;
}

// Convert analog reading to humidity (adjust for your sensor)
float convertToHumidity(int reading) {
  // Example conversion for humidity sensors
  // Adjust this formula based on your specific sensor datasheet
  float voltage = reading * (3.3 / 4095.0);
  float humidity = (voltage / 3.3) * 100; // Simple linear conversion
  return constrain(humidity, 0, 100); // Ensure humidity is 0-100%
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
  doc["sensorData"]["timestamp"] = WiFi.getTime();
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
