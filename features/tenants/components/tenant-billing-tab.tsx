"use client";

import { useState } from 'react';
import { BillingConfigCard } from './billing-config-card';
import { InvoicesTable } from './invoices-table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TenantBillingTabProps {
  tenantId: string;
}

export const TenantBillingTab = ({ tenantId }: TenantBillingTabProps) => {
  const [statusFilter, setStatusFilter] = useState('all');

  return (
    <div className="grid gap-6">
      <BillingConfigCard tenantId={tenantId} />
      <Card>
        <CardHeader>
          <CardTitle>Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={statusFilter} onValueChange={setStatusFilter}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All Invoices</TabsTrigger>
              <TabsTrigger value="pending_payment">Pending</TabsTrigger>
              <TabsTrigger value="paid">Paid</TabsTrigger>
              <TabsTrigger value="failed">Failed</TabsTrigger>
            </TabsList>
            <TabsContent value="all">
              <InvoicesTable tenantId={tenantId} statusFilter="all" />
            </TabsContent>
            <TabsContent value="pending_payment">
              <InvoicesTable tenantId={tenantId} statusFilter="pending_payment" />
            </TabsContent>
            <TabsContent value="paid">
              <InvoicesTable tenantId={tenantId} statusFilter="paid" />
            </TabsContent>
            <TabsContent value="failed">
              <InvoicesTable tenantId={tenantId} statusFilter="failed" />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
