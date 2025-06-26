"use client";

import { useEffect, type ReactNode } from 'react';
import { useRouter } from "next/navigation";
import { useTenantStore } from '@/features/tenants/store';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { AlertCircle, CheckCircle, XCircle, FileCog, PlusCircle, RefreshCw, Edit } from 'lucide-react';
import { format } from 'date-fns';


const formatCurrency = (amount: number, currency: string) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
};

interface DetailRowProps {
  label: string;
  value: ReactNode;
  isBoolean?: boolean;
}

const DetailRow = ({ label, value, isBoolean = false }: DetailRowProps) => (
  <div className="flex justify-between items-center py-2 border-b border-border/20">
    <p className="text-sm text-muted-foreground">{label}</p>
    {isBoolean ? (
      value ? <CheckCircle className="h-5 w-5 text-green-500" /> : <XCircle className="h-5 w-5 text-destructive" />
    ) : (
      <p className="text-sm font-medium">{value}</p>
    )}
  </div>
);

interface BillingConfigCardProps {
  tenantId: string;
}

export const BillingConfigCard = ({ tenantId }: BillingConfigCardProps) => {
  const router = useRouter();
  const {
    billingConfig,
    loadingBillingConfig,
    billingConfigError,
    isUpdating, // For generate invoice action
    storeError,
    fetchBillingConfig,
    generateInvoices,
  } = useTenantStore();

  useEffect(() => {
    if (tenantId) {
      fetchBillingConfig(tenantId);
    }
  }, [tenantId, fetchBillingConfig]);

  const handleGenerateInvoices = () => {
    generateInvoices(tenantId);
  };

  if (loadingBillingConfig) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Billing Configuration</CardTitle>
          <CardDescription>Loading configuration details...</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-40">
          <Spinner />
        </CardContent>
      </Card>
    );
  }

  // Handle case where config does not exist (404 error)
  if (billingConfigError && billingConfigError.status === 404) {
    return (
      <Card className="text-center">
        <CardHeader>
          <CardTitle>No Billing Configuration</CardTitle>
          <CardDescription>This tenant has not been set up for billing yet.</CardDescription>
        </CardHeader>
        <CardContent>
          <FileCog className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="mt-4 text-sm text-muted-foreground">Create a billing configuration to start generating invoices.</p>
        </CardContent>
        <CardFooter>
          <Button className="w-full">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Configuration
          </Button>
        </CardFooter>
      </Card>
    );
  }

  if (!billingConfig) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-destructive">Error</CardTitle>
                <CardDescription className="text-destructive">Could not load billing configuration.</CardDescription>
            </CardHeader>
            <CardContent className='flex flex-col items-center justify-center text-center'>
                <AlertCircle className="h-10 w-10 text-destructive mb-2" />
                <p className="text-sm">{storeError?.message || 'An unknown error occurred.'}</p>
            </CardContent>
        </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Billing Configuration</CardTitle>
        <CardDescription>Monthly billing settings for this tenant.</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
        <DetailRow label="Billing Email" value={billingConfig.billing_email} />
        <DetailRow label="Flat Rate" value={formatCurrency(billingConfig.flat_rate_amount, billingConfig.currency)} />
        <DetailRow label="Billing Day" value={`Day ${billingConfig.billing_day_of_month} of the month`} />
        <DetailRow label="Payment Due" value={`${billingConfig.payment_due_days} days after issue`} />
        <DetailRow label="Auto-generate Invoices" value={billingConfig.auto_generate_invoices} isBoolean />
        <DetailRow label="Email Notifications" value={billingConfig.email_notifications} isBoolean />
        <DetailRow label="Config Status" value={billingConfig.is_active ? 'Active' : 'Inactive'} />
        <DetailRow label="Last Updated" value={format(new Date(billingConfig.updated_at), 'PPP')} />
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => router.push(`/dashboard/tenants/${tenantId}/edit`)}><Edit className="h-4 w-4 mr-2" />Edit Configuration</Button>
        <Button onClick={handleGenerateInvoices} disabled={isUpdating}>
          {isUpdating ? <Spinner className="mr-2 h-4 w-4" /> : <RefreshCw className="mr-2 h-4 w-4" />}
          Generate Invoice
        </Button>
      </CardFooter>
    </Card>
  );
};
