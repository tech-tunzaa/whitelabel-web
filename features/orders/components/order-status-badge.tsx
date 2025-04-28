import { Badge } from "@/components/ui/badge"

interface OrderStatusBadgeProps {
  status: string
}

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const getVariant = () => {
    switch (status) {
      case "pending":
        return "warning"
      case "processing":
        return "secondary"
      case "shipped":
        return "default"
      case "delivered":
        return "success"
      case "cancelled":
        return "destructive"
      case "refunded":
        return "outline"
      default:
        return "default"
    }
  }

  return <Badge variant={getVariant()}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>
}
