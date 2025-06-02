"use client"

import * as React from "react"
import { useState, useRef, useEffect } from "react"
import { Upload, Loader, File, Calendar, Plus, Trash, Eye, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { FilePreviewModal } from "@/components/ui/file-preview-modal"
import { uploadFile } from "@/lib/services/file-upload.service"

// Type definitions
export type DocumentType = {
  id: string
  name: string
  required?: boolean
  description?: string
}

export interface DocumentWithMeta {
  id?: string // Used internally, not sent to backend
  document_id?: string
  document_type: string
  file_name?: string // Used internally for display
  expires_at?: string
  document_url?: string
  verification_status?: string
  submitted_at?: string
  rejection_reason?: string
  file?: File // Used internally for upload
  file_id?: string
}

export interface DocumentUploadNewProps {
  id: string
  label?: string
  description?: string
  documentTypes: DocumentType[]
  existingDocuments?: DocumentWithMeta[]
  onDocumentsChange: (documents: DocumentWithMeta[]) => void
  onRemoveDocument?: (documentId: string) => void
  className?: string
  disabled?: boolean
}

export function DocumentUpload({
  id,
  label = "Upload Documents",
  description,
  documentTypes,
  existingDocuments = [],
  onDocumentsChange,
  onRemoveDocument,
  className = "",
  disabled = false
}: DocumentUploadNewProps) {
  // State management - simplified
  const [documents, setDocuments] = useState<DocumentWithMeta[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isAddingDocument, setIsAddingDocument] = useState(false)
  const [selectedDocumentType, setSelectedDocumentType] = useState<string>("")
  const [expires_at, setExpires_at] = useState<string>("") // Use string for date input
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [previewFile, setPreviewFile] = useState<{src: string, alt: string} | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  
  // Initialize with existing documents exactly as they are
  useEffect(() => {
    // Only update if we get a non-empty array to avoid clearing local state
    if (existingDocuments && existingDocuments.length > 0) {
      setDocuments(existingDocuments)
    }
  }, [existingDocuments])

  const handlePreviewDocument = (url?: string, name?: string) => {
    if (!url) return
    // Just set the source and alt text for the FilePreviewModal
    setPreviewFile({ src: url, alt: name || "Document" })
    setIsPreviewOpen(true)
  }

  const closePreview = () => {
    setIsPreviewOpen(false)
    setPreviewFile(null)
  }

  // Handle file selection and validate the file before proceeding
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) {
      setError(null)
      return
    }
    
    // Check file size (max 10MB)
    const maxSizeMB = 10
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`File is too large. Maximum size is ${maxSizeMB}MB.`)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
      return
    }
    
    // Clear any previous errors
    setError(null)
  }
  
  // Handle document upload using the file storage API
  const handleUploadDocument = async () => {
    // Get the file from the input
    const file = fileInputRef.current?.files?.[0]
    
    // Basic validation
    if (!file || !selectedDocumentType) {
      setError(!file ? "Please select a file" : "Please select a document type")
      return
    }
    
    try {
      setIsUploading(true)
      setError(null)
      
      // Upload the file to the storage API
      const uploadResponse = await uploadFile(file, true);
      
      // console.log('Document upload response:', uploadResponse);
      
      // Create a new document object with data from the upload response
      const newDocument: DocumentWithMeta = {
        id: `temp-${Date.now()}`, // Temporary ID for tracking
        document_type: selectedDocumentType,
        file_name: file.name,
        document_url: uploadResponse.fileCDNUrl, // Use the CDN URL from the upload response
        expires_at: expires_at || undefined,
        // Store the file reference and additional metadata from the API
        file_id: uploadResponse.filePath
      }
      
      // Add to existing documents list
      const updatedDocuments = [...documents, newDocument]
      setDocuments(updatedDocuments)
      
      // Notify parent component
      onDocumentsChange(updatedDocuments)
      
      // Reset the form
      setSelectedDocumentType("")
      setExpires_at("")
      setIsAddingDocument(false)
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
      
      // Close the dialog
      setError(null)
    } catch (error) {
      console.error("Error uploading document:", error)
      setError("Failed to upload document. Please try again.")
      // Show error message to the user
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    } finally {
      setIsUploading(false)
    }
  }
   
  // Remove document from both UI and notify parent
  const handleRemoveDocument = (docToRemove: DocumentWithMeta) => {
    // Log document being removed for debugging
    console.log('Removing document:', docToRemove);
    
    try {
      // If the document has a document_id and onRemoveDocument callback is provided,
      // call it to handle server-side deletion
      if (docToRemove.document_id && onRemoveDocument) {
        onRemoveDocument(docToRemove.document_id);
      }
      
      // Filter out the document from the local state
      const updatedDocs = documents.filter(doc => 
        // Compare by multiple ID fields to ensure proper removal
        doc.id !== docToRemove.id && 
        doc.document_id !== docToRemove.document_id
      );
      
      // Update local state
      setDocuments(updatedDocs);
      
      // Notify parent component of the updated documents list
      onDocumentsChange(updatedDocs);
    } catch (error) {
      console.error('Error removing document:', error);
      // Don't modify the UI if removal failed
    }
  }

  // Update document with comprehensive field support
  const handleUpdateDocument = (docId: string, updates: Partial<DocumentWithMeta>) => {
    console.log('Updating document:', { docId, updates });
    
    // Map through documents and update the matching one
    const updatedDocs = documents.map(doc => {
      // Match by any ID field (id or document_id)
      if (doc.id === docId || doc.document_id === docId) {
        // Create updated document with proper field name handling
        const updatedDoc = { 
          ...doc, 
          ...updates,
          // Ensure document_url and file_url are properly synced
          document_url: updates.document_url || doc.document_url,
          // Preserve expires_at or expiry_date
          expires_at: updates.expires_at || doc.expires_at
        };
        return updatedDoc;
      }
      return doc;
    });
    
    // Update local state
    setDocuments(updatedDocs);
    
    // Notify parent component
    onDocumentsChange(updatedDocs);
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Section header */}
      <div className="flex justify-end items-center mb-2">        
        {/* Add document button */}
        <Dialog open={isAddingDocument} onOpenChange={setIsAddingDocument}>
          <DialogTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-1 hover:bg-primary/10"
              disabled={disabled}
            >
              <Plus className="h-4 w-4" />
              Add Document
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload New Document</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {/* File upload input */}
              <div className="space-y-2">
                <Label htmlFor="document-file">Document File</Label>
                <Input
                  ref={fileInputRef}
                  id="document-file"
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                />
                <p className="text-xs text-muted-foreground">
                  Accepted formats: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG (max 10MB)
                </p>
              </div>
              
              {/* Document type selector */}
              <div className="space-y-2">
                <Label htmlFor="document-type">Document Type</Label>
                <Select 
                  value={selectedDocumentType} 
                  onValueChange={setSelectedDocumentType}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select document type" />
                  </SelectTrigger>
                  <SelectContent>
                    {documentTypes.map(type => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Date input for expires at */}
              <div className="space-y-2">
                <Label htmlFor="expiry-date">Expires At (if applicable)</Label>
                <Input
                  id="expiry-date"
                  type="date"
                  value={expires_at}
                  onChange={(e) => setExpires_at(e.target.value)}
                  className="w-full"
                  disabled={!selectedDocumentType || isUploading}
                />
                <p className="text-xs text-muted-foreground">
                  Optional - for documents with an expiration date
                </p>
              </div>
              
              {/* Error display */}
              {error && (
                <div className="text-sm text-destructive">{error}</div>
              )}
              
              {/* Upload status */}
              {isUploading && (
                <div className="flex items-center justify-center p-2">
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  <span>Uploading document...</span>
                </div>
              )}
              
              {/* Upload button */}
              <Button 
                onClick={handleUploadDocument}
                disabled={isUploading || !selectedDocumentType}
                className="w-full mt-2"
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload Document
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Documents list */}
      {documents.length > 0 ? (
        <div className="space-y-2">
          <ScrollArea className="max-h-[400px] overflow-y-auto">
            <div className="space-y-2">
              {documents.map((doc) => (
                <div 
                  key={doc.id || doc.document_url} 
                  className="flex items-center justify-between p-3 rounded-md border bg-card transition-colors hover:bg-accent/10 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-md bg-primary/10 text-primary">
                      <File className="h-8 w-8" />
                    </div>
                    
                    {/* Document information */}
                    <div className="flex-1 min-w-0">  {/* Added min-width for proper truncation */}
                      <div className="font-medium flex items-center gap-1">
                        {documentTypes.find(t => t.id === doc.document_type)?.name || doc.document_type}
                        {!doc.document_id ? (
                          <span className="text-xs bg-green-100 text-green-600 px-1.5 py-0.5 rounded-full">New</span>
                        ) : null }
                      </div>
                      <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                        {doc.file_name || ""}
                      </div>
                      {doc.expires_at && (
                        <div className="text-xs flex items-center text-muted-foreground">
                          <Calendar className="h-3 w-3 mr-1" />
                          Expires: {doc.expires_at}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Action buttons with improved visual feedback */}
                  <div className="flex gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                    {/* Preview button - with type="button" to prevent form submission */}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.preventDefault(); // Prevent any form submission
                        handlePreviewDocument(doc.document_url, doc.file_name);
                      }} 
                      disabled={disabled || !doc.document_url}
                      className="h-8 w-8"
                      title="Preview document"
                    >
                      <Eye className="h-4 w-4" />
                      <span className="sr-only">Preview</span>
                    </Button>
                    
                    {/* Delete button - with type="button" to prevent form submission */}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.preventDefault(); // Prevent any form submission
                        e.stopPropagation(); // Stop event bubbling
                        handleRemoveDocument(doc);
                      }}
                      disabled={disabled}
                      className="h-8 w-8 hover:bg-destructive/10"
                      title="Delete document"
                    >
                      <Trash className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-6 border border-dashed rounded-md">
          <Upload className="h-10 w-10 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">No documents uploaded</p>
          <p className="text-xs text-muted-foreground mt-1">Click "Add Document" to upload</p>
        </div>
      )}
      
      {/* Use FilePreviewModal instead of custom dialog */}
      {isPreviewOpen && previewFile && (
        <FilePreviewModal
          src={previewFile.src}
          alt={previewFile.alt}
          isOpen={isPreviewOpen}
          onClose={closePreview}
        />
      )}
    </div>
  )
}
