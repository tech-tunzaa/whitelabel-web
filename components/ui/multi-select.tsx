"use client"

import * as React from "react"
import { X, Check } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

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
}

export const MultiSelect = ({
  options,
  selected,
  onChange,
  className,
  placeholder = "Select options",
  ...props
}: MultiSelectProps) => {
  const [open, setOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")

  const selectedOptions = options.filter(option => selected.includes(option.value))
  
  // Filter options based on search query
  const filteredOptions = options.filter(option => 
    option.label.toLowerCase().includes(searchQuery.toLowerCase())
  )
  
  return (
    <Popover open={open} onOpenChange={setOpen} {...props}>
      <PopoverTrigger asChild>
        <div
          role="combobox"
          aria-expanded={open}
          className={`w-full cursor-pointer flex min-h-10 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${className}`}
        >
          <div className="flex flex-wrap gap-1">
            {selectedOptions.length > 0 ? (
              selectedOptions.map(option => (
                <Badge
                  key={option.value}
                  variant="secondary"
                  className="mr-1 mb-1"
                >
                  {option.label}
                  <button
                    type="button"
                    className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        onChange(selected.filter(value => value !== option.value))
                      }
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                    }}
                    onClick={() => {
                      onChange(selected.filter(value => value !== option.value))
                    }}
                  >
                    <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                  </button>
                </Badge>
              ))
            ) : (
              <span className="text-sm text-muted-foreground">{placeholder}</span>
            )}
          </div>
          <div className="opacity-50">▼</div>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start" side="bottom">
        <Command shouldFilter={false}>
          <CommandInput 
            placeholder="Search..." 
            className="h-9"
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandEmpty>No options found.</CommandEmpty>
          <CommandGroup className="max-h-64 overflow-auto">
            {filteredOptions.map(option => {
              const isSelected = selected.includes(option.value)
              return (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={() => {
                    onChange(
                      isSelected
                        ? selected.filter(value => value !== option.value)
                        : [...selected, option.value]
                    )
                  }}
                >
                  <div className={`mr-2 flex h-4 w-4 items-center justify-center rounded-sm border ${isSelected ? 'bg-primary border-primary' : 'border-input'}`}>
                    {isSelected && <Check className="h-3 w-3 text-primary-foreground" />}
                  </div>
                  <span>{option.label}</span>
                </CommandItem>
              )
            })}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
