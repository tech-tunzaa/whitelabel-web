"use client"

import React from "react"
import { Button } from "./button"
import { Label } from "./label"
import { Input } from "./input"
import { cn } from "@/lib/utils"

interface DocumentUploadProps {
  label: string
  description?: string
  files: File[]
  setFiles: React.Dispatch<React.SetStateAction<File[]>>
  expiryDates: Record<string, string>
  setExpiryDates: React.Dispatch<React.SetStateAction<Record<string, string>>>
}

export function DocumentUpload({
  label,
  description,
  files,
  setFiles,
  expiryDates,
  setExpiryDates,
}: DocumentUploadProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files)
      setFiles((prev) => [...prev, ...filesArray])
    }
  }

  const removeFile = (fileName: string) => {
    setFiles(files.filter((file) => file.name !== fileName))
    
    // Also remove any expiry date for this file
    if (expiryDates[fileName]) {
      const newExpiryDates = { ...expiryDates }
      delete newExpiryDates[fileName]
      setExpiryDates(newExpiryDates)
    }
  }

  const setExpiryDate = (fileName: string, dateString: string) => {
    if (dateString) {
      setExpiryDates(prev => ({ ...prev, [fileName]: dateString }))
    } else {
      // Remove expiry date if empty
      const newExpiryDates = { ...expiryDates }
      delete newExpiryDates[fileName]
      setExpiryDates(newExpiryDates)
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-col gap-2">
        <Label htmlFor={label.replace(/\s+/g, '-').toLowerCase()}>{label}</Label>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
        <div className="mt-1">
          <Input
            id={label.replace(/\s+/g, '-').toLowerCase()}
            type="file"
            onChange={handleFileChange}
            className="w-full"
            multiple
          />
        </div>
      </div>
      
      {files.length > 0 && (
        <div className="mt-2 space-y-2">
          {files.map((file) => (
            <div className="flex flex-col gap-2 mb-2 bg-muted p-2 rounded-md" key={file.name}>
              <div className="flex items-center justify-between">
                <span className="text-sm">{file.name}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(file.name)}
                >
                  Remove
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor={`expiry-${file.name}`} className="text-xs">
                  Expiry Date (Optional)
                </Label>
                <Input
                  id={`expiry-${file.name}`}
                  type="date"
                  className="w-[240px] bg-white"
                  value={expiryDates[file.name] || ""}
                  onChange={(e) => setExpiryDate(file.name, e.target.value)}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
