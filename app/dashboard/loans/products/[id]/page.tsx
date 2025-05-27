"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ArrowLeft, Edit, DollarSign, Percent, Calendar, Clock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { ErrorCard } from "@/components/ui/error-card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import { useLoanProductStore } from "@/features/loans/products/store";
import { useLoanProviderStore } from "@/features/loans/providers/store";
// Format currency directly to avoid import issues
const formatCurrency = (value: number | string | undefined): string => {
  if (value === undefined) return '$0.00';
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) {
    return '$0.00';
  }
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(numValue);
};

interface LoanProductDetailPageProps {
  params: {
    id: string;
  };
}

export default function LoanProductDetailPage({ params }: LoanProductDetailPageProps) {
  const { id } = params;
  const router = useRouter();
  const session = useSession();
  const tenantId = session?.data?.user?.tenant_id;
  
  const { 
    product, 
    loading: productLoading, 
    storeError: productError, 
    fetchProductById,
    updateProductStatus 
  } = useLoanProductStore();
  
  const {
    provider,
    loading: providerLoading,
    fetchProviderById
  } = useLoanProviderStore();
  
  const [loading, setLoading] = useState(true);

  // Define tenant headers
  const tenantHeaders = {
    'X-Tenant-ID': tenantId || ''
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        await fetchProductById(id, tenantHeaders);
      } catch (error) {
        console.error("Failed to fetch product:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [fetchProductById, id]);

  useEffect(() => {
    const fetchProviderData = async () => {
      if (product && product.provider_id) {
        try {
          await fetchProviderById(product.provider_id, tenantHeaders);
        } catch (error) {
          console.error("Failed to fetch provider:", error);
        }
      }
    };

    fetchProviderData();
  }, [fetchProviderById, product]);

  const handleStatusChange = async (isActive: boolean) => {
    try {
      await updateProductStatus(id, isActive, tenantHeaders);
      await fetchProductById(id, tenantHeaders);
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  const formatFrequency = (frequency: string) => {
    switch (frequency) {
      case 'weekly':
        return 'Weekly';
      case 'bi-weekly':
        return 'Bi-Weekly';
      case 'monthly':
        return 'Monthly';
      default:
        return frequency;
    }
  };

  if (loading || productLoading) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center p-4 border-b">
          <Button
            variant="ghost"
            className="mr-2"
            onClick={() => router.push("/dashboard/loans/products")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Loan Product Details</h1>
            <p className="text-muted-foreground">
              View loan product information
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center h-64">
          <Spinner />
        </div>
      </div>
    );
  }

  if (!product && !productLoading && productError) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center p-4 border-b">
          <Button
            variant="ghost"
            className="mr-2"
            onClick={() => router.push("/dashboard/loans/products")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Loan Product Details</h1>
            <p className="text-muted-foreground">
              View loan product information
            </p>
          </div>
        </div>

        <div className="p-4">
          <ErrorCard
            title="Failed to load product"
            error={{
              status: productError.status?.toString() || "Error",
              message: productError.message || "An error occurred"
            }}
            buttonText="Go Back"
            buttonAction={() => router.push("/dashboard/loans/products")}
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
            onClick={() => router.push("/dashboard/loans/products")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{product?.name || "Product Details"}</h1>
            <p className="text-muted-foreground">
              View and manage loan product details
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button
            variant={product?.is_active ? "outline" : "default"}
            onClick={() => handleStatusChange(!product?.is_active)}
          >
            {product?.is_active ? "Deactivate" : "Activate"}
          </Button>
          <Button 
            variant="outline"
            onClick={() => router.push(`/dashboard/loans/products/${id}/edit`)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </div>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="shadow-sm hover:shadow transition-shadow duration-200">
              <CardHeader className="bg-muted/30">
                <CardTitle className="flex items-center justify-between">
                  <span>Product Information</span>
                  <Badge 
                    variant={product?.is_active ? "success" : "secondary"}
                    className={product?.is_active ? "bg-green-500 hover:bg-green-600 text-white" : ""}
                  >
                    {product?.is_active ? "Active" : "Inactive"}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div className="bg-muted/20 p-4 rounded-lg border border-muted">
                    <p className="text-sm">{product?.description || "No description provided."}</p>
                  </div>
                  
                  <Separator className="my-2" />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-6">
                      <div className="flex items-start p-3 rounded-lg bg-muted/10 border border-muted hover:bg-muted/20 transition-colors duration-200">
                        <div className="mr-3 mt-1">
                          <Percent className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-muted-foreground">Interest Rate</div>
                          <div className="text-lg font-semibold text-primary">{product?.interest_rate}%</div>
                        </div>
                      </div>
                      
                      <div className="flex items-start p-3 rounded-lg bg-muted/10 border border-muted hover:bg-muted/20 transition-colors duration-200">
                        <div className="mr-3 mt-1">
                          <DollarSign className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-muted-foreground">Loan Amount Range</div>
                          <div className="text-lg font-semibold text-primary">
                            {formatCurrency(product?.min_amount)} - {formatCurrency(product?.max_amount)}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-start">
                        <div className="mr-2 mt-1">
                          <Calendar className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-muted-foreground">Term Options</div>
                          <div className="text-sm">
                            {product?.term_options.map((term, index) => (
                              <span key={index}>
                                {term} {term === 1 ? 'month' : 'months'}
                                {index < product.term_options.length - 1 ? ', ' : ''}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="mr-2 mt-1">
                          <Clock className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-muted-foreground">Payment Frequency</div>
                          <div className="text-sm">{formatFrequency(product?.payment_frequency)}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {product?.processing_fee && (
                    <>
                      <Separator />
                      <div className="flex items-start">
                        <div className="mr-2 mt-1">
                          <DollarSign className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-muted-foreground">Processing Fee</div>
                          <div className="text-sm">{formatCurrency(product?.processing_fee)}</div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Provider Information</CardTitle>
              </CardHeader>
              <CardContent>
                {providerLoading ? (
                  <div className="flex justify-center py-4">
                    <Spinner />
                  </div>
                ) : provider ? (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-medium">{provider.name}</h3>
                      <p className="text-sm text-muted-foreground">{provider.description}</p>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-2">
                      <div className="text-sm">
                        <span className="font-medium text-muted-foreground">Email: </span>
                        {provider.contact_email}
                      </div>
                      <div className="text-sm">
                        <span className="font-medium text-muted-foreground">Phone: </span>
                        {provider.contact_phone}
                      </div>
                      {provider.website && (
                        <div className="text-sm">
                          <span className="font-medium text-muted-foreground">Website: </span>
                          <a href={provider.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            {provider.website}
                          </a>
                        </div>
                      )}
                    </div>
                    
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => router.push(`/dashboard/loans/providers/${provider.provider_id}`)}
                    >
                      View Provider
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground">Provider information not available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
