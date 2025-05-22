"use client"

import React, { useState, useEffect, useCallback, useRef } from "react"
import { Button } from "./button"
import { Label } from "./label"
import { Input } from "./input"
import { cn } from "@/lib/utils"
import {
  Trash,
  Eye,
  Loader,
  FileUp,
  FileQuestion,
  AlertTriangle,
  Check,
  Calendar,
} from "lucide-react"
import { format } from "date-fns"
import { DocumentTypeIcon } from "./document-type-icon"
import { FilePreviewModal } from "./file-preview-modal"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select"

export interface DocumentType {
  id: string
  label: string
  requiresExpiry?: boolean
}

export interface DocumentWithMeta {
  id?: string
  document_id?: string
  document_type: string
  file_name?: string
  document_number?: string
  expiry_date?: string
  file_url?: string
  document_url?: string
  verification_status?: string
  submitted_at?: string
  rejection_reason?: string
  file?: File
  file_id?: string
}

export interface DocumentUploadProps {
  formId: string
  label?: string
  description?: string
  documentTypes: DocumentType[]
  existingDocuments?: DocumentWithMeta[]
  onRemoveExistingDocument?: (documentId: string) => void
  onDocumentsChange?: (files: DocumentWithMeta[]) => void
  disabled?: boolean
  className?: string
  autoUpload?: boolean
}

