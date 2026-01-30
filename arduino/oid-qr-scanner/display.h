/**
 * BrainSAIT OID Scanner - Display Driver
 *
 * Support for OLED (SSD1306) and LCD (I2C) displays
 */

#ifndef DISPLAY_H
#define DISPLAY_H

#include <Arduino.h>
#include <Wire.h>

// Uncomment ONE display type
#define USE_OLED_DISPLAY  1
// #define USE_LCD_DISPLAY   1

#if USE_OLED_DISPLAY
  #include <Adafruit_GFX.h>
  #include <Adafruit_SSD1306.h>

  #define SCREEN_WIDTH 128
  #define SCREEN_HEIGHT 64
  #define OLED_RESET -1
  #define SCREEN_ADDRESS 0x3C

  Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);
#endif

#if USE_LCD_DISPLAY
  #include <LiquidCrystal_I2C.h>
  LiquidCrystal_I2C lcd(0x27, 20, 4);
#endif

class OIDDisplay {
public:
  bool initialized = false;

  bool begin() {
    #if USE_OLED_DISPLAY
      if (!display.begin(SSD1306_SWITCHCAPVCC, SCREEN_ADDRESS)) {
        Serial.println("[Display] SSD1306 allocation failed");
        return false;
      }
      display.clearDisplay();
      display.setTextSize(1);
      display.setTextColor(SSD1306_WHITE);
      initialized = true;
      showSplash();
      return true;
    #endif

    #if USE_LCD_DISPLAY
      lcd.init();
      lcd.backlight();
      initialized = true;
      showSplash();
      return true;
    #endif

    return false;
  }

  void showSplash() {
    #if USE_OLED_DISPLAY
      display.clearDisplay();
      display.setTextSize(2);
      display.setCursor(10, 0);
      display.println("BrainSAIT");
      display.setTextSize(1);
      display.setCursor(20, 20);
      display.println("OID Scanner");
      display.setCursor(15, 35);
      display.println("PEN: 61026");
      display.setCursor(5, 50);
      display.println("Initializing...");
      display.display();
    #endif

    #if USE_LCD_DISPLAY
      lcd.clear();
      lcd.setCursor(3, 0);
      lcd.print("BrainSAIT");
      lcd.setCursor(4, 1);
      lcd.print("OID Scanner");
      lcd.setCursor(5, 2);
      lcd.print("PEN: 61026");
      lcd.setCursor(2, 3);
      lcd.print("Initializing...");
    #endif

    delay(2000);
  }

  void showReady() {
    #if USE_OLED_DISPLAY
      display.clearDisplay();
      display.setTextSize(1);
      display.setCursor(0, 0);
      display.println("BrainSAIT OID");
      display.drawLine(0, 10, 128, 10, SSD1306_WHITE);
      display.setCursor(0, 20);
      display.println("Ready to scan");
      display.setCursor(0, 35);
      display.println("Hold QR code in");
      display.setCursor(0, 45);
      display.println("front of camera");
      display.display();
    #endif

    #if USE_LCD_DISPLAY
      lcd.clear();
      lcd.setCursor(0, 0);
      lcd.print("BrainSAIT OID");
      lcd.setCursor(0, 1);
      lcd.print("--------------------");
      lcd.setCursor(0, 2);
      lcd.print("Ready to scan");
      lcd.setCursor(0, 3);
      lcd.print("Hold QR in front");
    #endif
  }

  void showScanning() {
    #if USE_OLED_DISPLAY
      display.clearDisplay();
      display.setTextSize(2);
      display.setCursor(10, 25);
      display.println("Scanning...");
      display.display();
    #endif

    #if USE_LCD_DISPLAY
      lcd.clear();
      lcd.setCursor(5, 1);
      lcd.print("Scanning...");
    #endif
  }

  void showOIDResult(const String& oid, const String& name, const String& status) {
    #if USE_OLED_DISPLAY
      display.clearDisplay();
      display.setTextSize(1);

      // Header
      display.setCursor(0, 0);
      display.println("SCAN RESULT");
      display.drawLine(0, 10, 128, 10, SSD1306_WHITE);

      // OID (scroll if too long)
      display.setCursor(0, 15);
      display.print("OID: ");
      if (oid.length() > 15) {
        // Show last part of OID
        display.println("..." + oid.substring(oid.length() - 12));
      } else {
        display.println(oid);
      }

      // Name
      display.setCursor(0, 28);
      display.print("Name: ");
      display.println(name.substring(0, 14));

      // Status with icon
      display.setCursor(0, 41);
      display.print("Status: ");
      if (status == "active") {
        display.fillCircle(60, 44, 3, SSD1306_WHITE);
      } else {
        display.drawCircle(60, 44, 3, SSD1306_WHITE);
      }
      display.setCursor(70, 41);
      display.println(status);

      // Checkmark
      display.drawLine(100, 55, 108, 63, SSD1306_WHITE);
      display.drawLine(108, 63, 125, 48, SSD1306_WHITE);

      display.display();
    #endif

    #if USE_LCD_DISPLAY
      lcd.clear();
      lcd.setCursor(0, 0);
      lcd.print("SCAN OK!");

      // OID (truncate for LCD)
      lcd.setCursor(0, 1);
      if (oid.length() > 20) {
        lcd.print(oid.substring(oid.length() - 20));
      } else {
        lcd.print(oid);
      }

      // Name
      lcd.setCursor(0, 2);
      lcd.print(name.substring(0, 20));

      // Status
      lcd.setCursor(0, 3);
      lcd.print("Status: ");
      lcd.print(status);
    #endif
  }

