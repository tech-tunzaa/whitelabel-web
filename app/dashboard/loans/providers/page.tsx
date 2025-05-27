"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Plus, Search, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { ErrorCard } from "@/components/ui/error-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useLoanProviderStore } from "@/features/loans/providers/store";
import { LoanProviderFilter } from "@/features/loans/providers/types";
import { ProviderTable } from "@/features/loans/providers/components/provider-table";

export default function LoanProvidersPage() {
  const router = useRouter();
  const session = useSession();
  const tenantId = session?.data?.user?.tenant_id;
  
  const { providers, loading, storeError, fetchProviders, updateProviderStatus } = useLoanProviderStore();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState("all");
  const [isTabLoading, setIsTabLoading] = useState(false);
  const pageSize = 10;

  // Define tenant headers
  const tenantHeaders = {
    'X-Tenant-ID': tenantId
  };

  // Define filter based on active tab
  const getFilters = (): LoanProviderFilter => {
    const baseFilter: LoanProviderFilter = {
      skip: (currentPage - 1) * pageSize,
      limit: pageSize
    };

    // Add search filter if available
    if (searchQuery) {
      baseFilter.search = searchQuery;
    }

    // Add filter based on the active tab
    switch (activeTab) {
      case "active":
        return { 
          ...baseFilter, 
          is_active: true 
        };
      case "inactive":
        return { 
          ...baseFilter, 
          is_active: false 
        };
      default:
        return baseFilter;
    }
  };

  // Fetch providers when tab changes or page changes
  useEffect(() => {
    const fetchProviderData = async () => {
      try {
        setIsTabLoading(true);
        const filters = getFilters();
        await fetchProviders(filters, tenantHeaders);
      } catch (error) {
        console.error("Error fetching loan providers:", error);
      } finally {
        setIsTabLoading(false);
      }
    };

    fetchProviderData();
  }, [fetchProviders, activeTab, currentPage, searchQuery]);

  const handleProviderClick = (provider) => {
    router.push(`/dashboard/loans/providers/${provider.provider_id}`);
  };

  const handleStatusChange = async (providerId, isActive) => {
    try {
      await updateProviderStatus(providerId, isActive, tenantHeaders);
      
      // Refresh the provider list after status change
      const filters = getFilters();
      fetchProviders(filters, tenantHeaders);
    } catch (error) {
      console.error("Failed to update provider status:", error);
    }
  };

  // Handle tab change
  const handleTabChange = (value) => {
    setActiveTab(value);
    setCurrentPage(1); // Reset to first page when changing tabs
  };

  if (loading && providers.length === 0) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Loan Providers</h1>
            <p className="text-muted-foreground">
              Manage loan providers and their products
            </p>
          </div>
          <Button onClick={() => router.push("/dashboard/loans/providers/add")}>
            <Plus className="mr-2 h-4 w-4" />
            Add Provider
          </Button>
        </div>

        <div className="flex items-center justify-center h-64">
          <Spinner />
        </div>
      </div>
    );
  }

  if (!providers && !loading && storeError) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Loan Providers</h1>
            <p className="text-muted-foreground">
              Manage loan providers and their products
            </p>
          </div>
          <Button onClick={() => router.push("/dashboard/loans/providers/add")}>
            <Plus className="mr-2 h-4 w-4" />
            Add Provider
          </Button>
        </div>

        <div>
          <ErrorCard
            title="Failed to load loan providers"
            error={{
              status: storeError.status?.toString() || "Error",
              message: storeError.message || "An error occurred"
            }}
            buttonText="Retry"
            buttonAction={() => fetchProviders(getFilters(), tenantHeaders)}
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
          <h1 className="text-2xl font-bold tracking-tight">Loan Providers</h1>
          <p className="text-muted-foreground">
            Manage loan providers and their products
          </p>
        </div>
        <Button onClick={() => router.push("/dashboard/loans/providers/add")}>
          <Plus className="mr-2 h-4 w-4" />
          Add Provider
        </Button>
      </div>

      <div className="p-4 space-y-4">
        <div className="flex justify-between mb-4">
          <div className="flex-1 max-w-sm">
            <Input
              placeholder="Search providers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
              leftIcon={<Search className="h-4 w-4 opacity-50" />}
            />
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="w-full">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="inactive">Inactive</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="mt-4">
            {isTabLoading ? (
              <div className="flex justify-center py-8">
                <Spinner />
              </div>
            ) : (
              <ProviderTable
                providers={providers}
                onView={handleProviderClick}
                onEdit={(provider) => router.push(`/dashboard/loans/providers/${provider.provider_id}/edit`)}
                onStatusChange={handleStatusChange}
              />
            )}
          </TabsContent>
          <TabsContent value="active" className="mt-4">
            {isTabLoading ? (
              <div className="flex justify-center py-8">
                <Spinner />
              </div>
            ) : (
              <ProviderTable
                providers={providers}
                onView={handleProviderClick}
                onEdit={(provider) => router.push(`/dashboard/loans/providers/${provider.provider_id}/edit`)}
                onStatusChange={handleStatusChange}
              />
            )}
          </TabsContent>
          <TabsContent value="inactive" className="mt-4">
            {isTabLoading ? (
              <div className="flex justify-center py-8">
                <Spinner />
              </div>
            ) : (
              <ProviderTable
                providers={providers}
                onView={handleProviderClick}
                onEdit={(provider) => router.push(`/dashboard/loans/providers/${provider.provider_id}/edit`)}
                onStatusChange={handleStatusChange}
              />
            )}
          </TabsContent>
        </Tabs>

        {/* TODO: Add pagination component here if needed */}
      </div>
    </div>
  );
}
