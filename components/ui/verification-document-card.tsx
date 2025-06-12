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
  XCircle,
  ShieldCheck
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { VerificationDocument } from "@/features/affiliates/types";

type RejectionReason = {
  id: string;
  label: string;
};

const REJECTION_REASONS: RejectionReason[] = [
  { id: 'expired', label: 'Document has expired' },
  { id: 'unclear', label: 'Document is unclear or illegible' },
  { id: 'incomplete', label: 'Document is incomplete' },
  { id: 'invalid', label: 'Document appears to be invalid' },
  { id: 'wrong_type', label: 'Wrong document type submitted' },
  { id: 'other', label: 'Other reason' }
];

interface VerificationDocumentCardProps {
  document: VerificationDocument;
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
  if (!document) {
    console.error("VerificationDocumentCard: received undefined 'document' prop.");
    return (
      <Card className={cn("border-dashed border-red-300 bg-red-50 p-4", className)}>
        <div className="flex items-center text-red-700">
          <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
          <p className="font-medium">Error: Document data is missing.</p>
        </div>
      </Card>
    );
  }
  const [previewOpen, setPreviewOpen] = useState(false);
  const [verifyDialogOpen, setVerifyDialogOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState("approve");
  const [selectedReason, setSelectedReason] = useState<string>("");
  const [customReason, setCustomReason] = useState("");
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
    
    const finalReason = selectedReason === 'other' ? customReason : 
      REJECTION_REASONS.find(r => r.id === selectedReason)?.label || '';
    
    if (!finalReason.trim()) return;
    
    try {
      setIsSubmitting(true);
      await onReject(document.document_id, finalReason);
      setVerifyDialogOpen(false);
      setSelectedReason("");
      setCustomReason("");
    } catch (error) {
      console.error("Failed to reject document:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const documentName = document.file_name || document.document_type?.replace(/_/g, ' ') || document.id || 'Unnamed Document';
  const isPending = document.status === "pending";
  const isRejected = document.status === "rejected";
  const isApproved = document.status === "approved";

  return (
    <>
      <Card className={cn("w-full mb-4", className)}>
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
                {document.document_type ? document.document_type.replace(/_/g, ' ') : 'N/A'}
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
                    <CheckCircle2 className="h-3 w-3" />
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
            onClick={() => setPreviewOpen(true)}
          >
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>

          {showActions && isPending && (
            <Button 
              variant="default" 
              size="sm"
              className="bg-primary/90 hover:bg-primary"
              onClick={() => setVerifyDialogOpen(true)}
            >
              <ShieldCheck className="h-4 w-4 mr-2" />
              Verify
            </Button>
          )}
        </CardFooter>
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

      {/* Verification Dialog with Tabs */}
      <Dialog open={verifyDialogOpen} onOpenChange={setVerifyDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-xl">Verify Document</DialogTitle>
            <DialogDescription>
              Review and make a decision on this document verification request.
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-2 mb-4">
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-md">
              <div className="flex-shrink-0 w-12 h-12 bg-muted rounded-md flex items-center justify-center">
                <FileText className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-medium">{documentName}</h3>
                <p className="text-sm text-muted-foreground">
                  Type: {document.document_type ? document.document_type.replace(/_/g, ' ') : 'N/A'}
                </p>
              </div>
            </div>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="mt-2 text-blue-600"
              onClick={() => setPreviewOpen(true)}
            >
              <Eye className="h-4 w-4 mr-2" />
              Preview Document
            </Button>
          </div>
          
          <Tabs defaultValue="approve" value={selectedTab} onValueChange={setSelectedTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="approve" className="data-[state=active]:bg-green-50 data-[state=active]:text-green-700">
                <Check className="h-4 w-4 mr-2" />
                Approve
              </TabsTrigger>
              <TabsTrigger value="reject" className="data-[state=active]:bg-red-50 data-[state=active]:text-red-700">
                <X className="h-4 w-4 mr-2" />
                Reject
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="approve" className="mt-4 pt-2">
              <div className="text-center space-y-4">
                <div className="bg-green-50 text-green-700 rounded-md p-4 flex flex-col items-center">
                  <CheckCircle2 className="h-12 w-12 mb-2 text-green-600" />
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
                  
                  {selectedReason === 'other' && (
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
                  disabled={isSubmitting || !selectedReason || (selectedReason === 'other' && !customReason.trim())}
                >
                  {isSubmitting ? "Processing..." : "Reject Document"}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
          
          <DialogFooter className="mt-2">
            <Button variant="outline" onClick={() => {
              setVerifyDialogOpen(false);
              setSelectedReason("");
              setCustomReason("");
              setSelectedTab("approve");
            }}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
