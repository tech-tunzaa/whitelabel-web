import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Order } from "../types/order";
import { mockRiders } from "../data/riders";

interface OrderActionsProps {
  order: Order;
  onOrderUpdate: (updatedOrder: Order) => void;
}

export function OrderActions({ order, onOrderUpdate }: OrderActionsProps) {
  const [isRefundDialogOpen, setIsRefundDialogOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [isAssignRiderDialogOpen, setIsAssignRiderDialogOpen] = useState(false);
  const [selectedRider, setSelectedRider] = useState("");

  const handleStatusChange = (newStatus: string) => {
    onOrderUpdate({ ...order, status: newStatus as Order["status"] });
    toast.success(`Order status updated to ${newStatus}`);
  };

  const handleRefund = () => {
    onOrderUpdate({ ...order, status: "refunded" });
    toast.success("Refund processed successfully");
    setIsRefundDialogOpen(false);
  };

  const handleCancel = () => {
    onOrderUpdate({ ...order, status: "cancelled" });
    toast.success("Order cancelled successfully");
    setIsCancelDialogOpen(false);
  };

  const handleAssignRider = () => {
    if (!selectedRider) return;

    const rider = mockRiders.find((r) => r.id === parseInt(selectedRider));
    if (rider) {
      onOrderUpdate({ ...order, rider, status: "processing" });
      toast.success(`Order assigned to ${rider.name}`);
      setIsAssignRiderDialogOpen(false);
    }
  };

  const handleToggleFlag = () => {
    onOrderUpdate({ ...order, flagged: !order.flagged });
    toast.success(
      order.flagged ? "Issue marked as resolved" : "Issue flagged for follow-up"
    );
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Order Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Tabs defaultValue="status" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="status">Update Status</TabsTrigger>
              <TabsTrigger value="actions">Actions</TabsTrigger>
            </TabsList>
            <TabsContent value="status" className="space-y-4 pt-4">
              <Select
                value={order.status}
                onValueChange={handleStatusChange}
                disabled={order.status === "cancelled" || order.status === "refunded"}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
            </TabsContent>
            <TabsContent value="actions" className="space-y-4 pt-4">
              <div className="grid grid-cols-1 gap-2">
                {order.status !== "cancelled" && order.status !== "refunded" && (
                  <>
                    <Button
                      variant="outline"
                      className="justify-start"
                      onClick={() => setIsCancelDialogOpen(true)}
                    >
                      Cancel Order
                    </Button>
                    <Button
                      variant="outline"
                      className="justify-start"
                      onClick={() => setIsRefundDialogOpen(true)}
                    >
                      Issue Refund
                    </Button>
                    {!order.rider && (
                      <Button
                        variant="outline"
                        className="justify-start"
                        onClick={() => setIsAssignRiderDialogOpen(true)}
                      >
                        Assign Rider
                      </Button>
                    )}
                  </>
                )}
                <Button
                  variant={order.flagged ? "default" : "outline"}
                  className="justify-start"
                  onClick={handleToggleFlag}
                >
                  {order.flagged ? "Resolve Issue" : "Flag Issue"}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Refund Dialog */}
      <Dialog open={isRefundDialogOpen} onOpenChange={setIsRefundDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Issue Refund</DialogTitle>
            <DialogDescription>
              Are you sure you want to issue a refund for this order? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRefundDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleRefund}>
              Issue Refund
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Dialog */}
      <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Order</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this order? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCancelDialogOpen(false)}
            >
              No, Keep Order
            </Button>
            <Button variant="destructive" onClick={handleCancel}>
              Yes, Cancel Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Rider Dialog */}
      <Dialog
        open={isAssignRiderDialogOpen}
        onOpenChange={setIsAssignRiderDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Rider</DialogTitle>
            <DialogDescription>
              Select a rider to deliver this order.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select value={selectedRider} onValueChange={setSelectedRider}>
              <SelectTrigger>
                <SelectValue placeholder="Select a rider" />
              </SelectTrigger>
              <SelectContent>
                {mockRiders
                  .filter((rider) => rider.status === "available")
                  .map((rider) => (
                    <SelectItem key={rider.id} value={rider.id.toString()}>
                      {rider.name} - {rider.distance} miles away
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAssignRiderDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleAssignRider} disabled={!selectedRider}>
              Assign Rider
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
} 