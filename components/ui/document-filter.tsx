"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DocumentType } from "@/components/ui/document-upload"
import { CalendarIcon, Filter, X } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

export interface DocumentFilterValues {
  documentType?: string
  status?: string
  fromDate?: Date
  toDate?: Date
  search?: string
}

interface DocumentFilterProps {
  documentTypes: DocumentType[]
  onFilterChange: (filters: DocumentFilterValues) => void
  className?: string
}

export function DocumentFilter({
  documentTypes,
  onFilterChange,
  className
}: DocumentFilterProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [filters, setFilters] = useState<DocumentFilterValues>({})
  const [activeFilterCount, setActiveFilterCount] = useState(0)
  
  // Initialize date range if needed
  const [fromDate, setFromDate] = useState<Date | undefined>(undefined)
  const [toDate, setToDate] = useState<Date | undefined>(undefined)
  
  // Calculate active filter count
  useEffect(() => {
    let count = 0
    if (filters.documentType) count++
    if (filters.status) count++
    if (filters.fromDate) count++
    if (filters.toDate) count++
    if (filters.search && filters.search.trim() !== "") count++
    setActiveFilterCount(count)
  }, [filters])

  // Apply filters
  const applyFilters = () => {
    const newFilters = { ...filters }
    if (fromDate) newFilters.fromDate = fromDate
    if (toDate) newFilters.toDate = toDate
    
    onFilterChange(newFilters)
    setIsOpen(false)
  }
  
  // Clear filters
  const clearFilters = () => {
    setFilters({})
    setFromDate(undefined)
    setToDate(undefined)
    onFilterChange({})
    setIsOpen(false)
  }

  // Update individual filter
  const updateFilter = (key: keyof DocumentFilterValues, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === "" ? undefined : value
    }))
  }

  return (
    <div className={cn("flex flex-wrap gap-2 items-center", className)}>
      {/* Search input */}
      <div className="flex-1 min-w-[200px]">
        <Input 
          placeholder="Search documents..." 
          value={filters.search || ""}
          onChange={(e) => updateFilter("search", e.target.value)}
          className="w-full"
        />
      </div>
      
      {/* Filter popover */}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="relative">
            <Filter className="mr-2 h-4 w-4" />
            Filters
            {activeFilterCount > 0 && (
              <Badge
                variant="secondary"
                className="ml-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
              >
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[320px] p-4" align="end">
          <div className="grid gap-4">
            <div className="space-y-2">
              <h4 className="font-medium leading-none">Document Filters</h4>
              <p className="text-sm text-muted-foreground">
                Filter documents by type, status, and date
              </p>
            </div>
            
            {/* Document Type filter */}
            <div className="grid gap-2">
              <Label htmlFor="doctype">Document Type</Label>
              <Select
                value={filters.documentType || ""}
                onValueChange={(value) => updateFilter("documentType", value)}
              >
                <SelectTrigger id="doctype">
                  <SelectValue placeholder="All document types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All document types</SelectItem>
                  {documentTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Status filter */}
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={filters.status || ""}
                onValueChange={(value) => updateFilter("status", value)}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Any status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Date range filter */}
            <div className="grid gap-2">
              <Label>Date Range</Label>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex-1">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !fromDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {fromDate ? format(fromDate, "PPP") : "From date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={fromDate}
                        onSelect={setFromDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="flex-1">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !toDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {toDate ? format(toDate, "PPP") : "To date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={toDate}
                        onSelect={setToDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between">
              <Button variant="outline" size="sm" onClick={clearFilters}>
                <X className="mr-1 h-4 w-4" />
                Clear
              </Button>
              <Button size="sm" onClick={applyFilters}>
                Apply Filters
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
} 