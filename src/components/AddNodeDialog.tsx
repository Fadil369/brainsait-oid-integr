import { useState } from 'react'
import { Plus, Sparkle, Check } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import type { OIDNode, OIDNodeType, OIDStatus } from '@/lib/oid-data'
import { getNextChildId, validateOID } from '@/lib/oid-utils'

interface AddNodeDialogProps {
  parentNode: OIDNode | null
  onAdd: (node: Partial<OIDNode>) => void
}

interface AISuggestion {
  name: string
  description: string
  useCases: string[]
  type: OIDNodeType
}

export function AddNodeDialog({ parentNode, onAdd }: AddNodeDialogProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [nodeType, setNodeType] = useState<OIDNodeType>('leaf')
  const [status, setStatus] = useState<OIDStatus>('active')
  const [useCase, setUseCase] = useState('')
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  
  const nextOid = parentNode ? getNextChildId(parentNode) : ''
  
  const generateSuggestions = async () => {
    if (!parentNode || !useCase.trim()) {
      toast.error('Please provide a use case description')
      return
    }
    
    setIsGenerating(true)
    
    try {
      const promptText = `You are an expert in OID (Object Identifier) registry design and enterprise architecture. 

Given the following context:
- Parent Node: ${parentNode.name}
- Parent OID: ${parentNode.oid}
- Parent Description: ${parentNode.description}
- Parent Use Cases: ${parentNode.useCases?.join(', ') || 'Not specified'}
- User's Use Case: ${useCase}

Generate exactly 3 creative and practical OID node suggestions that would be children of the parent node. Each suggestion should align with BrainSAIT's enterprise architecture (healthcare tech, AI services, FHIR integration, MCP tools, IoT, etc.).

Return the result as a valid JSON object with a single property called "suggestions" that contains an array of 3 suggestion objects. Each suggestion must have:
- name: A concise, professional name (2-5 words)
- description: A detailed 1-2 sentence description
- useCases: An array of 2-3 specific use case strings
- type: Either "branch" (has children) or "leaf" (endpoint)

Example format:
{
  "suggestions": [
    {
      "name": "AI Model Registry",
      "description": "Centralized registry for AI model versions, metadata, and deployment tracking across BrainSAIT services.",
      "useCases": ["Model version control", "Deployment provenance tracking", "AI audit trail"],
      "type": "branch"
    }
  ]
}`

      const result = await window.spark.llm(promptText, 'gpt-4o', true)
      const parsed = JSON.parse(result)
      
      if (parsed.suggestions && Array.isArray(parsed.suggestions)) {
        setSuggestions(parsed.suggestions)
        toast.success('AI suggestions generated!')
      } else {
        throw new Error('Invalid response format')
      }
    } catch (error) {
      console.error('Failed to generate suggestions:', error)
      toast.error('Failed to generate suggestions')
    } finally {
      setIsGenerating(false)
    }
  }
  
  const applySuggestion = (suggestion: AISuggestion) => {
    setName(suggestion.name)
    setDescription(suggestion.description)
    setNodeType(suggestion.type)
  }
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name.trim()) {
      toast.error('Name is required')
      return
    }
    
    if (!description.trim()) {
      toast.error('Description is required')
      return
    }
    
    if (!parentNode) {
      toast.error('Parent node is required')
      return
    }
    
    if (!validateOID(nextOid)) {
      toast.error('Invalid OID format')
      return
    }
    
    const newNode: Partial<OIDNode> = {
      id: name.toLowerCase().replace(/\s+/g, '-'),
      oid: nextOid,
      name,
      description,
      type: nodeType,
      status,
      children: nodeType === 'leaf' ? undefined : []
    }
    
    onAdd(newNode)
    
    setName('')
    setDescription('')
    setNodeType('leaf')
    setStatus('active')
    setUseCase('')
    setSuggestions([])
    setOpen(false)
    
    toast.success('OID node added successfully')
  }
  
  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (!newOpen) {
      setName('')
      setDescription('')
      setNodeType('leaf')
      setStatus('active')
      setUseCase('')
      setSuggestions([])
    }
  }
  
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" disabled={!parentNode}>
          <Plus size={16} className="mr-2" />
          Add Child Node
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[650px] max-h-[90vh] flex flex-col">
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <DialogHeader>
            <DialogTitle>Add New OID Node</DialogTitle>
            <DialogDescription>
              Create a new child node under {parentNode?.name || 'selected node'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="oid">OID Path</Label>
              <Input
                id="oid"
                value={nextOid}
                disabled
                className="font-mono text-sm bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                Automatically assigned based on parent node
              </p>
            </div>
            
            <div className="border border-border rounded-lg p-4 bg-accent/5 space-y-3">
              <div className="flex items-center gap-2">
                <Sparkle size={18} weight="fill" className="text-accent" />
                <Label htmlFor="useCase" className="text-base font-semibold">
                  AI-Powered Suggestions
                </Label>
              </div>
              
              <div className="space-y-2">
                <Textarea
                  id="useCase"
                  placeholder="Describe what this node will be used for... (e.g., 'Track medical device IoT sensors', 'Manage API authentication tokens', 'Store patient consent records')"
                  value={useCase}
                  onChange={(e) => setUseCase(e.target.value)}
                  rows={2}
                  className="resize-none"
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={generateSuggestions}
                  disabled={!useCase.trim() || isGenerating}
                  className="w-full"
                >
                  <Sparkle size={16} className="mr-2" weight={isGenerating ? "regular" : "fill"} />
                  {isGenerating ? 'Generating suggestions...' : 'Generate AI Suggestions'}
                </Button>
              </div>
              
              {suggestions.length > 0 && (
                <div className="space-y-2 mt-4">
                  <p className="text-xs font-medium text-muted-foreground">
                    Select a suggestion to apply:
                  </p>
                  <div className="space-y-2">
                    {suggestions.map((suggestion, index) => (
                      <Card
                        key={index}
                        className="p-3 cursor-pointer hover:bg-accent/10 transition-colors border-2 hover:border-accent/50"
                        onClick={() => applySuggestion(suggestion)}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-sm">{suggestion.name}</p>
                              <Badge variant={suggestion.type === 'branch' ? 'default' : 'secondary'} className="text-xs">
                                {suggestion.type}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {suggestion.description}
                            </p>
                            {suggestion.useCases && suggestion.useCases.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {suggestion.useCases.map((uc, ucIndex) => (
                                  <Badge key={ucIndex} variant="outline" className="text-xs">
                                    {uc}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                          {name === suggestion.name && (
                            <Check size={18} weight="bold" className="text-accent flex-shrink-0" />
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                placeholder="e.g., AI Service Module"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe the purpose and use of this OID node..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Node Type</Label>
                <Select value={nodeType} onValueChange={(value) => setNodeType(value as OIDNodeType)}>
                  <SelectTrigger id="type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="branch">Branch (has children)</SelectItem>
                    <SelectItem value="leaf">Leaf (endpoint)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={status} onValueChange={(value) => setStatus(value as OIDStatus)}>
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="experimental">Experimental</SelectItem>
                    <SelectItem value="deprecated">Deprecated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              <Plus size={16} className="mr-2" />
              Add Node
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}