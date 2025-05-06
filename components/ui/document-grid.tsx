"use client"

import { ScrollArea } from "@/components/ui/scroll-area"
import { DocumentThumbnail } from "./document-thumbnail"

interface DocumentWithExpiry {
  name: string
  url?: string
  type?: string
  expiryDate?: string
  number?: string
}

interface DocumentGridProps {
  documents: DocumentWithExpiry[]
  isMobile?: boolean
  title?: string
}

export function DocumentGrid({ documents, isMobile = false, title }: DocumentGridProps) {
  if (!documents.length) {
    return (
      <div className="text-sm text-muted-foreground">
        {title ? `No ${title.toLowerCase()} documents uploaded.` : "No documents uploaded."}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {title && <h3 className="text-base font-medium">{title}</h3>}
      {isMobile ? (
        <ScrollArea className="whitespace-nowrap pb-4">
          <div className="flex gap-4">
            {documents.map((doc, index) => (
              <DocumentThumbnail
                key={index}
                document={doc}
                className="min-w-[200px]"
              />
            ))}
          </div>
        </ScrollArea>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {documents.map((doc, index) => (
            <DocumentThumbnail
              key={index}
              document={doc}
            />
          ))}
        </div>
      )}
    </div>
  )
}
