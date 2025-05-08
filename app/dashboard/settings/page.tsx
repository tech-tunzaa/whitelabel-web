"use client";

import { Separator } from "@/components/ui/separator";
import { SystemSettingsForm } from "@/features/settings/components/system-settings-form";
import { Toaster } from "@/components/ui/sonner";

export default function SettingsPage() {
  return (
    <div className="space-y-4 pt-6">
      <div className="flex items-start justify-between mx-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
          <p className="text-sm text-muted-foreground">
            Configure system-wide settings and preferences
          </p>
        </div>
      </div>
      <Separator />

      <div className="grid grid-cols-1 gap-6 mx-6">
        <SystemSettingsForm />
      </div>
    </div>
  );
}
