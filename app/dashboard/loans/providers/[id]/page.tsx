"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ArrowLeft, Edit, Link, Mail, Phone, Globe, MapPin, Key, LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { ErrorCard } from "@/components/ui/error-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import { useLoanProviderStore } from "@/features/loans/providers/store";
import { useLoanProductStore } from "@/features/loans/products/store";
import { ProductTable } from "@/features/loans/products/components/product-table";

interface DetailItemProps {
  icon: LucideIcon;
  label: string;
  value?: string;
}

const DetailItem = ({ icon: Icon, label, value }: DetailItemProps) => {
  if (!value) return null;
  
  return (
    <div className="flex items-start mb-4">
      <div className="mr-2 mt-1">
        <Icon className="h-5 w-5 text-muted-foreground" />
      </div>
      <div>
        <div className="text-sm font-medium text-muted-foreground">{label}</div>
        <div className="text-sm">{value}</div>
      </div>
    </div>
  );
};

interface LoanProviderDetailPageProps {
  params: {
    id: string;
  };
}

export default function LoanProviderDetailPage({ params }: LoanProviderDetailPageProps) {
  const { id } = params;
  const router = useRouter();
  const session = useSession();
  const tenantId = session?.data?.user?.tenant_id;
  
  const { 
    provider, 
    loading: providerLoading, 
    storeError: providerError, 
    fetchProviderById, 
    updateProviderStatus 
  } = useLoanProviderStore();
  
  const {
    products,
    loading: productsLoading,
    storeError: productsError,
    fetchProducts
  } = useLoanProductStore();
  
  const [activeTab, setActiveTab] = useState("details");

  // Define tenant headers
  const tenantHeaders = {
    'X-Tenant-ID': tenantId || ''
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        await fetchProviderById(id, tenantHeaders);
      } catch (error) {
        console.error("Failed to fetch provider:", error);
      }
    };

    fetchData();
  }, [fetchProviderById, id]);

  useEffect(() => {
    if (activeTab === "products" && provider) {
      const fetchProviderProducts = async () => {
        try {
          await fetchProducts({ provider_id: id }, tenantHeaders);
        } catch (error) {
          console.error("Failed to fetch products:", error);
        }
      };

      fetchProviderProducts();
    }
  }, [activeTab, fetchProducts, id, provider]);

  const handleStatusChange = async (isActive: boolean) => {
    try {
      await updateProviderStatus(id, isActive, tenantHeaders);
      await fetchProviderById(id, tenantHeaders);
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  if (providerLoading && !provider) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center p-4 border-b">
          <Button
            variant="ghost"
            className="mr-2"
            onClick={() => router.push("/dashboard/loans/providers")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Loan Provider Details</h1>
            <p className="text-muted-foreground">
              View loan provider information
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center h-64">
          <Spinner />
        </div>
      </div>
    );
  }

  if (!provider && !providerLoading && providerError) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center p-4 border-b">
          <Button
            variant="ghost"
            className="mr-2"
            onClick={() => router.push("/dashboard/loans/providers")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Loan Provider Details</h1>
            <p className="text-muted-foreground">
              View loan provider information
            </p>
          </div>
        </div>

        <div className="p-4">
          <ErrorCard
            title="Failed to load provider"
            error={{
              status: providerError.status?.toString() || "Error",
              message: providerError.message || "An error occurred"
            }}
            buttonText="Go Back"
            buttonAction={() => router.push("/dashboard/loans/providers")}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center">
          <Button
            variant="ghost"
            className="mr-2"
            onClick={() => router.push("/dashboard/loans/providers")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{provider?.name || "Provider Details"}</h1>
            <p className="text-muted-foreground">
              View and manage loan provider details
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button
            variant={provider?.is_active ? "outline" : "default"}
            onClick={() => handleStatusChange(!provider?.is_active)}
          >
            {provider?.is_active ? "Deactivate" : "Activate"}
          </Button>
          <Button 
            variant="outline"
            onClick={() => router.push(`/dashboard/loans/providers/${id}/edit`)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </div>
      </div>

      <div className="p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Provider Information</span>
                    {provider?.is_active ? (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                        Inactive
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">{provider?.description}</p>
                    
                    <Separator />
                    
                    <div className="space-y-2">
                      <DetailItem icon={Mail} label="Email" value={provider?.contact_email} />
                      <DetailItem icon={Phone} label="Phone" value={provider?.contact_phone} />
                      <DetailItem icon={Globe} label="Website" value={provider?.website} />
                      <DetailItem icon={MapPin} label="Address" value={provider?.address} />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Integration Settings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      API integration details for this provider.
                    </p>
                    
                    <Separator />
                    
                    <div className="space-y-2">
                      <DetailItem icon={Key} label="Integration Key" value={provider?.integration_key} />
                      <DetailItem 
                        icon={Link} 
                        label="Integration Secret" 
                        value={provider?.integration_secret ? "••••••••••••••••" : "Not set"}
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => router.push(`/dashboard/loans/providers/${id}/edit`)}
                  >
                    Update Integration Settings
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="products" className="mt-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Loan Products</CardTitle>
                <Button 
                  onClick={() => router.push(`/dashboard/loans/products/add?provider=${id}`)}
                >
                  Add Product
                </Button>
              </CardHeader>
              <CardContent>
                {productsLoading ? (
                  <div className="flex justify-center py-8">
                    <Spinner />
                  </div>
                ) : products && products.length > 0 ? (
                  <ProductTable
                    products={products}
                    onView={(product) => router.push(`/dashboard/loans/products/${product.product_id}`)}
                    onEdit={(product) => router.push(`/dashboard/loans/products/${product.product_id}/edit`)}
                    onStatusChange={(productId, isActive) => {
                      // This would be implemented in the product store
                    }}
                  />
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No products found for this provider</p>
                    <Button 
                      className="mt-4"
                      onClick={() => router.push(`/dashboard/loans/products/add?provider=${id}`)}
                    >
                      Add Product
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
