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
  "extension": [
    {
      "url": "http://brainsait.com/fhir/StructureDefinition/provenance",
      "valueIdentifier": {
        "system": "urn:oid:${node.oid}",
        "value": "${node.name}",
        "assigner": {
          "display": "BrainSAIT Healthcare Platform"
        }
      }
    }
  ]
}`
}

export function generateMCPUrn(node: OIDNode): string {
  const toolName = node.id.replace(/-/g, '_')
  return `{
  "tools": [
    {
      "name": "${toolName}",
      "description": "${node.description}",
      "inputSchema": {
        "type": "object",
        "properties": {},
        "required": []
      },
      "metadata": {
        "urn": "urn:oid:${node.oid}",
        "provider": "BrainSAIT Enterprise",
        "version": "1.0.0"
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
  return `// HTTP Request Headers
const headers = {
  'X-BrainSAIT-OID': '${node.oid}',
  'X-BrainSAIT-Service': '${node.name}',
  'X-BrainSAIT-Provider': 'BrainSAIT Enterprise',
  'Content-Type': 'application/json'
}

// Example usage with fetch
fetch('https://api.brainsait.com/endpoint', {
  method: 'POST',
  headers: headers,
  body: JSON.stringify(data)
})

// Example CURL command
curl -X POST https://api.brainsait.com/endpoint \\
  -H "X-BrainSAIT-OID: ${node.oid}" \\
  -H "X-BrainSAIT-Service: ${node.name}" \\
  -H "Content-Type: application/json" \\
  -d '{"data": "example"}'`
}

export function generateDatabaseSchema(node: OIDNode): string {
  return `-- Database Schema with OID Integration
CREATE TABLE brainsait_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  oid VARCHAR(255) NOT NULL DEFAULT '${node.oid}',
  asset_name VARCHAR(255) NOT NULL,
  asset_type VARCHAR(100),
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT valid_oid CHECK (oid LIKE '1.3.6.1.4.1.61026.%')
);

CREATE INDEX idx_oid ON brainsait_assets(oid);

-- Insert example
INSERT INTO brainsait_assets (oid, asset_name, asset_type, metadata)
VALUES (
  '${node.oid}',
  '${node.name}',
  'service',
  '{"status": "${node.status}", "description": "${node.description}"}'::jsonb
);`
}

export function generateQRCodeData(node: OIDNode): string {
  return JSON.stringify({
    oid: node.oid,
    name: node.name,
    issuer: 'BrainSAIT Enterprise',
    pen: '61026',
    timestamp: new Date().toISOString()
  }, null, 2)
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