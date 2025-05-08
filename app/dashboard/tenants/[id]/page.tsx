"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { use } from "react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { mockTenants } from "@/features/tenants/data/tenants";

interface TenantPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function TenantPage({ params }: TenantPageProps) {
  const router = useRouter();
  const { id } = use(params);
  const tenant = mockTenants.find((t) => t.id === id);

  if (!tenant) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Tenant Not Found</h1>
            <p className="text-muted-foreground">
              The tenant you are looking for does not exist.
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
        <Badge variant={tenant.status === "active" ? "default" : "secondary"} className="ml-auto">
          {tenant.status.charAt(0).toUpperCase() + tenant.status.slice(1)}
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
                    <AvatarImage src={tenant.logo} alt={tenant.name} />
                    <AvatarFallback>{tenant.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-semibold">{tenant.name}</h3>
                    <p className="text-sm text-muted-foreground">Industry: {tenant.industry}</p>
                    <p className="text-sm text-muted-foreground">Industry: {tenant.industry}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium">Contact Person</p>
                    <p className="text-sm">{tenant.contactPerson}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Contact Email</p>
                    <p className="text-sm">{tenant.email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Contact Phone</p>
                    <p className="text-sm">{tenant.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Country</p>
                    <p className="text-sm">{tenant.country}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Currency</p>
                    <p className="text-sm">{tenant.currency}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Status</p>
                    <Badge variant={tenant.status === "active" ? "default" : "secondary"}>
                      {tenant.status.charAt(0).toUpperCase() + tenant.status.slice(1)}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Address Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium">Street Address</p>
                    <p className="text-sm">{tenant.address}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">City</p>
                    <p className="text-sm">{tenant.city}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">State/Province</p>
                    <p className="text-sm">{tenant.state || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Postal Code</p>
                    <p className="text-sm">{tenant.postalCode || "N/A"}</p>
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
                    {tenant.billing_history.map((bill) => (
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
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Subscription Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium">Plan</p>
                    <p className="text-sm">{tenant.plan || "Basic Plan"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Billing Cycle</p>
                    <p className="text-sm">{tenant.billingCycle || "Monthly"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Next Billing Date</p>
                    <p className="text-sm">{tenant.nextBillingDate ? format(new Date(tenant.nextBillingDate), "PPP") : "N/A"}</p>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium">Subscription Status</p>
                    <Badge variant="outline">{tenant.subscriptionStatus || "Active"}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  className="w-full" 
                  variant="outline" 
                  onClick={() => router.push(`/dashboard/tenants/${tenant.id}/edit`)}
                >
                  Edit Tenant
                </Button>
                <Button 
                  className="w-full" 
                  variant="outline"
                >
                  View Transactions
                </Button>
                <Button 
                  className="w-full" 
                  variant="outline"
                >
                  View Products
                </Button>
                <Button 
                  className="w-full" 
                  variant={tenant.status === "active" ? "destructive" : "default"}
                >
                  {tenant.status === "active" ? "Deactivate" : "Activate"} Tenant
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
