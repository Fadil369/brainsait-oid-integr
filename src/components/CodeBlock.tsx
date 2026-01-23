import { useState } from 'react'
import { Copy, Check } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface CodeBlockProps {
  code: string
  language?: string
  className?: string
}

export function CodeBlock({ code, language = 'text', className }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)
  
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      toast.success('Code copied to clipboard')
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      toast.error('Failed to copy code')
    }
  }
  
  return (
    <div className={cn('relative group', className)}>
      <div className="absolute top-2 right-2 z-10">
        <Button
          size="sm"
          variant="secondary"
          onClick={handleCopy}
          className="h-8 px-3 text-xs"
        >
          {copied ? (
            <>
              <Check size={14} className="mr-1" />
              Copied
            </>
          ) : (
            <>
              <Copy size={14} className="mr-1" />
              Copy
            </>
          )}
        </Button>
      </div>
      
      <pre className="code-block overflow-x-auto pt-12 pb-4 px-4">
        <code className={`language-${language}`}>{code}</code>
      </pre>
    </div>
  )
}