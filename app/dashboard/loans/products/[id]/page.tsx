"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { format } from "date-fns";
import {
  ArrowLeft, Edit, DollarSign, Percent, Calendar, Clock, 
  CreditCard, Check, X, ExternalLink, Star, ChevronsUpDown,
  BarChart4, FileText, Building, Tag, Calculator, Settings,
  Coins, BadgeDollarSign, Target, Users, Wallet, Globe,
  Mail, Phone
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { VerificationDocumentCard } from "@/components/ui/verification-document-card";
import { Spinner } from "@/components/ui/spinner";
import { ErrorCard } from "@/components/ui/error-card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

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
    fetchProduct,
    updateProductStatus 
  } = useLoanProductStore();
  
  const {
    provider,
    loading: providerLoading,
    fetchProvider
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
        await fetchProduct(id, tenantHeaders);
        
        if (product?.provider_id) {
          await fetchProvider(product?.provider_id, tenantHeaders);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    if (tenantId) {
      fetchData();
    }
  }, [id, tenantId, fetchProduct, fetchProvider, product?.provider_id]);

  const handleStatusChange = async (isActive: boolean) => {
    try {
      toast.loading(`${isActive ? 'Activating' : 'Deactivating'} product?...`);
      await updateProductStatus(id, isActive, tenantHeaders);
      await fetchProduct(id, tenantHeaders);
      toast.success(`Product ${isActive ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      toast.error(`Failed to ${isActive ? 'activate' : 'deactivate'} product`);
    }
  };

  const formatFrequency = (frequency: string) => {
    if (!frequency) return "Not set";
    return frequency.charAt(0).toUpperCase() + frequency.slice(1).replace("_", " ");
  };
  
  // Calculate monthly payment for a loan
  const calculateMonthlyPayment = (principal: string | number, interestRate: string | number, termMonths: number) => {
    const p = parseFloat(principal.toString());
    const r = parseFloat(interestRate.toString()) / 100 / 12; // Monthly interest rate
    const n = termMonths;
    
    // Monthly payment formula: P * (r * (1 + r)^n) / ((1 + r)^n - 1)
    if (r === 0) return p / n; // If interest rate is 0, just divide principal by term
    
    const monthlyPayment = p * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    return monthlyPayment;
  };
  
  // Calculate total interest paid over the life of the loan
  const calculateTotalInterest = (principal: string | number, interestRate: string | number, termMonths: number) => {
    const p = parseFloat(principal.toString());
    const monthlyPayment = calculateMonthlyPayment(p, interestRate, termMonths);
    const totalPayment = monthlyPayment * termMonths;
    return totalPayment - p;
  };

  if (productLoading && !product) {
    return (
      <Spinner />
    );
  }

  if (productError && !product && !productLoading) {
    return (
      <ErrorCard
        title="Error Loading Loan Product"
        error={{
          message: productError?.message || "Failed to load loan product",
          status: productError?.status ? String(productError.status) : "error"
        }}
        buttonText="Back to Products"
        buttonAction={() => router.push("/dashboard/loans/products")}
        buttonIcon={ArrowLeft}
      />
    );
  }

  const formatDateDisplay = (dateString: string | null | undefined) => {
    if (!dateString) return "Not set";
    return format(new Date(dateString), "MMMM d, yyyy");
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/dashboard/loans/products")}
            className="shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Button>
          
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback style={{ backgroundColor: "#6366f1" }} className="text-white">
                <DollarSign className="h-6 w-6" />
              </AvatarFallback>
            </Avatar>
            
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{product?.name}</h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Badge 
                  variant={product?.is_active ? "default" : "destructive"} 
                  className={product?.is_active ? "bg-green-500 hover:bg-green-600 px-2 py-1" : "px-2 py-1"}
                >
                  {product?.is_active ? "Active" : "Inactive"}
                </Badge>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Created: {formatDateDisplay(product?.created_at)}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/dashboard/loans/products/${id}/edit`)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 overflow-auto space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-7 gap-6">
          {/* Main Content - 5 columns */}
          <div className="md:col-span-5 space-y-6">
            {/* Overview Card */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <CardTitle>Overview</CardTitle>
                  <Badge variant={product?.is_active ? "outline" : "secondary"}>
                    {product?.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  {/* Description */}
                  <div className="bg-muted/20 p-4 rounded-lg border border-muted">
                    <p className="text-sm">{product?.description || "No description provided."}</p>
                  </div>
                  
                  {/* Key Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="border-0 shadow-none bg-muted/10">
                      <CardContent className="p-4">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <Percent className="h-4 w-4 text-primary" />
                            <p className="text-sm text-muted-foreground">Interest Rate</p>
                          </div>
                          <p className="text-2xl font-bold">{product?.interest_rate}%</p>
                          <p className="text-xs text-muted-foreground">Annual percentage rate</p>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="border-0 shadow-none bg-muted/10">
                      <CardContent className="p-4">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-primary" />
                            <p className="text-sm text-muted-foreground">Amount Range</p>
                          </div>
                          <p className="text-xl font-bold">
                            {formatCurrency(product?.min_amount)} - {formatCurrency(product?.max_amount)}
                          </p>
                          <p className="text-xs text-muted-foreground">Minimum and maximum loan amount</p>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="border-0 shadow-none bg-muted/10">
                      <CardContent className="p-4">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-primary" />
                            <p className="text-sm text-muted-foreground">Payment Schedule</p>
                          </div>
                          <p className="text-xl font-bold capitalize">
                            {formatFrequency(product?.payment_frequency)}
                          </p>
                          <p className="text-xs text-muted-foreground">Repayment frequency</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Loan Terms Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Loan Terms</CardTitle>
                    <CardDescription>Detailed loan terms and conditions</CardDescription>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <p className="text-sm font-medium flex items-center gap-1 text-muted-foreground">
                        <Calendar className="h-4 w-4" /> Term Options
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {product?.term_options.map((term, index) => (
                          <Badge key={index} variant="outline" className="capitalize">
                            {term} {term === 1 ? 'month' : 'months'}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    {product?.late_fee && (
                      <div className="space-y-1">
                        <p className="text-sm font-medium flex items-center gap-1 text-muted-foreground">
                          <DollarSign className="h-4 w-4" /> Late Payment Fee
                        </p>
                        <p className="text-sm">{formatCurrency(product?.late_fee)}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    {product?.processing_fee && (
                      <div className="space-y-1">
                        <p className="text-sm font-medium flex items-center gap-1 text-muted-foreground">
                          <CreditCard className="h-4 w-4" /> Processing Fee
                        </p>
                        <p className="text-sm">{formatCurrency(product?.processing_fee)}</p>
                      </div>
                    )}
                    
                    {product?.early_repayment_fee && (
                      <div className="space-y-1">
                        <p className="text-sm font-medium flex items-center gap-1 text-muted-foreground">
                          <BadgeDollarSign className="h-4 w-4" /> Early Repayment Fee
                        </p>
                        <p className="text-sm">{formatCurrency(product?.early_repayment_fee)}</p>
                      </div>
                    )}
                  </div>
                </div>
                
                <Separator className="my-4" />
                
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Eligibility Criteria</p>
                  <ul className="text-sm list-disc list-inside space-y-1 ml-2">
                    <li>Minimum age requirement: 18 years</li>
                    <li>Valid identification document</li>
                    <li>Proof of income or employment</li>
                    <li>No active bankruptcies or defaults</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Sidebar - 2 columns */}
          <div className="md:col-span-2 space-y-6">
            {/* Provider Information */}
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
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback style={{ backgroundColor: "#4f46e5" }}>
                          {provider.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium">{provider.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {provider.is_active ? "Active Provider" : "Inactive Provider"}
                        </p>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <a href={`mailto:${provider.contact_email}`} className="text-sm hover:underline">
                          {provider.contact_email}
                        </a>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <a href={`tel:${provider.contact_phone}`} className="text-sm hover:underline">
                          {provider.contact_phone}
                        </a>
                      </div>
                      
                      {provider.website && (
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-muted-foreground" />
                          <a 
                            href={provider.website.startsWith('http') ? provider.website : `https://${provider.website}`} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-sm hover:underline flex items-center gap-1"
                          >
                            {provider.website.replace(/^https?:\/\//, '')}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground">Provider information not available</p>
                  </div>
                )}
              </CardContent>
              
              {provider && (
                <CardFooter>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => router.push(`/dashboard/loans/providers/${provider.provider_id}`)}
                  >
                    <Building className="h-4 w-4 mr-2" />
                    View Provider
                  </Button>
                </CardFooter>
              )}
            </Card>
            
            {/* Product Status */}
            <Card>
              <CardHeader>
                <CardTitle>Product Status</CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Current Status</p>
                  <Badge 
                    className={`capitalize ${product?.is_active ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-red-100 text-red-800 hover:bg-red-200'}`}
                  >
                    {product?.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Created On</p>
                  <p className="text-sm">{formatDateDisplay(product?.created_at)}</p>
                </div>
                
                {product?.updated_at && product?.updated_at !== product?.created_at && (
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Last Updated</p>
                    <p className="text-sm">{formatDateDisplay(product?.updated_at)}</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <Button 
                  variant={product?.is_active ? "destructive" : "default"}
                  className="w-full"
                  onClick={() => handleStatusChange(!product?.is_active)}
                >
                  {product?.is_active ? (
                    <>
                      <X className="h-4 w-4 mr-2" />
                      Deactivate Product
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Activate Product
                    </>
                  )}
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => router.push(`/dashboard/loans/products/${id}/edit`)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Product
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
