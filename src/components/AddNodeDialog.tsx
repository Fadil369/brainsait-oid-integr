import { useState } from 'react'
import { Plus } from '@phosphor-icons/react'
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
import { toast } from 'sonner'
import type { OIDNode, OIDNodeType, OIDStatus } from '@/lib/oid-data'
import { getNextChildId, validateOID } from '@/lib/oid-utils'

interface AddNodeDialogProps {
  parentNode: OIDNode | null
  onAdd: (node: Partial<OIDNode>) => void
}

export function AddNodeDialog({ parentNode, onAdd }: AddNodeDialogProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [nodeType, setNodeType] = useState<OIDNodeType>('leaf')
  const [status, setStatus] = useState<OIDStatus>('active')
  
  const nextOid = parentNode ? getNextChildId(parentNode) : ''
  
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
    setOpen(false)
    
    toast.success('OID node added successfully')
  }
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" disabled={!parentNode}>
          <Plus size={16} className="mr-2" />
          Add Child Node
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add New OID Node</DialogTitle>
            <DialogDescription>
              Create a new child node under {parentNode?.name || 'selected node'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
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
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
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