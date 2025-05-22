"use client"

import { 
  FileText, 
  Image, 
  File,
  FileJson,
  FileCode as FileCodeIcon,
  FileX,
  Archive,
  FileEdit
} from "lucide-react"
import { getFileTypeFromName } from "@/lib/services/file-upload.service"

interface DocumentTypeIconProps {
  fileName: string
  mimeType?: string
  className?: string
  size?: number
}

export function DocumentTypeIcon({
  fileName,
  mimeType,
  className = "",
  size = 24
}: DocumentTypeIconProps) {
  // Determine document type based on file name and mime type
  let docType = "unknown"
  
  if (mimeType) {
    if (mimeType.startsWith("image/")) {
      docType = "image"
    } else if (mimeType === "application/pdf") {
      docType = "pdf"
    } else if (mimeType.includes("spreadsheet") || mimeType.includes("excel") || mimeType.includes("csv")) {
      docType = "spreadsheet"
    } else if (mimeType.includes("text/") || mimeType.includes("document")) {
      docType = "text"
    } else if (mimeType.includes("zip") || mimeType.includes("compressed")) {
      docType = "archive"
    }
  } else {
    // Fallback to extension check
    docType = getFileTypeFromName(fileName)
  }

  // Return appropriate icon
  switch (docType) {
    case "image":
      return <Image className={className} size={size} />
    case "pdf":
      return <FileText className={className} size={size} />
    case "spreadsheet":
      return <FileJson className={className} size={size} />
    case "doc":
    case "text":
      return <FileEdit className={className} size={size} />
    case "code":
      return <FileCodeIcon className={className} size={size} />
    case "archive":
      return <Archive className={className} size={size} />
    case "unknown":
      return <FileX className={className} size={size} />
    default:
      return <FileText className={className} size={size} />
  }
} 