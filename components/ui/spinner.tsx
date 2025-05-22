'use client';

import * as React from "react";
import { cn } from "@/lib/utils";

type SpinnerProps = {
  size?: "lg" | "md" | "sm";
  color?: "black" | "white";
  className?: string;
};

export function Spinner({ size = "md", color = "black", className }: SpinnerProps) {
  return (
    <div className={cn("flex-1 flex items-center justify-center", className)}>
      <div
        className={`animate-spin rounded-full border-b-2 
        ${size === "lg" ? "h-12 w-12" : size === "sm" ? "h-4 w-4" : "h-8 w-8"} 
        ${color === "black" ? "border-primary" : "border-secondary"}`}
      ></div>
    </div>
  );
}
