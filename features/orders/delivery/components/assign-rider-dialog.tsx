import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Order, Rider } from "@/features/orders/types/order"

interface AssignRiderDialogProps {
  isOpen: boolean
  onClose: () => void
  order: Order | null
  riders: Rider[]
  onAssign: (orderId: number, riderId: number) => void
}

export function AssignRiderDialog({
  isOpen,
  onClose,
  order,
  riders,
  onAssign,
}: AssignRiderDialogProps) {
  const [selectedRider, setSelectedRider] = useState("")

  const handleAssign = () => {
    if (!selectedRider || !order) return

    const riderId = Number.parseInt(selectedRider)
    onAssign(order.id, riderId)
    toast.success(`Order #${order.id} assigned to rider`)
    onClose()
    setSelectedRider("")
  }

  if (!order) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Rider to Order #{order.id}</DialogTitle>
          <DialogDescription>
            Select a rider to assign to this order. The rider will be responsible for delivering the
            order to the customer.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Select value={selectedRider} onValueChange={setSelectedRider}>
            <SelectTrigger>
              <SelectValue placeholder="Select a rider" />
            </SelectTrigger>
            <SelectContent>
              {riders.map((rider) => (
                <SelectItem key={rider.id} value={rider.id.toString()}>
                  {rider.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleAssign} disabled={!selectedRider}>
            Assign Rider
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 