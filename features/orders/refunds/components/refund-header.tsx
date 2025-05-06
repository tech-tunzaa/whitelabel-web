import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"

export function RefundHeader() {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="relative w-full max-w-sm">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search by order ID..."
          className="pl-8 w-full md:w-[300px]"
        />
      </div>
      <Button variant="outline" onClick={() => router.push("/dashboard/orders")}>
        View All Orders
      </Button>
    </div>
  )
}
