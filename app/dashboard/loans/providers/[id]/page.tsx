"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { format } from "date-fns";
import { ArrowLeft, Edit, Link, Mail, Phone, Globe, MapPin, Key, LucideIcon, 
  ExternalLink, Settings, Calendar, CreditCard, Building, Clock, PieChart, Briefcase, 
  DollarSign, Shield, FileText, Check, X, Upload, AlertCircle, ImageIcon, FileSymlink } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { ErrorCard } from "@/components/ui/error-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { FilePreviewModal } from "@/components/ui/file-preview-modal";
import { VerificationDocumentCard } from "@/components/ui/verification-document-card";

import { useLoanProviderStore } from "@/features/loans/providers/store";
import { useLoanProductStore } from "@/features/loans/products/store";
import { ProductTable } from "@/features/loans/products/components/product-table";
import { VerificationDocument } from "@/features/loans/providers/types";
import { isImageFile, isPdfFile } from "@/lib/services/file-upload.service";

interface DetailItemProps {
  icon: LucideIcon;
  label: string;
  value?: string | React.ReactNode;
  isLink?: boolean;
  href?: string;
}

const DetailItem = ({ icon: Icon, label, value, isLink = false, href }: DetailItemProps) => {
  if (!value) return null;
  
  return (
    <div className="space-y-1">
      <p className="text-sm font-medium flex items-center gap-1 text-muted-foreground">
        <Icon className="h-4 w-4" /> {label}
      </p>
      {isLink && href ? (
        <p className="text-sm">
          <a href={href} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1">
            {value}
            <ExternalLink className="h-3 w-3" />
          </a>
        </p>
      ) : (
        <p className="text-sm">{value}</p>
      )}
    </div>
  );
};

interface LoanProviderDetailPageProps {
  params: {
    id: string;
  };
}

