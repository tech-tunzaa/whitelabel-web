import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { useRouter } from "next/navigation"

export function DeliveryHeader() {
  const router = useRouter()

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
      <div className="relative w-full sm:w-72">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search order ID..."
          className="pl-8 w-full"
        />
      </div>
      <Button variant="outline" onClick={() => router.push("/dashboard/orders")}>
        View All Orders
      </Button>
    </div>
  )
} 