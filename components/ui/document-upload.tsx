"use client"

import React, { useState, useEffect } from "react"
import { Button } from "./button"
import { Label } from "./label"
import { Input } from "./input"
import { cn } from "@/lib/utils"
import { Trash, Plus, X, FileIcon, AlertTriangle, Check, Loader } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "./select"
import { useDocumentStore, DocumentWithUpload } from "@/lib/stores/document-store"
import { isImageFile, isPdfFile } from "@/lib/services/document-upload.service"
import { DocumentTypeIcon } from "@/components/ui/document-type-icon"

export interface DocumentType {
  id: string
  label: string
  category: string
  description?: string
}

export interface DocumentWithMeta {
  id?: string
  document_id?: string
  file_name: string
  document_type: string
  file_url?: string
  document_url?: string
  file?: File
  file_size?: number
  mime_type?: string
  expiry_date?: string
  verification_status?: "pending" | "approved" | "rejected"
  rejection_reason?: string
  submitted_at?: string
  verified_at?: string
}

interface DocumentUploadProps {
  formId: string // Unique ID for this form instance
  label?: string
  description?: string
  documentTypes: DocumentType[]
  existingDocuments?: DocumentWithMeta[]
  onRemoveExistingDocument?: (documentId: string) => void
  onDocumentsChange?: (documents: DocumentWithMeta[]) => void
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
  // Access document store
  const {
    documents: allStoreDocs,
    uploadingDocuments,
    addDocument,
    updateDocument,
    removeDocument,
    uploadDocument: uploadDocumentToStore,
    retryUpload,
    setDocuments,
    registerForm,
    unregisterForm
  } = useDocumentStore();
  
  // Get documents for this form
  const storeDocs = allStoreDocs[formId] || [];
  
  // Register form on mount, unregister on unmount
  useEffect(() => {
    registerForm(formId);
    
    return () => {
      unregisterForm(formId);
    };
  }, [formId, registerForm, unregisterForm]);
  
