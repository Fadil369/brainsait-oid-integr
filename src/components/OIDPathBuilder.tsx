import { useState, useEffect } from 'react'
import { ArrowRight, Copy, Check, Download, Sparkle } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { toast } from 'sonner'
import { CodeBlock } from './CodeBlock'
import { QRCodePreview } from './QRCodePreview'
import { getNodePath } from '@/lib/oid-utils'
import type { OIDNode } from '@/lib/oid-data'
import { cn } from '@/lib/utils'
import {
  generateFHIRExtension,
  generateMCPUrn,
  generateX509Extension,
  generateAPIHeader,
  generateDatabaseSchema,
  generateQRCodeData
} from '@/lib/oid-utils'

interface OIDPathBuilderProps {
  root: OIDNode
  selectedNode: OIDNode | null
}

type ImplementationType = 'fhir' | 'mcp' | 'x509' | 'api' | 'database' | 'qrcode'

interface Implementation {
  type: ImplementationType
  title: string
  description: string
  icon: string
  language: string
  generator: (node: OIDNode) => string
}

const implementations: Implementation[] = [
  {
    type: 'fhir',
    title: 'FHIR Extension',
    description: 'HL7 FHIR resource extension for healthcare interoperability',
    icon: '🏥',
    language: 'json',
    generator: generateFHIRExtension
  },
  {
    type: 'mcp',
    title: 'MCP Tool URN',
    description: 'Model Context Protocol tool identifier for AI agents',
    icon: '🤖',
    language: 'json',
    generator: generateMCPUrn
  },
  {
    type: 'x509',
    title: 'X.509 Certificate',
    description: 'Digital certificate extension for cryptographic signing',
    icon: '🔐',
    language: 'bash',
    generator: generateX509Extension
  },
  {
    type: 'api',
    title: 'API Headers',
    description: 'HTTP request headers for service identification',
    icon: '🌐',
    language: 'javascript',
    generator: generateAPIHeader
  },
  {
    type: 'database',
    title: 'Database Schema',
    description: 'PostgreSQL table with OID integration',
    icon: '💾',
    language: 'sql',
    generator: generateDatabaseSchema
  },
  {
    type: 'qrcode',
    title: 'QR Code Data',
    description: 'JSON payload for physical asset tagging',
    icon: '📱',
    language: 'json',
    generator: generateQRCodeData
  }
]

