"use client"

import * as React from "react"
import { Upload, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface ImageUploadProps {
  id: string
  value?: string
  onChange: (url: string) => void
  onFileChange?: (file: File) => void
  previewAlt?: string
  height?: string
  width?: string
  buttonText?: string
  className?: string
}

export function ImageUpload({
  id,
  value,
  onChange,
  onFileChange,
  previewAlt = "Image preview",
  height = "h-24",
  width = "w-full",
  buttonText = "Upload",
  className = "",
}: ImageUploadProps) {
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(value || null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert("File is too large! Maximum size is 2MB.")
      return
    }

    // Create URL for preview
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    onChange(url)
    
    if (onFileChange) {
      onFileChange(file)
    }
  }

  const clearImage = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setPreviewUrl(null)
    onChange("")
  }

  return (
    <div className={`relative ${className}`}>
      {previewUrl ? (
        <div className="relative aspect-video rounded-md overflow-hidden">
          <img
            src={previewUrl}
            alt={previewAlt}
            className="object-contain w-full h-full"
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 h-6 w-6"
            onClick={clearImage}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        <>
          <Input
            type="file"
            className="hidden"
            id={id}
            accept="image/*"
            onChange={handleFileChange}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => document.getElementById(id)?.click()}
            className={`${width} ${height} border-dashed flex flex-col gap-2 items-center justify-center`}
          >
            <Upload className="h-6 w-6" />
            <span>{buttonText}</span>
            <span className="text-xs text-muted-foreground">
              PNG, JPG, SVG (max 2MB)
            </span>
          </Button>
        </>
      )}
    </div>
  )
}
