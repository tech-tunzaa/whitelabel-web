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
import { toast } from 'sonner';

interface ExtendedUser extends NextAuthUser {
  tenant_id: string;
  role: "super" | "admin" | "sub_admin" | "support";
}

interface VendorResponseItemProps {
  vendorId: string;
  response: VendorResponse;
  vendor: Vendor | undefined;
  isLoading: boolean;
}

export const VendorResponseItem: React.FC<VendorResponseItemProps> = ({ vendorId, response, vendor, isLoading }) => {
  const { data: session } = useSession();
  const user = session?.user as ExtendedUser;
  const router = useRouter();

  const handleViewVendorDetails = () => {
    if (!user?.tenant_id || !vendorId) {
      console.error('Missing tenant ID or vendor ID');
      return;
    }
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

  if (!vendor) {
    return (
      <></>
    );
  }

  return (
    <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/30">
      <Avatar className="h-12 w-12 border-2 border-primary/20 cursor-pointer" onClick={handleViewVendorDetails}>
        <AvatarFallback className="bg-primary/10 font-semibold text-primary">
          {vendor.business_name?.[0] || <User className="h-6 w-6" />}
        </AvatarFallback>
      </Avatar>
      <div className="grid gap-2 flex-1">
        <div className="flex items-start justify-between">
          <div className="grid gap-0.5">
            <h3 
              className="font-semibold text-primary hover:underline cursor-pointer"
              onClick={handleViewVendorDetails}
            >
              {vendor.business_name}
            </h3>
            <div className="flex items-center gap-4">
              <a
                href={`mailto:${vendor.contact_email}`}
                className="text-xs text-muted-foreground flex items-center gap-1.5 hover:text-primary hover:underline transition-colors group"
              >
                <Mail className="h-3 w-3 group-hover:text-primary" />
                <span>{vendor.contact_email}</span>
              </a>
              <a
                href={`tel:${vendor.contact_phone}`}
                className="text-xs text-muted-foreground flex items-center gap-1.5 hover:text-primary hover:underline transition-colors group"
              >
                <Phone className="h-3 w-3 group-hover:text-primary" />
                <span>{vendor.contact_phone}</span>
              </a>
            </div>
          </div>
          <Badge 
            variant={response.status === 'accepted' ? 'success' : response.status === 'rejected' ? 'destructive' : 'secondary'}
            className="capitalize h-fit"
          >
            {response.status}
          </Badge>
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
