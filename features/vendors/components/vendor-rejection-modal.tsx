"use client";

import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { AlertTriangle } from "lucide-react";

interface VendorRejectionModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (reason: { type: string; customReason?: string }) => void;
  isProcessing: boolean;
}

const rejectionReasons = [
    { id: "incomplete_documents", title: "Incomplete Documents", description: "Required verification documents are missing" },
    { id: "invalid_documents", title: "Invalid Documents", description: "Provided documents are invalid or expired" },
    { id: "business_information", title: "Business Information Issues", description: "Inconsistent or incomplete business information" },
    { id: "policy_violation", title: "Policy Violation", description: "Vendor does not comply with platform policies" },
    { id: "other", title: "Other Reason", description: "Provide a custom reason for rejection" },
];

export const VendorRejectionModal = ({
  isOpen,
  onOpenChange,
  onConfirm,
  isProcessing,
}: VendorRejectionModalProps) => {
  const [rejectionType, setRejectionType] = useState("incomplete_documents");
  const [customReason, setCustomReason] = useState("");

  const handleConfirmClick = () => {
    if (rejectionType === "other" && !customReason.trim()) {
      return;
    }
    onConfirm({ type: rejectionType, customReason });
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>Reject Vendor</AlertDialogTitle>
          <AlertDialogDescription>
            Please select a reason for rejecting this vendor. This will be visible to the vendor.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="py-4">
          <RadioGroup value={rejectionType} onValueChange={setRejectionType} className="space-y-3">
            {rejectionReasons.map((reason) => (
                 <div className="flex items-center space-x-2" key={reason.id}>
                    <RadioGroupItem value={reason.id} id={reason.id} />
                    <Label htmlFor={reason.id} className="flex flex-col font-normal">
                      <div className="font-medium me-auto">{reason.title}</div>
                      <div className="text-sm text-muted-foreground">{reason.description}</div>
                    </Label>
                  </div>
            ))}
          </RadioGroup>

          {rejectionType === "other" && (
            <div className="mt-4">
              <Label htmlFor="custom-reason">Custom Reason</Label>
              <Textarea
                id="custom-reason"
                placeholder="Please provide a detailed reason for rejecting this vendor"
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                className="mt-1"
              />
            </div>
          )}
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isProcessing}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirmClick}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={isProcessing || (rejectionType === "other" && !customReason.trim())}
          >
            {isProcessing ? (
              <Spinner size="sm" className="mr-2 h-4 w-4" />
            ) : (
              <AlertTriangle className="mr-2 h-4 w-4" />
            )}
            Reject Vendor
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
