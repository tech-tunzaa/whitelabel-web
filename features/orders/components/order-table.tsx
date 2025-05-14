import { useState } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Edit, Eye, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { OrderStatusBadge } from "./order-status-badge";
import { useOrderStore } from "../store";
import { Order } from "../types";

interface OrderTableProps {
  orders: Order[];
  onEdit?: (order: Order) => void;
  onDelete?: (order: Order) => void;
  onViewDetails?: (order: Order) => void;
}

export function OrderTable({
  orders,
  onEdit,
  onDelete,
  onViewDetails,
}: OrderTableProps) {
  const router = useRouter();
  const { updateOrderStatus, toggleOrderFlag } = useOrderStore();
  const [isRefundDialogOpen, setIsRefundDialogOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "Tzs",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const handleRefund = () => {
    if (!selectedOrder) return;
    updateOrderStatus(selectedOrder.id, "refunded");
    toast.success("Refund processed successfully");
    setIsRefundDialogOpen(false);
    setSelectedOrder(null);
  };

  const handleCancel = () => {
    if (!selectedOrder) return;
    updateOrderStatus(selectedOrder.id, "cancelled");
    toast.success("Order cancelled successfully");
    setIsCancelDialogOpen(false);
    setSelectedOrder(null);
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order Number</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Total</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow
              key={order._id}
              className={order.flagged ? "bg-amber-50" : undefined}
            >
              <TableCell className="font-medium">
                #{order.order_number}
                {order.flagged && (
                  <Badge variant="destructive" className="ml-2">
                    Issue
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span>
                    {order.shipping_address.first_name}{" "}
                    {order.shipping_address.last_name}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <Badge
                  variant={order.status === "pending" ? "default" : "secondary"}
                >
                  {order.status}
                </Badge>
              </TableCell>
              <TableCell>
                {order.totals.total} {order.currency}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {onViewDetails && (
                      <DropdownMenuItem onClick={() => onViewDetails(order)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                    )}
                    {onEdit && (
                      <DropdownMenuItem onClick={() => onEdit(order)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                    )}
                    {onDelete && (
                      <DropdownMenuItem onClick={() => onDelete(order)}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
          {orders.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={7}
                className="text-center py-8 text-muted-foreground"
              >
                No orders found matching your criteria.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

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
    </>
  );
}
