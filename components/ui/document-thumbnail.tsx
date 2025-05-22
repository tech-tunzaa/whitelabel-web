"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { FileText, Calendar, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { FilePreviewModal } from "./file-preview-modal"

interface DocumentWithExpiry {
  name: string
  url?: string
  type?: string
  expiryDate?: string
  number?: string
}

interface DocumentThumbnailProps {
  document: DocumentWithExpiry
  className?: string
}

export function DocumentThumbnail({ document, className }: DocumentThumbnailProps) {
  const [previewOpen, setPreviewOpen] = useState(false)

  // Check if document is expired or close to expiring
  const getDocumentStatus = (expiryDate?: string) => {
    if (!expiryDate) return { status: "valid", label: "" }
    
    const today = new Date()
    const expiry = new Date(expiryDate)
    const diffTime = expiry.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) {
      return { status: "expired", label: "Expired" }
    } else if (diffDays <= 30) {
      return { status: "expiring", label: `Expires in ${diffDays} days` }
    } else {
      return { status: "valid", label: `Expires: ${expiryDate}` }
    }
  }

  const docStatus = getDocumentStatus(document.expiryDate)
  const isPdf = document.url?.toLowerCase().endsWith(".pdf")

  return (
    <>
      <Card 
        className={cn(
          "cursor-pointer hover:shadow-md transition-shadow",
          docStatus.status === "expired" ? "border-red-300" : 
          docStatus.status === "expiring" ? "border-amber-300" : "",
          className
        )}
        onClick={() => setPreviewOpen(true)}
      >
        <CardContent className="p-2 relative">
          {isPdf ? (
            <div className="h-32 w-full bg-muted rounded-md flex items-center justify-center">
              <FileText className="h-12 w-12 text-muted-foreground" />
            </div>
          ) : (
            <img
              src={document.url || "/placeholder.svg"}
              alt={document.name}
              className="h-32 w-full object-cover rounded-md"
            />
          )}
          {docStatus.status !== "valid" && (
            <div className={cn(
              "absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium",
              docStatus.status === "expired" ? "bg-red-500 text-white" : "bg-amber-500 text-white"
            )}>
              {docStatus.status === "expired" ? "Expired" : "Expiring"}
            </div>
          )}
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs truncate">{document.name}</p>
            {document.expiryDate && (
              <div className="flex items-center text-xs text-muted-foreground">
                <Calendar className="h-3 w-3 mr-1" />
                <span className="truncate">
                  {new Date(document.expiryDate).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
          {document.number && (
            <p className="text-xs text-muted-foreground truncate">{document.number}</p>
          )}
        </CardContent>
      </Card>

      <FilePreviewModal
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        src={document.url || "/placeholder.svg"}
        alt={document.name}
      />
    </>
  )
}
