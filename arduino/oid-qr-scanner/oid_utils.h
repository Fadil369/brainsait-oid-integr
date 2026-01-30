/**
 * BrainSAIT OID Utilities Library
 *
 * Helper functions for OID parsing, validation, and manipulation
 */

#ifndef OID_UTILS_H
#define OID_UTILS_H

#include <Arduino.h>
#include <ArduinoJson.h>

// BrainSAIT OID Root
#define BRAINSAIT_ROOT "1.3.6.1.4.1.61026"
#define ISO_ROOT "1"
#define ISO_MEMBER_BODY "1.2"
#define ISO_IDENTIFIED_ORG "1.3"
#define DOD "1.3.6"
#define INTERNET "1.3.6.1"
#define PRIVATE "1.3.6.1.4"
#define ENTERPRISE "1.3.6.1.4.1"

/**
 * OID Structure representing a parsed Object Identifier
 */
struct OID {
  String fullPath;           // Complete OID string
  int components[20];        // Individual arc values
  int depth;                 // Number of components
  bool isBrainSAIT;         // Belongs to BrainSAIT namespace
  int branchType;           // 1=geo, 2=org, 3=products, 4=infra

  // Metadata from QR
  String name;
  String description;
  String status;
  String nodeType;
};

/**
 * Parse an OID string into components
 * @param oidString The OID string (e.g., "1.3.6.1.4.1.61026.3.2.1")
 * @return Parsed OID structure
 */
OID parseOID(const String& oidString) {
  OID oid;
  oid.fullPath = oidString;
  oid.depth = 0;
  oid.isBrainSAIT = false;
  oid.branchType = 0;

  // Parse components
  int start = 0;
  for (int i = 0; i <= oidString.length() && oid.depth < 20; i++) {
    if (i == oidString.length() || oidString[i] == '.') {
      String component = oidString.substring(start, i);
      oid.components[oid.depth++] = component.toInt();
      start = i + 1;
    }
  }

  // Check if BrainSAIT namespace
  if (oid.depth >= 7 &&
      oid.components[0] == 1 &&
      oid.components[1] == 3 &&
      oid.components[2] == 6 &&
      oid.components[3] == 1 &&
      oid.components[4] == 4 &&
      oid.components[5] == 1 &&
      oid.components[6] == 61026) {
    oid.isBrainSAIT = true;

    // Determine branch type
    if (oid.depth > 7) {
      oid.branchType = oid.components[7];
    }
  }

  return oid;
}

/**
 * Validate OID format
 * @param oidString The OID string to validate
 * @return true if valid OID format
 */
bool validateOIDFormat(const String& oidString) {
  if (oidString.length() == 0) return false;

  // Must start with digit
  if (!isDigit(oidString[0])) return false;

  // Check format: digits separated by dots
  bool lastWasDot = false;
  for (int i = 0; i < oidString.length(); i++) {
    char c = oidString[i];
    if (c == '.') {
      if (lastWasDot || i == 0 || i == oidString.length() - 1) {
        return false; // Consecutive dots or leading/trailing dot
      }
      lastWasDot = true;
    } else if (isDigit(c)) {
      lastWasDot = false;
    } else {
      return false; // Invalid character
    }
  }

  return true;
}

/**
 * Check if OID belongs to BrainSAIT namespace
 * @param oidString The OID string
 * @return true if under 1.3.6.1.4.1.61026
 */
bool isBrainSAITOID(const String& oidString) {
  return oidString.startsWith(BRAINSAIT_ROOT);
}

/**
 * Get the branch name for a BrainSAIT OID
 * @param oid Parsed OID structure
 * @return Human-readable branch name
 */
String getBranchName(const OID& oid) {
  if (!oid.isBrainSAIT || oid.depth < 8) {
    return "Unknown";
  }

  switch (oid.branchType) {
    case 1: return "Geographic Operations";
    case 2: return "Organization";
    case 3: return "Products & Services";
    case 4: return "Infrastructure";
    default: return "Unknown Branch";
  }
}

/**
 * Get sub-branch details for Products (branch 3)
 * @param oid Parsed OID structure
 * @return Product sub-branch name
 */
String getProductSubBranch(const OID& oid) {
  if (!oid.isBrainSAIT || oid.branchType != 3 || oid.depth < 9) {
    return "";
  }

  switch (oid.components[8]) {
    case 1: return "Content Management System";
    case 2: return "Healthcare Platform";
    case 3: return "AI Agent Framework";
    default: return "Unknown Product";
  }
}

/**
 * Get healthcare service name
 * @param oid Parsed OID structure
 * @return Healthcare service name
 */
