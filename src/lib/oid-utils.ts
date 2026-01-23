import type { OIDNode } from './oid-data'

export function findNodeByOid(root: OIDNode, oid: string): OIDNode | null {
  if (root.oid === oid) return root
  
  if (root.children) {
    for (const child of root.children) {
      const found = findNodeByOid(child, oid)
      if (found) return found
    }
  }
  
  return null
}

export function findNodeById(root: OIDNode, id: string): OIDNode | null {
  if (root.id === id) return root
  
  if (root.children) {
    for (const child of root.children) {
      const found = findNodeById(child, id)
      if (found) return found
    }
  }
  
  return null
}

export function getNextChildId(parent: OIDNode): string {
  if (!parent.children || parent.children.length === 0) {
    return `${parent.oid}.1`
  }
  
  const lastChild = parent.children[parent.children.length - 1]
  const lastSegment = lastChild.oid.split('.').pop()
  const nextNumber = parseInt(lastSegment || '0', 10) + 1
  
  return `${parent.oid}.${nextNumber}`
}

export function searchNodes(root: OIDNode, query: string): OIDNode[] {
  const results: OIDNode[] = []
  const lowerQuery = query.toLowerCase()
  
  function search(node: OIDNode) {
    if (
      node.name.toLowerCase().includes(lowerQuery) ||
      node.description.toLowerCase().includes(lowerQuery) ||
      node.oid.includes(query) ||
      node.id.toLowerCase().includes(lowerQuery)
    ) {
      results.push(node)
    }
    
    if (node.children) {
      node.children.forEach(search)
    }
  }
  
  search(root)
  return results
}

export function generateFHIRExtension(node: OIDNode): string {
  return `{
  "resourceType": "Claim",
  "id": "claim-example-001",
  "status": "active",
  "type": {
    "coding": [
      {
        "system": "http://terminology.hl7.org/CodeSystem/claim-type",
        "code": "institutional"
      }
    ]
  },
  "extension": [
    {
      "url": "http://brainsait.com/fhir/StructureDefinition/provenance",
      "extension": [
        {
          "url": "service-identifier",
          "valueIdentifier": {
            "system": "urn:oid:${node.oid}",
            "value": "${node.name}"
          }
        },
        {
          "url": "processing-timestamp",
          "valueDateTime": "2024-01-15T10:30:00Z"
        },
        {
          "url": "assigner",
          "valueString": "BrainSAIT Healthcare Platform"
        }
      ]
    }
  ],
  "patient": {
    "reference": "Patient/example"
  },
  "provider": {
    "reference": "Organization/brainsait"
  }
}`
}

export function generateMCPUrn(node: OIDNode): string {
  const toolName = node.id.replace(/-/g, '_')
  return `{
  "mcpServers": {
    "brainsait-${node.id}": {
      "command": "node",
      "args": ["./mcp-server.js"],
      "env": {
        "BRAINSAIT_OID": "${node.oid}",
        "SERVICE_NAME": "${node.name}"
      }
    }
  },
  "tools": [
    {
      "name": "${toolName}",
      "description": "${node.description}",
      "inputSchema": {
        "type": "object",
        "properties": {
          "input": {
            "type": "string",
            "description": "Input data for processing"
          }
        },
        "required": ["input"]
      },
      "metadata": {
        "urn": "urn:oid:${node.oid}",
        "provider": "BrainSAIT Enterprise (PEN 61026)",
        "version": "1.0.0",
        "service": "${node.name}",
        "namespace": "urn:oid:1.3.6.1.4.1.61026"
      }
    }
  ]
}`
}

export function generateX509Extension(node: OIDNode): string {
  return `# OpenSSL Configuration Extension
# Add to openssl.cnf under [v3_req] or [v3_ca]

[ brainsait_extension ]
subjectAltName = otherName:${node.oid};UTF8:${node.name}
certificatePolicies = ${node.oid}

# X.509 Certificate Extension Field
1.3.6.1.4.1.61026 = ASN1:UTF8String:BrainSAIT Enterprise
${node.oid} = ASN1:UTF8String:${node.name}

# Generate certificate with:
# openssl req -new -x509 -key private.key \\
#   -out certificate.crt -days 365 \\
#   -config openssl.cnf -extensions brainsait_extension`
}

export function generateAPIHeader(node: OIDNode): string {
  return `// JavaScript/TypeScript HTTP Headers
const headers = {
  'X-BrainSAIT-OID': '${node.oid}',
  'X-BrainSAIT-Service': '${node.name}',
  'X-BrainSAIT-PEN': '61026',
  'X-BrainSAIT-Timestamp': new Date().toISOString(),
  'Content-Type': 'application/json',
  'Accept': 'application/json'
}

// Fetch API Example
const response = await fetch('https://api.brainsait.com/v1/endpoint', {
  method: 'POST',
  headers: headers,
  body: JSON.stringify({
    action: 'process',
    data: { /* your data */ }
  })
})

// Axios Example
import axios from 'axios'

const axiosResponse = await axios.post(
  'https://api.brainsait.com/v1/endpoint',
  { action: 'process', data: {} },
  { headers }
)

// CURL Command
curl -X POST https://api.brainsait.com/v1/endpoint \\
  -H "X-BrainSAIT-OID: ${node.oid}" \\
  -H "X-BrainSAIT-Service: ${node.name}" \\
  -H "X-BrainSAIT-PEN: 61026" \\
  -H "Content-Type: application/json" \\
  -d '{"action":"process","data":{}}'

// Python Requests Example
import requests
from datetime import datetime

headers = {
    'X-BrainSAIT-OID': '${node.oid}',
    'X-BrainSAIT-Service': '${node.name}',
    'X-BrainSAIT-PEN': '61026',
    'X-BrainSAIT-Timestamp': datetime.utcnow().isoformat() + 'Z',
    'Content-Type': 'application/json'
}

response = requests.post(
    'https://api.brainsait.com/v1/endpoint',
    headers=headers,
    json={'action': 'process', 'data': {}}
)`
}

