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

interface DeliveryPartnerRejectionModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (reason: { type: string; customReason?: string }) => void;
  isProcessing: boolean;
}

const rejectionReasons = [
    { id: "incomplete_kyc", title: "Incomplete KYC", description: "Required KYC documents are missing or unverified." },
    { id: "invalid_vehicle_info", title: "Invalid Vehicle Information", description: "Provided vehicle details are incorrect or invalid." },
    { id: "background_check_failed", title: "Background Check Failed", description: "Partner did not pass the required background checks." },
    { id: "policy_violation", title: "Policy Violation", description: "Partner does not comply with platform policies." },
    { id: "other", title: "Other Reason", description: "Provide a custom reason for rejection." },
];

export const DeliveryPartnerRejectionModal = ({
  isOpen,
  onOpenChange,
  onConfirm,
  isProcessing,
}: DeliveryPartnerRejectionModalProps) => {
  const [rejectionType, setRejectionType] = useState("incomplete_kyc");
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
          <AlertDialogTitle>Reject Delivery Partner</AlertDialogTitle>
          <AlertDialogDescription>
            Please select a reason for rejecting this partner. This will be visible to them.
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
                placeholder="Please provide a detailed reason for rejection"
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
            Reject Partner
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
