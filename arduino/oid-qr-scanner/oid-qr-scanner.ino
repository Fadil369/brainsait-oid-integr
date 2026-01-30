/**
 * BrainSAIT OID QR Code Scanner
 *
 * Hardware: ESP32-CAM (AI-Thinker) or ESP32 + GM65 QR Module
 * Purpose: Scan OID QR codes and integrate with BrainSAIT OID Registry
 *
 * OID Root: 1.3.6.1.4.1.61026 (BrainSAIT PEN)
 *
 * @author BrainSAIT Engineering
 * @license CC BY-NC-SA
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <EEPROM.h>

// ============== CONFIGURATION ==============
// Choose your hardware setup
#define USE_ESP32_CAM  1  // Set to 1 for ESP32-CAM, 0 for GM65 module

#if USE_ESP32_CAM
  #include "esp_camera.h"
  #include "quirc.h"  // QR code decoder library

  // ESP32-CAM (AI-Thinker) pin definitions
  #define PWDN_GPIO_NUM     32
  #define RESET_GPIO_NUM    -1
  #define XCLK_GPIO_NUM      0
  #define SIOD_GPIO_NUM     26
  #define SIOC_GPIO_NUM     27
  #define Y9_GPIO_NUM       35
  #define Y8_GPIO_NUM       34
  #define Y7_GPIO_NUM       39
  #define Y6_GPIO_NUM       36
  #define Y5_GPIO_NUM       21
  #define Y4_GPIO_NUM       19
  #define Y3_GPIO_NUM       18
  #define Y2_GPIO_NUM        5
  #define VSYNC_GPIO_NUM    25
  #define HREF_GPIO_NUM     23
  #define PCLK_GPIO_NUM     22
  #define FLASH_GPIO_NUM     4
#else
  // GM65 QR Scanner Module (UART)
  #define GM65_RX_PIN       16
  #define GM65_TX_PIN       17
  HardwareSerial GM65Serial(2);
#endif

// WiFi Configuration
const char* WIFI_SSID = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";

// BrainSAIT API Configuration
const char* BRAINSAIT_API_URL = "https://api.brainsait.com/oid";
const char* BRAINSAIT_API_KEY = "YOUR_API_KEY";

// OID Constants
const char* BRAINSAIT_OID_ROOT = "1.3.6.1.4.1.61026";
const int BRAINSAIT_PEN = 61026;

// Status LED
#define STATUS_LED_PIN    33
#define BUZZER_PIN        12

// ============== GLOBAL VARIABLES ==============
struct OIDData {
  String oid;
  String name;
  String description;
  String nodeType;
  String status;
  String timestamp;
  bool valid;
};

OIDData lastScannedOID;
bool wifiConnected = false;

#if USE_ESP32_CAM
  struct quirc *qr = NULL;
  camera_fb_t *fb = NULL;
#endif

// ============== SETUP ==============
void setup() {
  Serial.begin(115200);
  Serial.println("\n========================================");
  Serial.println("  BrainSAIT OID QR Scanner v1.0");
  Serial.println("  PEN: 61026 | Root: 1.3.6.1.4.1.61026");
  Serial.println("========================================\n");

  // Initialize pins
  pinMode(STATUS_LED_PIN, OUTPUT);
  pinMode(BUZZER_PIN, OUTPUT);

  // Status: Initializing
  blinkLED(3, 100);

  // Initialize EEPROM for storing scan history
  EEPROM.begin(512);

  // Connect to WiFi
  connectWiFi();

  // Initialize QR scanner
  #if USE_ESP32_CAM
    initCamera();
    initQRDecoder();
  #else
    initGM65();
  #endif

  // Ready signal
  successBeep();
  Serial.println("[READY] OID Scanner initialized. Waiting for QR codes...\n");
}

// ============== MAIN LOOP ==============
void loop() {
  #if USE_ESP32_CAM
    scanQRWithCamera();
  #else
    scanQRWithGM65();
  #endif

  // Handle serial commands
  if (Serial.available()) {
    handleSerialCommand();
  }

  delay(100);
}

// ============== WiFi Functions ==============
void connectWiFi() {
  Serial.print("[WiFi] Connecting to ");
  Serial.println(WIFI_SSID);

  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 30) {
    delay(500);
    Serial.print(".");
    attempts++;
    digitalWrite(STATUS_LED_PIN, !digitalRead(STATUS_LED_PIN));
  }

  if (WiFi.status() == WL_CONNECTED) {
    wifiConnected = true;
    Serial.println("\n[WiFi] Connected!");
    Serial.print("[WiFi] IP: ");
    Serial.println(WiFi.localIP());
    digitalWrite(STATUS_LED_PIN, HIGH);
  } else {
    Serial.println("\n[WiFi] Connection failed - running in offline mode");
    wifiConnected = false;
  }
}

// ============== Camera Functions (ESP32-CAM) ==============
#if USE_ESP32_CAM
void initCamera() {
  Serial.println("[Camera] Initializing ESP32-CAM...");

  camera_config_t config;
  config.ledc_channel = LEDC_CHANNEL_0;
  config.ledc_timer = LEDC_TIMER_0;
  config.pin_d0 = Y2_GPIO_NUM;
  config.pin_d1 = Y3_GPIO_NUM;
  config.pin_d2 = Y4_GPIO_NUM;
  config.pin_d3 = Y5_GPIO_NUM;
  config.pin_d4 = Y6_GPIO_NUM;
  config.pin_d5 = Y7_GPIO_NUM;
  config.pin_d6 = Y8_GPIO_NUM;
  config.pin_d7 = Y9_GPIO_NUM;
  config.pin_xclk = XCLK_GPIO_NUM;
  config.pin_pclk = PCLK_GPIO_NUM;
  config.pin_vsync = VSYNC_GPIO_NUM;
  config.pin_href = HREF_GPIO_NUM;
  config.pin_sccb_sda = SIOD_GPIO_NUM;
  config.pin_sccb_scl = SIOC_GPIO_NUM;
  config.pin_pwdn = PWDN_GPIO_NUM;
  config.pin_reset = RESET_GPIO_NUM;
  config.xclk_freq_hz = 10000000;
  config.pixel_format = PIXFORMAT_GRAYSCALE;
  config.frame_size = FRAMESIZE_VGA;  // 640x480 for QR scanning
  config.jpeg_quality = 12;
  config.fb_count = 1;
  config.grab_mode = CAMERA_GRAB_WHEN_EMPTY;

  esp_err_t err = esp_camera_init(&config);
  if (err != ESP_OK) {
    Serial.printf("[Camera] Init failed with error 0x%x\n", err);
    errorBeep();
    return;
  }

  Serial.println("[Camera] Initialized successfully");
}

void initQRDecoder() {
  Serial.println("[QR] Initializing quirc decoder...");
  qr = quirc_new();
  if (!qr) {
    Serial.println("[QR] Failed to allocate quirc");
    return;
  }
  if (quirc_resize(qr, 640, 480) < 0) {
    Serial.println("[QR] Failed to resize quirc");
    quirc_destroy(qr);
    qr = NULL;
    return;
  }
  Serial.println("[QR] Decoder ready");
}

void scanQRWithCamera() {
  if (!qr) return;

  fb = esp_camera_fb_get();
  if (!fb) {
    Serial.println("[Camera] Capture failed");
    return;
  }

  // Copy image to quirc buffer
  uint8_t *image = quirc_begin(qr, NULL, NULL);
  memcpy(image, fb->buf, fb->len);
  quirc_end(qr);

  // Check for QR codes
  int count = quirc_count(qr);
  for (int i = 0; i < count; i++) {
    struct quirc_code code;
    struct quirc_data data;

    quirc_extract(qr, i, &code);
    quirc_decode_error_t err = quirc_decode(&code, &data);

    if (err == QUIRC_SUCCESS) {
      String qrContent = String((char*)data.payload);
      Serial.println("\n[QR] Code detected!");
      Serial.println("[QR] Content: " + qrContent);

      processQRContent(qrContent);
    }
  }

  esp_camera_fb_return(fb);
}
#endif

// ============== GM65 Scanner Functions ==============
#if !USE_ESP32_CAM
void initGM65() {
  Serial.println("[GM65] Initializing QR Scanner Module...");
  GM65Serial.begin(9600, SERIAL_8N1, GM65_RX_PIN, GM65_TX_PIN);

  // Configure GM65 for continuous scanning
  // Command: Set trigger mode to automatic
  uint8_t autoScanCmd[] = {0x7E, 0x00, 0x08, 0x01, 0x00, 0x02, 0xAB, 0xCD};
  GM65Serial.write(autoScanCmd, sizeof(autoScanCmd));

  delay(100);
  Serial.println("[GM65] Scanner ready");
}

void scanQRWithGM65() {
  if (GM65Serial.available()) {
    String qrContent = "";
    unsigned long timeout = millis() + 500;

    while (millis() < timeout) {
      if (GM65Serial.available()) {
        char c = GM65Serial.read();
        if (c == '\r' || c == '\n') {
          if (qrContent.length() > 0) break;
        } else {
          qrContent += c;
        }
      }
    }

    if (qrContent.length() > 0) {
      Serial.println("\n[GM65] Code detected!");
      Serial.println("[GM65] Content: " + qrContent);
      processQRContent(qrContent);
    }
  }
}
#endif

// ============== QR Content Processing ==============
void processQRContent(String content) {
  // Try to parse as JSON (OID format from BrainSAIT platform)
  StaticJsonDocument<1024> doc;
  DeserializationError error = deserializeJson(doc, content);

  if (!error) {
    // Valid JSON - check if it's BrainSAIT OID format
    if (doc.containsKey("oid") || doc.containsKey("path")) {
      parseOIDJson(doc);
    } else {
      Serial.println("[Parse] JSON detected but not BrainSAIT OID format");
      lastScannedOID.valid = false;
    }
  } else {
    // Not JSON - check if it's a raw OID string
    if (content.startsWith(BRAINSAIT_OID_ROOT)) {
      parseRawOID(content);
    } else {
      Serial.println("[Parse] Unknown QR format");
      lastScannedOID.valid = false;
      errorBeep();
    }
  }

  // Process valid OID
  if (lastScannedOID.valid) {
    displayOIDInfo();
    successBeep();

    // Send to API if connected
    if (wifiConnected) {
      sendToAPI();
    }

    // Store in local history
    storeInHistory();
  }
}

void parseOIDJson(JsonDocument& doc) {
  /*
   * Expected BrainSAIT OID QR JSON format:
   * {
   *   "oid": "1.3.6.1.4.1.61026.3.2.1",
   *   "name": "AI Normalizer Service",
   *   "description": "Clinical coding and claim normalization service",
   *   "nodeType": "leaf",
   *   "status": "active",
   *   "pen": 61026,
   *   "provider": "BrainSAIT Enterprise",
   *   "timestamp": "2025-01-30T10:00:00Z"
   * }
   */

  lastScannedOID.oid = doc["oid"] | doc["path"] | "";
  lastScannedOID.name = doc["name"] | "Unknown";
  lastScannedOID.description = doc["description"] | "";
  lastScannedOID.nodeType = doc["nodeType"] | "unknown";
  lastScannedOID.status = doc["status"] | "unknown";
  lastScannedOID.timestamp = doc["timestamp"] | "";

  // Validate OID belongs to BrainSAIT namespace
  if (lastScannedOID.oid.startsWith(BRAINSAIT_OID_ROOT)) {
    lastScannedOID.valid = true;
    Serial.println("[OID] Valid BrainSAIT OID detected");
  } else {
    Serial.println("[OID] Warning: OID not in BrainSAIT namespace");
    lastScannedOID.valid = true; // Still process, but flag it
  }
}

