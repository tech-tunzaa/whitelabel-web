"use client";

import { useState } from "react";
import { Store, StoreBanner } from "../types";
import { useVendorStore } from "../store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { StoreIcon, ExternalLink } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { StoreBannerEditor } from "./store-banner-editor";
import { Badge } from "@/components/ui/badge";

interface StoreProps {
  vendorId: string;
  store: Store | null;
  isLoading?: boolean;
  onStoreUpdated?: () => void;
  tenantHeaders?: Record<string, string>;
  className?: string;
}

export function StoreSection({
  vendorId,
  store,
  isLoading = false,
  onStoreUpdated,
  tenantHeaders = {},
  className = "",
}: StoreProps) {
  const vendorStore = useVendorStore();
  const [banners, setBanners] = useState<StoreBanner[]>(store?.banners || []);

  // Function to handle banner updates
  const handleBannerUpdate = async (updatedBanners: StoreBanner[]) => {
    setBanners(updatedBanners);
    if (onStoreUpdated) {
      onStoreUpdated();
    }
  };

  return (
    <Card className={`${className}`}>
      <CardHeader>
        <div className="flex items-center">
          <StoreIcon className="h-5 w-5 mr-2 text-primary" />
          <CardTitle>Store Information</CardTitle>
        </div>
        <CardDescription>
          View store details and manage banners
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Spinner />
          </div>
        ) : store ? (
          <div className="space-y-6">
            {/* Store Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                {/* Store Logo */}
                {store.logo_url ? (
                  <div className="w-32 h-32 relative rounded-md overflow-hidden border">
                    <img 
                      src={store.logo_url} 
                      alt="Store Logo" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <Badge variant="outline" className="text-muted-foreground">
                    No logo available
                  </Badge>
                )}

                {/* Store Name */}
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground">Store Name</h3>
                  <p className="text-base font-medium">{store.store_name || "-"}</p>
                </div>
                
                {/* Store URL */}
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground">Store URL</h3>
                  <div className="flex items-center">
                    <p className="text-base font-medium">/{store.store_slug || "-"}</p>
                    {store.store_slug && (
                      <Button variant="ghost" size="sm" className="ml-2 p-1 h-auto" asChild>
                        <a href={`/marketplace/${store.store_slug}`} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Store Description */}
              <div>
                <h3 className="font-medium text-sm text-muted-foreground">Store Description</h3>
                <p className="mt-1 break-words">
                  {store.description || "No description provided"}
                </p>
              </div>
            </div>

            {/* Store Banners */}
            <div className="border-t pt-4">
              <h3 className="font-medium mb-3">Store Banners</h3>
              <StoreBannerEditor
                banners={banners}
                onChange={handleBannerUpdate}
                storeId={store.id || ""}
                vendorId={vendorId}
                readOnly={false}
                tenantHeaders={tenantHeaders}
              />
            </div>
          </div>
        ) : (
          <div className="py-4 text-center text-muted-foreground">
            No store information found
          </div>
        )}
      </CardContent>
    </Card>
  );
}
