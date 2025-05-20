"use client"

import { useState, useEffect } from "react"
import { X, ZoomIn, ZoomOut, RotateCw, Download, ExternalLink, FileSymlink, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { isPdfFile, isImageFile, getDocumentType } from "@/lib/services/document-upload.service"

interface ImagePreviewModalProps {
  src: string
  alt: string
  onClose: () => void
  isOpen: boolean
}

export function ImagePreviewModal({ src, alt, onClose, isOpen }: ImagePreviewModalProps) {
  const [scale, setScale] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const documentType = getDocumentType(src)
  
  // Reset zoom and rotation when image changes
  useEffect(() => {
    if (isOpen) {
      setScale(1)
      setRotation(0)
      setError(null)
      setIsLoading(true)
    }
  }, [src, isOpen])

  // Close on escape key press
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    
    window.addEventListener("keydown", handleEsc)
    return () => window.removeEventListener("keydown", handleEsc)
  }, [onClose])

  if (!isOpen) return null
  
  const zoomIn = () => setScale(prev => Math.min(prev + 0.25, 3))
  const zoomOut = () => setScale(prev => Math.max(prev - 0.25, 0.5))
  const rotate = () => setRotation(prev => (prev + 90) % 360)
  
  const handleDownload = () => {
    const link = document.createElement("a")
    link.href = src
    link.download = alt || "document"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleOpenInNewTab = () => {
    window.open(src, "_blank")
  }

  const handleImageError = () => {
    setError("Failed to load the document")
    setIsLoading(false)
  }

  const handleImageLoad = () => {
    setIsLoading(false)
  }
  
  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center">
      <div className="relative w-full max-w-7xl h-[80vh] mx-4">
        {/* Document container */}
        <div className="bg-black h-full w-full flex items-center justify-center overflow-auto relative">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
          )}

          {error && (
            <div className="text-center text-white p-4 flex flex-col items-center gap-2">
              <AlertCircle className="h-12 w-12 text-red-400" />
              <p>{error}</p>
              <Button variant="outline" onClick={handleOpenInNewTab} className="mt-2">
                <ExternalLink className="mr-2 h-4 w-4" />
                Open in Browser
              </Button>
            </div>
          )}

          {documentType === 'pdf' ? (
            <iframe
              src={`${src}#toolbar=0`}
              className="w-full h-full"
              onLoad={handleImageLoad}
              onError={handleImageError}
              title={alt}
            />
          ) : documentType === 'image' ? (
            <img
              src={src}
              alt={alt}
              className="max-h-full max-w-full object-contain transition-transform duration-200"
              style={{
                transform: `scale(${scale}) rotate(${rotation}deg)`
              }}
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
          ) : (
            <div className="text-center text-white p-4 flex flex-col items-center gap-2">
              <FileSymlink className="h-16 w-16 text-gray-400" />
              <p>This file type cannot be previewed</p>
              <Button variant="outline" onClick={handleOpenInNewTab} className="mt-2">
                <ExternalLink className="mr-2 h-4 w-4" />
                Open in Browser
              </Button>
            </div>
          )}
        </div>
        
        {/* Controls */}
        {documentType === 'image' && !error && (
          <div className="absolute left-0 right-0 bottom-4 flex justify-center">
            <div className="bg-background/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg flex gap-2">
              <Button variant="ghost" size="icon" onClick={zoomIn} title="Zoom In">
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={zoomOut} title="Zoom Out">
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={rotate} title="Rotate">
                <RotateCw className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleDownload} title="Download">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
        
        {/* Universal controls for any document */}
        <div className="absolute right-2 top-2 flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDownload}
            className="rounded-full bg-background/50 backdrop-blur-sm hover:bg-background/80"
            title="Download"
          >
            <Download className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={handleOpenInNewTab}
            className="rounded-full bg-background/50 backdrop-blur-sm hover:bg-background/80"
            title="Open in new tab"
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full bg-background/50 backdrop-blur-sm hover:bg-background/80"
            onClick={onClose}
            title="Close"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  )
} 