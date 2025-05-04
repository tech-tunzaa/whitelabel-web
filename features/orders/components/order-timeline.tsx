import { format } from "date-fns";
import { CheckCircle2, Circle, Image as ImageIcon, X } from "lucide-react";
import Image from "next/image";
import React from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { TimelineEvent } from "../types/order";

interface OrderTimelineProps {
  timeline: TimelineEvent[];
}

export function OrderTimeline({ timeline }: OrderTimelineProps) {
  const [selectedEvent, setSelectedEvent] = React.useState<TimelineEvent | null>(null);

  return (
    <div className="relative">
      <div className="absolute left-4 top-0 h-full w-px bg-border" />
      <div className="space-y-6">
        {timeline.map((event, index) => (
          <div key={index} className="relative flex gap-4">
            <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-background">
              {index === timeline.length - 1 ? (
                <Circle className="h-4 w-4 text-primary" />
              ) : (
                <CheckCircle2 className="h-4 w-4 text-primary" />
              )}
            </div>
            <div className="flex flex-1 flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">{event.status}</span>
                <span className="text-sm text-muted-foreground">
                  {format(new Date(event.timestamp), "MMM d, yyyy h:mm a")}
                </span>
                {event.images && event.images.length > 0 && (
                  <span className="flex items-center gap-1 text-sm text-muted-foreground">
                    <ImageIcon className="h-3 w-3" />
                    {event.images.length}
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{event.note}</p>
              {event.images && event.images.length > 0 && (
                <button 
                  onClick={() => setSelectedEvent(event)}
                  className="group flex items-center gap-1 text-sm text-primary hover:underline"
                >
                  View photos
                  <ImageIcon className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {selectedEvent?.status === "shipped" ? "Packaging Photos" : "Delivery Photos"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            {selectedEvent?.images?.map((image, index) => (
              <div 
                key={index} 
                className="relative aspect-square rounded-md overflow-hidden bg-muted"
              >
                <Image
                  src={image.url}
                  alt={image.alt}
                  fill
                  className="object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = `https://placehold.co/600x400/e2e8f0/94a3b8?text=${selectedEvent.status}+${index + 1}`;
                  }}
                />
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 