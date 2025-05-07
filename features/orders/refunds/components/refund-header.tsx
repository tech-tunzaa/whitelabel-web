import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"

interface RefundHeaderProps {
  onSearchChange?: (query: string) => void;
}

export function RefundHeader({ onSearchChange }: RefundHeaderProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  
  useEffect(() => {
    // Add a small delay to avoid too many updates while typing
    const timeout = setTimeout(() => {
      if (onSearchChange) {
        onSearchChange(searchQuery);
      }
    }, 300);
    
    return () => clearTimeout(timeout);
  }, [searchQuery, onSearchChange]);
  
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="relative w-full max-w-sm">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search by order ID..."
          className="pl-8 w-full md:w-[300px]"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <Button variant="outline" onClick={() => router.push("/dashboard/orders")}>
        View All Orders
      </Button>
    </div>
  )
}
