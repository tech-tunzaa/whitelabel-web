import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { RefundCard } from "./refund-card"
import { Order } from "@/features/orders/types/order"

interface RefundTabsProps {
  refundRequests: Order[]
  approvedRefunds: Order[]
  onViewDetails: (order: Order) => void
}

export function RefundTabs({
  refundRequests,
  approvedRefunds,
  onViewDetails,
}: RefundTabsProps) {
  return (
    <Tabs defaultValue="requests" className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-4">
        <TabsTrigger value="requests">
          Requests
          <Badge variant="secondary" className="ml-2">
            {refundRequests.length}
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="approved">
          Approved
          <Badge variant="secondary" className="ml-2">
            {approvedRefunds.length}
          </Badge>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="requests" className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {refundRequests.map((order) => (
            <RefundCard
              key={order.id}
              order={order}
              onViewDetails={() => onViewDetails(order)}
            />
          ))}
          {refundRequests.length === 0 && (
            <div className="col-span-full flex items-center justify-center p-8 border rounded-lg bg-muted/10">
              <p className="text-muted-foreground">No refund requests found.</p>
            </div>
          )}
        </div>
      </TabsContent>

      <TabsContent value="approved" className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {approvedRefunds.map((order) => (
            <RefundCard
              key={order.id}
              order={order}
              onViewDetails={() => onViewDetails(order)}
              isApproved
            />
          ))}
          {approvedRefunds.length === 0 && (
            <div className="col-span-full flex items-center justify-center p-8 border rounded-lg bg-muted/10">
              <p className="text-muted-foreground">No approved refunds found.</p>
            </div>
          )}
        </div>
      </TabsContent>
    </Tabs>
  )
}
