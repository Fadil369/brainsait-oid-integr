import { useState, useEffect } from 'react'
import { MagnifyingGlass, GitBranch, Sparkle } from '@phosphor-icons/react'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Toaster } from '@/components/ui/sonner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TreeNodeComponent } from '@/components/TreeNode'
import { NodeDetailPanel } from '@/components/NodeDetailPanel'
import { OIDPathBuilder } from '@/components/OIDPathBuilder'
import { AddNodeDialog } from '@/components/AddNodeDialog'
import { oidRegistry, type OIDNode } from '@/lib/oid-data'
import { findNodeById } from '@/lib/oid-utils'
import { useKV } from '@github/spark/hooks'

function App() {
  const [registry, setRegistry] = useKV<OIDNode>('oid-registry', oidRegistry)
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showDetailPanel, setShowDetailPanel] = useState(false)
  const [activeView, setActiveView] = useState<'builder' | 'details'>('builder')
  
  const currentRegistry = registry || oidRegistry
  const selectedNode = selectedNodeId ? findNodeById(currentRegistry, selectedNodeId) : null
  
  const handleNodeSelect = (node: OIDNode) => {
    setSelectedNodeId(node.id)
    setShowDetailPanel(true)
  }
  
  const handleAddNode = (parentId: string, newNode: Partial<OIDNode>) => {
    const addToTree = (node: OIDNode): OIDNode => {
      if (node.id === parentId) {
        return {
          ...node,
          children: [...(node.children || []), newNode as OIDNode]
        }
      }
      
      if (node.children) {
        return {
          ...node,
          children: node.children.map(addToTree)
        }
      }
      
      return node
    }
    
    setRegistry((current) => addToTree(current || oidRegistry))
  }
  
  useEffect(() => {
    if (selectedNodeId) {
      const node = findNodeById(currentRegistry, selectedNodeId)
      if (!node) {
        setSelectedNodeId(null)
        setShowDetailPanel(false)
      }
    }
  }, [currentRegistry, selectedNodeId])
  
  return (
    <div className="h-screen flex flex-col bg-background">
      <header className="border-b border-border bg-card">
        <div className="px-6 py-4">
          <div className="flex items-center gap-3 mb-2">
            <GitBranch size={32} weight="duotone" className="text-primary" />
            <div className="flex-1">
              <h1 className="text-2xl font-bold font-mono tracking-tight">
                BrainSAIT OID Registry
              </h1>
              <p className="text-sm text-muted-foreground">
                IANA Private Enterprise Number (PEN) 61026
              </p>
            </div>
            {selectedNode && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-accent/10 border border-accent/30 rounded">
                <Sparkle size={16} weight="fill" className="text-accent" />
                <span className="text-xs font-medium text-accent-foreground">
                  Path Builder Active
                </span>
              </div>
            )}
          </div>
        </div>
      </header>
      
      <div className="flex-1 flex overflow-hidden">
        <div className={`flex-1 flex flex-col transition-all duration-300 ${showDetailPanel ? 'lg:w-1/2' : 'w-full'}`}>
          <div className="p-6 border-b border-border bg-card/50">
            <div className="space-y-4">
              <div className="relative">
                <MagnifyingGlass
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  placeholder="Search OID tree by name, path, or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <AddNodeDialog
                  parentNode={selectedNode}
                  onAdd={(node) => selectedNode && handleAddNode(selectedNode.id, node)}
                />
                
                {selectedNode && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Separator orientation="vertical" className="h-4" />
                    <span>
                      Selected: <span className="font-mono text-accent">{selectedNode.oid}</span>
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <ScrollArea className="flex-1">
            <div className="p-6">
              <Card className="p-4">
                <TreeNodeComponent
                  node={currentRegistry}
                  selectedId={selectedNodeId}
                  onSelect={handleNodeSelect}
                  searchQuery={searchQuery}
                />
              </Card>
            </div>
          </ScrollArea>
        </div>
        
        {showDetailPanel && (
          <div className="w-full lg:w-1/2 border-l border-border">
            <Tabs value={activeView} onValueChange={(v) => setActiveView(v as 'builder' | 'details')} className="h-full flex flex-col">
              <div className="px-4 pt-3 border-b border-border bg-card/50">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="builder" className="gap-2">
                    <Sparkle size={16} />
                    Path Builder
                  </TabsTrigger>
                  <TabsTrigger value="details" className="gap-2">
                    <GitBranch size={16} />
                    Node Details
                  </TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="builder" className="flex-1 mt-0">
                <OIDPathBuilder
                  root={currentRegistry}
                  selectedNode={selectedNode}
                />
              </TabsContent>
              
              <TabsContent value="details" className="flex-1 mt-0 overflow-hidden">
                <NodeDetailPanel
                  node={selectedNode}
                  onClose={() => setShowDetailPanel(false)}
                />
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
      
      <Toaster position="bottom-right" />
    </div>
  )
}

export default App