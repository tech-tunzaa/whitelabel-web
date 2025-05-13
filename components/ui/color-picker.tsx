"use client"

import * as React from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface ColorPickerProps {
  color: string
  onChange: (color: string) => void
  disabled?: boolean
  className?: string
  presetColors?: string[]
}

export const ColorPicker = ({
  color,
  onChange,
  disabled = false,
  className,
  presetColors = ["#3182CE", "#E2E8F0", "#ED8936", "#000000", "#FFFFFF", "#4285F4", "#34A853", "#FBBC05", "#EA4335"]
}: ColorPickerProps) => {
  const [value, setValue] = React.useState(color)

  React.useEffect(() => {
    setValue(color)
  }, [color])

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value
    setValue(newColor)
    onChange(newColor)
  }

  const handlePresetClick = (presetColor: string) => {
    setValue(presetColor)
    onChange(presetColor)
  }

  return (
    <div className={cn("flex gap-2 items-center", className)}>
      <Popover>
        <PopoverTrigger asChild disabled={disabled}>
          <button
            type="button"
            className={cn(
              "w-10 h-10 rounded-md border flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              disabled && "opacity-50 cursor-not-allowed"
            )}
            style={{ backgroundColor: value }}
            aria-label="Pick a color"
          />
        </PopoverTrigger>
        <PopoverContent className="w-64 p-3">
          <div className="flex flex-col gap-2">
            <Label htmlFor="color-input">Color Value</Label>
            <div className="flex gap-2">
              <div
                className="w-8 h-8 rounded-md border"
                style={{ backgroundColor: value }}
              />
              <Input
                id="color-input"
                type="color"
                value={value}
                onChange={handleColorChange}
                className="w-full h-8 cursor-pointer p-0 border-0 bg-transparent"
              />
            </div>
            <Input
              type="text"
              value={value}
              onChange={handleColorChange}
              placeholder="#FFFFFF"
              className="w-full mt-1"
            />
            <div className="mt-2">
              <Label className="mb-1.5 block">Presets</Label>
              <div className="grid grid-cols-6 gap-1 mt-1">
                {presetColors.map((presetColor) => (
                  <button
                    key={presetColor}
                    type="button"
                    className="w-8 h-8 rounded-md border focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    style={{ backgroundColor: presetColor }}
                    onClick={() => handlePresetClick(presetColor)}
                    aria-label={`Select color ${presetColor}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
      <Input
        type="text"
        value={value}
        onChange={handleColorChange}
        placeholder="#FFFFFF"
        disabled={disabled}
      />
    </div>
  )
}

export default ColorPicker