  // Initialize store with existing documents if provided
  useEffect(() => {
    // Only add existing documents once on mount
    if (existingDocuments.length && !storeDocs.length) {
      const docsWithStatus = existingDocuments.map(doc => ({
        ...doc,
        uploadStatus: 'success',
        progress: 100
      }));
      setDocuments(formId, docsWithStatus as DocumentWithUpload[]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Notify parent component of document changes
  useEffect(() => {
    if (onDocumentsChange) {
      // Return only successfully uploaded documents
      const uploadedDocs = storeDocs
        .filter(doc => doc.uploadStatus === 'success')
        .map(({ uploadStatus, progress, error, uploadResponse, ...doc }) => {
          // Ensure document has all required fields for form submission
          const documentData = {
            ...doc,
            document_type: doc.document_type || "", // Ensure document_type is never undefined
            file_url: doc.file_url || doc.document_url || "", // Use either URL field
            verification_status: doc.verification_status || "pending" // Default status
          };
          
          // Remove file object (can't be serialized in form submission)
          if (documentData.file) {
            delete documentData.file;
          }
          
          return documentData;
        });
      
      // Log documents being sent to parent
      console.log(`[DocumentUpload] Sending ${uploadedDocs.length} documents to parent for formId: ${formId}`);
      onDocumentsChange(uploadedDocs); // Don't include existing documents - let parent handle merging if needed
    }
  }, [storeDocs, existingDocuments, onDocumentsChange, formId]);

  // Handle file selection
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || disabled) return;
    
    const newFiles = Array.from(e.target.files);
    
    // Add each file as a new document with minimal data
    for (const file of newFiles) {
      const newDoc: DocumentWithUpload = {
        file_name: file.name,
        document_type: "",
        file_size: file.size,
        mime_type: file.type,
        file: file,
        uploadStatus: 'pending'
      };
      
      addDocument(formId, newDoc);
      
      // Auto upload if enabled
      if (autoUpload) {
        await uploadDocumentToStore(formId, newDoc);
      }
    }
    
    // Clear the input to allow selecting the same file again
    e.target.value = "";
  };

  // Update document type for a file
  const updateDocType = async (fileName: string, docType: string) => {
    if (disabled) return;
    
    updateDocument(formId, fileName, { document_type: docType });
    
    // If document has pending status and now has a document type, upload it
    const doc = storeDocs.find(d => d.file_name === fileName);
    if (doc && doc.uploadStatus === 'pending' && doc.file && autoUpload) {
      await uploadDocumentToStore(formId, { ...doc, document_type: docType });
    }
  };

  // Update expiry date for a file
  const updateExpiryDate = (fileName: string, date: string) => {
    if (disabled) return;
    updateDocument(formId, fileName, { expiry_date: date });
  };
  
  // Handle removing a document
  const handleRemoveDocument = (fileName: string) => {
    if (disabled) return;
    removeDocument(formId, fileName);
  };
  
  // Handle retrying a failed upload
  const handleRetryUpload = async (fileName: string) => {
    if (disabled) return;
    await retryUpload(formId, fileName);
  };
  
  // Get document type label
  const getDocTypeLabel = (typeId: string) => {
    const docType = documentTypes.find(t => t.id === typeId);
    return docType?.label || typeId;
  };

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {/* Existing Documents Display */}
      {existingDocuments.length > 0 && (
        <div className="mb-6">
          <h4 className="text-md font-medium mb-2">Existing Documents</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {existingDocuments.map((doc, index) => {
              const docId = doc.document_id || doc.id || `existing-doc-${index}`;
              return (
                <div key={docId} className="flex items-center justify-between p-3 border rounded-md bg-background hover:bg-accent/10 transition-colors">
                  <div className="flex gap-3 items-start flex-1">
                    <div className="bg-primary/10 p-2 rounded-md">
                      {isImageFile(doc.file_name || '') ? (
                        <img 
                          src={doc.file_url} 
                          alt={doc.file_name} 
                          className="h-6 w-6 object-cover"
                          onError={(e) => {
                            const target = e.currentTarget as HTMLImageElement;
                            target.src = '';
                            target.style.display = 'none';
                            const nextSibling = target.nextElementSibling as HTMLElement;
                            if (nextSibling) {
                              nextSibling.style.display = 'block';
                            }
                          }}
                        />
                      ) : (
                        <DocumentTypeIcon 
                          fileName={doc.file_name || ''} 
                          mimeType={doc.mime_type} 
                          size={16} 
                          className="text-primary" 
                        />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">{doc.document_type ? getDocTypeLabel(doc.document_type) : 'Document'}</p>
                      <p className="text-sm text-muted-foreground truncate">{doc.file_name}</p>
                      {doc.expiry_date && (
                        <p className="text-xs text-muted-foreground">Expires: {doc.expiry_date}</p>
                      )}
                      {doc.verification_status && (
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${doc.verification_status === 'approved' ? 'bg-green-100 text-green-800' : doc.verification_status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {doc.verification_status.charAt(0).toUpperCase() + doc.verification_status.slice(1)}
                        </span>
                      )}
                    </div>
                  </div>
                  <Button 
                    type="button"
                    variant="ghost" 
                    size="sm" 
                    onClick={() => onRemoveExistingDocument && onRemoveExistingDocument(docId)}
                    disabled={disabled}
                    className="shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {/* File selector */}
      <div className="flex flex-col gap-2">
        <div>
          {label && <Label className="mb-2">{label}</Label>}
          {description && (
            <p className="text-sm text-muted-foreground mb-2">{description}</p>
          )}
        </div>

        <label
          htmlFor={`file-upload-${formId}`}
          className={cn(
            "flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-md",
            !disabled ? "cursor-pointer bg-background hover:bg-accent/50 transition-colors" : "bg-muted cursor-not-allowed"
          )}
        >
          <div className="flex flex-col items-center justify-center py-6">
            <Plus className="w-8 h-8 mb-2 text-primary/60" />
            <p className="mb-1 text-sm font-medium">
              <span className="font-semibold text-primary">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-muted-foreground">
              PDF, JPG, PNG or other document files
            </p>
          </div>
          <input
            id={`file-upload-${formId}`}
            type="file"
            className="hidden"
            onChange={handleFileChange}
            multiple
            disabled={disabled}
          />
        </label>
      </div>

      {/* Uploaded/Pending Files */}
      {storeDocs.filter(doc => !!doc.file_name).length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-medium border-b pb-2">New Files</h3>
          <div className="space-y-3">
            {storeDocs.filter(doc => !!doc.file_name).map((doc, index) => {
              const isUploading = doc.uploadStatus === 'uploading';
              const isUploaded = doc.uploadStatus === 'success';
              const hasError = doc.uploadStatus === 'error';
              
              return (
                <div
                  key={`new-file-${index}`}
                  className={cn(
                    "flex flex-col sm:flex-row sm:items-center justify-between p-3 border rounded-md gap-3",
                    "bg-background hover:bg-accent/10 transition-colors",
                    hasError ? "border-red-300 bg-red-50/50" : ""
                  )}
                >
                  <div className="flex gap-3 items-center min-w-0 flex-1">
                    <div className={cn(
                      "p-2 rounded-md",
                      isUploaded ? "bg-green-100" : 
                      isUploading ? "bg-blue-100" :
                      hasError ? "bg-red-100" : "bg-primary/10"
                    )}>
                      {hasError ? (
                        <X className="h-6 w-6 text-red-500" />
                      ) : isUploading ? (
                        <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                      ) : isUploaded && isImageFile(doc.file_name) ? (
                        <img 
                          src={doc.file_url} 
                          alt={doc.file_name} 
                          className="h-6 w-6 object-cover" 
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none'
                            const parent = (e.target as HTMLImageElement).parentElement
                            if (parent) {
                              parent.innerHTML = '<svg class="h-6 w-6 text-primary" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17.25v1.007a2 2 0 01-.879 1.648l-6 4A2 2 0 010 22.007V19.25l6-4v-8l-6-4V0a2 2 0 013.121-1.648l6 4a2 2 0 01.879 1.648v1.007m4.121-7.12l6-3.858a2 2 0 013.121 1.648v6l-6 4m0 0l-6-4m6 4v8l-6 4v2.007a2 2 0 01-3.121 1.648l-6-4a2 2 0 01-.879-1.648v-2.007"></path></svg>'
                            }
                          }}
                        />
                      ) : (
                        <DocumentTypeIcon 
                          fileName={doc.file_name} 
                          mimeType={doc.mime_type} 
                          size={16}
                          className="text-primary" 
                        />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{doc.file_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {doc.file_size ? `${(doc.file_size / 1024).toFixed(1)} KB` : ''}
                      </p>
                      
                      {isUploading && (
                        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                          <div 
                            className="bg-blue-600 h-1.5 rounded-full" 
                            style={{ width: `${doc.progress || 0}%` }}
                          />
                        </div>
                      )}
                      
                      {hasError && (
                        <p className="text-xs text-red-500 mt-1">
                          {doc.error || 'Upload failed'}
                          <Button
                            type="button"
                            variant="link"
                            size="sm"
                            className="p-0 h-auto text-xs ml-2"
                            onClick={() => handleRetryUpload(doc.file_name)}
                          >
                            Retry
                          </Button>
                        </p>
                      )}
                      
                      {isUploaded && doc.file_url && isImageFile(doc.file_name) && (
                        <div className="mt-2">
                          <img 
                            src={doc.file_url} 
                            alt={doc.file_name} 
                            className="h-12 w-auto object-cover rounded-sm" 
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 sm:items-center w-full sm:w-auto">
                    {/* Document type selector */}
                    <Select
                      value={doc.document_type || ""}
                      onValueChange={(value) => updateDocType(doc.file_name, value)}
                      disabled={disabled || isUploading}
                    >
                      <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Document Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Document Type</SelectLabel>
                          {documentTypes.map((type) => (
                            <SelectItem key={type.id} value={type.id}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>

                    {/* Expiry date picker */}
                    <div className="flex-1 sm:flex-initial">
                      <Input
                        type="date"
                        placeholder="Expiry Date"
                        value={doc.expiry_date || ""}
                        onChange={(e) =>
                          updateExpiryDate(doc.file_name, e.target.value)
                        }
                        className="w-full"
                        disabled={disabled || isUploading}
                      />
                    </div>

                    {/* Remove button */}
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => handleRemoveDocument(doc.file_name)}
                      className="shrink-0"
                      disabled={disabled || isUploading}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
