"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

interface ErrorCardProps {
  title: string;
  error?: { status: string; message: string };
  buttonText: string;
  buttonAction: () => void;
  buttonIcon: React.ComponentType<{ className?: string }>;
}

export function ErrorCard({
  title,
  error,
  buttonText,
  buttonAction,
  buttonIcon: Icon,
}: ErrorCardProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          {error && <p className="text-muted-foreground">{error.message}</p>}
        </div>
      </div>
      <div className="p-4">
        <Button variant="outline" onClick={buttonAction}>
          <Icon className="mr-2 h-4 w-4" />
          {buttonText}
        </Button>
      </div>
    </div>
  );
}
