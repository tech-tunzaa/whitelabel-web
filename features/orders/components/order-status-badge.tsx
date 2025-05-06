import { Badge } from "@/components/ui/badge"

interface OrderStatusBadgeProps {
  status: string
}

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const getVariant = () => {
    switch (status.toLowerCase()) {
      case "pending":
        return "secondary" // Changed from warning to secondary as warning is not supported
      case "processing":
        return "secondary"
      case "shipped":
        return "default"
      case "delivered":
        return "default"
      case "cancelled":
        return "destructive"
      case "refunded":
        return "outline"
      case "issued refund":
        return "secondary"
      case "return requested":
        return "secondary"
      case "rejected refund":
        return "destructive"
      default:
        return "default"
    }
  }

  return <Badge variant={getVariant()}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>
}
