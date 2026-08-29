/**
 * 🌾 KrishiMitra - Smart Farmer Assistant
 * 🧊 Cold Chain Monitoring IoT Script for ESP32 & DHT11
 * 
 * This sketch reads temperature and humidity from a DHT11 sensor and
 * uploads it to ThingSpeak at regular intervals (every 15 seconds) to
 * enable real-time observation on the KrishiMitra web dashboard.
 * 
 * Hardware Connections:
 * DHT11 Breakout Module Pin   | ESP32 Pin
 * ----------------------------|----------
 * VCC / +                     | 3V3
 * GND / -                     | GND
 * DATA                        | D15 (GPIO 15)
 * 
 * Libraries Required:
 * 1. DHT Sensor Library by Adafruit
 * 2. Adafruit Unified Sensor Library
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include "DHT.h"

// ======================== CONFIGURATION ========================
// Replace with your WiFi credentials
const char* ssid = "Hackathon-29-30";             // Replace with your WiFi SSID
const char* password = "M!t$#ECE1998";     // Replace with your WiFi Password
// Note: Ensure these match the values in your frontend .env file!
const char* writeApiKey = "XKR0V0DA4T18LG55"; 
const char* thingspeakServer = "http://api.thingspeak.com";

// Sensor Configuration
#define DHTPIN 15          // ESP32 GPIO pin D15 connected to DHT11 DATA pin
#define DHTTYPE DHT11      // DHT 11 sensor model
// ===============================================================

DHT dht(DHTPIN, DHTTYPE);

void setup() {
  Serial.begin(115200);
  delay(1000);
  
  Serial.println("\n--- KrishiMitra Cold Chain Node Initializing ---");
  
  // Initialize DHT sensor
  dht.begin();
  Serial.println("DHT11 sensor initialized.");

  // Connect to WiFi
  connectToWiFi();
}

void loop() {
  // Check WiFi connection status, reconnect if lost
  if (WiFi.status() != WL_CONNECTED) {
    connectToWiFi();
  }

  // Reading temperature or humidity takes about 250 milliseconds
  float humidity = dht.readHumidity();
  float temperature = dht.readTemperature(); // Celsius (default)

  // Check if any reads failed and exit early (to try again)
  if (isnan(humidity) || isnan(temperature)) {
    Serial.println("❌ Failed to read from DHT sensor!");
    delay(2000);
    return;
  }

  // Print readings to the Serial Monitor
  Serial.print("🌡️ Temperature: ");
  Serial.print(temperature);
  Serial.print(" °C | 💧 Humidity: ");
  Serial.print(humidity);
  Serial.println(" %");

  // Upload data to ThingSpeak
  uploadToThingSpeak(temperature, humidity);

  // ThingSpeak free channels require at least a 15-second delay between updates
  Serial.println("Sleeping for 15 seconds...");
  delay(15000);
}

void connectToWiFi() {
  Serial.print("Connecting to WiFi Network: ");
  Serial.println(ssid);
  
  WiFi.begin(ssid, password);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(1000);
    Serial.print(".");
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n✅ WiFi connected successfully!");
    Serial.print("IP address: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\n❌ WiFi connection failed. Retrying in next loop...");
  }
}

void uploadToThingSpeak(float temp, float hum) {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    
    // Construct the ThingSpeak Update URL
    // field1: Temperature, field2: Humidity
    String url = String(thingspeakServer) + "/update?api_key=" + writeApiKey + 
                 "&field1=" + String(temp, 1) + 
                 "&field2=" + String(hum, 1);
                 
    Serial.print("Sending data to ThingSpeak: ");
    Serial.println(url);
    
    http.begin(url);
    int httpResponseCode = http.GET();
    
    if (httpResponseCode > 0) {
      String response = http.getString();
      Serial.print("✅ ThingSpeak Response Code: ");
      Serial.println(httpResponseCode);
      Serial.print("Entry ID: ");
      Serial.println(response);
    } else {
      Serial.print("❌ Error on sending GET: ");
      Serial.println(httpResponseCode);
    }
    
    http.end(); // Free resources
  } else {
    Serial.println("⚠️ Cannot upload to ThingSpeak: WiFi not connected.");
  }
}
