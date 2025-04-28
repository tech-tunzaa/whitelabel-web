"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { ArrowRight, MapPin, MoreHorizontal, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { mockOrders } from "../data/orders"
import { mockRiders } from "../data/riders"

export default function DeliveryPage() {
  const router = useRouter()
  const [orders, setOrders] = useState(mockOrders)
  const [riders, setRiders] = useState(mockRiders)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [selectedRider, setSelectedRider] = useState("")
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false)

  const unassignedOrders = orders.filter(
    (order) =>
      !order.rider &&
      (order.status === "pending" || order.status === "processing") &&
      order.id.toString().includes(searchQuery),
  )

  const inProgressOrders = orders.filter(
    (order) =>
      order.rider &&
      (order.status === "processing" || order.status === "shipped") &&
      order.id.toString().includes(searchQuery),
  )

  const availableRiders = riders.filter((rider) => rider.status === "available")

  const handleAssignRider = () => {
    if (!selectedRider || !selectedOrder) return

    const rider = riders.find((r) => r.id === Number.parseInt(selectedRider))

    // Update order with rider
    setOrders(
      orders.map((order) =>
        order.id === selectedOrder.id
          ? {
              ...order,
              rider: rider,
              status: order.status === "pending" ? "processing" : order.status,
            }
          : order,
      ),
    )

    // Update rider status
    setRiders(
      riders.map((r) =>
        r.id === rider.id
          ? {
              ...r,
              status: "assigned",
              currentOrders: [...(r.currentOrders || []), selectedOrder.id],
            }
          : r,
      ),
    )

    toast.success(`Order #${selectedOrder.id} assigned to ${rider.name}`)
    setIsAssignDialogOpen(false)
    setSelectedRider("")
  }

  const handleReassignRider = (order) => {
    setSelectedOrder(order)
    setIsAssignDialogOpen(true)
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Delivery Management</h1>
          <p className="text-muted-foreground">Manage order deliveries and rider assignments</p>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search order ID..."
              className="pl-8 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" onClick={() => router.push("/admin/orders")}>
            View All Orders
          </Button>
        </div>

        <Tabs defaultValue="unassigned" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="unassigned">
              Unassigned
              <Badge variant="secondary" className="ml-2">
                {unassignedOrders.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="in-progress">
              In Progress
              <Badge variant="secondary" className="ml-2">
                {inProgressOrders.length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="unassigned" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {unassignedOrders.map((order) => (
                <Card key={order.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle>Order #{order.id}</CardTitle>
                      <Badge variant={order.status === "pending" ? "warning" : "secondary"}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </Badge>
                    </div>
                    <CardDescription>
                      {new Date(order.orderDate).toLocaleDateString()} • {order.items.length}{" "}
                      {order.items.length === 1 ? "item" : "items"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="space-y-3">
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
                    </div>
                  </CardContent>
                  <CardFooter className="border-t pt-4">
                    <Button
                      className="w-full"
                      onClick={() => {
                        setSelectedOrder(order)
                        setIsAssignDialogOpen(true)
                      }}
                    >
                      Assign to Rider
                    </Button>
                  </CardFooter>
                </Card>
              ))}
              {unassignedOrders.length === 0 && (
                <div className="col-span-full flex items-center justify-center p-8 border rounded-lg bg-muted/10">
                  <p className="text-muted-foreground">No unassigned orders found.</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="in-progress" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {inProgressOrders.map((order) => (
                <Card key={order.id} className="overflow-hidden">
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
                          <DropdownMenuItem onClick={() => router.push(`/admin/orders/${order.id}`)}>
                            View order details
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleReassignRider(order)}>
                            Reassign to different rider
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <CardDescription>
                      {new Date(order.orderDate).toLocaleDateString()} • {formatCurrency(order.total)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Badge variant={order.status === "shipped" ? "default" : "secondary"}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Assigned Rider</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={order.rider.avatar || "/placeholder.svg"} />
                            <AvatarFallback>
                              {order.rider.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{order.rider.name}</span>
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
                    </div>
                  </CardContent>
                  <CardFooter className="border-t pt-4">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => router.push(`/admin/orders/${order.id}`)}
                    >
                      View Details
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
              {inProgressOrders.length === 0 && (
                <div className="col-span-full flex items-center justify-center p-8 border rounded-lg bg-muted/10">
                  <p className="text-muted-foreground">No orders in progress.</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Assign Rider Dialog */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Rider to Order #{selectedOrder?.id}</DialogTitle>
            <DialogDescription>Select an available rider to deliver this order.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select value={selectedRider} onValueChange={setSelectedRider}>
              <SelectTrigger>
                <SelectValue placeholder="Select a rider" />
              </SelectTrigger>
              <SelectContent>
                {availableRiders.map((rider) => (
                  <SelectItem key={rider.id} value={rider.id.toString()}>
                    {rider.name} - {rider.distance} miles away
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {availableRiders.length === 0 && (
              <p className="text-sm text-muted-foreground mt-2">No riders are currently available.</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAssignRider} disabled={!selectedRider}>
              Assign Rider
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
