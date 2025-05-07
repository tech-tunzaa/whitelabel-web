"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { use } from "react";

import { Button } from "@/components/ui/button";
import { TenantForm } from "@/features/tenants/components/tenant-form";
import { useTenantStore } from "@/features/tenants/stores/tenant-store";
import { toast } from "sonner";

interface TenantEditPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function TenantEditPage({ params }: TenantEditPageProps) {
  const router = useRouter();
  const { tenants, updateTenant } = useTenantStore();
  const { id } = use(params);
  const tenant = tenants.find((t) => t.id === id);

  if (!tenant) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Tenant Not Found</h1>
            <p className="text-muted-foreground">
              The tenant you are trying to edit does not exist.
            </p>
          </div>
        </div>
        <div className="p-4">
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard/tenants")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Tenants
          </Button>
        </div>
      </div>
    );
  }

  const handleSubmit = (data: any) => {
    const updatedTenant = {
      ...tenant,
      ...data,
      updated_at: new Date().toISOString(),
    };

    updateTenant(updatedTenant);
    toast.success("Tenant updated successfully");
    router.push("/dashboard/tenants");
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/dashboard/tenants")}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Edit Tenant: {tenant.name}
            </h1>
            <p className="text-muted-foreground">
              Update tenant details and configurations
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 p-4 overflow-auto">
        <TenantForm initialData={tenant} onSubmit={handleSubmit} />
      </div>
    </div>
  );
}
