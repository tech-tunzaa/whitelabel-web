"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
// import { Pagination } from "@/components/ui/pagination";
import { ErrorCard } from "@/components/ui/error-card";
import { Skeleton } from "@/components/ui/skeleton";

import { useVendorStore } from "@/features/vendors/store";
import { VendorListResponse } from "@/features/vendors/types";
import { VendorTable } from "@/features/vendors/components/vendor-table";

export default function VendorsPage() {
  const router = useRouter();
  const { vendors, loading, storeError, fetchVendors, updateVendorStatus } = useVendorStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Define tenant headers
  const tenantHeaders = {
    'X-Tenant-ID': '4c56d0c3-55d9-495b-ae26-0d922d430a42'
  };

  useEffect(() => {
    // Pass tenant headers to the fetchVendors function
    fetchVendors(undefined, tenantHeaders);
  }, [fetchVendors]);

  const handleVendorClick = (vendor: VendorListResponse["items"][0]) => {
    router.push(`/dashboard/vendors/${vendor.vendor_id}`);
  };

  const handleStatusChange = async (vendorId: string, status: string) => {
    try {
      // Pass tenant headers to the updateVendorStatus function
      await updateVendorStatus(vendorId, status, tenantHeaders);
    } catch (error) {
      console.error("Failed to update vendor status:", error);
    }
  };

  // Filter vendors based on search query
  const filteredVendors = vendors?.filter((vendor) => {
    if (!searchQuery.trim()) return true;
    
    const query = searchQuery.toLowerCase();
    
    // Log vendor structure to debug
    console.log('Filtering vendor:', vendor);
    
    return (
      vendor.business_name?.toLowerCase().includes(query) ||
      vendor.display_name?.toLowerCase().includes(query) ||
      vendor.contact_email?.toLowerCase().includes(query) ||
      vendor.contact_phone?.toLowerCase().includes(query)
    );
  }) || [];
  
  // Log the filtered results to debug
  console.log('Filtered vendors count:', filteredVendors.length);

  // Paginate vendors
  const totalPages = Math.ceil(filteredVendors.length / pageSize);
  const displayedVendors = filteredVendors.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  if (loading) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Vendors</h1>
            <p className="text-muted-foreground">
              Manage vendor applications and accounts
            </p>
          </div>
          <Button onClick={() => router.push("/dashboard/vendors/add")}>
            <Plus className="mr-2 h-4 w-4" />
            Add Vendor
          </Button>
        </div>

        <Spinner />
      </div>
    );
  }

  if (!vendors && !loading && storeError) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Vendors</h1>
            <p className="text-muted-foreground">
              Manage vendor applications and accounts
            </p>
          </div>
          <Button onClick={() => router.push("/dashboard/vendors/add")}>
            <Plus className="mr-2 h-4 w-4" />
            Add Vendor
          </Button>
        </div>

        <div>
          <ErrorCard
            title="Failed to load vendors"
            error={storeError}
            buttonText="Retry"
            buttonAction={() => fetchVendors(undefined, tenantHeaders)}
            buttonIcon={RefreshCw}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Vendors</h1>
          <p className="text-muted-foreground">
            Manage vendor applications and accounts
          </p>
        </div>
        <Button onClick={() => router.push("/dashboard/vendors/add")}>
          <Plus className="mr-2 h-4 w-4" />
          Add Vendor
        </Button>
      </div>

      <div className="p-4 space-y-4">
        <div className="flex justify-between mb-4">
          <div className="relative w-[300px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search vendors..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1); // Reset to first page when searching
              }}
            />
          </div>
        </div>

        <VendorTable
          vendors={displayedVendors}
          onVendorClick={handleVendorClick}
          onStatusChange={handleStatusChange}
        />

        {/* {totalPages > 1 && (
          <div className="flex justify-center mt-4">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )} */}
      </div>
    </div>
  );
}
