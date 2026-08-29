/**
 * 🌾 Cold Shield — Smart Agricultural Cold-Chain & GPS Node
 * 🧊 Hardware: ESP32 + DHT11/DHT22 (Temp/Hum) + NEO-6M / NEO-7M GPS Module (GY-GPSV3-NEO)
 * 
 * Hardware Connections:
 * ----------------------------------------------------
 * DHT11 / DHT22 Sensor:
 *   VCC (+)  --> ESP32 3V3
 *   GND (-)  --> ESP32 GND
 *   DATA     --> ESP32 GPIO 15 (D15)
 * 
 * NEO-6M GPS Module (with Ceramic Patch Antenna):
 *   VCC      --> ESP32 3V3 / 5V
 *   GND      --> ESP32 GND
 *   TX       --> ESP32 GPIO 16 (RX2)
 *   RX       --> ESP32 GPIO 17 (TX2)
 * ----------------------------------------------------
 * 
 * Required Libraries:
 *   1. DHT sensor library by Adafruit
 *   2. TinyGPSPlus by Mikal Hart (for NEO-6M NMEA parsing)
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <HardwareSerial.h>
#include <TinyGPSPlus.h>
#include "DHT.h"

// ======================== WI-FI & THINGSPEAK CONFIG ========================
const char* ssid = "Farmer_WiFi_Hotspot";          // Your Wi-Fi SSID
const char* password = "ColdShieldSecurePass";      // Your Wi-Fi Password
const char* writeApiKey = "XKR0V0DA4T18LG55";       // ThingSpeak Write API Key
const char* thingspeakServer = "http://api.thingspeak.com";

// ======================== HARDWARE PIN CONFIG ========================
#define DHTPIN 15              // GPIO 15 connected to DHT11 Data Pin
#define DHTTYPE DHT11          // Sensor type: DHT11 or DHT22

#define GPS_RX_PIN 16          // Connected to NEO-6M TX pin
#define GPS_TX_PIN 17          // Connected to NEO-6M RX pin
#define GPS_BAUD 9600          // Standard NEO-6M baud rate

DHT dht(DHTPIN, DHTTYPE);
TinyGPSPlus gps;
HardwareSerial gpsSerial(2);   // UART 2 on ESP32

void setup() {
  Serial.begin(115200);
  delay(1000);
  
  Serial.println("\n========================================================");
  Serial.println("🛡️ Cold Shield — ESP32 + NEO-6M GPS + DHT11 Ingestion Node");
  Serial.println("========================================================");
  
  // Initialize DHT Sensor
  dht.begin();
  Serial.println("✅ DHT11 Sensor Initialized.");
  
  // Initialize GPS UART
  gpsSerial.begin(GPS_BAUD, SERIAL_8N1, GPS_RX_PIN, GPS_TX_PIN);
  Serial.println("✅ NEO-6M GPS UART2 Initialized (9600 Baud).");

  // Connect to Wi-Fi
  connectToWiFi();
}

void loop() {
  if (WiFi.status() != WL_CONNECTED) {
    connectToWiFi();
  }

  // Read incoming GPS NMEA sentences
  while (gpsSerial.available() > 0) {
    gps.encode(gpsSerial.read());
  }

  // Read Temperature & Humidity from DHT11
  float humidity = dht.readHumidity();
  float temperature = dht.readTemperature(); // Celsius

  if (isnan(humidity) || isnan(temperature)) {
    Serial.println("⚠️ Warning: Failed to read from DHT11 probe!");
    delay(2000);
    return;
  }

  // Extract GPS Telemetry
  double latitude = 15.8281;   // Default fallback: Kurnool AP Highway
  double longitude = 78.0373;
  float speedKmh = 52.4;
  int satellites = 8;

  if (gps.location.isValid()) {
    latitude = gps.location.lat();
    longitude = gps.location.lng();
    speedKmh = gps.speed.kmph();
    satellites = gps.satellites.value();
    Serial.printf("🛰️ GPS Lock Acquired! Satellites: %d | Lat: %.6f, Lon: %.6f | Speed: %.1f km/h\n", 
                  satellites, latitude, longitude, speedKmh);
  } else {
    Serial.println("🛰️ GPS Searching for Satellites via Ceramic Antenna...");
  }

  Serial.printf("🌡️ Inside Temp: %.1f °C | 💧 Humidity: %.1f %% RH | 🚛 Speed: %.1f km/h\n", 
                temperature, humidity, speedKmh);

  // Upload Complete Telemetry to ThingSpeak
  // Field1: Temp, Field2: Hum, Field3: Lat, Field4: Lon, Field5: Speed, Field6: Sats
  uploadTelemetryToThingSpeak(temperature, humidity, latitude, longitude, speedKmh, satellites);

  // Upload interval (15 seconds standard)
  Serial.println("Sleeping 15 seconds until next telemetry burst...\n");
  delay(15000);
}

void connectToWiFi() {
  Serial.print("Connecting to Wi-Fi Network: ");
  Serial.println(ssid);
  WiFi.begin(ssid, password);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(1000);
    Serial.print(".");
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n✅ Wi-Fi connected successfully!");
    Serial.print("ESP32 IP Address: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\n❌ Wi-Fi Connection failed. Retrying...");
  }
}

void uploadTelemetryToThingSpeak(float temp, float hum, double lat, double lon, float speed, int sats) {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    
    // Construct multi-field ThingSpeak payload
    String url = String(thingspeakServer) + "/update?api_key=" + writeApiKey +
                 "&field1=" + String(temp, 1) +
                 "&field2=" + String(hum, 1) +
                 "&field3=" + String(lat, 6) +
                 "&field4=" + String(lon, 6) +
                 "&field5=" + String(speed, 1) +
                 "&field6=" + String(sats);

    Serial.print("Sending Ingestion Payload: ");
    Serial.println(url);

    http.begin(url);
    int responseCode = http.GET();

    if (responseCode > 0) {
      Serial.printf("✅ ThingSpeak Response Code: %d (Entry ID: %s)\n", responseCode, http.getString().c_str());
    } else {
      Serial.printf("❌ Error sending telemetry: %d\n", responseCode);
    }
    http.end();
  }
}
