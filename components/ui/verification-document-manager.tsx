import React, { useState } from "react";
import { format } from "date-fns";
import {
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  Eye,
  Check,
  X,
  AlertCircle,
  Paperclip,
  ShieldCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader as UIDialogHeader,
  DialogTitle as UIDialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { FilePreviewModal } from "@/components/ui/file-preview-modal";
import { cn } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";
import { Copy } from "@/components/ui/copy";

export type VerificationDocument = {
  id: string;
  document_id: string;
  document_name: string;
  document_type: string;
  document_type_id: string;
  document_type_name?: string;
  document_type_description?: string;
  document_url?: string;
  verification_status?: "pending" | "verified" | "rejected";
  file_name?: string;
  expires_at?: string | null;
  rejection_reason?: string | null;
  submitted_at?: string | null;
  verified_at?: string | null;
  number?: string; // Added number field
};

export type VerificationActionPayload = {
  document_id: string;
  verification_status: "verified" | "rejected";
  rejection_reason?: string;
};

export interface VerificationDocumentManagerProps {
  documents: VerificationDocument[];
  onDocumentVerification: (payload: VerificationActionPayload) => Promise<void>;
  showActions?: boolean;
  className?: string;
  isProcessing?: boolean;
}

const REJECTION_REASONS = [
  { id: "expired", label: "Document has expired" },
  { id: "blurry", label: "Document is blurry or unreadable" },
  { id: "incorrect", label: "Incorrect document type" },
  { id: "other", label: "Other (please specify)" },
];

export function VerificationDocumentManager({
  documents,
  onDocumentVerification,
  showActions = true,
  className,
  isProcessing = false,
}: VerificationDocumentManagerProps) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(undefined);
  const [verifyDialogOpen, setVerifyDialogOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<VerificationDocument | null>(null);
  const [selectedTab, setSelectedTab] = useState("approve");
  const [rejectionReason, setRejectionReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return <span className="text-slate-500">N/A</span>;
    try {
      return format(new Date(dateString), "MMM d, yyyy");
    } catch (error) {
      return <span className="text-red-500">Invalid date</span>;
    }
  };

  const getStatusBadge = (status?: "pending" | "verified" | "rejected") => {
    switch (status) {
      case "verified":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200 font-medium">
            <CheckCircle className="mr-1.5 h-3.5 w-3.5" />
            Verified
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200 font-medium">
            <XCircle className="mr-1.5 h-3.5 w-3.5" />
            Rejected
          </Badge>
        );
      case "pending":
      default:
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200 font-medium">
            <Clock className="mr-1.5 h-3.5 w-3.5" />
            Pending
          </Badge>
        );
    }
  };

  const openVerifyDialog = (doc: VerificationDocument) => {
    setSelectedDoc(doc);
    setSelectedTab("approve");
    setRejectionReason("");
    setCustomReason("");
    setError(null);
    setVerifyDialogOpen(true);
  };

  const handleAction = async (status: "verified" | "rejected") => {
    if (!selectedDoc) return;

    let finalRejectionReason = "";
    if (status === "rejected") {
      if (rejectionReason === "other") {
        if (!customReason.trim()) {
          setError("Please specify a reason for rejection.");
          return;
        }
        finalRejectionReason = customReason.trim();
      } else {
        const reasonLabel = REJECTION_REASONS.find((r) => r.id === rejectionReason)?.label;
        if (!reasonLabel) {
          setError("Please select a valid rejection reason.");
          return;
        }
        finalRejectionReason = reasonLabel;
      }
    }

    setError(null);
    try {
      await onDocumentVerification({
        document_id: selectedDoc.document_id,
        verification_status: status,
        rejection_reason: finalRejectionReason,
      });
      setVerifyDialogOpen(false);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    }
  };

  if (!documents || documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-200 p-12 text-center">
        <FileText className="mx-auto h-12 w-12 text-slate-400" />
        <h3 className="mt-4 text-lg font-semibold text-slate-800">
          No Documents Submitted
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          There are no verification documents to display at the moment.
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "grid gap-2.5 grid-cols-[repeat(auto-fit,minmax(260px,1fr))]",
        className
      )}
    >
      {documents.map((doc) => {
        const isPending = doc.verification_status === "pending";
        return (
          <Card
            key={doc.id}
            className="flex flex-col w-full rounded-lg border bg-white shadow-sm transition-all hover:shadow-md"
          >
            <CardHeader className="flex-row items-start justify-between gap-4 p-4">
              <div className="flex-1 space-y-1">
                <CardTitle className="text-base font-semibold text-slate-800 leading-tight">
                  {doc.document_type_name || doc.document_type_id} {getStatusBadge(doc.verification_status)}
                </CardTitle>
                {doc.number && (
                  <div className="flex items-center mt-1 text-xs text-muted-foreground gap-1">
                    <span className="font-mono">Document Number:</span>
                    <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 text-slate-700">{doc.number}</span>
                    <Copy text={doc.number} size={14} className="ml-1" />
                  </div>
                )}
                {doc.document_type_description && (
                  <p className="text-xs text-slate-500">
                    {doc.document_type_description}
                  </p>
                )}
              </div>
            </CardHeader>

            <CardContent className="flex-grow space-y-3 text-sm">
              {doc.submitted_at && (
                <div className="flex items-center text-slate-600">
                  <Clock className="mr-2 h-4 w-4 flex-shrink-0 text-slate-400" />
                  <span className="font-medium">Submitted:</span>
                  <span className="ml-auto text-slate-700">
                    {formatDate(doc.submitted_at)}
                  </span>
                </div>
              )}
              {doc.verified_at && (
                <div className="flex items-center text-slate-600">
                  <Clock className="mr-2 h-4 w-4 flex-shrink-0 text-slate-400" />
                  <span className="font-medium">Verified:</span>
                  <span className="ml-auto text-slate-700">
                    {formatDate(doc.verified_at)}
                  </span>
                </div>
              )}
              {doc.expires_at && (
              <div className="flex items-center text-slate-600">
                <Calendar className="mr-2 h-4 w-4 flex-shrink-0 text-slate-400" />
                <span className="font-medium">Expires:</span>
                <span className="ml-auto text-slate-700">
                  {formatDate(doc.expires_at)}
                </span>
              </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between gap-2 border-t bg-slate-50/50 p-3">
              {doc.document_url && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs text-blue-500"
                  onClick={() => {
                    setPreviewUrl(doc.document_url);
                    setPreviewOpen(true);
                    setSelectedDoc(doc);
                  }}
                >
                  <Eye className="mr-1.5 h-3.5 w-3.5" />
                  Preview
                </Button>
              )}
              {showActions && isPending && (
                <Button
                  size="sm"
                  className="h-8 text-xs"
                  onClick={() => openVerifyDialog(doc)}
                  disabled={isProcessing}
                >
                  <ShieldCheck className="mr-1.5 h-3.5 w-3.5" />
                  Verify
                </Button>
              )}
            </CardFooter>
          </Card>
        );
      })}

      {selectedDoc && (
        <Dialog open={verifyDialogOpen} onOpenChange={setVerifyDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <UIDialogHeader>
              <UIDialogTitle className="text-lg font-semibold">
                Verify: {selectedDoc.document_type_name}
              </UIDialogTitle>
              <DialogDescription>
                Review the document details and choose to approve or reject.
              </DialogDescription>
            </UIDialogHeader>

            {error && (
              <div className="my-3 flex items-center gap-2 rounded-md bg-red-50 p-3 text-sm text-red-700">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            )}

            <Tabs
              defaultValue="approve"
              value={selectedTab}
              onValueChange={setSelectedTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="approve">
                  <Check className="mr-2 h-4 w-4" /> Approve
                </TabsTrigger>
                <TabsTrigger value="reject">
                  <X className="mr-2 h-4 w-4" /> Reject
                </TabsTrigger>
              </TabsList>
              <TabsContent value="approve" className="pt-6">
                <div className="text-center space-y-2">
                  <p className="text-sm text-slate-600">You are about to approve this document.</p>
                  <Button
                    className="w-full bg-green-600 hover:bg-green-700"
                    onClick={() => handleAction("verified")}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <Spinner className="mr-2 h-4 w-4" />
                    ) : (
                      <CheckCircle className="mr-2 h-4 w-4" />
                    )}
                    Confirm Approval
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="reject" className="pt-6">
                <div className="space-y-4">
                  <div>
                    <Label className="font-semibold text-slate-800">Reason for Rejection</Label>
                    <RadioGroup
                      value={rejectionReason}
                      onValueChange={setRejectionReason}
                      className="mt-2 space-y-2"
                    >
                      {REJECTION_REASONS.map((reason) => (
                        <Label
                          key={reason.id}
                          htmlFor={reason.id}
                          className="flex items-center space-x-3 rounded-md border p-3 has-[:checked]:border-slate-400 has-[:checked]:bg-slate-50"
                        >
                          <RadioGroupItem value={reason.id} id={reason.id} />
                          <span>{reason.label}</span>
                        </Label>
                      ))}
                    </RadioGroup>
                  </div>

                  {rejectionReason === "other" && (
                    <div className="pl-1">
                      <Textarea
                        placeholder="Please specify why the document was rejected..."
                        value={customReason}
                        onChange={(e) => setCustomReason(e.target.value)}
                        className="min-h-[80px]"
                      />
                    </div>
                  )}
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={() => handleAction("rejected")}
                    disabled={
                      isProcessing ||
                      !rejectionReason ||
                      (rejectionReason === "other" && !customReason.trim())
                    }
                  >
                    {isProcessing ? (
                      <Spinner className="mr-2 h-4 w-4" />
                    ) : (
                      <XCircle className="mr-2 h-4 w-4" />
                    )}
                    Confirm Rejection
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      )}

      <FilePreviewModal
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        src={previewUrl ?? ""}
        alt={selectedDoc?.document_type_name || "Document"}
      />
    </div>
  );
}
