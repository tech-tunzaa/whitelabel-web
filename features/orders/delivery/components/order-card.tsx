import { MapPin, MoreHorizontal } from "lucide-react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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

interface OrderCardProps {
  order: any
  onAssignRider?: () => void
  onReassignRider?: () => void
  showAssignButton?: boolean
}

export function OrderCard({
  order,
  onAssignRider,
  onReassignRider,
  showAssignButton = false,
}: OrderCardProps) {
  const router = useRouter()

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "TZS",
    }).format(amount)
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle>Order #{order.id}</CardTitle>
          {!showAssignButton && (
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
                <DropdownMenuItem onClick={onReassignRider}>
                  Reassign to different rider
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        <CardDescription>
          {format(new Date(order.orderDate), "MMM d, yyyy")} •{" "}
          {showAssignButton ? `${order.items.length} ${order.items.length === 1 ? "item" : "items"}` : formatCurrency(order.total)}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="space-y-3">
          {!showAssignButton && (
            <div className="flex items-center space-x-2">
              <Badge variant={order.status === "shipped" ? "default" : "secondary"}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </Badge>
            </div>
          )}
          {showAssignButton && (
            <Badge variant={order.status === "pending" ? "warning" : "secondary"}>
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </Badge>
          )}
          <div>
            <p className="text-sm font-medium">Pickup Location</p>
            <div className="flex items-start mt-1">
              <MapPin className="h-4 w-4 mr-1 mt-0.5 text-muted-foreground" />
              <p className="text-sm">{order.vendor.address}</p>
            </div>
          </div>
          <div>
            <p className="text-sm font-medium">Delivery Location</p>
            <div className="flex items-start mt-1">
              <MapPin className="h-4 w-4 mr-1 mt-0.5 text-muted-foreground" />
              <p className="text-sm">
                {order.shipping.address.street}, {order.shipping.address.city}
              </p>
            </div>
          </div>
          {!showAssignButton && order.rider && (
            <div>
              <p className="text-sm font-medium">Assigned Rider</p>
              <div className="flex items-center space-x-2 mt-1">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={order.rider.avatar || "/placeholder.svg"} />
                  <AvatarFallback>
                    {order.rider.name
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm">{order.rider.name}</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
      {showAssignButton && (
        <CardFooter className="border-t pt-4">
          <Button className="w-full" onClick={onAssignRider}>
            Assign to Rider
          </Button>
        </CardFooter>
      )}
    </Card>
  )
} 