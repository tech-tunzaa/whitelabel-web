"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { ErrorCard } from "@/components/ui/error-card";
import { toast } from "sonner";

import { ProviderForm } from "@/features/loans/providers/components/provider-form";
import { useLoanProviderStore } from "@/features/loans/providers/store";
import { LoanProviderFormValues } from "@/features/loans/providers/types";

interface EditLoanProviderPageProps {
  params: {
    id: string;
  };
}

export default function EditLoanProviderPage({ params }: EditLoanProviderPageProps) {
  const { id } = params;
  const router = useRouter();
  const session = useSession();
  const tenantId = session?.data?.user?.tenant_id;
  
  const { 
    provider, 
    loading, 
    storeError, 
    fetchProviderById, 
    updateProvider 
  } = useLoanProviderStore();
  
  const [submitting, setSubmitting] = useState(false);
  const [initialValues, setInitialValues] = useState<LoanProviderFormValues | null>(null);

  // Define tenant headers
  const tenantHeaders = {
    'X-Tenant-ID': tenantId || ''
  };

  useEffect(() => {
    const fetchProvider = async () => {
      try {
        await fetchProviderById(id, tenantHeaders);
      } catch (error) {
        console.error("Failed to fetch provider:", error);
        toast({
          title: "Error",
          description: "Failed to load provider details",
          variant: "destructive",
        });
      }
    };

    fetchProvider();
  }, [fetchProviderById, id]);

  useEffect(() => {
    if (provider) {
      setInitialValues({
        tenant_id: provider.tenant_id,
        name: provider.name,
        description: provider.description,
        contact_email: provider.contact_email,
        contact_phone: provider.contact_phone,
        website: provider.website || '',
        address: provider.address || '',
        is_active: provider.is_active,
        integration_key: provider.integration_key || '',
        integration_secret: provider.integration_secret || '',
      });
    }
  }, [provider]);

  const handleSubmit = async (values: LoanProviderFormValues) => {
    try {
      setSubmitting(true);
      await updateProvider(id, values, tenantHeaders);
      
      toast({
        title: "Success",
        description: "Loan provider updated successfully",
        variant: "success",
      });
      
      router.push("/dashboard/loans/providers");
    } catch (error: any) {
      console.error("Failed to update provider:", error);
      toast({
        title: "Error",
        description: error?.message || "Failed to update loan provider",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && !initialValues) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center p-4 border-b">
          <Button
            variant="ghost"
            className="mr-2"
            onClick={() => router.push("/dashboard/loans/providers")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Edit Loan Provider</h1>
            <p className="text-muted-foreground">
              Update an existing loan provider
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center h-64">
          <Spinner />
        </div>
      </div>
    );
  }

  if (!provider && !loading && storeError) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center p-4 border-b">
          <Button
            variant="ghost"
            className="mr-2"
            onClick={() => router.push("/dashboard/loans/providers")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Edit Loan Provider</h1>
            <p className="text-muted-foreground">
              Update an existing loan provider
            </p>
          </div>
        </div>

        <div className="p-4">
          <ErrorCard
            title="Failed to load provider"
            error={{
              status: storeError.status?.toString() || "Error",
              message: storeError.message || "An error occurred"
            }}
            buttonText="Go Back"
            buttonAction={() => router.push("/dashboard/loans/providers")}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center p-4 border-b">
        <Button
          variant="ghost"
          className="mr-2"
          onClick={() => router.push("/dashboard/loans/providers")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Edit Loan Provider</h1>
          <p className="text-muted-foreground">
            Update an existing loan provider
          </p>
        </div>
      </div>

      <div className="p-4">
        {initialValues ? (
          <Card>
            <CardHeader>
              <CardTitle>Provider Information</CardTitle>
            </CardHeader>
            <CardContent>
              <ProviderForm
                initialValues={initialValues}
                onSubmit={handleSubmit}
                isSubmitting={submitting || loading}
                submitLabel="Update Provider"
              />
            </CardContent>
          </Card>
        ) : (
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        )}
      </div>
    </div>
  );
}
