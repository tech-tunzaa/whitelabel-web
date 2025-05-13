import { useState } from "react";
import { Search, Calendar } from "lucide-react";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";

interface OrderFiltersProps {
  onStatusChange?: (status: string) => void;
  onSearchChange?: (query: string) => void;
  onDateRangeChange?: (range: { from?: Date; to?: Date }) => void;
}

export function OrderFilters({ 
  onStatusChange, 
  onSearchChange, 
  onDateRangeChange 
}: OrderFiltersProps) {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [timeframe, setTimeframe] = useState<string>("all");

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (onSearchChange) {
      onSearchChange(query);
    }
  };

  const handleTimeframeChange = (value: string) => {
    setTimeframe(value);
    
    // Calculate date range based on timeframe
    const now = new Date();
    let from: Date | undefined;
    let to: Date | undefined = now;
    
    switch (value) {
      case "today":
        from = new Date(now.setHours(0, 0, 0, 0));
        break;
      case "week":
        from = new Date(now);
        from.setDate(now.getDate() - 7);
        break;
      case "month":
        from = new Date(now);
        from.setDate(now.getDate() - 30);
        break;
      default: // "all"
        from = undefined;
        to = undefined;
    }
    
    setDateRange({ from, to });
    if (onDateRangeChange) {
      onDateRangeChange({ from, to });
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
      <div className="relative w-full sm:w-72">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search orders..."
          className="pl-8 w-full"
          value={searchQuery}
          onChange={handleSearchChange}
        />
      </div>
      <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
        <Select value={timeframe} onValueChange={handleTimeframeChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Time" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="week">Last 7 Days</SelectItem>
            <SelectItem value="month">Last 30 Days</SelectItem>
          </SelectContent>
        </Select>

        {/* <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="icon" className="ml-2">
              <Calendar className="h-4 w-4" />
              <span className="sr-only">Date range</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <CalendarComponent
              mode="range"
              selected={dateRange}
              onSelect={(range) => {
                setDateRange(range || {});
                if (onDateRangeChange) {
                  onDateRangeChange(range || {});
                }
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover> */}
      </div>
    </div>
  );
} 