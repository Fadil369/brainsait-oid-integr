import { useEffect, useRef, useState } from 'react'
import QRCode from 'qrcode'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, Printer, Share } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'

interface QRCodePreviewProps {
  data: string
  title?: string
  description?: string
}

export function QRCodePreview({ data, title, description }: QRCodePreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [size, setSize] = useState(400)
  const [errorLevel, setErrorLevel] = useState<'L' | 'M' | 'Q' | 'H'>('H')

  useEffect(() => {
    if (!canvasRef.current) return

    QRCode.toCanvas(
      canvasRef.current,
      data,
      {
        width: size,
        margin: 2,
        errorCorrectionLevel: errorLevel,
        color: {
          dark: '#35334d',
          light: '#f8f8fa'
        }
      },
      (error) => {
        if (error) {
          console.error('QR Code generation error:', error)
          toast.error('Failed to generate QR code')
        }
      }
    )
  }, [data, size, errorLevel])

  const handleDownload = () => {
    if (!canvasRef.current) return

    canvasRef.current.toBlob((blob) => {
      if (!blob) {
        toast.error('Failed to generate image')
        return
      }

      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `qrcode-${Date.now()}.png`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast.success('QR code downloaded')
    })
  }

  const handlePrint = () => {
    if (!canvasRef.current) return

    const dataUrl = canvasRef.current.toDataURL('image/png')
    const printWindow = window.open('', '_blank')
    
    if (!printWindow) {
      toast.error('Please allow popups to print')
      return
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>Print QR Code</title>
          <style>
            body {
              margin: 0;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              font-family: system-ui, -apple-system, sans-serif;
            }
            .container {
              text-align: center;
              padding: 2rem;
            }
            img {
              max-width: 100%;
              height: auto;
            }
            h2 {
              margin-top: 1rem;
              color: #333;
            }
            p {
              color: #666;
              margin-top: 0.5rem;
            }
            @media print {
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <img src="${dataUrl}" alt="QR Code" />
            ${title ? `<h2>${title}</h2>` : ''}
            ${description ? `<p>${description}</p>` : ''}
          </div>
        </body>
      </html>
    `)
    printWindow.document.close()
    
    printWindow.onload = () => {
      printWindow.focus()
      printWindow.print()
    }
  }

  const handleShare = async () => {
    if (!canvasRef.current) return

    try {
      canvasRef.current.toBlob(async (blob) => {
        if (!blob) {
          toast.error('Failed to generate image')
          return
        }

        const file = new File([blob], 'qrcode.png', { type: 'image/png' })

        if (navigator.share && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: title || 'QR Code',
            text: description || 'Scan this QR code',
            files: [file]
          })
          toast.success('Shared successfully')
        } else {
          await navigator.clipboard.write([
            new ClipboardItem({
              'image/png': blob
            })
          ])
          toast.success('QR code copied to clipboard')
        }
      })
    } catch (error) {
      console.error('Share error:', error)
      toast.error('Failed to share')
    }
  }

  return (
    <Card className="border-accent/20">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <CardTitle className="text-base">QR Code Preview</CardTitle>
            <CardDescription className="mt-1.5">
              Scan this code to access the OID asset information
            </CardDescription>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              className="gap-2"
            >
              <Download size={16} />
              <span className="hidden sm:inline">Download</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="gap-2"
            >
              <Printer size={16} />
              <span className="hidden sm:inline">Print</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              className="gap-2"
            >
              <Share size={16} />
              <span className="hidden sm:inline">Share</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-center">
          <div className="p-4 bg-[#f8f8fa] rounded-lg border-2 border-accent/30 inline-block">
            <canvas ref={canvasRef} className="block" />
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="size-slider" className="text-xs font-medium">
                QR Code Size
              </Label>
              <span className="text-xs text-muted-foreground font-mono">
                {size}px
              </span>
            </div>
            <Slider
              id="size-slider"
              min={200}
              max={600}
              step={50}
              value={[size]}
              onValueChange={(values) => setSize(values[0])}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-medium">Error Correction Level</Label>
            <div className="grid grid-cols-4 gap-2">
              {(['L', 'M', 'Q', 'H'] as const).map((level) => (
                <Button
                  key={level}
                  variant={errorLevel === level ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setErrorLevel(level)}
                  className="text-xs"
                >
                  {level}
                  <span className="ml-1 text-[10px] opacity-70">
                    {level === 'L' && '7%'}
                    {level === 'M' && '15%'}
                    {level === 'Q' && '25%'}
                    {level === 'H' && '30%'}
                  </span>
                </Button>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground">
              Higher levels = better recovery from damage, but denser codes
            </p>
          </div>
        </div>

        <div className="p-3 bg-muted/50 rounded-md border border-border">
          <h4 className="text-xs font-semibold mb-2 text-muted-foreground">
            QR Code Data
          </h4>
          <div className="text-xs text-muted-foreground font-mono break-all leading-relaxed">
            {data.substring(0, 150)}
            {data.length > 150 && '...'}
          </div>
          <p className="text-[10px] text-muted-foreground mt-2">
            Total size: {data.length} characters
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
