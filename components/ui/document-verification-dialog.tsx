"use client";

import { useState, useEffect } from "react";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Calendar,
  Eye,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { DatePicker } from "@/components/ui/date-picker";
import { Badge } from "@/components/ui/badge";
import {
  getDocumentType,
  isImageFile,
  isPdfFile,
} from "@/lib/services/file-upload.service";
import { FilePreviewModal } from "@/components/ui/file-preview-modal";

interface DocumentVerificationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  documentId: string;
  documentType: string;
  documentName: string;
  documentUrl?: string;
  expiresAt?: string;
  onApprove: (documentId: string, expiresAt?: string) => Promise<void>;
  onReject: (documentId: string, reason: string) => Promise<void>;
  onPreview?: (url: string) => void;
}

export function DocumentVerificationDialog({
  isOpen,
  onClose,
  documentId,
  documentType,
  documentName,
  documentUrl,
  expiresAt,
  onApprove,
  onReject,
  onPreview,
}: DocumentVerificationDialogProps) {
  const [tab, setTab] = useState("approve");
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectionType, setRejectionType] = useState("invalid");
  const [selectedExpiryDate, setSelectedExpiryDate] = useState<
    Date | undefined
  >(expiresAt ? new Date(expiresAt) : undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Update expiry date when the document changes
  useEffect(() => {
    if (expiresAt) {
      setSelectedExpiryDate(new Date(expiresAt));
    } else {
      setSelectedExpiryDate(undefined);
    }
  }, [expiresAt, documentId]);

  const handleApprove = async () => {
    try {
      setIsSubmitting(true);
      setError(null);
      await onApprove(documentId, selectedExpiryDate?.toISOString());
      onClose();
    } catch (err) {
      setError("Failed to approve document");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get a predefined reason based on rejection type
  const getPredefinedReason = (type: string): string => {
    switch (type) {
      case "invalid":
        return "The document does not meet our validation requirements.";
      case "expired":
        return "The document has expired and is no longer valid.";
      case "unclear":
        return "The document is too blurry or unclear to read properly.";
      case "incomplete":
        return "The document is missing required information.";
      case "fraudulent":
        return "The document appears to be altered or forged.";
      default:
        return rejectionReason;
    }
  };

  const handleReject = async () => {
    // For "other" type, require a custom reason
    if (rejectionType === "other" && !rejectionReason.trim()) {
      setError("Please provide a reason for rejection");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      // Use predefined reason for standard rejection types, or custom reason for "other"
      const finalReason =
        rejectionType === "other"
          ? rejectionReason
          : getPredefinedReason(rejectionType);

      await onReject(documentId, finalReason);
      onClose();
    } catch (err) {
      setError("Failed to reject document");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setTab("approve");
    setRejectionReason("");
    setRejectionType("invalid");
    setError(null);
  };

  // Determine if document can be previewed
  const canPreviewDocument =
    documentUrl && (isImageFile(documentUrl) || isPdfFile(documentUrl));

  // Handle document preview
  const handlePreviewDocument = () => {
    if (onPreview && documentUrl) {
      onPreview(documentUrl);
    } else if (documentUrl) {
      setIsPreviewOpen(true);
    }
  };

  return (
    <>
      <Dialog
        open={isOpen}
        onOpenChange={(open) => {
          if (!open) {
            resetForm();
            onClose();
          }
        }}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Verify Document</span>
              {documentUrl && canPreviewDocument && (
                <Button
                  variant="outline"
                  size="sm"
                  className="flex gap-1 items-center"
                  onClick={handlePreviewDocument}
                >
                  <Eye size={16} />
                  <span>Preview</span>
                </Button>
              )}
            </DialogTitle>
            <DialogDescription className="flex items-center justify-between">
              <span>
                {documentType.replace(/_/g, " ")} - {documentName}
              </span>
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
              {documentType.match(
                /passport|license|id|certificate|permit/i
              ) && (
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
                          <Badge variant="destructive" className="ml-2">
                            Expired
                          </Badge>
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

                {/* Only show the text area for "other" rejection type */}
                {rejectionType === "other" && (
                  <div className="grid gap-2">
                    <Label htmlFor="rejection-reason">Custom Reason</Label>
                    <Textarea
                      id="rejection-reason"
                      placeholder="Please explain why this document is being rejected"
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      rows={3}
                      disabled={isSubmitting}
                    />
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>

          {error && (
            <div className="flex items-center p-3 mt-2 bg-red-50 border border-red-200 rounded-md text-sm text-red-600">
              <AlertTriangle className="h-4 w-4 mr-2 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <DialogFooter className="pt-4">
            <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            {tab === "approve" ? (
              <Button onClick={handleApprove} disabled={isSubmitting}>
                {isSubmitting ? "Processing..." : "Approve"}
              </Button>
            ) : (
              <Button
                variant="destructive"
                onClick={handleReject}
                disabled={
                  isSubmitting ||
                  (rejectionType === "other" && !rejectionReason.trim())
                }
              >
                {isSubmitting ? "Processing..." : "Reject"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* File preview modal */}
      {documentUrl && (
        <FilePreviewModal
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          src={documentUrl}
          alt={documentName}
        />
      )}
    </>
  );
}
