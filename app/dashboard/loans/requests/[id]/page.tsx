"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ArrowLeft, DollarSign, CalendarDays, FileText, Tag, ClipboardCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { ErrorCard } from "@/components/ui/error-card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

import { useLoanRequestStore } from "@/features/loans/requests/store";
import { useLoanProductStore } from "@/features/loans/products/store";
// Local implementations to avoid import issues
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

const formatDate = (date: string | Date | undefined, format: 'short' | 'medium' | 'long' = 'medium'): string => {
  if (!date) return 'N/A';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return 'Invalid Date';
  }
  
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: format === 'short' ? 'short' : 'long',
    day: 'numeric',
  };
  
  if (format === 'long') {
    options.hour = 'numeric';
    options.minute = 'numeric';
    options.hour12 = true;
  }
  
  return new Intl.DateTimeFormat('en-US', options).format(dateObj);
};

interface LoanRequestDetailPageProps {
  params: {
    id: string;
  };
}

export default function LoanRequestDetailPage({ params }: LoanRequestDetailPageProps) {
  const { id } = params;
  const router = useRouter();
  const session = useSession();
  const tenantId = session?.data?.user?.tenant_id || '';
  
  const { 
    request, 
    loading: requestLoading, 
    storeError: requestError, 
    fetchRequest,
    updateRequestStatus 
  } = useLoanRequestStore();
  
  const {
    product,
    loading: productLoading,
    fetchProductById
  } = useLoanProductStore();
  
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Define tenant headers
  const tenantHeaders = {
    'X-Tenant-ID': tenantId
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        await fetchRequest(id, tenantHeaders);
      } catch (error) {
        console.error("Failed to fetch request:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [fetchRequest, id]);

  useEffect(() => {
    const fetchProductData = async () => {
      if (request && request.product_id) {
        try {
          await fetchProductById(request.product_id, tenantHeaders);
        } catch (error) {
          console.error("Failed to fetch product:", error);
        }
      }
    };

    fetchProductData();
  }, [fetchProductById, request]);

  const handleStatusChange = async (status: string) => {
    try {
      setUpdating(true);
      await updateRequestStatus(id, status, tenantHeaders);
      await fetchRequest(id, tenantHeaders);
      
      toast.success(`Loan request status updated to ${status}`);
    } catch (error) {
      console.error("Failed to update status:", error);
      toast.error(error instanceof Error ? error.message : "Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Approved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Rejected</Badge>;
      case 'disbursed':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Disbursed</Badge>;
      case 'paid':
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Paid</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const renderStatusActions = () => {
    if (!request) return null;
    
    const status = request.status.toLowerCase();
    
    switch (status) {
      case 'pending':
        return (
          <div className="flex space-x-2 mt-4">
            <Button 
              variant="default" 
              disabled={updating} 
              onClick={() => handleStatusChange('approved')}
            >
              Approve
            </Button>
            <Button 
              variant="outline"
              disabled={updating}
              onClick={() => handleStatusChange('rejected')}
            >
              Reject
            </Button>
          </div>
        );
      case 'approved':
        return (
          <div className="flex space-x-2 mt-4">
            <Button 
              variant="default" 
              disabled={updating} 
              onClick={() => handleStatusChange('disbursed')}
            >
              Mark as Disbursed
            </Button>
          </div>
        );
      case 'disbursed':
        return (
          <div className="flex space-x-2 mt-4">
            <Button 
              variant="default" 
              disabled={updating} 
              onClick={() => handleStatusChange('paid')}
            >
              Mark as Paid
            </Button>
          </div>
        );
      default:
        return null;
    }
  };

  if (loading || requestLoading) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center p-4 border-b">
          <Button
            variant="ghost"
            className="mr-2"
            onClick={() => router.push("/dashboard/loans/requests")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Loan Request Details</h1>
            <p className="text-muted-foreground">
              View loan request information
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center h-64">
          <Spinner />
        </div>
      </div>
    );
  }

  if (!request && !requestLoading && requestError) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center p-4 border-b">
          <Button
            variant="ghost"
            className="mr-2"
            onClick={() => router.push("/dashboard/loans/requests")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Loan Request Details</h1>
            <p className="text-muted-foreground">
              View loan request information
            </p>
          </div>
        </div>

        <div className="p-4">
          <ErrorCard
            title="Failed to load request"
            error={{
              status: requestError.status?.toString() || "Error",
              message: requestError.message || "An error occurred"
            }}
            buttonText="Go Back"
            buttonAction={() => router.push("/dashboard/loans/requests")}
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
            onClick={() => router.push("/dashboard/loans/requests")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Loan Request</h1>
            <p className="text-muted-foreground">
              View and manage loan request details
            </p>
          </div>
        </div>
        <div>
          {getStatusBadge(request?.status || 'Unknown')}
        </div>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Request Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-4">
                      <div className="flex items-start">
                        <div className="mr-2 mt-1">
                          <DollarSign className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-muted-foreground">Loan Amount</div>
                          <div className="text-lg font-semibold">{formatCurrency(request?.loan_amount || 0)}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="mr-2 mt-1">
                          <CalendarDays className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-muted-foreground">Term Length</div>
                          <div className="text-sm">
                            {request?.term_length} {request?.term_length === 1 ? 'month' : 'months'}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-start">
                        <div className="mr-2 mt-1">
                          <ClipboardCheck className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-muted-foreground">Status</div>
                          <div className="text-sm">{getStatusBadge(request?.status || 'Unknown')}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="mr-2 mt-1">
                          <CalendarDays className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-muted-foreground">Request Date</div>
                          <div className="text-sm">{formatDate(request?.created_at || new Date(), 'long')}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <div className="flex items-start">
                      <div className="mr-2 mt-1">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-muted-foreground">Purpose</div>
                        <div className="text-sm mt-1">{request?.purpose || 'No purpose specified'}</div>
                      </div>
                    </div>
                  </div>
                  
                  {request?.notes && (
                    <>
                      <Separator />
                      <div>
                        <div className="flex items-start">
                          <div className="mr-2 mt-1">
                            <FileText className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-muted-foreground">Notes</div>
                            <div className="text-sm mt-1">{request.notes}</div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                  
                  {renderStatusActions()}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Vendor Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium">{request?.vendor_name || 'Unknown Vendor'}</h3>
                    {request?.vendor_email && (
                      <p className="text-sm text-muted-foreground">{request.vendor_email}</p>
                    )}
                  </div>
                  
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => router.push(`/dashboard/vendors/${request?.vendor_id}`)}
                  >
                    View Vendor
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card className="mt-4">
              <CardHeader>
                <CardTitle>Product Information</CardTitle>
              </CardHeader>
              <CardContent>
                {productLoading ? (
                  <div className="flex justify-center py-4">
                    <Spinner />
                  </div>
                ) : product ? (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-medium">{product.name}</h3>
                      <p className="text-sm text-muted-foreground">{product.description}</p>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Interest Rate:</span>
                        <span className="text-sm font-medium">{product.interest_rate}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Payment Frequency:</span>
                        <span className="text-sm font-medium">{product.payment_frequency}</span>
                      </div>
                    </div>
                    
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => router.push(`/dashboard/loans/products/${product.product_id}`)}
                    >
                      View Product
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground">Product information not available</p>
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
