import React from 'react';
import { useSession } from 'next-auth/react';
import type { User as NextAuthUser } from 'next-auth';
import { VendorResponse } from '@/features/orders/types';
import { Vendor } from '@/features/vendors/types';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

import { User, Mail, Phone, ExternalLink } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';

interface VendorResponseItemProps {
  vendorId: string;
  response: VendorResponse;
  vendor: Vendor | undefined;
  isLoading: boolean;
}

export const VendorResponseItem: React.FC<VendorResponseItemProps> = ({ vendorId, response, vendor, isLoading }) => {
  const { data: session } = useSession();
  const router = useRouter();

  const handleGoToVendor = () => {
    router.push(`/dashboard/vendors/${vendorId}`);
  };
  
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

  return (
    <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/30 hover:bg-muted/40 transition-colors">
      <Avatar onClick={handleGoToVendor} className="h-12 w-12 border-2 border-primary/20 cursor-pointer">
        <AvatarFallback className="bg-primary/10 font-semibold text-primary">
          {vendor?.business_name?.[0] || <User className="h-6 w-6" />}
        </AvatarFallback>
      </Avatar>
      <div className="grid gap-2 flex-1">
        <div className="flex items-center justify-between">
          <h3 onClick={handleGoToVendor} className="font-semibold text-primary cursor-pointer hover:underline">{vendor?.business_name}</h3>
          <Badge 
            variant={response.status === 'accept' ? 'default' : response.status === 'reject' ? 'destructive' : 'secondary'}
            className="gap-0"
          >
            <span className="capitalize">{response.status}</span>{response.status === 'accept' || response.status === 'reject' ? 'ed' : ''}
          </Badge>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <a
            href={`mailto:${vendor?.contact_email}`}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary hover:underline transition-colors group"
          >
            <Mail className="h-3.5 w-3.5 group-hover:text-primary" />
            <span>{vendor?.contact_email}</span>
          </a>
          <span className="text-muted-foreground">|</span>
          <a
            href={`tel:${vendor?.contact_phone}`}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary hover:underline transition-colors group"
          >
            <Phone className="h-3.5 w-3.5 group-hover:text-primary" />
            <span>{vendor?.contact_phone}</span>
          </a>
        </div>
        {response.notes && (
          <div className="text-sm mt-2 p-3 bg-background rounded-md border shadow-sm max-w-[100%] overflow-hidden break-words">
            <p className="text-muted-foreground break-words whitespace-normal">
              <strong className="text-foreground">Notes:</strong> {response.notes}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
