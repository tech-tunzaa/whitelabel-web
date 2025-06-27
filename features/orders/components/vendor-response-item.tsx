import React from 'react';
import { VendorResponse } from '@/features/orders/types';
import { Vendor } from '@/features/vendors/types';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { User, Mail, Phone } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface VendorResponseItemProps {
  vendorId: string;
  response: VendorResponse;
  vendor: Vendor | undefined;
  isLoading: boolean;
}

export const VendorResponseItem: React.FC<VendorResponseItemProps> = ({ vendorId, response, vendor, isLoading }) => {
  if (isLoading) {
    return (
      <div className="flex items-center gap-4 p-4 border-b last:border-b-0">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[250px]" />
          <Skeleton className="h-4 w-[200px]" />
        </div>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="flex items-start gap-4 p-4 border-b last:border-b-0">
        <Avatar className="h-12 w-12">
          <AvatarFallback><User /></AvatarFallback>
        </Avatar>
        <div className="grid gap-1 flex-1">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold italic text-muted-foreground">Vendor details unavailable</h3>
            <Badge variant={response.status === 'accepted' ? 'default' : response.status === 'rejected' ? 'destructive' : 'secondary'}>
              {response.status}
            </Badge>
          </div>
          {response.notes && (
            <p className="text-sm mt-2 p-2 bg-gray-50 rounded-md"><strong>Notes:</strong> {response.notes}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-4 p-4 border-b last:border-b-0">
      <Avatar className="h-12 w-12">
        <AvatarFallback>{vendor.business_name?.[0] || <User />}</AvatarFallback>
      </Avatar>
      <div className="grid gap-1 flex-1">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">{vendor.business_name}</h3>
          <Badge variant={response.status === 'accepted' ? 'default' : response.status === 'rejected' ? 'destructive' : 'secondary'}>
            {response.status}
          </Badge>
        </div>
        <div className="text-sm text-muted-foreground flex items-center gap-2">
          <Mail className="h-3.5 w-3.5" />
          <span>{vendor.contact_email}</span>
        </div>
        <div className="text-sm text-muted-foreground flex items-center gap-2">
          <Phone className="h-3.5 w-3.5" />
          <span>{vendor.contact_phone}</span>
        </div>
        {response.notes && (
          <p className="text-sm mt-2 p-2 bg-gray-50 rounded-md"><strong>Notes:</strong> {response.notes}</p>
        )}
      </div>
    </div>
  );
};
