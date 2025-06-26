import React, { useState } from "react";
import { format } from "date-fns";
import {
  FileText,
  CheckCircle,
  XCircle,
  Eye,
  AlertCircle,
  Calendar,
  Clock,
  Check,
  X,
  ShieldCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter as UIDialogFooter, DialogHeader as UIDialogHeader, DialogTitle as UIDialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { FilePreviewModal } from "@/components/ui/file-preview-modal";
import { cn } from "@/lib/utils";

export type VerificationDocument = {
  id: string;
  document_id?: string;
  document_type: string;
  document_url?: string;
  status?: "pending" | "approved" | "rejected";
  file_name?: string;
  expires_at?: string;
  rejection_reason?: string;
  submitted_at?: string;
  verified_at?: string;
};

export interface VerificationDocumentManagerProps {
  documents: VerificationDocument[];
  onApprove?: (documentId: string, expiresAt?: string) => Promise<void>;
  onReject?: (documentId: string, reason: string) => Promise<void>;
  showActions?: boolean;
  className?: string;
}

const REJECTION_REASONS = [
  { id: "expired", label: "Document has expired" },
  { id: "unclear", label: "Document is unclear or illegible" },
  { id: "incomplete", label: "Document is incomplete" },
  { id: "invalid", label: "Document appears to be invalid" },
  { id: "wrong_type", label: "Wrong document type submitted" },
  { id: "other", label: "Other reason" },
];

export function VerificationDocumentManager({
  documents,
  onApprove,
  onReject,
  showActions = true,
  className,
}: VerificationDocumentManagerProps) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(undefined);
  const [verifyDialogOpen, setVerifyDialogOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<VerificationDocument | null>(null);
  const [selectedTab, setSelectedTab] = useState("approve");
  const [selectedReason, setSelectedReason] = useState<string>("");
  const [customReason, setCustomReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const openVerifyDialog = (doc: VerificationDocument) => {
    setSelectedDoc(doc);
    setVerifyDialogOpen(true);
    setSelectedTab("approve");
    setSelectedReason("");
    setCustomReason("");
    setError(null);
  };

  const handleApprove = async () => {
    if (!onApprove || !selectedDoc) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await onApprove(selectedDoc.id);
      setVerifyDialogOpen(false);
    } catch (err) {
      setError("Failed to approve document");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!onReject || !selectedDoc) return;
    const finalReason = selectedReason === "other" ? customReason : REJECTION_REASONS.find(r => r.id === selectedReason)?.label || "";
    if (!finalReason.trim()) {
      setError("Please provide a rejection reason");
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      await onReject(selectedDoc.id, finalReason);
      setVerifyDialogOpen(false);
    } catch (err) {
      setError("Failed to reject document");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {documents.length === 0 && (
        <div className="text-center py-4">
          <FileText className="h-8 w-8 text-muted-foreground mx-auto opacity-20" />
          <p className="text-sm text-muted-foreground">No documents submitted</p>
        </div>
      )}
      {documents.map((document, index) => {
        const documentName = document.file_name || document.document_type?.replace(/_/g, " ") || document.id || "Unnamed Document";
        const isPending = document.status === "pending";
        const isRejected = document.status === "rejected";
        const isApproved = document.status === "approved";
        return (
          <Card key={document.id || index} className="w-full mb-4">
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-16 h-16 bg-muted rounded-md flex items-center justify-center">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                </div>
                <div className="flex-grow min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold truncate">{documentName}</h3>
                    {getStatusBadge(document.status || "pending")}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {document.document_type ? document.document_type.replace(/_/g, " ") : "N/A"}
                  </p>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2">
                    {document.expires_at && (
                      <div className="flex items-center gap-1 text-xs">
                        <Calendar className="h-3 w-3" />
                        <span>Expires: {formatDate(document.expires_at)}</span>
                      </div>
                    )}
                    {document.submitted_at && (
                      <div className="flex items-center gap-1 text-xs">
                        <Clock className="h-3 w-3" />
                        <span>Submitted: {formatDate(document.submitted_at)}</span>
                      </div>
                    )}
                    {isApproved && document.verified_at && (
                      <div className="flex items-center gap-1 text-green-600 text-xs col-span-2 mt-1">
                        <CheckCircle className="h-3 w-3" />
                        <span>Verified on {formatDate(document.verified_at)}</span>
                      </div>
                    )}
                    {isRejected && document.rejection_reason && (
                      <div className="flex items-center gap-1 text-red-600 text-xs col-span-2 mt-1">
                        <XCircle className="h-3 w-3" />
                        <span>Rejected: {document.rejection_reason}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="px-4 py-3 bg-muted/30 flex justify-between">
              <Button
                variant="outline"
                size="sm"
                className="text-blue-600"
                onClick={() => {
                  setPreviewUrl(document.document_url);
                  setPreviewOpen(true);
                }}
              >
                <Eye className="h-4 w-4 mr-2" /> Preview
              </Button>
              {showActions && isPending && (
                <Button
                  variant="default"
                  size="sm"
                  className="bg-primary/90 hover:bg-primary"
                  onClick={() => openVerifyDialog(document)}
                >
                  <ShieldCheck className="h-4 w-4 mr-2" /> Verify
                </Button>
              )}
            </CardFooter>
          </Card>
        );
      })}
      {/* File Preview Modal */}
      {previewOpen && previewUrl && (
        <FilePreviewModal
          src={previewUrl}
          alt="Document Preview"
          isOpen={previewOpen}
          onClose={() => setPreviewOpen(false)}
        />
      )}
      {/* Verification Dialog */}
      <Dialog open={verifyDialogOpen} onOpenChange={setVerifyDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <UIDialogHeader>
            <UIDialogTitle className="text-xl">Verify Document</UIDialogTitle>
            <DialogDescription>
              Review and make a decision on this document verification request.
            </DialogDescription>
          </UIDialogHeader>
          {selectedDoc && (
            <div className="mt-2 mb-4">
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-md">
                <div className="flex-shrink-0 w-12 h-12 bg-muted rounded-md flex items-center justify-center">
                  <FileText className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="font-medium">{selectedDoc.file_name || selectedDoc.document_type?.replace(/_/g, " ") || selectedDoc.id}</h3>
                  <p className="text-sm text-muted-foreground">
                    Type: {selectedDoc.document_type ? selectedDoc.document_type.replace(/_/g, " ") : "N/A"}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="mt-2 text-blue-600"
                onClick={() => {
                  setPreviewUrl(selectedDoc.document_url);
                  setPreviewOpen(true);
                }}
              >
                <Eye className="h-4 w-4 mr-2" /> Preview Document
              </Button>
            </div>
          )}
          <Tabs defaultValue="approve" value={selectedTab} onValueChange={setSelectedTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="approve" className="data-[state=active]:bg-green-50 data-[state=active]:text-green-700">
                <Check className="h-4 w-4 mr-2" /> Approve
              </TabsTrigger>
              <TabsTrigger value="reject" className="data-[state=active]:bg-red-50 data-[state=active]:text-red-700">
                <X className="h-4 w-4 mr-2" /> Reject
              </TabsTrigger>
            </TabsList>
            <TabsContent value="approve" className="mt-4 pt-2">
              <div className="text-center space-y-4">
                <div className="bg-green-50 text-green-700 rounded-md p-4 flex flex-col items-center">
                  <CheckCircle className="h-12 w-12 mb-2 text-green-600" />
                  <p className="font-medium">Document will be marked as approved</p>
                  <p className="text-sm text-green-600/80 mt-1">This action cannot be undone</p>
                </div>
                <Button
                  variant="default"
                  className="w-full bg-green-600 hover:bg-green-700 mt-2"
                  onClick={handleApprove}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Processing..." : "Approve Document"}
                </Button>
              </div>
            </TabsContent>
            <TabsContent value="reject" className="mt-4">
              <div className="space-y-4">
                <div className="bg-red-50 text-red-700 rounded-md p-3 flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  <p className="text-sm">Please select a reason for rejection. This information may be shared with the user.</p>
                </div>
                <div className="space-y-3">
                  <RadioGroup value={selectedReason} onValueChange={setSelectedReason} className="gap-2">
                    {REJECTION_REASONS.map((reason) => (
                      <div key={reason.id} className="flex items-center space-x-2">
                        <RadioGroupItem value={reason.id} id={reason.id} />
                        <Label htmlFor={reason.id} className="cursor-pointer">{reason.label}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                  {selectedReason === "other" && (
                    <div className="mt-3 pl-6">
                      <Textarea
                        placeholder="Please specify the rejection reason..."
                        value={customReason}
                        onChange={(e) => setCustomReason(e.target.value)}
                        className="mt-1"
                        rows={3}
                      />
                    </div>
                  )}
                </div>
                <Button
                  variant="default"
                  className="w-full bg-red-600 hover:bg-red-700"
                  onClick={handleReject}
                  disabled={isSubmitting || !selectedReason || (selectedReason === "other" && !customReason.trim())}
                >
                  {isSubmitting ? "Processing..." : "Reject Document"}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
          {error && (
            <div className="flex items-center p-3 mt-2 bg-red-50 border border-red-200 rounded-md text-sm text-red-600">
              <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}
          <UIDialogFooter className="mt-2">
            <Button
              variant="outline"
              onClick={() => setVerifyDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </UIDialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 