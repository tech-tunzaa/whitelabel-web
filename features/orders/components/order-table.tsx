import { useState } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal } from "lucide-react";
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
import { useOrderStore } from "../stores/order-store";
import type { Order } from "../types/order";

interface OrderTableProps {
  orders: Order[];
}

export function OrderTable({ orders }: OrderTableProps) {
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
            <TableHead>Order ID</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="hidden md:table-cell">Customer</TableHead>
            <TableHead className="hidden md:table-cell">Items</TableHead>
            <TableHead className="hidden md:table-cell">Total</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow
              key={order.id}
              className={order.flagged ? "bg-amber-50" : undefined}
            >
              <TableCell className="font-medium">
                #{order.id}
                {order.flagged && (
                  <Badge variant="destructive" className="ml-2">
                    Issue
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="text-sm">{formatDate(order.orderDate)}</span>
                  <span className="text-xs text-muted-foreground hidden md:inline-block">
                    {new Date(order.orderDate).toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })}
                  </span>
                </div>
              </TableCell>
              <TableCell className="hidden md:table-cell">
                <div className="flex flex-col">
                  <span>{order.customer.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {order.customer.email}
                  </span>
                </div>
              </TableCell>
              <TableCell className="hidden md:table-cell">
                {order.items.length}
              </TableCell>
              <TableCell className="hidden md:table-cell">
                {formatCurrency(order.total)}
              </TableCell>
              <TableCell>
                <OrderStatusBadge status={order.status} />
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem
                      onClick={() => router.push(`/dashboard/orders/${order.id}`)}
                    >
                      View details
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {order.status === "pending" && (
                      <DropdownMenuItem
                        onClick={() => {
                          updateOrderStatus(order.id, "processing");
                        }}
                      >
                        Mark as processing
                      </DropdownMenuItem>
                    )}
                    {(order.status === "pending" || order.status === "processing") && (
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedOrder(order);
                          setIsCancelDialogOpen(true);
                        }}
                      >
                        Cancel order
                      </DropdownMenuItem>
                    )}
                    {order.status === "processing" && (
                      <DropdownMenuItem
                        onClick={() => {
                          updateOrderStatus(order.id, "shipped");
                        }}
                      >
                        Mark as shipped
                      </DropdownMenuItem>
                    )}
                    {order.status === "shipped" && (
                      <DropdownMenuItem
                        onClick={() => {
                          updateOrderStatus(order.id, "delivered");
                        }}
                      >
                        Mark as delivered
                      </DropdownMenuItem>
                    )}
                    {(order.status === "delivered" || order.status === "shipped") && (
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedOrder(order);
                          setIsRefundDialogOpen(true);
                        }}
                      >
                        Issue refund
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      onClick={() => {
                        toggleOrderFlag(order.id);
                      }}
                    >
                      {order.flagged ? "Resolve issue" : "Flag issue"}
                    </DropdownMenuItem>
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