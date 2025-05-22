"use client"

import React, { useState, useEffect, useCallback } from "react"
import { Button } from "./button"
import { Label } from "./label"
import { Input } from "./input"
import { cn } from "@/lib/utils"
import { Trash, Eye, Loader, FileUp, FileQuestion, AlertTriangle, Check, Calendar } from "lucide-react"
import { format } from "date-fns"
import { isImageFile, isPdfFile } from "@/lib/services/file-upload.service"
import { DocumentTypeIcon } from "./document-type-icon"
import { useFileStore } from "@/lib/stores/file-store"
import { FilePreviewModal } from "./file-preview-modal"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select"

// Types
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

export function DocumentUploadFixed({
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
  // State for preview modal
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState<{ url: string; name: string } | null>(null);

  // Get file store methods
  const { files, addFile, updateFile, removeFile, uploadFile, registerForm, unregisterForm } = 
    useFileStore(state => state);
  
  // Register form on mount, unregister on unmount
  useEffect(() => {
    registerForm(formId);
    return () => unregisterForm(formId);
  }, [formId, registerForm, unregisterForm]);
  
  // Get files for this form
  const storeFiles = files[formId] || [];
  
  // Simple file change handler
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;
    
    // Add each file to the file store
    Array.from(fileList).forEach(file => {
      const fileId = `file-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      addFile(formId, {
        file_id: fileId,
        document_type: "",
        file_name: file.name,
        file
      });
    });
    
    // Reset the input
    e.target.value = "";
  }, [formId, addFile]);
  
  // Upload files when they're added
  useEffect(() => {
    if (!autoUpload) return;
    
    // Find files that need to be uploaded
    const filesToUpload = storeFiles.filter(file => 
      file.file && // Has file object
      !file.uploadStatus // Not already uploaded
    );
    
    // Upload each file
    filesToUpload.forEach(file => {
      if (file.file_id) {
        uploadFile(formId, file.file_id).catch(err => 
          console.error("File upload error:", err)
        );
      }
    });
  }, [storeFiles, formId, autoUpload, uploadFile]);
  
  // Notify parent when files change or upload completes
  useEffect(() => {
    if (!onDocumentsChange || storeFiles.length === 0) return;
    
    // Don't filter files - send ALL files to prevent disappearing
    const formattedFiles = storeFiles.map(file => ({
      document_id: file.file_id || "",
      document_type: file.document_type || "",
      file_name: file.file_name || "",
      document_number: file.document_number || "",
      expiry_date: file.expiry_date || "",
      file_url: file.uploadResponse?.fileCDNUrl || file.uploadResponse?.fileUrl || "",
      verification_status: "pending",
      submitted_at: new Date().toISOString(),
    }));
    
    // Notify parent about all files
    onDocumentsChange(formattedFiles);
  }, [storeFiles, onDocumentsChange]);
  
  // Update document metadata (type, expiry date)
  const handleUpdateDocumentMeta = useCallback((fileId: string, updates: Partial<DocumentWithMeta>) => {
    // Update the file in the store
    updateFile(formId, fileId, updates);
  }, [formId, updateFile]);
  
  // Remove file handler
  const handleRemoveFile = useCallback((fileId: string) => {
    removeFile(formId, fileId);
  }, [formId, removeFile]);
  
  // Handle removing existing document
  const handleRemoveExistingDocument = useCallback((docId: string) => {
    if (onRemoveExistingDocument) {
      onRemoveExistingDocument(docId);
    }
  }, [onRemoveExistingDocument]);
  
  // Preview file handlers
  const handlePreviewFile = useCallback((url: string | undefined, name: string | undefined) => {
    if (!url) return;
    setPreviewFile({ url, name: name || "Document" });
    setIsPreviewOpen(true);
  }, []);
  
  const handleClosePreview = useCallback(() => {
    setIsPreviewOpen(false);
    setPreviewFile(null);
  }, []);
  
  // Accepted file types
  const acceptedFileTypes = ".pdf,.jpg,.jpeg,.png,.gif,.webp";
  
  // Render the component
  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {/* Existing Documents Display */}
      {existingDocuments.length > 0 && (
        <div className="mb-6">
          <h4 className="text-md font-medium mb-2">Existing Documents</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {existingDocuments.map((doc, index) => {
              const docId = doc.document_id || doc.id || `existing-doc-${index}`;
              const documentUrl = doc.file_url || doc.document_url || "";
              const documentType = documentTypes.find((t) => t.id === doc.document_type);
              const canPreview = documentUrl && (isImageFile(doc.file_name || "") || isPdfFile(doc.file_name || ""));
              
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
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={() => handlePreviewFile(documentUrl, doc.file_name)}
                        disabled={!canPreview}
                      >
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">Preview</span>
                      </Button>
                      {onRemoveExistingDocument && (
                        <Button 
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => handleRemoveExistingDocument(docId)}
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
      
      {/* File List */}
      <div className="space-y-4 pt-2">
        {storeFiles.length > 0 ? (
          <div className="space-y-4">
            <h4 className="font-medium">Uploaded Documents</h4>
            {storeFiles
              .filter(doc => !!doc.file_name)
              .map((doc, index) => {
                const isUploading = doc.uploadStatus === 'uploading';
                const isUploaded = doc.uploadStatus === 'success';
                const fileUrl = doc.uploadResponse?.fileCDNUrl || doc.uploadResponse?.fileUrl;
                const hasError = doc.uploadStatus === 'error' || doc.error;
                
                return (
                  <div
                    key={doc.file_id || `doc-${index}`}
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
                            fileName={doc.file_name || ""} 
                            mimeType={doc.file?.type || ""} 
                            size={16}
                            className={hasError ? "text-destructive" : "text-primary"} 
                          />
                        </div>
                        <div className="flex-1 min-w-0 space-y-1">
                          <p className="font-medium text-sm truncate">
                            {doc.file_name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {((doc.file?.size || 0) / 1024).toFixed(1)} KB
                          </p>

                          {/* Document Type and Expiry Date sections in a grid */}
                          <div className="grid grid-cols-2 gap-2">
                            {/* Document Type Selection */}
                            <div className="pt-2 space-y-1">
                              <Label
                                htmlFor={`doc-type-${doc.file_id}`}
                                className="text-xs font-normal"
                              >
                                Document Type
                              </Label>
                              <Select
                                value={doc.document_type || ""}
                                onValueChange={(value) => {
                                  handleUpdateDocumentMeta(doc.file_id || "", {
                                    document_type: value,
                                  });
                                }}
                                disabled={disabled || isUploading}
                              >
                                <SelectTrigger 
                                  id={`doc-type-${doc.file_id}`}
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

                            {/* Expiry Date Field using Date Input */}
                            <div className="pt-2 space-y-1">
                              <Label
                                htmlFor={`doc-expiry-${doc.file_id}`}
                                className="text-xs font-normal"
                              >
                                Expiry Date
                              </Label>
                              <Input
                                id={`doc-expiry-${doc.file_id}`}
                                type="date"
                                value={doc.expiry_date ? doc.expiry_date.split('T')[0] : ''}
                                onChange={(e) => {
                                  handleUpdateDocumentMeta(doc.file_id || "", {
                                    expiry_date: e.target.value ? new Date(e.target.value).toISOString() : undefined,
                                  });
                                }}
                                className="h-8 text-sm"
                                disabled={disabled || isUploading}
                              />
                              {doc.expiry_date && (
                                <p className="text-xs text-muted-foreground">
                                  {format(new Date(doc.expiry_date), "PPP")}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        {/* Preview button */}
                        {isUploaded && fileUrl && (
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                            onClick={() => handlePreviewFile(fileUrl, doc.file_name)}
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
                          onClick={() => handleRemoveFile(doc.file_id || "")}
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
                          {typeof doc.progress === 'number' && (
                            <span>{Math.round(doc.progress)}%</span>
                          )}
                        </div>
                      )}

                      {hasError && (
                        <div className="flex items-center gap-2 text-xs text-destructive">
                          <AlertTriangle className="h-3 w-3" />
                          <span>{doc.error || "Upload failed"}</span>
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
