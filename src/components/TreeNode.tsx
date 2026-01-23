import { useState } from 'react'
import { CaretRight, CaretDown, Tree, FolderOpen, Folder, Circle } from '@phosphor-icons/react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { OIDNode } from '@/lib/oid-data'

interface TreeNodeProps {
  node: OIDNode
  selectedId: string | null
  onSelect: (node: OIDNode) => void
  level?: number
  searchQuery?: string
}

export function TreeNodeComponent({ node, selectedId, onSelect, level = 0, searchQuery = '' }: TreeNodeProps) {
  const [isExpanded, setIsExpanded] = useState(level < 2)
  
  const hasChildren = node.children && node.children.length > 0
  const isSelected = selectedId === node.id
  
  const matchesSearch = searchQuery
    ? node.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      node.oid.includes(searchQuery) ||
      node.description.toLowerCase().includes(searchQuery.toLowerCase())
    : true
  
  const Icon = node.type === 'root' ? Tree : hasChildren ? (isExpanded ? FolderOpen : Folder) : Circle
  
  const handleClick = () => {
    onSelect(node)
    if (hasChildren) {
      setIsExpanded(!isExpanded)
    }
  }
  
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
  
  if (!matchesSearch && searchQuery) {
    return null
  }
  
  return (
    <div className={cn('transition-opacity duration-200', !matchesSearch && searchQuery && 'opacity-40')}>
      <button
        onClick={handleClick}
        className={cn(
          'w-full text-left px-3 py-2 rounded transition-all duration-150 flex items-start gap-2 group',
          'hover:bg-muted/50 border border-transparent',
          isSelected && 'bg-muted border-l-2 border-l-accent shadow-sm'
        )}
        style={{ paddingLeft: `${level * 1.5 + 0.75}rem` }}
      >
        <div className="flex items-center gap-1 min-w-[20px] mt-0.5">
          {hasChildren && (
            <span className="text-muted-foreground">
              {isExpanded ? <CaretDown size={16} /> : <CaretRight size={16} />}
            </span>
          )}
        </div>
        
        <Icon size={20} weight="duotone" className={cn(
          'mt-0.5 flex-shrink-0',
          node.type === 'root' ? 'text-primary' : 'text-foreground/70'
        )} />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={cn(
              'font-medium text-sm',
              node.type === 'root' && 'font-semibold text-base'
            )}>
              {node.name}
            </span>
            <Badge variant="outline" className={cn('text-xs font-mono', getStatusColor(node.status))}>
              {node.status}
            </Badge>
          </div>
          
          <div className="font-mono text-xs text-accent mt-0.5">
            {node.oid}
          </div>
          
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
            {node.description}
          </p>
        </div>
      </button>
      
      {hasChildren && isExpanded && (
        <div className="mt-1">
          {node.children?.map((child) => (
            <TreeNodeComponent
              key={child.id}
              node={child}
              selectedId={selectedId}
              onSelect={onSelect}
              level={level + 1}
              searchQuery={searchQuery}
            />
          ))}
        </div>
      )}
    </div>
  )
}