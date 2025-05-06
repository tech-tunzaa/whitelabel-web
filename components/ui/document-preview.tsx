"use client"

import { useState, useRef, useEffect } from "react"
import { X, ZoomIn, ZoomOut, Download } from "lucide-react"
import { Button } from "./button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./dialog"
import { cn } from "@/lib/utils"

interface DocumentPreviewProps {
  isOpen: boolean
  onClose: () => void
  documentUrl: string
  documentName: string
  documentType: "image" | "pdf"
}

export function DocumentPreview({
  isOpen,
  onClose,
  documentUrl,
  documentName,
  documentType,
}: DocumentPreviewProps) {
  const [scale, setScale] = useState(1)
  const contentRef = useRef<HTMLDivElement>(null)
  
  // Reset zoom level when opening a new document
  useEffect(() => {
    if (isOpen) {
      setScale(1)
    }
  }, [isOpen, documentUrl])

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.25, 3))
  }

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 0.25, 0.5))
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl w-[90vw]">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-lg truncate">{documentName}</DialogTitle>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="icon" onClick={handleZoomOut}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={handleZoomIn}>
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" asChild>
              <a href={documentUrl} download={documentName} target="_blank" rel="noopener noreferrer">
                <Download className="h-4 w-4" />
              </a>
            </Button>
            <Button variant="outline" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <div ref={contentRef} className="mt-4 overflow-auto max-h-[70vh] flex items-center justify-center">
          {documentType === "image" ? (
            <img 
              src={documentUrl} 
              alt={documentName} 
              className="max-w-full transition-transform duration-200 ease-in-out"
              style={{ transform: `scale(${scale})` }}
            />
          ) : (
            <iframe
              src={`${documentUrl}#toolbar=0&navpanes=0`}
              title={documentName}
              className={cn(
                "w-full transition-transform duration-200 ease-in-out",
                scale !== 1 ? "transform origin-center" : ""
              )}
              style={{ height: "70vh", transform: `scale(${scale})` }}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