export default function LoanProviderDetailPage({ params }: LoanProviderDetailPageProps) {
  const providerId = params.id;
  const router = useRouter();
  const session = useSession();
  const tenantId = session?.data?.user?.tenantId || '';
  
  const loanProviderStore = useLoanProviderStore();
  const loanProductStore = useLoanProductStore();
  
  const { provider, loading: providerLoading, storeError: providerError } = loanProviderStore;
  const { products, loading: productsLoading } = loanProductStore;
  
  const [activeTab, setActiveTab] = useState("details");
  const [fetchAttempted, setFetchAttempted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // UI States
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Define tenant headers
  const tenantHeaders = {
    'X-Tenant-ID': tenantId
  };

  useEffect(() => {
    // Fetch provider data if not already loaded
    if (!fetchAttempted && providerId) {
      setFetchAttempted(true);
      loanProviderStore.fetchProvider(providerId, tenantHeaders).catch((error) => {
        console.error("Error fetching provider:", error);
      });
    }
  }, [providerId, loanProviderStore, fetchAttempted, tenantHeaders]);

  useEffect(() => {
    if (activeTab === "products" && provider) {
      loanProductStore.fetchProducts({ provider_id: providerId }, tenantHeaders).catch((error) => {
        console.error("Failed to fetch products:", error);
      });
    }
  }, [activeTab, loanProductStore, providerId, provider, tenantHeaders]);

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "Not set";
    return format(new Date(dateString), "MM/dd/yyyy");
  };

  // Handle document preview
  const handlePreviewDocument = (url: string) => {
    if (isImageFile(url) || isPdfFile(url)) {
      setPreviewImage(url);
    } else {
      window.open(url, "_blank");
    }
  };
  
  // Handle document approve
  const handleDocumentApprove = async (documentId: string) => {
    try {
      toast.success("Document approved successfully");
      // Simulate an API call for demo purposes
      await new Promise(resolve => setTimeout(resolve, 500));
      // In a real app, you would make an API call here
      // await approveDocument(documentId);
      
      // Refresh provider data
      loanProviderStore.fetchProvider(providerId, tenantHeaders);
      return Promise.resolve();
    } catch (error) {
      toast.error("Failed to approve document");
      console.error(error);
      return Promise.reject(error);
    }
  };
  
  // Handle document reject
  const handleDocumentReject = async (documentId: string, reason: string) => {
    try {
      toast.success("Document rejected");
      // Simulate an API call for demo purposes
      await new Promise(resolve => setTimeout(resolve, 500));
      // In a real app, you would make an API call here
      // await rejectDocument(documentId, reason);
      
      // Refresh provider data
      loanProviderStore.fetchProvider(providerId, tenantHeaders);
      return Promise.resolve();
    } catch (error) {
      toast.error("Failed to reject document");
      console.error(error);
      return Promise.reject(error);
    }
  };

  const handleStatusChange = async (isActive: boolean) => {
    try {
      setIsSubmitting(true);
      await loanProviderStore.updateProviderStatus(providerId, isActive, tenantHeaders);
      toast.success(`Provider ${isActive ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      console.error("Failed to update status:", error);
      toast.error("Failed to update provider status");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (providerLoading && !provider) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spinner />
      </div>
    );
  }

  if (providerError) {
    return (
      <ErrorCard
        title="Error Loading Provider"
        error={{
          message: providerError?.message || "Failed to load provider",
          status: providerError?.status ? String(providerError.status) : "error"
        }}
        buttonText="Back to Providers"
        buttonAction={() => router.push("/dashboard/loans/providers")}
        buttonIcon={ArrowLeft}
      />
    );
  }

  if (!provider) {
    return (
      <ErrorCard
        title="Error Loading Provider"
        error={{
          message: "Failed to load provider",
          status: "error"
        }}
        buttonText="Back to Providers"
        buttonAction={() => router.push("/dashboard/loans/providers")}
        buttonIcon={ArrowLeft}
      />
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/dashboard/loans/providers")}
            className="shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Button>
          
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={provider.logo_url} alt={provider.name} />
              <AvatarFallback style={{ backgroundColor: "#4f46e5" }}>
                {provider.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{provider.name}</h1>
              {provider.website && (
                <p className="text-muted-foreground text-sm flex items-center gap-1">
                  <Globe className="h-3 w-3" />
                  <a 
                    href={provider.website.startsWith('http') ? provider.website : `https://${provider.website}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:underline flex items-center"
                  >
                    {provider.website}
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </p>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge 
            variant={provider.is_active ? "default" : "destructive"} 
            className={provider.is_active ? "bg-green-500 hover:bg-green-600 px-2 py-1" : "px-2 py-1"}
          >
            {provider.is_active ? "Active" : "Inactive"}
          </Badge>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/dashboard/loans/providers/${providerId}/edit`)}
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
                  <Badge variant={provider.is_active ? "outline" : "secondary"}>
                    {provider.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <p className="text-sm font-medium flex items-center gap-1 text-muted-foreground">
                        <Building className="h-4 w-4" /> Company Details
                      </p>
                      <p className="text-sm">{provider.description || "No description provided"}</p>
                    </div>
                    
                    {provider.contact_email && (
                      <DetailItem 
                        icon={Mail} 
                        label="Contact Email" 
                        value={provider.contact_email} 
                        isLink={true} 
                        href={`mailto:${provider.contact_email}`}
                      />
                    )}
                    
                    {provider.contact_phone && (
                      <DetailItem 
                        icon={Phone} 
                        label="Contact Phone" 
                        value={provider.contact_phone} 
                        isLink={true} 
                        href={`tel:${provider.contact_phone}`}
                      />
                    )}
                    
                    {provider.address && (
                      <DetailItem 
                        icon={MapPin} 
                        label="Address" 
                        value={provider.address}
                      />
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <p className="text-sm font-medium flex items-center gap-1 text-muted-foreground">
                        <Calendar className="h-4 w-4" /> Created On
                      </p>
                      <p className="text-sm">{formatDate(provider.created_at)}</p>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm font-medium flex items-center gap-1 text-muted-foreground">
                        <Clock className="h-4 w-4" /> Last Updated
                      </p>
                      <p className="text-sm">{formatDate(provider.updated_at)}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Loan Products Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle>Loan Products</CardTitle>
                  <CardDescription>
                    Products offered by this provider
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/dashboard/loans/products/add?provider=${providerId}`)}
                >
                  <DollarSign className="h-4 w-4 mr-2" />
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
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <DollarSign className="h-12 w-12 text-muted-foreground mb-2 opacity-20" />
                    <p className="text-muted-foreground mb-4">No loan products available</p>
                    <Button 
                      onClick={() => router.push(`/dashboard/loans/products/add?provider=${providerId}`)}
                    >
                      Add First Product
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Performance Summary */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle>Performance Summary</CardTitle>
                  <CardDescription>
                    Overview of loan performance metrics
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <Calendar className="h-4 w-4 mr-2" />
                  This Month
                </Button>
              </CardHeader>
              
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex flex-col gap-1">
                        <p className="text-sm text-muted-foreground">Total Loans</p>
                        <p className="text-2xl font-bold">{provider?.statistics?.total_loans || "0"}</p>
                        <div className="flex items-center text-xs text-green-500">
                          <span>+{provider?.statistics?.loan_growth || "0"}%</span>
                          <span className="text-muted-foreground ml-1">vs last month</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex flex-col gap-1">
                        <p className="text-sm text-muted-foreground">Avg. Loan Value</p>
                        <p className="text-2xl font-bold">{provider?.statistics?.avg_loan_value || "0.00"}</p>
                        <p className="text-xs text-muted-foreground">Across all products</p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex flex-col gap-1">
                        <p className="text-sm text-muted-foreground">Repayment Rate</p>
                        <p className="text-2xl font-bold">{provider?.statistics?.repayment_rate || "0"}%</p>
                        <p className="text-xs text-muted-foreground">Last 30 days</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Sidebar - 2 columns */}
          <div className="md:col-span-2 space-y-6">
            {/* API Integration Settings */}
            <Card>
              <CardHeader>
                <CardTitle>API Integration</CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <DetailItem 
                  icon={Key} 
                  label="Integration Key" 
                  value={provider?.integration_key || "Not configured"}
                />
                
                <DetailItem 
                  icon={Shield} 
                  label="Integration Secret" 
                  value={provider?.integration_secret ? "••••••••••••••••" : "Not configured"}
                />

                <DetailItem 
                  icon={Globe} 
                  label="API Endpoint" 
                  value={provider?.api_endpoint || "Not configured"}
                  isLink={!!provider?.api_endpoint}
                  href={provider?.api_endpoint}
                />
              </CardContent>
              
              <CardFooter>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => router.push(`/dashboard/loans/providers/${providerId}/edit`)}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Manage API Settings
                </Button>
              </CardFooter>
            </Card>

            {/* Verification Documents */}
            <Card>
              <CardHeader>
                <CardTitle>Verification Documents</CardTitle>
                <CardDescription>
                  Documents submitted for verification
                </CardDescription>
              </CardHeader>
              <CardContent>
                {provider.verification_documents && provider.verification_documents.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4">
                    {provider.verification_documents.map((doc, index) => (
                      <VerificationDocumentCard
                        key={doc.document_id || index}
                        document={doc}
                        onApprove={handleDocumentApprove}
                        onReject={handleDocumentReject}
                        showActions={doc.verification_status !== "approved"}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center">
                    <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                    <p className="text-sm text-muted-foreground">No documents uploaded</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-4"
                      onClick={() => router.push(`/dashboard/loans/providers/${providerId}/edit`)}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Documents
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Provider Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <Button 
                  variant={provider.is_active ? "destructive" : "default"}
                  className="w-full"
                  disabled={isSubmitting}
                  onClick={() => handleStatusChange(!provider.is_active)}
                >
                  {isSubmitting ? (
                    <Spinner size="sm" color="white" />
                  ) : (
                    provider.is_active ? "Deactivate Provider" : "Activate Provider"
                  )}
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => router.push(`/dashboard/loans/providers/${providerId}/edit`)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Provider
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      {/* Image Preview Modal */}
      <FilePreviewModal
        src={previewImage || ""}
        alt="Document Preview"
        isOpen={!!previewImage}
        onClose={() => setPreviewImage(null)}
      />
    </div>
  );
}