void parseRawOID(String oidString) {
  lastScannedOID.oid = oidString;
  lastScannedOID.name = "Unknown (raw OID)";
  lastScannedOID.description = "";
  lastScannedOID.nodeType = "unknown";
  lastScannedOID.status = "unknown";
  lastScannedOID.timestamp = "";
  lastScannedOID.valid = true;

  Serial.println("[OID] Raw OID string detected");
}

void displayOIDInfo() {
  Serial.println("\n╔════════════════════════════════════════╗");
  Serial.println("║       BrainSAIT OID SCAN RESULT        ║");
  Serial.println("╠════════════════════════════════════════╣");
  Serial.println("║ OID: " + padString(lastScannedOID.oid, 32) + " ║");
  Serial.println("║ Name: " + padString(lastScannedOID.name, 31) + " ║");
  if (lastScannedOID.description.length() > 0) {
    Serial.println("║ Desc: " + padString(lastScannedOID.description.substring(0, 31), 31) + " ║");
  }
  Serial.println("║ Type: " + padString(lastScannedOID.nodeType, 31) + " ║");
  Serial.println("║ Status: " + padString(lastScannedOID.status, 29) + " ║");
  Serial.println("╚════════════════════════════════════════╝\n");
}

String padString(String str, int width) {
  if (str.length() >= width) {
    return str.substring(0, width);
  }
  while (str.length() < width) {
    str += " ";
  }
  return str;
}

