"use client";

import { useState } from "react";
import { format } from "date-fns";
import { 
  FileText, 
  Check, 
  X, 
  Eye, 
  AlertCircle, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  XCircle
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { FilePreviewModal } from "@/components/ui/file-preview-modal";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export interface VerificationDocumentType {
  id?: string;
  document_id?: string;
  document_type: string;
  document_url: string;
  file_name?: string;
  file_size?: number;
  mime_type?: string;
  expires_at?: string;
  verification_status?: "pending" | "approved" | "rejected";
  rejection_reason?: string;
  submitted_at?: string;
  verified_at?: string;
}

interface VerificationDocumentCardProps {
  document: VerificationDocumentType;
  onApprove?: (documentId: string) => Promise<void>;
  onReject?: (documentId: string, reason: string) => Promise<void>;
  showActions?: boolean;
  className?: string;
}

export function VerificationDocumentCard({
  document,
  onApprove,
  onReject,
  showActions = true,
  className
}: VerificationDocumentCardProps) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [verifyDialogOpen, setVerifyDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Not set";
    return format(new Date(dateString), "MMM dd, yyyy");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Approved
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            Rejected
          </Badge>
        );
      case "pending":
      default:
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            Pending
          </Badge>
        );
    }
  };

  const handleApprove = async () => {
    if (!onApprove || !document.document_id) return;
    
    try {
      setIsSubmitting(true);
      await onApprove(document.document_id);
      setVerifyDialogOpen(false);
    } catch (error) {
      console.error("Failed to approve document:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!onReject || !document.document_id) return;
    
    try {
      setIsSubmitting(true);
      await onReject(document.document_id, rejectionReason);
      setRejectDialogOpen(false);
      setRejectionReason("");
    } catch (error) {
      console.error("Failed to reject document:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const documentName = document.file_name || document.document_type.replace(/_/g, ' ');
  const isPending = document.verification_status === "pending";
  const isRejected = document.verification_status === "rejected";
  const isApproved = document.verification_status === "approved";

  return (
    <>
      <Card className={cn("overflow-hidden", className)}>
        <div className="relative h-40 bg-muted">
          <div 
            className="absolute inset-0 bg-center bg-cover" 
            style={{ 
              backgroundImage: `url(${document.document_url})`,
              backgroundSize: 'cover',
              filter: 'blur(1px)',
              opacity: 0.3
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <FileText className="h-16 w-16 text-primary/30" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Button 
              variant="secondary" 
              size="sm" 
              className="shadow-md"
              onClick={() => setPreviewOpen(true)}
            >
              <Eye className="h-4 w-4 mr-1" /> View Document
            </Button>
          </div>
          <div className="absolute top-2 right-2">
            {getStatusBadge(document.verification_status || 'pending')}
          </div>
        </div>
        <CardContent className="p-4">
          <div className="space-y-3">
            <div>
              <h3 className="font-medium line-clamp-1" title={documentName}>
                {documentName}
              </h3>
              <p className="text-sm text-muted-foreground capitalize">
                {document.document_type.replace(/_/g, ' ')}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2 text-xs">
              {document.submitted_at && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>Submitted: {formatDate(document.submitted_at)}</span>
                </div>
              )}

              {document.expires_at && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>Expires: {formatDate(document.expires_at)}</span>
                </div>
              )}

              {isRejected && document.rejection_reason && (
                <div className="flex items-start gap-1 mt-1 text-red-500">
                  <AlertCircle className="h-3 w-3 mt-0.5" />
                  <span className="flex-1">
                    Reason: {document.rejection_reason}
                  </span>
                </div>
              )}
            </div>

            {showActions && isPending && (
              <div className="flex gap-2 mt-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full border-green-200 hover:border-green-300 hover:bg-green-50"
                        onClick={() => setVerifyDialogOpen(true)}
                      >
                        <Check className="h-4 w-4 mr-1 text-green-600" />
                        Approve
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Approve this document</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full border-red-200 hover:border-red-300 hover:bg-red-50"
                        onClick={() => setRejectDialogOpen(true)}
                      >
                        <X className="h-4 w-4 mr-1 text-red-600" />
                        Reject
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Reject this document</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            )}

            {isApproved && (
              <div className="flex items-center gap-1 text-green-600 text-xs mt-2">
                <CheckCircle2 className="h-3 w-3" />
                <span>Verified on {formatDate(document.verified_at)}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* File Preview Modal */}
      {previewOpen && (
        <FilePreviewModal
          src={document.document_url}
          alt={documentName}
          onClose={() => setPreviewOpen(false)}
          isOpen={previewOpen}
        />
      )}

      {/* Approve Confirmation Dialog */}
      <Dialog open={verifyDialogOpen} onOpenChange={setVerifyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Document</DialogTitle>
            <DialogDescription>
              Are you sure you want to approve this document? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <div className="col-span-4">
                <h3 className="font-medium">{documentName}</h3>
                <p className="text-sm text-muted-foreground">
                  Type: {document.document_type.replace(/_/g, ' ')}
                </p>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setVerifyDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="default" 
              className="bg-green-600 hover:bg-green-700"
              onClick={handleApprove}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Processing..." : "Approve Document"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Confirmation Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Document</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this document.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <div className="col-span-4">
                <h3 className="font-medium">{documentName}</h3>
                <p className="text-sm text-muted-foreground">
                  Type: {document.document_type.replace(/_/g, ' ')}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <div className="col-span-4">
                <Textarea
                  id="rejection-reason"
                  placeholder="Enter reason for rejection"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={handleReject}
              disabled={isSubmitting || !rejectionReason.trim()}
            >
              {isSubmitting ? "Processing..." : "Reject Document"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
