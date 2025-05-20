"use client"

import { useState, useEffect } from "react"
import { CheckCircle, XCircle, AlertTriangle, Calendar, Eye } from "lucide-react"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { DatePicker } from "@/components/ui/date-picker"
import { Badge } from "@/components/ui/badge"
import { getDocumentType, isImageFile, isPdfFile } from "@/lib/services/document-upload.service"

interface DocumentVerificationDialogProps {
  isOpen: boolean
  onClose: () => void
  documentId: string
  documentType: string
  documentName: string
  documentUrl?: string
  expiryDate?: string
  onApprove: (documentId: string, expiryDate?: string) => Promise<void>
  onReject: (documentId: string, reason: string) => Promise<void>
  onPreview?: (url: string) => void
}

export function DocumentVerificationDialog({
  isOpen,
  onClose,
  documentId,
  documentType,
  documentName,
  documentUrl,
  expiryDate,
  onApprove,
  onReject,
  onPreview
}: DocumentVerificationDialogProps) {
  const [tab, setTab] = useState("approve")
  const [rejectionReason, setRejectionReason] = useState("")
  const [rejectionType, setRejectionType] = useState("invalid")
  const [selectedExpiryDate, setSelectedExpiryDate] = useState<Date | undefined>(
    expiryDate ? new Date(expiryDate) : undefined
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Update expiry date when the document changes
  useEffect(() => {
    if (expiryDate) {
      setSelectedExpiryDate(new Date(expiryDate))
    } else {
      setSelectedExpiryDate(undefined)
    }
  }, [expiryDate, documentId])

  const handleApprove = async () => {
    try {
      setIsSubmitting(true)
      setError(null)
      await onApprove(documentId, selectedExpiryDate?.toISOString())
      onClose()
    } catch (err) {
      setError("Failed to approve document")
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      setError("Please provide a reason for rejection")
      return
    }

    try {
      setIsSubmitting(true)
      setError(null)
      
      const reason = `[${rejectionType}] ${rejectionReason}`
      await onReject(documentId, reason)
      onClose()
    } catch (err) {
      setError("Failed to reject document")
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setTab("approve")
    setRejectionReason("")
    setRejectionType("invalid")
    setError(null)
  }

  // Determine if document can be previewed
  const canPreviewDocument = documentUrl && (isImageFile(documentUrl) || isPdfFile(documentUrl))

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        resetForm()
        onClose()
      }
    }}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Verify Document</span>
            {documentUrl && onPreview && canPreviewDocument && (
              <Button 
                variant="outline" 
                size="sm" 
                className="flex gap-1 items-center" 
                onClick={() => onPreview(documentUrl)}
              >
                <Eye size={16} />
                <span>Preview</span>
              </Button>
            )}
          </DialogTitle>
          <DialogDescription className="flex items-center justify-between">
            <span>{documentType.replace(/_/g, " ")} - {documentName}</span>
          </DialogDescription>
        </DialogHeader>

        <Tabs value={tab} onValueChange={setTab} className="w-full mt-2">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="approve">Approve</TabsTrigger>
            <TabsTrigger value="reject">Reject</TabsTrigger>
          </TabsList>
          
          <TabsContent value="approve" className="space-y-4 py-4">
            <div className="flex flex-col items-center gap-2 text-center">
              <CheckCircle className="h-12 w-12 text-green-500" />
              <h3 className="text-lg font-medium">Approve Document</h3>
              <p className="text-sm text-muted-foreground">
                This document will be marked as verified and approved.
              </p>
            </div>

            {/* Expiry date picker for certain document types */}
            {documentType.match(/passport|license|id|certificate|permit/i) && (
              <div className="space-y-2 mt-4">
                <Label htmlFor="expiry-date">Expiry Date (Optional)</Label>
                <div className="grid gap-2">
                  <DatePicker
                    date={selectedExpiryDate}
                    setDate={setSelectedExpiryDate}
                    placeholder="Select expiry date"
                    disabled={isSubmitting}
                  />
                  {selectedExpiryDate && (
                    <p className="text-xs text-muted-foreground">
                      Selected: {format(selectedExpiryDate, "PPP")}
                      {new Date(selectedExpiryDate) < new Date() && (
                        <Badge variant="destructive" className="ml-2">Expired</Badge>
                      )}
                    </p>
                  )}
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="reject" className="space-y-4 py-4">
            <div className="flex flex-col items-center gap-2 text-center mb-4">
              <XCircle className="h-12 w-12 text-red-500" />
              <h3 className="text-lg font-medium">Reject Document</h3>
              <p className="text-sm text-muted-foreground">
                Please select a rejection type and provide a reason.
              </p>
            </div>

            <div className="space-y-4">
              <RadioGroup 
                value={rejectionType} 
                onValueChange={setRejectionType}
                className="flex flex-col space-y-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="invalid" id="invalid" />
                  <Label htmlFor="invalid">Invalid Document</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="expired" id="expired" />
                  <Label htmlFor="expired">Expired</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="unclear" id="unclear" />
                  <Label htmlFor="unclear">Unclear/Unreadable</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="incomplete" id="incomplete" />
                  <Label htmlFor="incomplete">Incomplete Information</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="fraudulent" id="fraudulent" />
                  <Label htmlFor="fraudulent">Suspected Fraudulent</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="other" id="other" />
                  <Label htmlFor="other">Other Reason</Label>
                </div>
              </RadioGroup>

              <div className="grid gap-2">
                <Label htmlFor="rejection-reason">Rejection Reason</Label>
                <Textarea
                  id="rejection-reason"
                  placeholder="Please explain why this document is being rejected"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {error && (
          <div className="bg-red-50 text-red-800 p-3 rounded-md flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          {tab === "approve" ? (
            <Button 
              onClick={handleApprove}
              disabled={isSubmitting} 
              className="bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? "Approving..." : "Approve Document"}
            </Button>
          ) : (
            <Button 
              onClick={handleReject}
              disabled={isSubmitting || !rejectionReason.trim()} 
              variant="destructive"
            >
              {isSubmitting ? "Rejecting..." : "Reject Document"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 