export function generateDatabaseSchema(node: OIDNode): string {
  return `-- PostgreSQL Schema with OID Integration for ${node.name}
-- This schema demonstrates how to use OIDs as globally unique identifiers

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Main assets table with OID tracking
CREATE TABLE brainsait_assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  oid VARCHAR(255) NOT NULL,
  asset_name VARCHAR(255) NOT NULL,
  asset_type VARCHAR(100),
  status VARCHAR(50) DEFAULT 'active',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by VARCHAR(255),
  
  -- Ensure OID belongs to BrainSAIT namespace
  CONSTRAINT valid_brainsait_oid 
    CHECK (oid LIKE '1.3.6.1.4.1.61026.%'),
  
  -- Ensure unique asset per OID
  CONSTRAINT unique_oid_asset 
    UNIQUE (oid, asset_name)
);

-- Indexes for performance
CREATE INDEX idx_assets_oid ON brainsait_assets(oid);
CREATE INDEX idx_assets_type ON brainsait_assets(asset_type);
CREATE INDEX idx_assets_status ON brainsait_assets(status);
CREATE INDEX idx_assets_metadata ON brainsait_assets USING GIN (metadata);

-- Audit log table
CREATE TABLE brainsait_audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  asset_id UUID REFERENCES brainsait_assets(id),
  oid VARCHAR(255) NOT NULL,
  action VARCHAR(50) NOT NULL,
  changes JSONB,
  performed_by VARCHAR(255),
  performed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT valid_audit_oid 
    CHECK (oid LIKE '1.3.6.1.4.1.61026.%')
);

CREATE INDEX idx_audit_oid ON brainsait_audit_log(oid);
CREATE INDEX idx_audit_asset ON brainsait_audit_log(asset_id);

-- Insert example record for ${node.name}
INSERT INTO brainsait_assets (
  oid, 
  asset_name, 
  asset_type, 
  status,
  metadata
) VALUES (
  '${node.oid}',
  '${node.name}',
  '${node.type}',
  '${node.status}',
  '${JSON.stringify({
    description: node.description,
    useCases: node.useCases || [],
    pen: "61026",
    namespace: "BrainSAIT Enterprise"
  })}'::jsonb
);

-- Query examples
-- Find all assets under this OID branch
SELECT * FROM brainsait_assets 
WHERE oid LIKE '${node.oid}%' 
ORDER BY oid;

-- Get asset with metadata
SELECT 
  id,
  oid,
  asset_name,
  status,
  metadata->>'description' as description,
  created_at
FROM brainsait_assets 
WHERE oid = '${node.oid}';

-- Audit trail for an OID
SELECT 
  a.action,
  a.changes,
  a.performed_by,
  a.performed_at
FROM brainsait_audit_log a
WHERE a.oid = '${node.oid}'
ORDER BY a.performed_at DESC;`
}

export function generateQRCodeData(node: OIDNode): string {
  const qrData = {
    version: "1.0",
    format: "BrainSAIT-Asset-Tag",
    asset: {
      oid: node.oid,
      name: node.name,
      type: node.type,
      status: node.status,
      description: node.description
    },
    organization: {
      name: "BrainSAIT Limited",
      pen: "61026",
      root: "1.3.6.1.4.1.61026"
    },
    metadata: {
      timestamp: new Date().toISOString(),
      issuer: "BrainSAIT Asset Management System",
      validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
    },
    verification: {
      checksum: `SHA256:${node.oid}:${node.name}`,
      verifyUrl: `https://oid.brainsait.com/verify/${node.oid.replace(/\./g, '/')}`
    }
  }
  
  return `${JSON.stringify(qrData, null, 2)}

// Implementation Examples:

// 1. Generate QR Code with qrcode.js (Node.js)
const QRCode = require('qrcode')
const data = ${JSON.stringify(qrData)}

QRCode.toFile('./asset-${node.id}.png', JSON.stringify(data), {
  errorCorrectionLevel: 'H',
  type: 'png',
  width: 512,
  color: {
    dark: '#1a1a2e',
    light: '#f5f5f5'
  }
})

// 2. Generate QR Code in Browser
const qrData = ${JSON.stringify(qrData)}
const qr = new QRCodeStyling({
  width: 400,
  height: 400,
  data: JSON.stringify(qrData),
  dotsOptions: {
    color: "#1a1a2e",
    type: "rounded"
  },
  cornersSquareOptions: {
    type: "extra-rounded"
  }
})
qr.download({ name: "asset-${node.id}", extension: "png" })

// 3. RFID NFC Tag Encoding (Python)
import json
import nfc

data = ${JSON.stringify(qrData)}
json_data = json.dumps(data)

def write_tag(tag):
    tag.ndef.records = [nfc.ndef.TextRecord(json_data)]
    return True

with nfc.ContactlessFrontend('usb') as clf:
    clf.connect(rdwr={'on-connect': write_tag})`
}

export function validateOID(oid: string): boolean {
  const oidRegex = /^(\d+\.)+\d+$/
  return oidRegex.test(oid) && oid.startsWith('1.3.6.1.4.1.61026')
}

export function getNodePath(root: OIDNode, targetId: string): OIDNode[] {
  const path: OIDNode[] = []
  
  function findPath(node: OIDNode): boolean {
    path.push(node)
    
    if (node.id === targetId) {
      return true
    }
    
    if (node.children) {
      for (const child of node.children) {
        if (findPath(child)) {
          return true
        }
      }
    }
    
    path.pop()
    return false
  }
  
  findPath(root)
  return path
}