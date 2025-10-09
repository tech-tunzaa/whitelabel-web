"use client";

import React, { useState, useEffect } from "react";
import { AlertTriangle, RefreshCcw, Minus, Plus } from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import { OrderItem } from "@/features/orders/types";

interface RefundItem {
  item_id: string;
  quantity: number;
}

interface RefundModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderItems: OrderItem[];
  onConfirm: (refundData: {
    items: RefundItem[];
    reason: string;
  }) => Promise<void>;
  isProcessing?: boolean;
}

const PREDEFINED_REASONS = [
  { value: "customer_request", label: "Customer Request" },
  { value: "defective_product", label: "Defective Product" },
  { value: "wrong_item", label: "Wrong Item Shipped" },
  { value: "other", label: "Other" },
];

export const RefundModal: React.FC<RefundModalProps> = ({
  isOpen,
  onClose,
  orderItems,
  onConfirm,
  isProcessing = false,
}) => {
  const [selectedItems, setSelectedItems] = useState<Record<string, number>>({});
  const [refundReason, setRefundReason] = useState<string>("");
  const [customReason, setCustomReason] = useState<string>("");

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedItems({});
      setRefundReason("");
      setCustomReason("");
    }
  }, [isOpen]);

  const handleItemToggle = (itemId: string, checked: boolean) => {
    setSelectedItems(prev => {
      if (checked) {
        return { ...prev, [itemId]: 1 }; // Default to quantity 1
      } else {
        const newItems = { ...prev };
        delete newItems[itemId];
        return newItems;
      }
    });
  };

  const handleQuantityChange = (itemId: string, change: number) => {
    const item = orderItems.find(item => item.item_id === itemId);
    if (!item) return;

    setSelectedItems(prev => {
      const currentQuantity = prev[itemId] || 0;
      const newQuantity = Math.max(0, Math.min(item.quantity, currentQuantity + change));
      
      if (newQuantity === 0) {
        const newItems = { ...prev };
        delete newItems[itemId];
        return newItems;
      }
      
      return { ...prev, [itemId]: newQuantity };
    });
  };

  const handleConfirmClick = async () => {
    const refundItems: RefundItem[] = Object.entries(selectedItems).map(([item_id, quantity]) => ({
      item_id,
      quantity,
    }));

    const finalReason = refundReason === "other" ? customReason : 
      PREDEFINED_REASONS.find(r => r.value === refundReason)?.label || "";

    await onConfirm({
      items: refundItems,
      reason: finalReason,
    });
  };

  const isFormValid = () => {
    const hasSelectedItems = Object.keys(selectedItems).length > 0;
    const hasValidReason = refundReason && (refundReason !== "other" || customReason.trim());
    return hasSelectedItems && hasValidReason && !isProcessing;
  };

  const selectedItemsCount = Object.keys(selectedItems).length;
  const totalRefundQuantity = Object.values(selectedItems).reduce((sum, qty) => sum + qty, 0);

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <RefreshCcw className="h-5 w-5" />
            Refund Order Items
          </AlertDialogTitle>
          <AlertDialogDescription>
            Select the items and quantities you want to refund. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-6 py-4">
          {/* Summary */}
          {selectedItemsCount > 0 && (
            <div className="bg-muted/30 rounded-lg p-3">
              <div className="text-sm text-muted-foreground">
                Selected: <Badge variant="outline">{selectedItemsCount} items</Badge> • 
                Total Quantity: <Badge variant="outline">{totalRefundQuantity}</Badge>
              </div>
            </div>
          )}

          {/* Items Selection */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Select Items to Refund</Label>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {orderItems.map((item) => {
                const isSelected = item.item_id in selectedItems;
                const selectedQuantity = selectedItems[item.item_id] || 0;
                
                return (
                  <div
                    key={item.item_id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) => 
                          handleItemToggle(item.item_id, checked as boolean)
                        }
                      />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.name}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>SKU: {item.sku || "N/A"}</span>
                          <span>•</span>
                          <span>Available: {item.quantity}</span>
                        </div>
                      </div>
                    </div>
                    
                    {isSelected && (
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleQuantityChange(item.item_id, -1)}
                          disabled={selectedQuantity <= 1}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center text-sm font-medium">
                          {selectedQuantity}
                        </span>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleQuantityChange(item.item_id, 1)}
                          disabled={selectedQuantity >= item.quantity}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Reason Selection */}
          <div className="space-y-3">
            <Label htmlFor="refund-reason">Refund Reason</Label>
            <Select value={refundReason} onValueChange={setRefundReason}>
              <SelectTrigger id="refund-reason">
                <SelectValue placeholder="Select a reason for the refund" />
              </SelectTrigger>
              <SelectContent>
                {PREDEFINED_REASONS.map((reason) => (
                  <SelectItem key={reason.value} value={reason.value}>
                    {reason.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Custom Reason */}
          {refundReason === "other" && (
            <div className="space-y-3">
              <Label htmlFor="custom-reason">Custom Reason</Label>
              <Textarea
                id="custom-reason"
                placeholder="Please provide a detailed reason for the refund"
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
              />
            </div>
          )}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isProcessing}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirmClick}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={!isFormValid()}
          >
            {isProcessing ? (
              <Spinner size="sm" className="mr-2 h-4 w-4" />
            ) : (
              <RefreshCcw className="mr-2 h-4 w-4" />
            )}
            Issue Refund
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