// ============== API Integration ==============
void sendToAPI() {
  if (!wifiConnected) return;

  Serial.println("[API] Sending scan data to BrainSAIT...");

  HTTPClient http;
  http.begin(String(BRAINSAIT_API_URL) + "/scan");
  http.addHeader("Content-Type", "application/json");
  http.addHeader("X-BrainSAIT-API-Key", BRAINSAIT_API_KEY);
  http.addHeader("X-BrainSAIT-Device", "OID-Scanner-ESP32");
  http.addHeader("X-BrainSAIT-OID", lastScannedOID.oid);
  http.addHeader("X-BrainSAIT-PEN", String(BRAINSAIT_PEN));

  // Build JSON payload
  StaticJsonDocument<512> doc;
  doc["oid"] = lastScannedOID.oid;
  doc["name"] = lastScannedOID.name;
  doc["scannedAt"] = millis();
  doc["deviceIP"] = WiFi.localIP().toString();
  doc["wifiSSID"] = WIFI_SSID;

  String payload;
  serializeJson(doc, payload);

  int httpCode = http.POST(payload);

  if (httpCode > 0) {
    if (httpCode == HTTP_CODE_OK || httpCode == HTTP_CODE_CREATED) {
      Serial.println("[API] Scan recorded successfully");
      String response = http.getString();
      Serial.println("[API] Response: " + response);
    } else {
      Serial.printf("[API] Server error: %d\n", httpCode);
    }
  } else {
    Serial.printf("[API] Connection error: %s\n", http.errorToString(httpCode).c_str());
  }

  http.end();
}