  void showError(const String& message) {
    #if USE_OLED_DISPLAY
      display.clearDisplay();
      display.setTextSize(2);
      display.setCursor(20, 10);
      display.println("ERROR");
      display.setTextSize(1);
      display.setCursor(0, 40);
      display.println(message.substring(0, 21));
      display.display();
    #endif

    #if USE_LCD_DISPLAY
      lcd.clear();
      lcd.setCursor(7, 0);
      lcd.print("ERROR");
      lcd.setCursor(0, 2);
      lcd.print(message.substring(0, 20));
    #endif
  }

  void showWiFiStatus(bool connected, const String& ip) {
    #if USE_OLED_DISPLAY
      display.clearDisplay();
      display.setTextSize(1);
      display.setCursor(0, 0);
      display.println("WiFi Status");
      display.drawLine(0, 10, 128, 10, SSD1306_WHITE);

      display.setCursor(0, 20);
      if (connected) {
        display.println("Connected!");
        display.setCursor(0, 35);
        display.print("IP: ");
        display.println(ip);
      } else {
        display.println("Disconnected");
        display.setCursor(0, 35);
        display.println("Offline mode");
      }
      display.display();
    #endif

    #if USE_LCD_DISPLAY
      lcd.clear();
      lcd.setCursor(0, 0);
      lcd.print("WiFi Status");
      lcd.setCursor(0, 1);
      lcd.print("--------------------");
      lcd.setCursor(0, 2);
      if (connected) {
        lcd.print("Connected");
        lcd.setCursor(0, 3);
        lcd.print("IP: ");
        lcd.print(ip.substring(0, 15));
      } else {
        lcd.print("Disconnected");
      }
    #endif
  }

  void showHistory(int count, const String& lastOID) {
    #if USE_OLED_DISPLAY
      display.clearDisplay();
      display.setTextSize(1);
      display.setCursor(0, 0);
      display.println("Scan History");
      display.drawLine(0, 10, 128, 10, SSD1306_WHITE);

      display.setCursor(0, 20);
      display.print("Total scans: ");
      display.println(count);

      display.setCursor(0, 35);
      display.println("Last scan:");
      display.setCursor(0, 47);
      if (lastOID.length() > 21) {
        display.println("..." + lastOID.substring(lastOID.length() - 18));
      } else {
        display.println(lastOID);
      }
      display.display();
    #endif

    #if USE_LCD_DISPLAY
      lcd.clear();
      lcd.setCursor(0, 0);
      lcd.print("Scan History");
      lcd.setCursor(0, 1);
      lcd.print("Total: ");
      lcd.print(count);
      lcd.setCursor(0, 2);
      lcd.print("Last:");
      lcd.setCursor(0, 3);
      lcd.print(lastOID.substring(lastOID.length() - 20));
    #endif
  }

  void showProgress(const String& task, int percent) {
    #if USE_OLED_DISPLAY
      display.clearDisplay();
      display.setTextSize(1);
      display.setCursor(0, 10);
      display.println(task);

      // Progress bar
      display.drawRect(10, 35, 108, 15, SSD1306_WHITE);
      int fillWidth = (percent * 104) / 100;
      display.fillRect(12, 37, fillWidth, 11, SSD1306_WHITE);

      display.setCursor(50, 55);
      display.print(percent);
      display.println("%");
      display.display();
    #endif

    #if USE_LCD_DISPLAY
      lcd.clear();
      lcd.setCursor(0, 0);
      lcd.print(task.substring(0, 20));
      lcd.setCursor(0, 2);

      // Simple progress bar
      int bars = (percent * 20) / 100;
      for (int i = 0; i < 20; i++) {
        lcd.print(i < bars ? '#' : '-');
      }
      lcd.setCursor(8, 3);
      lcd.print(percent);
      lcd.print("%");
    #endif
  }

  void clear() {
    #if USE_OLED_DISPLAY
      display.clearDisplay();
      display.display();
    #endif

    #if USE_LCD_DISPLAY
      lcd.clear();
    #endif
  }

  void setBrightness(uint8_t level) {
    #if USE_OLED_DISPLAY
      // SSD1306 contrast (0-255)
      display.ssd1306_command(SSD1306_SETCONTRAST);
      display.ssd1306_command(level);
    #endif

    #if USE_LCD_DISPLAY
      if (level > 0) {
        lcd.backlight();
      } else {
        lcd.noBacklight();
      }
    #endif
  }
};

#endif // DISPLAY_H
