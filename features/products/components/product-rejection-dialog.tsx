"use client";

import { useState, useEffect } from "react";
import { Product } from "@/features/products/types";
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

interface ProductRejectionDialogProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (productId: string, reason: string, customReason?: string) => void;
  loading: boolean;
}

const rejectionReasons = [
  { id: "product_quality", label: "Product quality issues" },
  { id: "inadequate_information", label: "Inadequate product information" },
  { id: "pricing_issues", label: "Pricing issues" },
  { id: "policy_violation", label: "Policy violation" },
  { id: "other", label: "Other (specify below)" },
];

export const ProductRejectionDialog = ({
  product,
  isOpen,
  onClose,
  onConfirm,
  loading,
}: ProductRejectionDialogProps) => {
  const [rejectionType, setRejectionType] = useState("product_quality");
  const [customReason, setCustomReason] = useState("");

  useEffect(() => {
    if (isOpen) {
      setRejectionType("product_quality");
      setCustomReason("");
    }
  }, [isOpen]);

  if (!product) return null;

  const isSuspending = product.verification_status === "approved";
  const title = isSuspending ? "Suspend Product" : "Reject Product";
  const description = isSuspending
    ? "Please provide a reason for suspending this product. This will be visible to the vendor."
    : "Please provide a reason for rejecting this product. This will be visible to the vendor.";
  const actionText = isSuspending ? "Suspend" : "Reject";

  const handleConfirm = () => {
    onConfirm(product.product_id, rejectionType, customReason);
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
          >
            {loading ? <Spinner className="mr-2 h-4 w-4" /> : null}
            {actionText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
