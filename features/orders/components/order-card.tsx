"use client"

import { format, parseISO } from "date-fns"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Order } from "../types/order"

interface OrderCardProps {
  order: Order
  onAssignRider: (order: Order) => void
  showAssignButton?: boolean
}

export function OrderCard({ order, onAssignRider, showAssignButton = false }: OrderCardProps) {
  // Parse the ISO date string first to ensure consistent parsing
  const orderDate = parseISO(order.orderDate)
  const formattedDate = format(orderDate, "MMM d, yyyy")
  const formattedTime = format(orderDate, "h:mm a")

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Order #{order.id}</CardTitle>
            <CardDescription>
              {formattedDate} at {formattedTime}
            </CardDescription>
          </div>
          {showAssignButton && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onAssignRider(order)}
            >
              Assign Rider
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Status</span>
            <span className="text-sm font-medium">{order.status}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Total</span>
            <span className="text-sm font-medium">${order.total.toFixed(2)}</span>
          </div>
          {order.rider && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Rider</span>
              <span className="text-sm font-medium">{order.rider.name}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 