import React from 'react';
import { useSession } from 'next-auth/react';
import type { User as NextAuthUser } from 'next-auth';
import { VendorResponse } from '@/features/orders/types';
import { Vendor } from '@/features/vendors/types';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
    if (!session?.user?.tenant_id) {
      console.error('Missing tenant ID or vendor ID');
      return;
    }
    
    router.push(`/dashboard/vendors/${vendorId}`);
  };

  const handleViewVendorDetails = async () => {
    if (!session?.user?.tenant_id || !vendorId) {
      console.error('Missing tenant ID or vendor ID');
      return;
    }

    try {
      await fetch(`/api/marketplace/vendors/${vendorId}`, {
        headers: {
          'X-Tenant-ID': session.user.tenant_id
        }
      });
      router.push(`/dashboard/vendors/${vendorId}`);
    } catch (error) {
      console.error('Error fetching vendor details:', error);
    }
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

  if (!vendor) {
    return (
      <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
        <Avatar className="h-12 w-12 border-2 border-muted-foreground/20">
          <AvatarFallback className="bg-primary/5"><User className="h-6 w-6 text-muted-foreground" /></AvatarFallback>
        </Avatar>
        <div className="grid gap-2 flex-1">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-muted-foreground">Vendor details unavailable</h3>
            <Badge 
              variant={response.status === 'accepted' ? 'default' : response.status === 'rejected' ? 'destructive' : 'secondary'}
              className="capitalize"
            >
              {response.status}
            </Badge>
          </div>
          {response.notes && (
            <div className="text-sm mt-1 p-3 bg-background rounded-md border shadow-sm">
              <p className="text-muted-foreground"><strong className="text-foreground">Notes:</strong> {response.notes}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/30 hover:bg-muted/40 transition-colors">
      <Avatar className="h-12 w-12 border-2 border-primary/20">
        <AvatarFallback className="bg-primary/10 font-semibold text-primary">
          {vendor.business_name?.[0] || <User className="h-6 w-6" />}
        </AvatarFallback>
      </Avatar>
      <div className="grid gap-2 flex-1">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-primary">{vendor.business_name}</h3>
          <Badge 
            variant={response.status === 'accepted' ? 'default' : response.status === 'rejected' ? 'destructive' : 'secondary'}
            className="capitalize"
          >
            {response.status}
          </Badge>
        </div>
        <div className="grid gap-1.5">
          <a
            href={`mailto:${vendor.contact_email}`}
            className="text-sm text-muted-foreground flex items-center gap-2 hover:text-primary hover:underline transition-colors group"
          >
            <Mail className="h-3.5 w-3.5 group-hover:text-primary" />
            <span>{vendor.contact_email}</span>
            <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
          </a>
          <a
            href={`tel:${vendor.contact_phone}`}
            className="text-sm text-muted-foreground flex items-center gap-2 hover:text-primary hover:underline transition-colors group"
          >
            <Phone className="h-3.5 w-3.5 group-hover:text-primary" />
            <span>{vendor.contact_phone}</span>
            <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
          </a>
          <Button
            variant="outline"
            size="sm"
            className="mt-2 w-full hover:bg-primary/5 transition-colors"
            onClick={handleViewVendorDetails}
          >
            <ExternalLink className="h-3.5 w-3.5 mr-2" />
            View Vendor Details
          </Button>
        </div>
        {response.notes && (
          <div className="text-sm mt-2 p-3 bg-background rounded-md border shadow-sm">
            <p className="text-muted-foreground"><strong className="text-foreground">Notes:</strong> {response.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
};
