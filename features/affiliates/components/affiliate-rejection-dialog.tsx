"use client";

import { useState, useEffect } from "react";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";

interface AffiliateRejectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string, customReason?: string) => void;
  loading: boolean;
  title?: string;
  description?: string;
  actionText?: string;
  defaultReason?: string;
}

const rejectionReasons = [
  { id: "fraud", label: "Fraud or suspicious activity" },
  { id: "incomplete_kyc", label: "Incomplete or invalid KYC" },
  { id: "policy_violation", label: "Policy violation" },
  { id: "other", label: "Other (specify below)" },
];

export const AffiliateRejectionDialog = ({
  isOpen,
  onClose,
  onConfirm,
  loading,
  title = "Reject Affiliate",
  description = "Please provide a reason for rejecting this affiliate. This information may be shared with the affiliate.",
  actionText = "Reject",
  defaultReason = "fraud",
}: AffiliateRejectionDialogProps) => {
  const [rejectionType, setRejectionType] = useState(defaultReason);
  const [customReason, setCustomReason] = useState("");

  useEffect(() => {
    if (isOpen) {
      setRejectionType(defaultReason);
      setCustomReason("");
    }
  }, [isOpen, defaultReason]);

  const handleConfirm = () => {
    onConfirm(rejectionType, customReason);
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>

        <div className="py-4">
          <RadioGroup value={rejectionType} onValueChange={setRejectionType}>
            <div className="space-y-4">
              {rejectionReasons.map((reason) => (
                <div key={reason.id} className="flex items-center space-x-2">
                  <RadioGroupItem value={reason.id} id={reason.id} />
                  <Label htmlFor={reason.id}>{reason.label}</Label>
                </div>
              ))}

              {rejectionType === "other" && (
                <Textarea
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  placeholder="Please provide a specific reason..."
                  className="mt-2"
                />
              )}
            </div>
          </RadioGroup>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={loading || (rejectionType === "other" && !customReason.trim())}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {loading ? <Spinner className="mr-2 h-4 w-4" /> : null}
            {actionText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}; 