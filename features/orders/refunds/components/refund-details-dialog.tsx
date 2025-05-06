import { format } from "date-fns"
import { CheckIcon, ChevronDownIcon, ChevronUpIcon, XIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Order } from "@/features/orders/types/order"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useState } from "react"

interface RefundDetailsDialogProps {
  isOpen: boolean
  onClose: () => void
  order: Order
  onApprove: (orderId: number) => void
  onReject: (orderId: number) => void
}

// Simple timeline section with toggle functionality
function TimelineSection({ timeline }: { timeline: any[] }) {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div>
      <Button 
        variant="ghost" 
        onClick={() => setIsOpen(!isOpen)} 
        className="w-full flex justify-between items-center rounded-none py-2 px-3">
        <span className="text-sm">View complete timeline</span>
        {isOpen ? (
          <ChevronUpIcon className="h-4 w-4" />
        ) : (
          <ChevronDownIcon className="h-4 w-4" />
        )}
      </Button>
      
      {isOpen && (
        <div className="p-3 border-t">
          <ol className="relative border-l border-muted ml-1 space-y-4">
            {timeline.map((event, index) => (
              <li className="ml-4" key={index}>
                <div className="absolute w-3 h-3 bg-muted-foreground rounded-full mt-1.5 -left-1.5"></div>
                <time className="mb-1 text-sm font-normal leading-none text-muted-foreground">
                  {format(new Date(event.timestamp), "MMM d, yyyy 'at' h:mm a")}
                </time>
                <h3 className="text-sm font-semibold">{event.status}</h3>
                <p className="text-sm">{event.note}</p>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}

export function RefundDetailsDialog({
  isOpen,
  onClose,
  order,
  onApprove,
  onReject,
}: RefundDetailsDialogProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "TZS",
    }).format(amount)
  }

  // Find the refund request event in the timeline
  const refundEvent = order.timeline.find(
    (event) => event.status === "Return Requested" || event.status === "Issued Refund"
  )

  const isAlreadyProcessed = order.status === "Refunded" || order.status === "Rejected Refund"

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Refund Request for Order #{order.id}</DialogTitle>
          <DialogDescription>
            Review the refund request details before making a decision.
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="h-[65vh] pr-4">
          <div className="space-y-8 pt-4 px-2">
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <Badge variant={order.status === "Refunded" ? "default" : "secondary"} className="mt-0.5">
                  {order.status}
                </Badge>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Order Date</p>
                <p>{format(new Date(order.orderDate), "MMMM d, yyyy")}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Order Total</p>
                <p className="font-medium">{formatCurrency(order.total)}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium">Customer Information</h3>
                  <div className="flex items-center mt-2 space-x-2">
                    <Avatar>
                      <AvatarImage src={order.customer.avatar} />
                      <AvatarFallback>
                        {order.customer.name
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{order.customer.name}</p>
                      <p className="text-sm text-muted-foreground">{order.customer.email}</p>
                    </div>
                  </div>
                  <div className="text-sm mt-2 space-y-1">
                    <p>Customer since: {order.customer.since}</p>
                    <p>Total orders: {order.customer.orderCount}</p>
                    <p>Phone: {order.customer.phone}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium">Vendor Information</h3>
                  <div className="text-sm mt-2 space-y-1">
                    <p><span className="font-medium">Name:</span> {order.vendor.name}</p>
                    <p><span className="font-medium">Address:</span> {order.vendor.address}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium">Refund Reason</h3>
                  <div className="text-sm mt-2 p-3 border rounded-md bg-muted/20">
                    {refundEvent ? (
                      <>
                        <p className="font-medium mb-2">
                          Requested on {format(new Date(refundEvent.timestamp), "MMMM d, yyyy 'at' h:mm a")}
                        </p>
                        <p>{refundEvent.note}</p>
                      </>
                    ) : (
                      <p>No refund request details available.</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium">Payment Information</h3>
                  <div className="text-sm mt-2 space-y-1">
                    <p><span className="font-medium">Method:</span> {order.payment.method}</p>
                    <p><span className="font-medium">Status:</span> {order.payment.status}</p>
                    <p><span className="font-medium">Transaction ID:</span> {order.payment.transactionId}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium">Order Items</h3>
                  <Table className="mt-2">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                        <TableHead className="text-right">Qty</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {order.items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.name}</TableCell>
                          <TableCell className="text-right">{formatCurrency(item.price)}</TableCell>
                          <TableCell className="text-right">{item.quantity}</TableCell>
                          <TableCell className="text-right">{formatCurrency(item.price * item.quantity)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div>
                  <h3 className="text-lg font-medium">Order Timeline</h3>
                  <div className="mt-2 border rounded-md overflow-hidden">
                    <TimelineSection timeline={order.timeline} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="gap-2 sm:gap-0">
          {!isAlreadyProcessed && (
            <>
              <Button
                variant="destructive"
                onClick={() => {
                  onReject(order.id);
                  onClose();
                }}
              >
                <XIcon className="mr-2 h-4 w-4" />
                Reject Refund
              </Button>
              <Button
                onClick={() => {
                  onApprove(order.id);
                  onClose();
                }}
              >
                <CheckIcon className="mr-2 h-4 w-4" />
                Approve Refund
              </Button>
            </>
          )}
          {isAlreadyProcessed && (
            <Button onClick={onClose}>Close</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