export function OIDPathBuilder({ root, selectedNode }: OIDPathBuilderProps) {
  const [path, setPath] = useState<OIDNode[]>([])
  const [selectedImpl, setSelectedImpl] = useState<ImplementationType>('fhir')
  const [copiedStates, setCopiedStates] = useState<Record<ImplementationType, boolean>>({
    fhir: false,
    mcp: false,
    x509: false,
    api: false,
    database: false,
    qrcode: false
  })

  useEffect(() => {
    if (selectedNode) {
      const nodePath = getNodePath(root, selectedNode.id)
      setPath(nodePath)
    } else {
      setPath([])
    }
  }, [selectedNode, root])

  const handleCopy = async (type: ImplementationType, code: string) => {
    try {
      await navigator.clipboard.writeText(code)
      setCopiedStates(prev => ({ ...prev, [type]: true }))
      toast.success('Copied to clipboard')
      setTimeout(() => {
        setCopiedStates(prev => ({ ...prev, [type]: false }))
      }, 2000)
    } catch (error) {
      toast.error('Failed to copy')
    }
  }

  const handleDownloadAll = () => {
    if (!selectedNode) return

    const allCode = implementations.map(impl => {
      const code = impl.generator(selectedNode)
      return `${'='.repeat(60)}\n${impl.title.toUpperCase()}\n${'='.repeat(60)}\n\n${code}\n\n`
    }).join('\n')

    const blob = new Blob([allCode], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${selectedNode.id}-implementations.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    toast.success('Downloaded all implementations')
  }

  if (!selectedNode) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <div className="text-center space-y-3">
          <Sparkle size={48} weight="duotone" className="text-muted-foreground mx-auto" />
          <p className="text-muted-foreground text-sm">
            Select an OID node to generate implementation examples
          </p>
        </div>
      </div>
    )
  }

  const currentImpl = implementations.find(impl => impl.type === selectedImpl)

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="p-6 border-b border-border bg-card/50">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold mb-1">OID Path Builder</h2>
            <p className="text-xs text-muted-foreground">
              Generate complete implementation examples for your selected node
            </p>
          </div>
          <Button
            onClick={handleDownloadAll}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <Download size={16} />
            Download All
          </Button>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {path.map((node, index) => (
            <div key={node.id} className="flex items-center gap-2">
              <Badge
                variant={index === path.length - 1 ? 'default' : 'outline'}
                className={cn(
                  'font-mono text-xs px-3 py-1',
                  index === path.length - 1 && 'bg-accent text-accent-foreground'
                )}
              >
                {node.oid.split('.').pop()}
              </Badge>
              {index < path.length - 1 && (
                <ArrowRight size={14} className="text-muted-foreground" />
              )}
            </div>
          ))}
        </div>

        <div className="mt-3 flex items-center gap-2">
          <code className="text-sm font-mono text-primary bg-primary/5 px-3 py-1.5 rounded border border-primary/20">
            {selectedNode.oid}
          </code>
          <Badge variant="outline" className="text-xs">
            {selectedNode.name}
          </Badge>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <Tabs value={selectedImpl} onValueChange={(v) => setSelectedImpl(v as ImplementationType)} className="h-full flex flex-col">
          <div className="px-6 pt-4 border-b border-border bg-card/30">
            <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
              {implementations.map(impl => (
                <TabsTrigger
                  key={impl.type}
                  value={impl.type}
                  className="text-xs gap-1.5"
                >
                  <span>{impl.icon}</span>
                  <span className="hidden lg:inline">{impl.title.split(' ')[0]}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-6">
              {implementations.map(impl => (
                <TabsContent key={impl.type} value={impl.type} className="mt-0">
                  <Card>
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <CardTitle className="flex items-center gap-2 text-base">
                            <span className="text-2xl">{impl.icon}</span>
                            {impl.title}
                          </CardTitle>
                          <CardDescription className="mt-2">
                            {impl.description}
                          </CardDescription>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCopy(impl.type, impl.generator(selectedNode))}
                          className="gap-2 flex-shrink-0"
                        >
                          {copiedStates[impl.type] ? (
                            <>
                              <Check size={16} className="text-green-500" />
                              Copied
                            </>
                          ) : (
                            <>
                              <Copy size={16} />
                              Copy
                            </>
                          )}
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {impl.type === 'qrcode' && (
                        <div className="mb-6">
                          <QRCodePreview
                            data={JSON.stringify(JSON.parse(impl.generator(selectedNode).split('\n\n')[0]), null, 0)}
                            title={selectedNode.name}
                            description={`OID: ${selectedNode.oid}`}
                          />
                        </div>
                      )}
                      
                      <CodeBlock
                        code={impl.generator(selectedNode)}
                        language={impl.language}
                      />

                      <div className="mt-4 p-4 bg-muted/50 rounded-md border border-border">
                        <h4 className="text-xs font-semibold mb-2 text-muted-foreground">
                          Implementation Context
                        </h4>
                        <div className="space-y-2 text-xs text-muted-foreground">
                          {impl.type === 'fhir' && (
                            <>
                              <p>
                                <strong>Use Case:</strong> Add this extension to FHIR resources (Claim, Patient, Observation) 
                                to track which BrainSAIT service processed the data.
                              </p>
                              <p>
                                <strong>System:</strong> NPHIES, Saudi Billing System, Healthcare Platform
                              </p>
                            </>
                          )}
                          {impl.type === 'mcp' && (
                            <>
                              <p>
                                <strong>Use Case:</strong> Register this tool in your MCP server to ensure unique identification 
                                in multi-agent environments (CrewAI, n8n).
                              </p>
                              <p>
                                <strong>System:</strong> Model Context Protocol, AI Agent Framework
                              </p>
                            </>
                          )}
                          {impl.type === 'x509' && (
                            <>
                              <p>
                                <strong>Use Case:</strong> Embed this OID in X.509 certificates used by the sbs-signer 
                                microservice to cryptographically bind signatures to BrainSAIT.
                              </p>
                              <p>
                                <strong>System:</strong> Digital Signing Service, PKI Infrastructure
                              </p>
                            </>
                          )}
                          {impl.type === 'api' && (
                            <>
                              <p>
                                <strong>Use Case:</strong> Include these headers in all API requests to identify the calling 
                                service and enable distributed tracing.
                              </p>
                              <p>
                                <strong>System:</strong> REST APIs, Microservices, API Gateway
                              </p>
                            </>
                          )}
                          {impl.type === 'database' && (
                            <>
                              <p>
                                <strong>Use Case:</strong> Use this schema to store OID-tagged assets in your database, 
                                enabling global uniqueness and compliance tracking.
                              </p>
                              <p>
                                <strong>System:</strong> PostgreSQL, Asset Management, Inventory Systems
                              </p>
                            </>
                          )}
                          {impl.type === 'qrcode' && (
                            <>
                              <p>
                                <strong>Use Case:</strong> Generate QR codes or RFID tags for physical hardware or software 
                                licensing tokens with this JSON payload.
                              </p>
                              <p>
                                <strong>System:</strong> Asset Tagging, Hardware Inventory, License Management
                              </p>
                            </>
                          )}
                        </div>
                      </div>

                      {selectedNode.useCases && selectedNode.useCases.length > 0 && (
                        <div className="mt-4 p-4 bg-accent/5 rounded-md border border-accent/20">
                          <h4 className="text-xs font-semibold mb-2 text-accent-foreground">
                            Defined Use Cases for {selectedNode.name}
                          </h4>
                          <ul className="space-y-1.5 text-xs text-muted-foreground">
                            {selectedNode.useCases.map((useCase, index) => (
                              <li key={index} className="flex gap-2">
                                <span className="text-accent">•</span>
                                <span>{useCase}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              ))}
            </div>
          </ScrollArea>
        </Tabs>
      </div>
    </div>
  )
}
