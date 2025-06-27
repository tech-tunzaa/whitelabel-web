import React, { useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { shallow } from 'zustand/shallow';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Order } from '@/features/orders/types';
import { useVendorStore } from '@/features/vendors/store';
import { VendorResponseItem } from './vendor-response-item';

interface VendorResponsesCardProps {
  order: Order;
}

export const VendorResponsesCard: React.FC<VendorResponsesCardProps> = ({ order }) => {
  const { data: session } = useSession();
  const vendorResponseEntries = Object.entries(order.vendor_responses || {});
  const stringifiedResponses = JSON.stringify(order.vendor_responses);

  const vendors = useVendorStore((state) => state.vendors);
  const fetchVendor = useVendorStore((state) => state.fetchVendor);

  useEffect(() => {
    const vendorResponses = JSON.parse(stringifiedResponses || '{}');
    const vendorIds = Object.keys(vendorResponses);

    if (session && vendorIds.length > 0) {
      const tenantId = (session.user as any)?.tenant_id;
      if (tenantId) {
        vendorIds.forEach((vendorId) => {
          const vendorExists = vendors.some((v) => v.vendor_id === vendorId);
          if (!vendorExists) {
            fetchVendor(vendorId, { 'X-Tenant-ID': tenantId });
          }
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, stringifiedResponses, vendors, fetchVendor]);

  const getVendorById = useCallback((id: string) => vendors.find(v => v.vendor_id === id), [vendors]);

  if (vendorResponseEntries.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Vendor Responses</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No vendor responses for this order yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vendor Responses ({vendorResponseEntries.length})</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div>
          {vendorResponseEntries.map(([vendorId, response]) => {
            const vendor = getVendorById(vendorId);
            const isLoading = !vendor;

            return (
              <VendorResponseItem
                key={vendorId}
                vendorId={vendorId}
                response={response}
                vendor={vendor}
                isLoading={isLoading}
              />
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
