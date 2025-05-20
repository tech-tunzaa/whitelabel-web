"use client"

import { useState } from "react"
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, ArrowDownToLine, AlertTriangle } from "lucide-react"
import { Spinner } from "@/components/ui/spinner"
import { VerificationDocument } from "@/features/vendors/types"

interface DocumentBulkActionsProps {
  selectedDocuments: VerificationDocument[]
  onApproveAll: () => Promise<void>
  onRejectAll: (reason: string) => Promise<void>
  onDownloadAll: () => Promise<void>
  onClearSelection: () => void
}

export function DocumentBulkActions({
  selectedDocuments,
  onApproveAll,
  onRejectAll,
  onDownloadAll,
  onClearSelection
}: DocumentBulkActionsProps) {
  const [showApproveDialog, setShowApproveDialog] = useState(false)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [rejectReason, setRejectReason] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const documentCount = selectedDocuments.length

  const handleApproveAll = async () => {
    try {
      setIsProcessing(true)
      setError(null)
      await onApproveAll()
      setShowApproveDialog(false)
      onClearSelection()
    } catch (err) {
      setError("Failed to approve documents")
      console.error(err)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleRejectAll = async () => {
    if (!rejectReason.trim()) {
      setError("Please provide a reason for rejection")
      return
    }

    try {
      setIsProcessing(true)
      setError(null)
      await onRejectAll(rejectReason)
      setShowRejectDialog(false)
      onClearSelection()
      setRejectReason("")
    } catch (err) {
      setError("Failed to reject documents")
      console.error(err)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDownloadAll = async () => {
    try {
      setIsProcessing(true)
      await onDownloadAll()
    } catch (err) {
      console.error(err)
    } finally {
      setIsProcessing(false)
    }
  }

  if (documentCount === 0) return null

  return (
    <>
      <div className="bg-muted/50 border rounded-lg p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{documentCount} document{documentCount !== 1 ? 's' : ''} selected</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearSelection}
            className="text-xs"
          >
            Clear
          </Button>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadAll}
            disabled={isProcessing}
          >
            <ArrowDownToLine className="mr-1 h-4 w-4" />
            Download All
          </Button>
          <Button
            variant="default"
            size="sm"
            className="bg-green-600 hover:bg-green-700"
            onClick={() => setShowApproveDialog(true)}
            disabled={isProcessing}
          >
            <CheckCircle className="mr-1 h-4 w-4" />
            Approve All
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setShowRejectDialog(true)}
            disabled={isProcessing}
          >
            <XCircle className="mr-1 h-4 w-4" />
            Reject All
          </Button>
        </div>
      </div>

      {/* Approve All Dialog */}
      <AlertDialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve {documentCount} Documents</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to approve {documentCount} document{documentCount !== 1 ? 's' : ''}?
              This action will mark all selected documents as verified and approved.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {error && (
            <div className="bg-red-50 text-red-800 p-3 rounded-md flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                handleApproveAll()
              }}
              className="bg-green-600 hover:bg-green-700"
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Spinner className="mr-2 h-4 w-4" />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Approve All
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject All Dialog */}
      <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject {documentCount} Documents</AlertDialogTitle>
            <AlertDialogDescription>
              Please provide a reason for rejecting {documentCount} document{documentCount !== 1 ? 's' : ''}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="reject-reason" className="text-sm font-medium">
                Rejection Reason
              </label>
              <textarea
                id="reject-reason"
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Please explain why these documents are being rejected"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                disabled={isProcessing}
              />
            </div>
          </div>
          {error && (
            <div className="bg-red-50 text-red-800 p-3 rounded-md flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                handleRejectAll()
              }}
              className="bg-destructive hover:bg-destructive/90"
              disabled={isProcessing || !rejectReason.trim()}
            >
              {isProcessing ? (
                <>
                  <Spinner className="mr-2 h-4 w-4" />
                  Processing...
                </>
              ) : (
                <>
                  <XCircle className="mr-2 h-4 w-4" />
                  Reject All
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
} 