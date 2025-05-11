"use client";

import React, { useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { ErrorCard } from "@/components/ui/error-card";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from 'sonner';

import { useTenantStore } from "@/features/tenants/store";
import { Tenant } from "@/features/tenants/types";

interface TenantPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function TenantPage({ params }: TenantPageProps) {
  const router = useRouter();
  const tenantStore = useTenantStore();
  const params_unwrapped = use(params);
  const id = params_unwrapped.id;
  const { tenant, loading, storeError } = tenantStore;

  useEffect(() => {
    // Only fetch if tenant is not already loaded or there's no error
    if (!tenant && !storeError && !loading) {
      tenantStore.fetchTenant(id);
    }
  }, [id, tenant, storeError, loading, tenantStore.fetchTenant]);

  if (loading) {
    return (
      <Spinner />
    );
  }

  if (storeError) {
    return (
      <ErrorCard
        title="Error Loading Tenant"
        error={{
          message: storeError?.message || "Failed to load tenant",
          status: storeError?.status ? String(storeError.status) : "error"
        }}
        buttonText="Back to Tenants"
        buttonAction={() => router.push("/dashboard/tenants")}
        buttonIcon={ArrowLeft}
      />
    );
  }

  if (!tenant) {
    return (
      <ErrorCard
        title="Error Loading Tenant"
        error={{
          message: "Failed to load tenant",
          status: "error"
        }}
        buttonText="Back to Tenants"
        buttonAction={() => router.push("/dashboard/tenants")}
        buttonIcon={ArrowLeft}
      />
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center p-4 border-b">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/dashboard/tenants")}
          className="mr-4"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only">Back</span>
        </Button>
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold tracking-tight">
            {tenant.name}
          </h1>
          <p className="text-sm text-muted-foreground">
            Tenant ID: {tenant.id}
          </p>
        </div>
        <Badge variant={tenant.is_active ? "default" : "secondary"} className="ml-auto">
          {tenant.is_active ? "Active" : "Inactive"}
        </Badge>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Tenant Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center mb-6">
                  <Avatar className="h-24 w-24 mr-6">
                    <AvatarImage src={tenant.branding?.theme?.logo?.primary || tenant.branding?.logoUrl} alt={tenant.name} />
                    <AvatarFallback>{tenant.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-semibold">{tenant.name}</h3>
                    <p className="text-sm text-muted-foreground">Domain: <a href={`${tenant.domain}`}>{tenant.domain}</a></p>
                  </div>
                  <div className="ml-auto flex">
                    <p className="text-sm font-medium text-muted-foreground">Status: </p>
                    <Badge variant={tenant.is_active ? "default" : "secondary"}>
                      {tenant.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm font-medium">Admin Email</p>
                    <p className="text-sm"><a href={`mailto:${tenant.admin_email}`}>{tenant.admin_email || "Not specified"}</a></p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm font-medium">Admin Phone</p>
                    <p className="text-sm"><a href={`tel:${tenant.admin_phone}`}>{tenant.admin_phone || "Not specified"}</a></p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Country</p>
                    <Badge variant="outline">{tenant.country_code || "Not specified"}</Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Currency</p>
                    <Badge variant="outline">{tenant.currency || "Not specified"}</Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Languages</p>
                    <div className="flex flex-wrap gap-2">
                      {tenant.languages?.map((lang, index) => (
                        <Badge key={index} variant="outline">
                          {lang}
                        </Badge>
                      )) || <Badge variant="outline">Not specified</Badge>}
                    </div>
                  </div>
                  <div className="col-span-3">
                    <p className="text-sm font-medium">Modules</p>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(tenant.modules).map(([module, enabled]) => (
                        <Badge key={module} variant={enabled ? "default" : "secondary"}>
                          {module}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium">Email</p>
                    <p className="text-lg">{tenant.admin_email || "Not provided"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Phone</p>
                    <p className="text-lg">{tenant.admin_phone || "Not provided"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Country</p>
                    <p className="text-lg">{tenant.country_code || "Not provided"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Currency</p>
                    <p className="text-lg">{tenant.currency || "Not provided"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Additional Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium">Domain</p>
                    <p className="text-sm">{tenant.domain || "Not specified"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Languages</p>
                    <p className="text-sm">{tenant.languages?.join(', ') || "Not specified"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Updated At</p>
                    <p className="text-sm">{new Date(tenant.updatedAt).toLocaleDateString() || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">User ID</p>
                    <p className="text-sm">{tenant.user_id || "N/A"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Billing History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-xl font-semibold">Billing History</h3>
                    <p className="text-sm text-muted-foreground">Last 6 months</p>
                  </div>
                  <div className="space-y-4">
                    {tenant.billing_history && tenant.billing_history.length > 0 ? (
                      tenant.billing_history.map((bill) => (
                        <div key={bill.id} className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">{bill.description}</p>
                            <p className="text-sm text-muted-foreground">{bill.date}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{bill.amount} {tenant.currency}</p>
                            <p className="text-sm text-muted-foreground">{bill.status}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No billing history available</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Trial Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium">Plan</p>
                    <p className="text-lg">{tenant.plan || "No plan"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Status</p>
                    <Badge variant={tenant.is_active ? "default" : "destructive"}>
                      {tenant.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Trial End Date</p>
                    <p className="text-lg">{tenant.trial_ends_at ? new Date(tenant.trial_ends_at).toLocaleDateString() : "Not available"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Created At</p>
                    <p className="text-lg">{new Date(tenant.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tenant Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium">Plan</p>
                    <p className="text-sm">{tenant.plan || "Not specified"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Status</p>
                    <Badge variant={tenant.is_active ? "default" : "secondary"}>
                      {tenant.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Trial Ends At</p>
                    <p className="text-sm">
                      {tenant.trial_ends_at
                        ? new Date(tenant.trial_ends_at).toLocaleDateString()
                        : "Not specified"}
                    </p>
                  </div>
                </div>
              </CardContent>
              <Separator />
              <CardFooter>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                  <div>
                    <p className="text-sm font-medium">Created At</p>
                    <p className="text-sm">{tenant.createdAt ? format(new Date(tenant.createdAt), 'MMM d, yyyy') : "Not specified"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Last Updated</p>
                    <p className="text-sm">{tenant.updatedAt ? format(new Date(tenant.updatedAt), 'MMM d, yyyy') : "Not specified"}</p>
                  </div>
                  {tenant.trial_ends_at && (
                    <div>
                      <p className="text-sm font-medium">Trial Ends At</p>
                      <p className="text-sm">{format(new Date(tenant.trial_ends_at), 'MMM d, yyyy')}</p>
                    </div>
                  )}
                </div>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Branding</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium">Primary Logo</p>
                    <img className="w-24 h-24" src={tenant.branding?.theme?.logo?.primary} alt="Primary Logo" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Secondary Logo</p>
                    <img className="w-24 h-24" src={tenant.branding?.theme?.logo?.secondary} alt="Secondary Logo" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Icon</p>
                    <img className="w-24 h-24" src={tenant.branding?.theme?.logo?.icon} alt="Icon" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 flex flex-col">
                  <Button
                    variant="outline"
                    onClick={() => router.push(`/dashboard/tenants/${tenant.id}/edit`)}
                  >
                    Edit Tenant
                  </Button>
                  <Button
                    onClick={() => {
                    // Call the tenant store's update tenant function to toggle the active status
                    tenantStore.updateTenant(tenant.id, {
                      ...tenant,
                      is_active: !tenant.is_active
                    });
                  }}
                    variant={tenant.is_active ? "destructive" : "default"}
                  >
                    {tenant.is_active ? "Deactivate" : "Activate"} Tenant
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