// ============== Local Storage ==============
void storeInHistory() {
  // Store last 10 scans in EEPROM
  // Format: [count][oid1_len][oid1]...[oid10_len][oid10]

  int count = EEPROM.read(0);
  if (count > 10 || count < 0) count = 0;

  // Shift existing entries
  // (simplified - in production, use proper circular buffer)

  // Store new OID length and data
  int addr = 1 + (count % 10) * 50;
  EEPROM.write(addr, lastScannedOID.oid.length());
  for (int i = 0; i < lastScannedOID.oid.length() && i < 49; i++) {
    EEPROM.write(addr + 1 + i, lastScannedOID.oid[i]);
  }

  EEPROM.write(0, (count + 1) % 10);
  EEPROM.commit();

  Serial.println("[Storage] Scan saved to local history");
}

void printHistory() {
  Serial.println("\n[History] Recent scans:");
  int count = EEPROM.read(0);
  if (count > 10) count = 10;

  for (int i = 0; i < count; i++) {
    int addr = 1 + i * 50;
    int len = EEPROM.read(addr);
    if (len > 0 && len < 50) {
      String oid = "";
      for (int j = 0; j < len; j++) {
        oid += (char)EEPROM.read(addr + 1 + j);
      }
      Serial.printf("  %d. %s\n", i + 1, oid.c_str());
    }
  }
}

// ============== Serial Commands ==============
void handleSerialCommand() {
  String cmd = Serial.readStringUntil('\n');
  cmd.trim();
  cmd.toLowerCase();

  if (cmd == "help") {
    printHelp();
  } else if (cmd == "status") {
    printStatus();
  } else if (cmd == "history") {
    printHistory();
  } else if (cmd == "clear") {
    clearHistory();
  } else if (cmd == "reconnect") {
    connectWiFi();
  } else if (cmd.startsWith("test ")) {
    // Test scan with provided OID
    String testOID = cmd.substring(5);
    processQRContent("{\"oid\":\"" + testOID + "\",\"name\":\"Test Scan\",\"status\":\"test\"}");
  } else {
    Serial.println("[Cmd] Unknown command. Type 'help' for options.");
  }
}

void printHelp() {
  Serial.println("\n╔════════════════════════════════════════╗");
  Serial.println("║     BrainSAIT OID Scanner Commands     ║");
  Serial.println("╠════════════════════════════════════════╣");
  Serial.println("║ help      - Show this help menu        ║");
  Serial.println("║ status    - Show device status         ║");
  Serial.println("║ history   - Show recent scans          ║");
  Serial.println("║ clear     - Clear scan history         ║");
  Serial.println("║ reconnect - Reconnect to WiFi          ║");
  Serial.println("║ test <oid>- Test with specified OID    ║");
  Serial.println("╚════════════════════════════════════════╝\n");
}

void printStatus() {
  Serial.println("\n[Status] Device Information:");
  Serial.printf("  WiFi: %s\n", wifiConnected ? "Connected" : "Disconnected");
  if (wifiConnected) {
    Serial.print("  IP: ");
    Serial.println(WiFi.localIP());
    Serial.printf("  RSSI: %d dBm\n", WiFi.RSSI());
  }
  Serial.printf("  Free Heap: %d bytes\n", ESP.getFreeHeap());
  Serial.printf("  Uptime: %lu ms\n", millis());
  Serial.printf("  BrainSAIT PEN: %d\n", BRAINSAIT_PEN);
  Serial.printf("  OID Root: %s\n", BRAINSAIT_OID_ROOT);
}

void clearHistory() {
  for (int i = 0; i < 512; i++) {
    EEPROM.write(i, 0);
  }
  EEPROM.commit();
  Serial.println("[Storage] History cleared");
}

// ============== Feedback Functions ==============
void blinkLED(int times, int delayMs) {
  for (int i = 0; i < times; i++) {
    digitalWrite(STATUS_LED_PIN, HIGH);
    delay(delayMs);
    digitalWrite(STATUS_LED_PIN, LOW);
    delay(delayMs);
  }
}

void successBeep() {
  tone(BUZZER_PIN, 2000, 100);
  delay(100);
  tone(BUZZER_PIN, 2500, 100);
}

void errorBeep() {
  tone(BUZZER_PIN, 500, 200);
  delay(100);
  tone(BUZZER_PIN, 300, 300);
}
