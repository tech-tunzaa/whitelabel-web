"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { DocumentFilter, DocumentFilterValues } from "@/components/ui/document-filter"
import { DocumentBulkActions } from "@/components/ui/document-bulk-actions"
import { DocumentTypeIcon } from "@/components/ui/document-type-icon"
import { DocumentType, DocumentWithMeta } from "@/components/ui/document-upload"
import { Eye, FileSymlink, ImageIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { isImageFile, isPdfFile } from "@/lib/services/file-upload.service"

interface DocumentListProps {
  documents: DocumentWithMeta[]
  documentTypes: DocumentType[]
  onDocumentClick?: (doc: DocumentWithMeta) => void
  onDocumentVerify?: (doc: DocumentWithMeta) => void
  onBulkApprove?: (docs: DocumentWithMeta[]) => Promise<void>
  onBulkReject?: (docs: DocumentWithMeta[], reason: string) => Promise<void>
  onBulkDownload?: (docs: DocumentWithMeta[]) => Promise<void>
  title?: string
  loading?: boolean
  className?: string
}

export function DocumentList({
  documents,
  documentTypes,
  onDocumentClick,
  onDocumentVerify,
  onBulkApprove,
  onBulkReject,
  onBulkDownload,
  title = "Documents",
  loading = false,
  className
}: DocumentListProps) {
  const [filteredDocs, setFilteredDocs] = useState<DocumentWithMeta[]>(documents)
  const [selectedDocs, setSelectedDocs] = useState<DocumentWithMeta[]>([])
  const [filters, setFilters] = useState<DocumentFilterValues>({})
  
  // Update filtered docs when documents or filters change
  useEffect(() => {
    let result = [...documents]
    
    // Apply document type filter
    if (filters.documentType) {
      result = result.filter((doc) => doc.document_type === filters.documentType)
    }
    
    // Apply status filter
    if (filters.status) {
      result = result.filter((doc) => doc.verification_status === filters.status)
    }
    
    // Apply date range filter
    if (filters.fromDate) {
      result = result.filter((doc) => {
        const submitDate = doc.submitted_at ? new Date(doc.submitted_at) : null
        return submitDate ? submitDate >= filters.fromDate! : false
      })
    }
    
    if (filters.toDate) {
      result = result.filter((doc) => {
        const submitDate = doc.submitted_at ? new Date(doc.submitted_at) : null
        return submitDate ? submitDate <= filters.toDate! : false
      })
    }
    
    // Apply search filter
    if (filters.search && filters.search.trim() !== "") {
      const searchTerm = filters.search.toLowerCase().trim()
      result = result.filter((doc) => (
        (doc.file_name && doc.file_name.toLowerCase().includes(searchTerm)) ||
        (doc.document_type && doc.document_type.toLowerCase().includes(searchTerm))
      ))
    }
    
    setFilteredDocs(result)
    
    // Clear selections if they're no longer in the filtered results
    setSelectedDocs((prevSelected) => 
      prevSelected.filter((selected) => 
        result.some((doc) => 
          (doc.document_id || doc.id) === (selected.document_id || selected.id)
        )
      )
    )
  }, [documents, filters])
  
  // Toggle selection of a document
  const toggleDocSelection = (doc: DocumentWithMeta) => {
    setSelectedDocs((prevSelected) => {
      const isSelected = prevSelected.some(
        (d) => (d.document_id || d.id) === (doc.document_id || doc.id)
      )
      
      if (isSelected) {
        return prevSelected.filter(
          (d) => (d.document_id || d.id) !== (doc.document_id || doc.id)
        )
      } else {
        return [...prevSelected, doc]
      }
    })
  }
  
  // Check if a document is selected
  const isDocSelected = (doc: DocumentWithMeta) => {
    return selectedDocs.some(
      (d) => (d.document_id || d.id) === (doc.document_id || doc.id)
    )
  }
  
  // Toggle select all
  const toggleSelectAll = () => {
    if (selectedDocs.length === filteredDocs.length) {
      setSelectedDocs([])
    } else {
      setSelectedDocs([...filteredDocs])
    }
  }
  
  // Get document type label
  const getDocTypeLabel = (typeId: string) => {
    const docType = documentTypes.find((t) => t.id === typeId)
    return docType?.label || typeId
  }
  
  // Check if document is previewable
  const isPreviewable = (doc: DocumentWithMeta) => {
    const url = doc.file_url || doc.document_url
    return url && (isImageFile(doc.file_name) || isPdfFile(doc.file_name))
  }
  
  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A"
    try {
      return format(new Date(dateString), "MMM d, yyyy")
    } catch (e) {
      return "Invalid date"
    }
  }
  
  // Handle bulk operations
  const handleBulkApprove = async () => {
    if (onBulkApprove) {
      await onBulkApprove(selectedDocs)
    }
  }
  
  const handleBulkReject = async (reason: string) => {
    if (onBulkReject) {
      await onBulkReject(selectedDocs, reason)
    }
  }
  
  const handleBulkDownload = async () => {
    if (onBulkDownload) {
      await onBulkDownload(selectedDocs)
    }
  }
  
  // Status badge colors
  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "approved":
        return <Badge variant="success">Approved</Badge>
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>
      default:
      case "pending":
        return <Badge variant="secondary">Pending</Badge>
    }
  }

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <DocumentFilter 
          documentTypes={documentTypes}
          onFilterChange={setFilters}
        />
        
        {/* Bulk actions */}
        {selectedDocs.length > 0 && (
          <DocumentBulkActions
            selectedDocuments={selectedDocs}
            onApproveAll={handleBulkApprove}
            onRejectAll={handleBulkReject}
            onDownloadAll={handleBulkDownload}
            onClearSelection={() => setSelectedDocs([])}
          />
        )}
        
        {/* Document list */}
        <div className="border rounded-md overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-accent/50 border-b">
                <th className="p-2 w-6">
                  <Checkbox
                    checked={filteredDocs.length > 0 && selectedDocs.length === filteredDocs.length}
                    onCheckedChange={toggleSelectAll}
                    disabled={documents.length === 0}
                    aria-label="Select all documents"
                  />
                </th>
                <th className="text-left p-2">Document</th>
                <th className="text-left p-2 hidden md:table-cell">Type</th>
                <th className="text-left p-2 hidden md:table-cell">Submitted</th>
                <th className="text-left p-2">Status</th>
                <th className="text-right p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-8">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                      <p>Loading documents...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredDocs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8">
                    <p className="text-muted-foreground">No documents found.</p>
                  </td>
                </tr>
              ) : (
                filteredDocs.map((doc, idx) => {
                  const docId = doc.document_id || doc.id || `doc-${idx}`
                  const docUrl = doc.file_url || doc.document_url
                  const canPreview = isPreviewable(doc)
                  
                  return (
                    <tr 
                      key={docId}
                      className="border-b hover:bg-accent/20 transition-colors"
                    >
                      <td className="p-2">
                        <Checkbox
                          checked={isDocSelected(doc)}
                          onCheckedChange={() => toggleDocSelection(doc)}
                          aria-label={`Select ${doc.file_name}`}
                        />
                      </td>
                      <td className="p-2">
                        <div 
                          className="flex items-center gap-2 cursor-pointer" 
                          onClick={() => onDocumentClick?.(doc)}
                        >
                          <div className="p-1 rounded-md bg-primary/10 flex-shrink-0">
                            <DocumentTypeIcon
                              fileName={doc.file_name}
                              mimeType={doc.mime_type}
                              size={16}
                              className="text-primary"
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium truncate">{doc.file_name}</p>
                            <p className="text-xs text-muted-foreground md:hidden">
                              {doc.document_type ? getDocTypeLabel(doc.document_type) : 'Unknown type'}
                            </p>
                            {doc.expiry_date && (
                              <p className="text-xs text-muted-foreground">
                                Expires: {formatDate(doc.expiry_date)}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-2 hidden md:table-cell">
                        {doc.document_type ? getDocTypeLabel(doc.document_type) : '-'}
                      </td>
                      <td className="p-2 hidden md:table-cell">
                        {formatDate(doc.submitted_at)}
                      </td>
                      <td className="p-2">
                        {getStatusBadge(doc.verification_status)}
                      </td>
                      <td className="p-2 text-right">
                        <div className="flex justify-end gap-1">
                          {canPreview && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => onDocumentClick?.(doc)}
                              title="Preview document"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}
                          {doc.verification_status !== 'approved' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => onDocumentVerify?.(doc)}
                              title="Verify document"
                            >
                              {doc.verification_status === 'rejected' ? (
                                <FileSymlink className="h-4 w-4" />
                              ) : (
                                <FileSymlink className="h-4 w-4" />
                              )}
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
} 