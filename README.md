# BrainSAIT OID Registry Platform

A comprehensive Object Identifier (OID) management platform for BrainSAIT Enterprise's IANA Private Enterprise Number (PEN 61026).

## Overview

This platform provides:

- **Interactive OID Tree Visualization** - Browse and manage the entire BrainSAIT OID namespace
- **Code Generation** - Generate FHIR extensions, MCP URNs, X.509 certificates, API headers, and database schemas
- **QR Code Generation** - Create scannable QR codes for physical asset tagging
- **AI-Powered Naming** - Get contextual suggestions for new OID nodes
- **Arduino Integration** - Hardware scanner for reading OID QR codes

## OID Namespace

```
1.3.6.1.4.1.61026 (BrainSAIT Root - PEN 61026)
├── .1 Geographic Operations
│   ├── .1 Riyadh (Saudi HQ, NPHIES, SBS)
│   └── .2 Sudan (Regional healthcare)
├── .2 Organization
│   ├── .1 Departments
│   │   ├── .1 Engineering
│   │   └── .2 Healthcare Operations
│   └── .2 Licensing & Compliance
├── .3 Products & Services
│   ├── .1 Content Management System
│   ├── .2 Healthcare Platform
│   │   ├── .1 AI Normalizer Service
│   │   ├── .2 Signer Microservice
│   │   └── .3 NPHIES Connector
│   └── .3 AI Agent Framework (Experimental)
└── .4 Infrastructure
    ├── .1 Ollama Private Cloud
    ├── .2 Docker Infrastructure
    └── .3 IoT Devices
```

## Quick Start

### Web Platform

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Arduino QR Scanner

See [arduino/oid-qr-scanner/README.md](arduino/oid-qr-scanner/README.md) for hardware setup instructions.

**Supported Hardware:**
- ESP32-CAM (AI-Thinker) - Built-in camera for QR scanning
- ESP32 + GM65 Module - Dedicated barcode scanner
- Optional: OLED/LCD display for scan results

## Code Generation Examples

### FHIR Extension
```json
{
  "extension": [{
    "url": "http://brainsait.com/fhir/StructureDefinition/provenance",
    "valueIdentifier": {
      "system": "urn:oid:1.3.6.1.4.1.61026.3.2.1",
      "value": "AI Normalizer Service"
    }
  }]
}
```

### MCP URN (AI Agents)
```json
{
  "tools": [{
    "metadata": {
      "urn": "urn:oid:1.3.6.1.4.1.61026.3.3.1",
      "provider": "BrainSAIT Enterprise (PEN 61026)"
    }
  }]
}
```

### API Headers
```javascript
const headers = {
  'X-BrainSAIT-OID': '1.3.6.1.4.1.61026.3.2.1',
  'X-BrainSAIT-Service': 'AI Normalizer Service',
  'X-BrainSAIT-PEN': '61026'
}
```

## Project Structure

```
├── src/
│   ├── components/
│   │   ├── custom/          # OID-specific components
│   │   │   ├── TreeNode.tsx
│   │   │   ├── OIDPathBuilder.tsx
│   │   │   ├── QRCodePreview.tsx
│   │   │   └── AddNodeDialog.tsx
│   │   └── ui/              # Radix UI components
│   ├── lib/
│   │   ├── oid-data.ts      # OID registry data
│   │   └── oid-utils.ts     # Code generators
│   └── App.tsx
├── arduino/
│   └── oid-qr-scanner/      # ESP32 QR scanner
│       ├── oid-qr-scanner.ino
│       ├── oid_utils.h
│       ├── display.h
│       └── config.h
└── package.json
```

## Technology Stack

**Web Platform:**
- React 19 + TypeScript
- Vite 7
- Tailwind CSS 4
- Radix UI Components
- TanStack Query
- QRCode library

**Arduino Scanner:**
- ESP32 / ESP32-CAM
- ArduinoJson
- quirc (QR decoder)
- WiFi + HTTPClient

## Use Cases

1. **Healthcare Interoperability** - Tag FHIR resources and claims with globally unique identifiers
2. **AI Agent Systems** - Identify tools and agents in multi-agent architectures
3. **Cryptographic Signing** - Embed OIDs in X.509 certificates
4. **Asset Management** - Track physical and virtual infrastructure
5. **Compliance & Auditing** - Ensure traceability across all systems

## License

CC BY-NC-SA 4.0

## Contact

- Engineering: engineering@brainsait.com
- Website: https://brainsait.com