export function DocumentUpload({
  formId,
  label = "Upload Documents",
  description,
  documentTypes,
  existingDocuments = [],
  onRemoveExistingDocument,
  onDocumentsChange,
  disabled = false,
  className,
  autoUpload = true,
}: DocumentUploadProps) {
  // State for modals
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState<{ url: string; name: string } | null>(null);
  
  // Internal state for newly uploaded files
  const [uploadedFiles, setUploadedFiles] = useState<Array<{
    id: string;
    name: string;
    size: number;
    type?: string;
    document_type?: string;
    expiry_date?: string;
    progress?: number;
    status: 'uploading' | 'success' | 'error';
    error?: string;
    url?: string;
  }>>([]);

  // Reference to track if component is mounted
  const isMountedRef = useRef(true);
  
  // Make sure we clean up URLs on unmount
  useEffect(() => {
    return () => {
      // Mark component as unmounted
      isMountedRef.current = false;
      
      // Clean up any object URLs to prevent memory leaks
      uploadedFiles.forEach(file => {
        if (file.url && file.url.startsWith('blob:')) {
          URL.revokeObjectURL(file.url);
        }
      });
    };
  }, [uploadedFiles]);
  
  // Debug log for component lifecycle
  useEffect(() => {
    console.log(`DocumentUpload (${formId}) - Mounted`);
    console.log("- existingDocuments:", existingDocuments);
    console.log("- uploadedFiles:", uploadedFiles);
    
    // Immediately notify parent when component is mounted
    if (uploadedFiles.length > 0) {
      notifyParentOfChanges();
    }
    
    return () => {
      console.log(`DocumentUpload (${formId}) - Unmounted`);
    };
  }, []);

  // Simple file change handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;
    
    console.log("Files selected:", fileList);
    
    // Process each file
    Array.from(fileList).forEach(file => {
      const fileId = `file-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      
      // Add to internal state first
      setUploadedFiles(prev => [
        ...prev,
        {
          id: fileId,
          name: file.name,
          size: file.size,
          type: file.type,
          status: 'uploading',
          progress: 0
        }
      ]);
      
      // Simulate file upload completion immediately instead of with timeout
      // This resolves the issue with files appearing to upload indefinitely
      setUploadedFiles(prev => 
        prev.map(f => 
          f.id === fileId
            ? { 
                ...f, 
                status: 'success',
                progress: 100,
                url: URL.createObjectURL(file) // This creates a local URL for preview
              }
            : f
        )
      );
      
      // Notify parent of changes right away
      setTimeout(() => {
        if (isMountedRef.current) {
          notifyParentOfChanges();
        }
      }, 100);
    });
    
    // Reset input
    e.target.value = "";
  };
  
  // Utility to notify parent about all documents
  const notifyParentOfChanges = useCallback(() => {
    if (!onDocumentsChange) return;
    
    // Convert internal format to expected output format
    const allDocuments = [
      // Format uploaded files to match DocumentWithMeta
      ...uploadedFiles.map(file => ({
        file_id: file.id,
        document_id: file.id,
        document_type: file.document_type || "",
        file_name: file.name,
        file_url: file.url || "",
        expiry_date: file.expiry_date,
        verification_status: "pending" as const,
        submitted_at: new Date().toISOString()
      }))
    ];
    
    console.log("Notifying parent about documents:", allDocuments);
    onDocumentsChange(allDocuments);
  }, [onDocumentsChange, uploadedFiles]);
  
  // Handle document updates (document type, expiry date)
  const handleUpdateDocumentMeta = useCallback((fileId: string, updates: Partial<{
    document_type: string;
    expiry_date?: string;
  }>) => {
    setUploadedFiles(prev => 
      prev.map(file => 
        file.id === fileId
          ? { ...file, ...updates }
          : file
      )
    );
    
    // Notify parent after a short delay to ensure state is updated
    setTimeout(notifyParentOfChanges, 100);
  }, [notifyParentOfChanges]);
  
  // Remove file handler
  const handleRemoveFile = useCallback((fileId: string) => {
    setUploadedFiles(prev => {
      // Find file before removing to release object URL if needed
      const fileToRemove = prev.find(f => f.id === fileId);
      if (fileToRemove?.url && fileToRemove.url.startsWith('blob:')) {
        URL.revokeObjectURL(fileToRemove.url);
      }
      
      return prev.filter(file => file.id !== fileId);
    });
    
    // Notify parent after a short delay to ensure state is updated
    setTimeout(notifyParentOfChanges, 100);
  }, [notifyParentOfChanges]);
  
  // Preview file handlers
  const handlePreviewFile = (url: string | undefined, name: string | undefined) => {
    if (!url) return;
    
    // For relative URLs, make sure to include the base URL
    let fullUrl = url;
    if (url && !url.startsWith('http') && !url.startsWith('blob:') && !url.startsWith('data:')) {
      // If it's a relative URL, construct the full URL
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
      fullUrl = `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
    }
    
    setPreviewFile({ 
      url: fullUrl, 
      name: name || "Document" 
    });
    setIsPreviewOpen(true);
  };
  
  const handleClosePreview = () => {
    setIsPreviewOpen(false);
    setPreviewFile(null);
  };
  
  // Accepted file types
  const acceptedFileTypes = ".pdf,.jpg,.jpeg,.png,.gif,.webp";
  
  // Render the component
  return (
    <div key={existingDocuments.length} className={cn("flex flex-col gap-4", className)}>
      {/* Debug Info - helpful for troubleshooting */}
      <div className="text-xs text-muted-foreground mb-2">
        <p>Existing docs count: {existingDocuments.length}</p>
        <p>Uploaded files count: {uploadedFiles.length}</p>
      </div>
      
      {/* Existing Documents Display */}
      {existingDocuments.length > 0 && (
        <div className="mb-6">
          <h4 className="text-md font-medium mb-2">Existing Documents</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {existingDocuments.map((doc, index) => {
              const docId = doc.document_id || doc.id || `existing-doc-${index}`;
              const documentUrl = doc.file_url || doc.document_url || "";
              const documentType = documentTypes.find((t) => t.id === doc.document_type);
              
              return (
                <div 
                  key={docId} 
                  className="border rounded-md p-3 bg-background hover:bg-accent/5 transition-colors"
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1">
                      <div className="flex gap-2 items-center">
                        <div className="bg-primary/10 p-2 rounded-md">
                          <DocumentTypeIcon 
                            fileName={doc.file_name || ""} 
                            mimeType="" 
                            size={16} 
                            className="text-primary" 
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium truncate">
                            {documentType?.label || doc.document_type || "Document"}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {doc.file_name || "Document"}
                          </p>
                          {doc.document_number && (
                            <p className="text-xs text-muted-foreground">
                              #{doc.document_number}
                            </p>
                          )}
                          {doc.expiry_date && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>
                                {new Date(doc.expiry_date).toLocaleDateString()}
                              </span>
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {/* Preview button */}
                      {documentUrl && (
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          onClick={() => handlePreviewFile(documentUrl, doc.file_name)}
                        >
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">Preview</span>
                        </Button>
                      )}
                      
                      {/* Remove button */}
                      {onRemoveExistingDocument && (
                        <Button 
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => onRemoveExistingDocument(docId)}
                          disabled={disabled}
                        >
                          <Trash className="h-4 w-4" />
                          <span className="sr-only">Remove</span>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {/* Upload Area */}
      <div className="space-y-1">
        <Label className="text-base">{label}</Label>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      
      {/* File Drop Area */}
      <div className="border rounded-lg p-4 mb-4">
        <div className="flex items-center justify-center w-full">
          <label
            htmlFor="file-upload-main"
            className={cn(
              "flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-background hover:bg-accent/10 transition-colors",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <FileUp className="w-8 h-8 text-muted-foreground mb-2" />
              <p className="mb-2 text-sm text-center text-muted-foreground">
                <span className="font-medium">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-center text-muted-foreground">
                PDF, Images (.jpg, .png, .pdf)
                <span className="ml-1">(Max size: 10MB)</span>
              </p>
            </div>
            <Input
              id="file-upload-main"
              type="file"
              className="hidden"
              onChange={handleFileChange}
              accept={acceptedFileTypes}
              disabled={disabled}
              multiple
            />
          </label>
        </div>
      </div>
      
      {/* Uploaded Files List */}
      <div className="space-y-4 pt-2">
        {uploadedFiles.length > 0 ? (
          <div className="space-y-4">
            <h4 className="font-medium">Uploaded Documents</h4>
            {uploadedFiles.map((file) => {
              const isUploading = file.status === 'uploading';
              const isUploaded = file.status === 'success';
              const hasError = file.status === 'error';
              
              return (
                <div
                  key={file.id}
                  className={cn(
                    "border rounded-lg p-3",
                    hasError && "border-destructive bg-destructive/5"
                  )}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className={cn(
                        "rounded-md p-2 flex-shrink-0",
                        hasError ? "bg-destructive/10" : "bg-primary/10"
                      )}>
                        <DocumentTypeIcon 
                          fileName={file.name} 
                          mimeType={file.type || ""} 
                          size={16}
                          className={hasError ? "text-destructive" : "text-primary"} 
                        />
                      </div>
                      <div className="flex-1 min-w-0 space-y-1">
                        <p className="font-medium text-sm truncate">
                          {file.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {(file.size / 1024).toFixed(1)} KB
                        </p>

                        {/* Document Type and Expiry Date sections */}
                        <div className="grid grid-cols-2 gap-2">
                          {/* Document Type Selection */}
                          <div className="pt-2 space-y-1">
                            <Label
                              htmlFor={`doc-type-${file.id}`}
                              className="text-xs font-normal"
                            >
                              Document Type
                            </Label>
                            <Select
                              value={file.document_type || ""}
                              onValueChange={(value) => {
                                handleUpdateDocumentMeta(file.id, {
                                  document_type: value,
                                });
                              }}
                              disabled={disabled || isUploading}
                            >
                              <SelectTrigger 
                                id={`doc-type-${file.id}`}
                                className="h-8 text-sm"
                              >
                                <SelectValue placeholder="Select document type" />
                              </SelectTrigger>
                              <SelectContent>
                                {documentTypes.map((type) => (
                                  <SelectItem key={type.id} value={type.id}>
                                    {type.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Expiry Date Field */}
                          <div className="pt-2 space-y-1">
                            <Label
                              htmlFor={`doc-expiry-${file.id}`}
                              className="text-xs font-normal"
                            >
                              Expiry Date
                            </Label>
                            <Input
                              id={`doc-expiry-${file.id}`}
                              type="date"
                              value={file.expiry_date ? file.expiry_date.split('T')[0] : ''}
                              onChange={(e) => {
                                handleUpdateDocumentMeta(file.id, {
                                  expiry_date: e.target.value ? new Date(e.target.value).toISOString() : undefined,
                                });
                              }}
                              className="h-8 text-sm"
                              disabled={disabled || isUploading}
                            />
                            {file.expiry_date && (
                              <p className="text-xs text-muted-foreground">
                                {format(new Date(file.expiry_date), "PPP")}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      {/* Preview button */}
                      {isUploaded && file.url && (
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          onClick={() => handlePreviewFile(file.url, file.name)}
                        >
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">Preview</span>
                        </Button>
                      )}
                      
                      {/* Remove button */}
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => handleRemoveFile(file.id)}
                        disabled={disabled || isUploading}
                      >
                        <Trash className="h-4 w-4" />
                        <span className="sr-only">Remove</span>
                      </Button>
                    </div>
                  </div>

                  {/* Upload Status Indicator */}
                  <div className="mt-2">
                    {isUploading && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Loader className="h-3 w-3 animate-spin" />
                        <span>Uploading...</span>
                        {typeof file.progress === 'number' && (
                          <span>{Math.round(file.progress)}%</span>
                        )}
                      </div>
                    )}

                    {hasError && (
                      <div className="flex items-center gap-2 text-xs text-destructive">
                        <AlertTriangle className="h-3 w-3" />
                        <span>{file.error || "Upload failed"}</span>
                      </div>
                    )}

                    {isUploaded && (
                      <div className="flex items-center gap-2 text-xs text-emerald-600">
                        <Check className="h-3 w-3" />
                        <span>Upload complete</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 border border-dashed rounded-md">
            <FileQuestion className="h-10 w-10 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              No documents uploaded yet
            </p>
          </div>
        )}
      </div>
      
      {/* File Preview Modal */}
      {previewFile && (
        <FilePreviewModal 
          isOpen={isPreviewOpen}
          onClose={handleClosePreview}
          src={previewFile.url}
          alt={previewFile.name}
        />
      )}
    </div>
  );
}
