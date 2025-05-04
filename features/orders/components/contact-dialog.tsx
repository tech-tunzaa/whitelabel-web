import { useState } from "react";
import { toast } from "sonner";
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

interface ContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recipientType: "customer" | "rider";
  recipientName: string;
}

export function ContactDialog({
  open,
  onOpenChange,
  recipientType,
  recipientName,
}: ContactDialogProps) {
  const [messageText, setMessageText] = useState("");

  const handleSendMessage = () => {
    if (!messageText.trim()) return;
    // TODO: Implement actual message sending functionality
    toast.success(`Message sent to ${recipientName}`);
    setMessageText("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Contact {recipientType === "customer" ? "Customer" : "Rider"}</DialogTitle>
          <DialogDescription>
            Send a message to {recipientName} regarding this order.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <Textarea
            placeholder="Type your message here..."
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            className="min-h-[100px]"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSendMessage}>Send Message</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 