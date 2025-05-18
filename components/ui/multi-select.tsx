"use client"

import * as React from "react"
import { X, Check, ChevronsUpDown } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

type Option = {
  value: string
  label: string
}

interface MultiSelectProps {
  options: Option[]
  selected: string[]
  onChange: (selected: string[]) => void
  className?: string
  placeholder?: string
  readOnly?: boolean
}

export const MultiSelect = ({
  options,
  selected,
  onChange,
  className,
  placeholder = "Select options",
  readOnly = false,
  ...props
}: MultiSelectProps) => {
  const [open, setOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")

  const selectedOptions = options.filter(option => selected.includes(option.value))
  
  // Filter options based on search query
  const filteredOptions = options.filter(option => 
    option.label.toLowerCase().includes(searchQuery.toLowerCase())
  )
  
  // Function to toggle option selection
  const toggleOption = (optionValue: string) => {
    const isSelected = selected.includes(optionValue)
    const newSelected = isSelected
      ? selected.filter(value => value !== optionValue)
      : [...selected, optionValue]
    onChange(newSelected)
  }

  return (
    <Popover open={!readOnly && open} onOpenChange={readOnly ? () => {} : setOpen} {...props}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between",
            selectedOptions.length > 0 ? "h-auto" : "h-10",
            className
          )}
          onClick={() => !readOnly && setOpen(!open)}
          disabled={readOnly}
        >
          <div className="flex flex-wrap gap-1 items-center">
            {selectedOptions.length > 0 ? (
              selectedOptions.map(option => (
                <Badge
                  key={option.value}
                  variant="secondary"
                  className="mr-1 mb-1"
                >
                  {option.label}
                  {!readOnly && (
                    <span
                      role="button"
                      tabIndex={0}
                      className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleOption(option.value)
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          e.stopPropagation()
                          toggleOption(option.value)
                        }
                      }}
                    >
                      <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                    </span>
                  )}
                </Badge>
              ))
            ) : (
              <span className="text-sm text-muted-foreground">{placeholder}</span>
            )}
          </div>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-2" align="start">
        <Input
          placeholder="Search options..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="mb-2"
        />
        <div className="max-h-60 overflow-y-auto">
          {filteredOptions.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              No options found.
            </div>
          ) : (
            filteredOptions.map(option => {
              const isSelected = selected.includes(option.value)
              return (
                <div
                  key={option.value}
                  onClick={() => toggleOption(option.value)}
                  className={cn(
                    "flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground",
                    isSelected && "bg-accent/50"
                  )}
                >
                  <div
                    className={cn(
                      "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border",
                      isSelected ? "bg-primary border-primary" : "border-input"
                    )}
                  >
                    {isSelected && <Check className="h-3 w-3 text-primary-foreground" />}
                  </div>
                  <span>{option.label}</span>
                </div>
              )
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
