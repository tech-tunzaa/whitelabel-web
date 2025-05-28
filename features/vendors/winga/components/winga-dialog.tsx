import React from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { WingaAction } from "../types";

interface WingaDialogProps {
  action: WingaAction | null;
  title: string;
  description: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (data?: any) => void;
  confirmLabel?: string;
  cancelLabel?: string;
  withReason?: boolean;
}

export function WingaDialog({
  action,
  title,
  description,
  open,
  onOpenChange,
  onConfirm,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  withReason = false,
}: WingaDialogProps) {
  const [reason, setReason] = React.useState("");

  const handleConfirm = () => {
    if (withReason) {
      onConfirm(reason);
    } else {
      onConfirm();
    }
    onOpenChange(false);
    setReason(""); // Reset reason after confirm
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        {withReason && (
          <div className="py-4">
            <Textarea
              placeholder="Please provide a reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="min-h-32"
            />
          </div>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setReason("")}>
            {cancelLabel}
          </AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm}>
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
