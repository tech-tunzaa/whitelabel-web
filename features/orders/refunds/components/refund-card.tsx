import { CalendarDays, InfoIcon, MoreHorizontal } from "lucide-react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Order } from "@/features/orders/types/order"

interface RefundCardProps {
  order: Order
  onViewDetails: () => void
  isApproved?: boolean
}

export function RefundCard({
  order,
  onViewDetails,
  isApproved = false,
}: RefundCardProps) {
  const router = useRouter()

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

  // Find the refund approval event if it exists
  const refundApprovalEvent = order.timeline.find(
    (event) => event.status === "Refunded"
  )

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle>Order #{order.id}</CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => router.push(`/dashboard/orders/${order.id}`)}>  
                View order details
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onViewDetails}>
                View refund details
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <CardDescription>
          {format(new Date(order.orderDate), "MMM d, yyyy")} •{" "}
          {formatCurrency(order.total)}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Badge variant={isApproved ? "default" : "secondary"}>
              {isApproved ? "Refunded" : "Refund Requested"}
            </Badge>
          </div>
          
          <div>
            <p className="text-sm font-medium">Customer</p>
            <p className="text-sm">{order.customer.name}</p>
          </div>
          
          <div>
            <p className="text-sm font-medium">Vendor</p>
            <p className="text-sm">{order.vendor.name}</p>
          </div>

          {refundEvent && (
            <div>
              <p className="text-sm font-medium">Reason</p>
              <p className="text-sm line-clamp-2">{refundEvent.note}</p>
            </div>
          )}
          
          {refundApprovalEvent && isApproved && (
            <div>
              <p className="text-sm font-medium">Refunded On</p>
              <div className="flex items-start mt-1">
                <CalendarDays className="h-4 w-4 mr-1 mt-0.5 text-muted-foreground" />
                <p className="text-sm">
                  {format(new Date(refundApprovalEvent.timestamp), "MMM d, yyyy 'at' h:mm a")}
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="border-t pt-4">
        <Button className="w-full" variant="outline" onClick={onViewDetails}>
          <InfoIcon className="h-4 w-4 mr-2" />
          View Refund Details
        </Button>
      </CardFooter>
    </Card>
  )
}
