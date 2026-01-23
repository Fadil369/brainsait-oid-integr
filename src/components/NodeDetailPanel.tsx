import { X, Code, Database, QrCode } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { CodeBlock } from './CodeBlock'
import type { OIDNode } from '@/lib/oid-data'
import {
  generateFHIRExtension,
  generateMCPUrn,
  generateX509Extension,
  generateAPIHeader,
  generateDatabaseSchema,
  generateQRCodeData
} from '@/lib/oid-utils'

interface NodeDetailPanelProps {
  node: OIDNode | null
  onClose: () => void
}

export function NodeDetailPanel({ node, onClose }: NodeDetailPanelProps) {
  if (!node) return null
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-accent/20 text-accent-foreground border-accent/40'
      case 'experimental':
        return 'bg-secondary/20 text-secondary-foreground border-secondary/40'
      case 'deprecated':
        return 'bg-muted text-muted-foreground border-border'
      default:
        return 'bg-muted text-muted-foreground'
    }
  }
  
  return (
    <div className="h-full flex flex-col bg-card border-l border-border">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-lg font-semibold truncate">{node.name}</h2>
            <Badge variant="outline" className={getStatusColor(node.status)}>
              {node.status}
            </Badge>
          </div>
          <code className="text-sm text-accent font-mono">{node.oid}</code>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X size={20} />
        </Button>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          <div>
            <h3 className="text-sm font-semibold mb-2">Description</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {node.description}
            </p>
          </div>
          
          {node.useCases && node.useCases.length > 0 && (
            <>
              <Separator />
              <div>
                <h3 className="text-sm font-semibold mb-3">Use Cases</h3>
                <ul className="space-y-2">
                  {node.useCases.map((useCase, index) => (
                    <li key={index} className="text-sm text-muted-foreground flex gap-2">
                      <span className="text-accent">•</span>
                      <span>{useCase}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
          
          <Separator />
          
          <div>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Code size={18} />
              Code Generation
            </h3>
            
            <Tabs defaultValue="fhir" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="fhir">FHIR</TabsTrigger>
                <TabsTrigger value="mcp">MCP</TabsTrigger>
                <TabsTrigger value="x509">X.509</TabsTrigger>
                <TabsTrigger value="api">API</TabsTrigger>
              </TabsList>
              
              <TabsContent value="fhir" className="space-y-3">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">FHIR Extension</CardTitle>
                    <CardDescription>
                      Add this extension to FHIR resources for provenance tracking
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <CodeBlock code={generateFHIRExtension(node)} language="json" />
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="mcp" className="space-y-3">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">MCP Tool URN</CardTitle>
                    <CardDescription>
                      Model Context Protocol tool configuration with OID namespace
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <CodeBlock code={generateMCPUrn(node)} language="json" />
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="x509" className="space-y-3">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">X.509 Certificate Extension</CardTitle>
                    <CardDescription>
                      OpenSSL configuration for certificate generation
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <CodeBlock code={generateX509Extension(node)} language="bash" />
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="api" className="space-y-3">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">API Headers</CardTitle>
                    <CardDescription>
                      HTTP headers for API requests with OID identification
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <CodeBlock code={generateAPIHeader(node)} language="javascript" />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
          
          <Separator />
          
          <div>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Database size={18} />
              Database Schema
            </h3>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">PostgreSQL Schema</CardTitle>
                <CardDescription>
                  Database table with OID integration
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CodeBlock code={generateDatabaseSchema(node)} language="sql" />
              </CardContent>
            </Card>
          </div>
          
          <Separator />
          
          <div>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <QrCode size={18} />
              Asset Tagging
            </h3>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">QR Code Data</CardTitle>
                <CardDescription>
                  JSON payload for QR code or RFID tag generation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CodeBlock code={generateQRCodeData(node)} language="json" />
              </CardContent>
            </Card>
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}