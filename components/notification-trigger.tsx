"use client";

import { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useNotifications } from "@/lib/notification-context";

interface NotificationTriggerProps {
  children: ReactNode;
  className?: string;
  badgeClassName?: string;
}

export function NotificationTrigger({
  children,
  className,
  badgeClassName,
}: NotificationTriggerProps) {
  const { unreadCount } = useNotifications();

  return (
    <div className={cn("relative flex cursor-pointer", className)}>
      {children}
      {unreadCount > 0 && (
        <Badge
          variant="destructive"
          className={cn(
            "absolute right-1 top-1.5 h-2 w-2 rounded-full p-0",
            badgeClassName
          )}
        />
      )}
    </div>
  );
} 