"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { HexColorPicker } from "react-colorful";

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  disabled?: boolean;
  className?: string;
}

export const ColorPicker = ({
  color,
  onChange,
  disabled = false,
  className,
}: ColorPickerProps) => {
  const [value, setValue] = React.useState(color);
  const [popoverOpen, setPopoverOpen] = React.useState(false);

  React.useEffect(() => {
    setValue(color);
  }, [color]);

  // Update both local state and parent component
  const handleColorChange = (newColor: string) => {
    setValue(newColor);
    onChange(newColor);
  };

  // Handle text input changes with validation
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    onChange(newValue);
  };

  return (
    <div className={cn("flex gap-2 items-center", className)}>
      <Popover open={popoverOpen && !disabled} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={cn(
              "w-10 h-10 rounded-md border flex items-center justify-center",
              disabled && "cursor-not-allowed"
            )}
            disabled={disabled}
            style={{ backgroundColor: value }}
            aria-label="Pick a color"
          />
        </PopoverTrigger>
        <PopoverContent className="w-auto p-3" align="start">
          <HexColorPicker color={value} onChange={handleColorChange} />
        </PopoverContent>
      </Popover>
      <Input
        type="text"
        value={value}
        onChange={handleInputChange}
        placeholder="#FFFFFF"
        readOnly={disabled}
        className="w-full"
      />
    </div>
  );
};

export default ColorPicker;