String getHealthcareService(const OID& oid) {
  if (!oid.isBrainSAIT || oid.branchType != 3 || oid.depth < 10) {
    return "";
  }

  if (oid.components[8] != 2) return ""; // Not healthcare platform

  switch (oid.components[9]) {
    case 1: return "AI Normalizer Service";
    case 2: return "Signer Microservice";
    case 3: return "NPHIES Connector";
    default: return "Unknown Service";
  }
}

/**
 * Build OID path from components
 * @param components Array of arc values
 * @param count Number of components
 * @return OID string
 */
String buildOIDPath(int* components, int count) {
  String path = "";
  for (int i = 0; i < count; i++) {
    if (i > 0) path += ".";
    path += String(components[i]);
  }
  return path;
}

/**
 * Get parent OID
 * @param oidString The OID string
 * @return Parent OID string
 */
String getParentOID(const String& oidString) {
  int lastDot = oidString.lastIndexOf('.');
  if (lastDot > 0) {
    return oidString.substring(0, lastDot);
  }
  return "";
}

/**
 * Create child OID
 * @param parentOID Parent OID string
 * @param childArc Child arc number
 * @return Child OID string
 */
String createChildOID(const String& parentOID, int childArc) {
  return parentOID + "." + String(childArc);
}

/**
 * Convert OID to URN format
 * @param oidString The OID string
 * @return URN string (urn:oid:...)
 */
String toURN(const String& oidString) {
  return "urn:oid:" + oidString;
}

/**
 * Convert OID to FHIR system URL
 * @param oidString The OID string
 * @return FHIR system URL
 */
String toFHIRSystem(const String& oidString) {
  return "http://brainsait.com/fhir/oid/" + oidString;
}

/**
 * Generate JSON representation of OID
 * @param oid Parsed OID structure
 * @return JSON string
 */
String toJSON(const OID& oid) {
  StaticJsonDocument<512> doc;

  doc["oid"] = oid.fullPath;
  doc["urn"] = toURN(oid.fullPath);
  doc["depth"] = oid.depth;
  doc["isBrainSAIT"] = oid.isBrainSAIT;

  if (oid.isBrainSAIT) {
    doc["pen"] = 61026;
    doc["branch"] = getBranchName(oid);
    doc["branchType"] = oid.branchType;
  }

  if (oid.name.length() > 0) doc["name"] = oid.name;
  if (oid.description.length() > 0) doc["description"] = oid.description;
  if (oid.status.length() > 0) doc["status"] = oid.status;
  if (oid.nodeType.length() > 0) doc["nodeType"] = oid.nodeType;

  JsonArray arcs = doc.createNestedArray("arcs");
  for (int i = 0; i < oid.depth; i++) {
    arcs.add(oid.components[i]);
  }

  String output;
  serializeJsonPretty(doc, output);
  return output;
}

/**
 * Get OID registration authority info
 * @param oid Parsed OID structure
 * @return Registration authority name
 */
String getRegistrationAuthority(const OID& oid) {
  if (oid.depth < 1) return "Unknown";

  // First arc
  switch (oid.components[0]) {
    case 0: return "ITU-T";
    case 1: return "ISO";
    case 2: return "Joint ISO/ITU-T";
    default: return "Unknown";
  }
}

/**
 * Print OID tree path (debug)
 * @param oid Parsed OID structure
 */
void printOIDPath(const OID& oid) {
  Serial.println("OID Path Analysis:");
  Serial.println("==================");

  String path = "";
  for (int i = 0; i < oid.depth; i++) {
    if (i > 0) path += ".";
    path += String(oid.components[i]);

    Serial.print("  ");
    for (int j = 0; j < i; j++) Serial.print("  ");
    Serial.print(oid.components[i]);
    Serial.print(" - ");

    // Describe known arcs
    if (i == 0 && oid.components[0] == 1) Serial.println("ISO");
    else if (i == 1 && path == "1.3") Serial.println("Identified Organization");
    else if (i == 2 && path == "1.3.6") Serial.println("US Department of Defense");
    else if (i == 3 && path == "1.3.6.1") Serial.println("Internet");
    else if (i == 4 && path == "1.3.6.1.4") Serial.println("Private");
    else if (i == 5 && path == "1.3.6.1.4.1") Serial.println("Enterprise");
    else if (i == 6 && path == BRAINSAIT_ROOT) Serial.println("BrainSAIT (PEN 61026)");
    else if (i == 7 && oid.isBrainSAIT) Serial.println(getBranchName(oid));
    else Serial.println("");
  }
}

#endif // OID_UTILS_H
