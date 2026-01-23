export type OIDNodeType = 'root' | 'branch' | 'leaf'

export type OIDStatus = 'active' | 'deprecated' | 'experimental'

export interface OIDNode {
  id: string
  oid: string
  name: string
  description: string
  type: OIDNodeType
  status: OIDStatus
  useCases?: string[]
  children?: OIDNode[]
  examples?: {
    fhir?: string
    mcp?: string
    x509?: string
    api?: string
  }
}

export interface CodeExample {
  language: string
  code: string
  description: string
}

export const BRAINSAIT_ROOT = '1.3.6.1.4.1.61026'

export const oidRegistry: OIDNode = {
  id: 'root',
  oid: BRAINSAIT_ROOT,
  name: 'BRAINSAIT LTD',
  description: 'IANA Private Enterprise Number (PEN) for BrainSAIT Limited. Root of all organizational identifiers.',
  type: 'root',
  status: 'active',
  useCases: [
    'Global Organization ID for all API headers',
    'Root namespace for all enterprise systems',
    'Digital identity foundation for regulatory compliance'
  ],
  children: [
    {
      id: 'geo',
      oid: `${BRAINSAIT_ROOT}.1`,
      name: 'Geographic Operations',
      description: 'Location-based operational divisions and IoT sensor networks across BrainSAIT deployments.',
      type: 'branch',
      status: 'active',
      useCases: [
        'Prefix for location-based IoT sensors',
        'Geographic routing for distributed systems',
        'Regional compliance and data sovereignty'
      ],
      children: [
        {
          id: 'riyadh',
          oid: `${BRAINSAIT_ROOT}.1.1`,
          name: 'Riyadh Operations',
          description: 'Saudi Arabia headquarters and primary healthcare operations center.',
          type: 'leaf',
          status: 'active',
          useCases: [
            'NPHIES integration endpoint identifier',
            'Saudi Billing System (SBS) deployment tag'
          ]
        },
        {
          id: 'sudan',
          oid: `${BRAINSAIT_ROOT}.1.2`,
          name: 'Sudan Operations',
          description: 'Sudan regional office and healthcare service delivery.',
          type: 'leaf',
          status: 'active',
          useCases: [
            'Regional healthcare system identifier',
            'Local compliance tracking'
          ]
        }
      ]
    },
    {
      id: 'org',
      oid: `${BRAINSAIT_ROOT}.2`,
      name: 'Organization Structure',
      description: 'Internal organizational hierarchy, departments, and governance structures.',
      type: 'branch',
      status: 'active',
      useCases: [
        'Metadata for internal RBAC (Role-Based Access Control)',
        'Department and team identification',
        'Audit trail for organizational actions'
      ],
      children: [
        {
          id: 'departments',
          oid: `${BRAINSAIT_ROOT}.2.1`,
          name: 'Departments',
          description: 'Organizational departments and business units.',
          type: 'branch',
          status: 'active',
          children: [
            {
              id: 'engineering',
              oid: `${BRAINSAIT_ROOT}.2.1.1`,
              name: 'Engineering',
              description: 'Software development and infrastructure engineering.',
              type: 'leaf',
              status: 'active'
            },
            {
              id: 'healthcare',
              oid: `${BRAINSAIT_ROOT}.2.1.2`,
              name: 'Healthcare Operations',
              description: 'Clinical operations and healthcare service delivery.',
              type: 'leaf',
              status: 'active'
            }
          ]
        },
        {
          id: 'licensing',
          oid: `${BRAINSAIT_ROOT}.2.2`,
          name: 'Licensing & Compliance',
          description: 'Software licensing, compliance tracking, and intellectual property management.',
          type: 'leaf',
          status: 'active',
          useCases: [
            'Creative Commons (CC BY-NC-SA 4.0) compliance tracking',
            'Software licensing token generation',
            'Automated compliance-as-code workflows'
          ]
        }
      ]
    },
    {
      id: 'products',
      oid: `${BRAINSAIT_ROOT}.3`,
      name: 'Products & Services',
      description: 'Product lines, service offerings, and platform deployments.',
      type: 'branch',
      status: 'active',
      useCases: [
        'Namespace for FHIR Extensions',
        'MCP Toolset identification',
        'Product version and instance tracking'
      ],
      children: [
        {
          id: 'cms',
          oid: `${BRAINSAIT_ROOT}.3.1`,
          name: 'Content Management System',
          description: 'CMS platform and related services.',
          type: 'branch',
          status: 'active',
          children: [
            {
              id: 'cms-summary',
              oid: `${BRAINSAIT_ROOT}.3.1.1`,
              name: 'Clinical Summary Tool',
              description: 'MCP tool for generating clinical summaries.',
              type: 'leaf',
              status: 'active',
              examples: {
                mcp: `urn:oid:${BRAINSAIT_ROOT}.3.1.1`
              }
            }
          ]
        },
        {
          id: 'healthcare-platform',
          oid: `${BRAINSAIT_ROOT}.3.2`,
          name: 'Healthcare Platform',
          description: 'Integrated healthcare technology suite including SBS and NPHIES integration.',
          type: 'branch',
          status: 'active',
          children: [
            {
              id: 'ai-normalizer',
              oid: `${BRAINSAIT_ROOT}.3.2.1`,
              name: 'AI Normalizer Service',
              description: 'AI-powered clinical coding and claim normalization engine.',
              type: 'leaf',
              status: 'active',
              useCases: [
                'FHIR resource custom extensions for AI provenance',
                'Claim processing audit trail',
                'AI model version tracking'
              ],
              examples: {
                fhir: `${BRAINSAIT_ROOT}.3.2.1`,
                api: `X-BrainSAIT-Service: ${BRAINSAIT_ROOT}.3.2.1`
              }
            },
            {
              id: 'sbs-signer',
              oid: `${BRAINSAIT_ROOT}.3.2.2`,
              name: 'Signer Microservice',
              description: 'Cryptographic signing service for NPHIES claims.',
              type: 'leaf',
              status: 'active',
              useCases: [
                'X.509 certificate Subject Alternative Name',
                'Digital signature provenance for claims',
                'Cryptographic identity binding'
              ],
              examples: {
                x509: `SubjectAltName: OID.${BRAINSAIT_ROOT}.3.2.2`,
                api: `X-BrainSAIT-Signer: ${BRAINSAIT_ROOT}.3.2.2`
              }
            },
            {
              id: 'nphies-connector',
              oid: `${BRAINSAIT_ROOT}.3.2.3`,
              name: 'NPHIES Integration Connector',
              description: 'Saudi NPHIES (National Platform for Health Insurance Exchange Services) integration layer.',
              type: 'leaf',
              status: 'active',
              examples: {
                fhir: `${BRAINSAIT_ROOT}.3.2.3`,
                api: `X-BrainSAIT-Connector: ${BRAINSAIT_ROOT}.3.2.3`
              }
            }
          ]
        },
        {
          id: 'ai-agents',
          oid: `${BRAINSAIT_ROOT}.3.3`,
          name: 'AI Agent Framework',
          description: 'Multi-agent AI systems and MCP servers.',
          type: 'branch',
          status: 'experimental',
          children: [
            {
              id: 'crewai',
              oid: `${BRAINSAIT_ROOT}.3.3.1`,
              name: 'CrewAI Agents',
              description: 'CrewAI-based multi-agent orchestration.',
              type: 'leaf',
              status: 'experimental',
              examples: {
                mcp: `urn:oid:${BRAINSAIT_ROOT}.3.3.1`
              }
            },
            {
              id: 'n8n',
              oid: `${BRAINSAIT_ROOT}.3.3.2`,
              name: 'n8n Automation',
              description: 'Workflow automation and agent orchestration via n8n.',
              type: 'leaf',
              status: 'experimental',
              examples: {
                mcp: `urn:oid:${BRAINSAIT_ROOT}.3.3.2`
              }
            }
          ]
        }
      ]
    },
    {
      id: 'infrastructure',
      oid: `${BRAINSAIT_ROOT}.4`,
      name: 'Infrastructure & Assets',
      description: 'Physical and virtual infrastructure, hardware assets, and deployment environments.',
      type: 'branch',
      status: 'active',
      useCases: [
        'QR code generation for physical assets',
        'RFID tagging for hardware inventory',
        'Container and VM instance identification'
      ],
      children: [
        {
          id: 'ollama',
          oid: `${BRAINSAIT_ROOT}.4.1`,
          name: 'Ollama Private Cloud',
          description: 'Local LLM deployment infrastructure.',
          type: 'leaf',
          status: 'active'
        },
        {
          id: 'docker',
          oid: `${BRAINSAIT_ROOT}.4.2`,
          name: 'Docker Infrastructure',
          description: 'Containerized service deployments.',
          type: 'leaf',
          status: 'active'
        }
      ]
    }
  ]
}