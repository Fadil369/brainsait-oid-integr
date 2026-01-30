/**
 * BrainSAIT OID QR Scanner Configuration
 *
 * Copy this file to config_local.h and update with your credentials
 */

#ifndef CONFIG_H
#define CONFIG_H

// ============== NETWORK CONFIGURATION ==============

// WiFi Settings
#define WIFI_SSID           "YOUR_WIFI_SSID"
#define WIFI_PASSWORD       "YOUR_WIFI_PASSWORD"

// Alternative WiFi (failover)
#define WIFI_SSID_ALT       "YOUR_BACKUP_SSID"
#define WIFI_PASSWORD_ALT   "YOUR_BACKUP_PASSWORD"

// ============== BRAINSAIT API ==============

// NetworkShare Server (local network)
#define BRAINSAIT_API_URL   "http://192.168.100.220:8080/oid"
#define BRAINSAIT_API_KEY   "brainsait-oid-scanner-001"

// Production API (uncomment for production use)
// #define BRAINSAIT_API_URL   "https://api.brainsait.com/oid"
// #define BRAINSAIT_API_KEY   "your-production-api-key"

// ============== OID CONFIGURATION ==============

// BrainSAIT IANA Private Enterprise Number
#define BRAINSAIT_PEN       61026

// OID Namespace Root
#define BRAINSAIT_OID_ROOT  "1.3.6.1.4.1.61026"

// Device OID (assign unique per device)
// Infrastructure branch: 1.3.6.1.4.1.61026.4
// IoT Devices sub-branch: 1.3.6.1.4.1.61026.4.3
#define DEVICE_OID          "1.3.6.1.4.1.61026.4.3.1"
#define DEVICE_NAME         "OID-QR-Scanner-001"
#define DEVICE_LOCATION     "BrainSAIT-HQ-Riyadh"

// ============== HARDWARE CONFIGURATION ==============

// Scanner Type: 1 = ESP32-CAM, 0 = GM65 Module
#define USE_ESP32_CAM       1

// Pin Definitions (ESP32-CAM AI-Thinker)
#if USE_ESP32_CAM
  #define FLASH_LED_PIN     4
  #define STATUS_LED_PIN    33
  #define BUZZER_PIN        12
#else
  // GM65 Module (UART)
  #define GM65_RX_PIN       16
  #define GM65_TX_PIN       17
  #define STATUS_LED_PIN    2
  #define BUZZER_PIN        4
#endif

// ============== DISPLAY (Optional) ==============

// OLED Display (SSD1306)
#define USE_OLED_DISPLAY    0
#if USE_OLED_DISPLAY
  #define OLED_SDA_PIN      21
  #define OLED_SCL_PIN      22
  #define OLED_WIDTH        128
  #define OLED_HEIGHT       64
#endif

// LCD Display (I2C 16x2/20x4)
#define USE_LCD_DISPLAY     0
#if USE_LCD_DISPLAY
  #define LCD_ADDRESS       0x27
  #define LCD_COLS          20
  #define LCD_ROWS          4
#endif

// ============== OPERATIONAL SETTINGS ==============

// Scan settings
#define SCAN_DEBOUNCE_MS    2000    // Minimum time between scans of same QR
#define SCAN_TIMEOUT_MS     30000   // Timeout for camera capture
#define MAX_QR_SIZE         512     // Maximum QR data size

// API settings
#define API_TIMEOUT_MS      10000   // HTTP request timeout
#define API_RETRY_COUNT     3       // Retry attempts on failure
#define API_RETRY_DELAY_MS  1000    // Delay between retries

// History settings
#define HISTORY_SIZE        50      // Number of scans to store locally
#define EEPROM_SIZE         4096    // EEPROM allocation

// ============== DEBUG SETTINGS ==============

#define DEBUG_SERIAL        1       // Enable serial debug output
#define DEBUG_BAUD_RATE     115200  // Serial baud rate
#define DEBUG_VERBOSE       0       // Extra verbose logging

// ============== OID BRANCH DEFINITIONS ==============

// These match the BrainSAIT OID Registry structure
namespace OIDBranches {
  // Geographic (1.3.6.1.4.1.61026.1)
  const char* GEOGRAPHIC = "1.3.6.1.4.1.61026.1";
  const char* RIYADH = "1.3.6.1.4.1.61026.1.1";
  const char* SUDAN = "1.3.6.1.4.1.61026.1.2";

  // Organization (1.3.6.1.4.1.61026.2)
  const char* ORGANIZATION = "1.3.6.1.4.1.61026.2";
  const char* DEPARTMENTS = "1.3.6.1.4.1.61026.2.1";
  const char* ENGINEERING = "1.3.6.1.4.1.61026.2.1.1";
  const char* HEALTHCARE_OPS = "1.3.6.1.4.1.61026.2.1.2";

  // Products (1.3.6.1.4.1.61026.3)
  const char* PRODUCTS = "1.3.6.1.4.1.61026.3";
  const char* CMS = "1.3.6.1.4.1.61026.3.1";
  const char* HEALTHCARE_PLATFORM = "1.3.6.1.4.1.61026.3.2";
  const char* AI_NORMALIZER = "1.3.6.1.4.1.61026.3.2.1";
  const char* SIGNER = "1.3.6.1.4.1.61026.3.2.2";
  const char* NPHIES_CONNECTOR = "1.3.6.1.4.1.61026.3.2.3";
  const char* AI_AGENTS = "1.3.6.1.4.1.61026.3.3";

  // Infrastructure (1.3.6.1.4.1.61026.4)
  const char* INFRASTRUCTURE = "1.3.6.1.4.1.61026.4";
  const char* OLLAMA_CLOUD = "1.3.6.1.4.1.61026.4.1";
  const char* DOCKER = "1.3.6.1.4.1.61026.4.2";
  const char* IOT_DEVICES = "1.3.6.1.4.1.61026.4.3";
}

#endif // CONFIG_H
