import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { OrderCard } from "./order-card"

interface DeliveryTabsProps {
  unassignedOrders: any[]
  inProgressOrders: any[]
  onAssignRider: (order: any) => void
  onReassignRider: (order: any) => void
}

export function DeliveryTabs({
  unassignedOrders,
  inProgressOrders,
  onAssignRider,
  onReassignRider,
}: DeliveryTabsProps) {
  return (
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
            <OrderCard
              key={order.id}
              order={order}
              onAssignRider={() => onAssignRider(order)}
              showAssignButton
            />
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
            <OrderCard
              key={order.id}
              order={order}
              onReassignRider={() => onReassignRider(order)}
            />
          ))}
          {inProgressOrders.length === 0 && (
            <div className="col-span-full flex items-center justify-center p-8 border rounded-lg bg-muted/10">
              <p className="text-muted-foreground">No in-progress orders found.</p>
            </div>
          )}
        </div>
      </TabsContent>
    </Tabs>
  )
} 