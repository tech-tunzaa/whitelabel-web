"use client";

import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  ArrowLeft,
  Check,
  X,
  Edit,
  RefreshCw,
  Phone,
  Mail,
  Globe,
  MapPin,
  FileText,
  CreditCard,
  AlertCircle,
  Building,
  User,
  Landmark,
  Calendar,
  Tag,
  Percent,
  Star,
  CheckCircle2,
  XCircle,
  Trash2,
  FileSymlink,
  DollarSign,
  TrendingUp,
  ShoppingCart,
  Users,
  Store as StoreIcon,
  Link as LinkIcon,
  UserCheck,
  Megaphone,
  ExternalLink,
  Settings,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
  CardDescription
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Spinner } from "@/components/ui/spinner";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { ErrorCard } from "@/components/ui/error-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useWingaStore } from "@/features/vendors/winga/store";
import { Winga, VerificationDocument } from "@/features/vendors/winga/types";
import { WingaDialog } from "@/features/vendors/winga/components";
import { FilePreviewModal } from "@/components/ui/file-preview-modal";
import { DocumentVerificationDialog } from "@/components/ui/document-verification-dialog";
import { VerificationDocumentCard } from "@/components/ui/verification-document-card";
import { isImageFile, isPdfFile } from "@/lib/services/file-upload.service";
import { formatCurrency } from "@/lib/utils";

interface WingaPageProps {
  params: {
    id: string;
  };
}

export default function WingaDetailPage({ params }: WingaPageProps) {
  const router = useRouter();
  const session = useSession();
  // Access tenant_id safely with a type assertion
  const tenant_id = (session?.data?.user as any)?.tenant_id;
  const id = params.id;
  
  // Destructure only the store methods that are defined
  const { 
    winga, 
    loading, 
    storeError, 
    fetchWinga, 
    updateWingaStatus
  } = useWingaStore();
  
  // UI States
  const [activeTab, setActiveTab] = useState("overview");
  const [dialogAction, setDialogAction] = useState<'approve' | 'reject' | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Document and Verification States
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewType, setPreviewType] = useState<"image" | "pdf" | null>(null);
  const [verificationDoc, setVerificationDoc] = useState<VerificationDocument | null>(null);
  const [showVerificationDialog, setShowVerificationDialog] = useState(false);
  
  // Vendor Relationships - Simulated data since the API method is not implemented
  const [vendorRelationships, setVendorRelationships] = useState<any[]>([]);
  const [relationshipsLoading, setRelationshipsLoading] = useState(false);

  // Define tenant headers
  const tenantHeaders = {
    "X-Tenant-ID": tenant_id,
  };

  // Fetch affiliate details
  useEffect(() => {
    if (id) {
      fetchWinga(id, tenantHeaders).catch((error) => {
        console.error("Error fetching winga:", error);
        toast.error("Failed to load affiliate details");
      });
    }
  }, [id, fetchWinga, tenant_id]);
  
  // Simulated vendor relationships fetch - this would be replaced with an actual API call
  useEffect(() => {
    if (id && winga) {
      setRelationshipsLoading(true);
      
      // Simulate API call with timeout
      setTimeout(() => {
        // Sample data - in a real implementation, this would come from an API
        const sampleRelationships = [
          {
            vendor_id: "v-" + Math.random().toString(36).substring(2, 10),
            vendor_name: "Premium Electronics",
            commission_rate: "5.5",
            product_scope: "all",
            status: "Active",
            start_date: new Date().toISOString()
          },
          {
            vendor_id: "v-" + Math.random().toString(36).substring(2, 10),
            vendor_name: "Fashion Forward",
            commission_rate: "7.25",
            product_scope: "specific",
            product_count: 12,
            status: "Active",
            start_date: new Date().toISOString()
          }
        ];
        
        setVendorRelationships(sampleRelationships);
        setRelationshipsLoading(false);
      }, 1000);
    }
  }, [id, winga]);

  // Document handling functions
  const handleDocumentPreview = (document: VerificationDocument) => {
    if (document.document_url) {
      // Determine file type
      if (isImageFile(document.document_url)) {
        setPreviewType("image");
        setPreviewUrl(document.document_url);
      } else if (isPdfFile(document.document_url)) {
        setPreviewType("pdf");
        setPreviewUrl(document.document_url);
      } else {
        // Default to opening in a new tab
        // Make sure we're in browser environment before using window
        if (typeof window !== 'undefined') {
          window.open(document.document_url, "_blank");
        }
      }
    }
  };

  const handleClosePreview = () => {
    setPreviewUrl(null);
    setPreviewType(null);
  };

  const handleDocumentVerification = (document: VerificationDocument) => {
    setVerificationDoc(document);
    setShowVerificationDialog(true);
  };

  const handleVerificationComplete = async (
    documentId: string,
    status: "approved" | "rejected",
    reason?: string
  ) => {
    try {
      setIsUpdating(true);
      // This is a placeholder - update with the actual API call when implemented
      // await updateDocumentStatus(id, documentId, status, reason, tenantHeaders);
      toast.success(`Document ${status} successfully`);
      fetchWinga(id, tenantHeaders);
    } catch (error) {
      console.error(`Error updating document status:`, error);
      toast.error(`Failed to update document status`);
    } finally {
      setIsUpdating(false);
      setShowVerificationDialog(false);
      setVerificationDoc(null);
    }
  };

  // Affiliate status action handlers
  const handleApprove = () => {
    setDialogAction('approve');
    setIsDialogOpen(true);
  };

  const handleReject = () => {
    setDialogAction('reject');
    setIsDialogOpen(true);
  };

  const handleConfirmAction = async (reason?: string) => {
    try {
      setIsUpdating(true);
      if (dialogAction === 'approve') {
        await updateWingaStatus(id, 'approved', tenantHeaders);
        toast.success("Affiliate approved successfully");
      } else if (dialogAction === 'reject') {
        await updateWingaStatus(id, 'rejected', tenantHeaders, reason);
        toast.success("Affiliate rejected successfully");
      }
      
      // Refresh the data
      fetchWinga(id, tenantHeaders);
    } catch (error) {
      console.error(`Error ${dialogAction}ing winga:`, error);
      toast.error(`Failed to ${dialogAction} affiliate`);
    } finally {
      setIsUpdating(false);
      setIsDialogOpen(false);
      setDialogAction(null);
    }
  };

  const handleEdit = () => {
    router.push(`/dashboard/vendors/winga/${id}/edit`);
  };
  
  const handleRefresh = () => {
    // Refresh affiliate details
    fetchWinga(id, tenantHeaders);
    
    // Refresh vendor relationships (simulated)
    if (winga) {
      setRelationshipsLoading(true);
      
      setTimeout(() => {
        // Refresh with the same sample data but different IDs
        const refreshedRelationships = [
          {
            vendor_id: "v-" + Math.random().toString(36).substring(2, 10),
            vendor_name: "Premium Electronics",
            commission_rate: "5.5",
            product_scope: "all",
            status: "Active",
            start_date: new Date().toISOString()
          },
          {
            vendor_id: "v-" + Math.random().toString(36).substring(2, 10),
            vendor_name: "Fashion Forward",
            commission_rate: "7.25",
            product_scope: "specific",
            product_count: 12,
            status: "Active",
            start_date: new Date().toISOString()
          }
        ];
        
        setVendorRelationships(refreshedRelationships);
        setRelationshipsLoading(false);
      }, 1000);
    }
  };
  
  // Helper functions
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="text-amber-500 border-amber-200 bg-amber-50">Pending</Badge>;
      case "approved":
        return <Badge variant="outline" className="text-green-500 border-green-200 bg-green-50">Approved</Badge>;
      case "rejected":
        return <Badge variant="outline" className="text-red-500 border-red-200 bg-red-50">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };
  
  // Local date formatting function to replace the imported one
  const formatDate = (date: string | Date): string => {
    if (!date) return 'N/A';
    
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(dateObj.getTime())) {
      return 'Invalid Date';
    }
    
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    
    return new Intl.DateTimeFormat('en-US', options).format(dateObj);
  };

  // Common header component for loading and error states
  const HeaderComponent = () => (
    <div className="flex items-center justify-between p-4 border-b">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Affiliate Details</h1>
        <p className="text-muted-foreground">
          View and manage affiliate information
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          onClick={handleRefresh}
          disabled={loading || isUpdating}
          className="gap-1"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
        <Button 
          variant="outline" 
          onClick={() => router.push("/dashboard/vendors/winga")}
          className="gap-1"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to List
        </Button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <Spinner />
    );
  }

  if (!winga && storeError) {
    return (
      <div className="flex flex-col h-full">
        <HeaderComponent />
        
        <div className="flex-1 p-8">
          <div className="max-w-6xl mx-auto">
            <ErrorCard
              title="Failed to load affiliate details"
              error={{
                status: storeError?.status?.toString() || "Error",
                message: storeError?.message || "An error occurred"
              }}
              buttonText="Retry"
              buttonAction={() => handleRefresh()}
              buttonIcon={RefreshCw}
            />
          </div>
        </div>
      </div>
    );
  }

  // Main content for an existing winga
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/dashboard/vendors/winga')}
            className="shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Button>
          
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              {winga?.profile_image ? (
                <AvatarImage src={winga?.profile_image} alt={winga?.affiliate_name} />
              ) : (
                <AvatarFallback style={{ backgroundColor: "#4f46e5" }}>
                  {getInitials(winga?.affiliate_name || 'W')}
                </AvatarFallback>
              )}
            </Avatar>
            
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{winga?.affiliate_name}</h1>
              {winga?.website && (
                <p className="text-muted-foreground text-sm flex items-center gap-1">
                  <Globe className="h-3 w-3" />
                  <a 
                    href={winga.website.startsWith('http') ? winga?.website : `https://${winga.website}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:underline flex items-center"
                  >
                    {winga?.website}
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </p>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge 
            variant={winga?.verification_status === 'approved' ? 'default' : winga?.verification_status === 'rejected' ? 'destructive' : 'outline'} 
            className={winga?.verification_status === 'approved' ? "bg-green-500 hover:bg-green-600 px-2 py-1" : 
                      winga?.verification_status === 'rejected' ? "px-2 py-1" : 
                      "text-amber-500 border-amber-200 bg-amber-50 px-2 py-1"}
          >
            {winga?.verification_status === 'approved' ? "Approved" : 
             winga?.verification_status === 'rejected' ? "Rejected" : "Pending"}
          </Badge>
          
          <div className="flex items-center gap-2 ml-2">
            {winga?.verification_status === 'pending' && (
              <>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleReject} 
                  disabled={isUpdating}
                  className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
                >
                  <X className="h-4 w-4 mr-1" /> Reject
                </Button>
                <Button 
                  size="sm"
                  onClick={handleApprove} 
                  disabled={isUpdating}
                  className="bg-green-500 hover:bg-green-600"
                >
                  <Check className="h-4 w-4 mr-1" /> Approve
                </Button>
              </>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleEdit}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-4 overflow-auto space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-7 gap-6">
          {/* Main Content - 5 columns */}
          <div className="md:col-span-5 space-y-6">
            <Tabs
              defaultValue="overview"
              value={activeTab}
              onValueChange={setActiveTab}
              className="space-y-6"
            >
              <TabsList className="w-full">
                <TabsTrigger value="overview" className="gap-1">
                  <User className="h-4 w-4" /> Overview
                </TabsTrigger>
                <TabsTrigger value="vendors" className="gap-1">
                  <StoreIcon className="h-4 w-4" /> Vendor Relationships
                </TabsTrigger>
              </TabsList>
            
              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Affiliate Profile Card */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5 text-primary" />
                        Affiliate Profile
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex flex-col items-center text-center">
                        <Avatar className="h-20 w-20 mb-2">
                          {winga?.profile_image ? (
                            <AvatarImage src={winga?.profile_image} alt={winga?.affiliate_name} />
                          ) : (
                            <AvatarFallback className="text-lg">
                              {getInitials(winga?.affiliate_name || 'W')}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <h3 className="text-lg font-medium">{winga?.affiliate_name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {winga?.role || 'Affiliate'}
                        </p>
                        {winga?.verification_status && (
                          <Badge
                            variant="outline"
                            className={`mt-2 ${winga?.verification_status === 'approved' ? 'text-green-600 border-green-200 bg-green-50' : 
                                              winga?.verification_status === 'rejected' ? 'text-red-600 border-red-200 bg-red-50' : 
                                              'text-amber-600 border-amber-200 bg-amber-50'}`}
                          >
                            {winga?.verification_status.charAt(0).toUpperCase() + winga?.verification_status.slice(1)}
                          </Badge>
                        )}
                      </div>
                      
                      <Separator />
                      
                      <div className="space-y-3">
                        {winga?.contact_email && (
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <a href={`mailto:${winga?.contact_email}`} className="text-sm hover:underline">
                              {winga?.contact_email}
                            </a>
                          </div>
                        )}
                        
                        {winga?.contact_phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <a href={`tel:${winga?.contact_phone}`} className="text-sm hover:underline">
                              {winga?.contact_phone}
                            </a>
                          </div>
                        )}
                        
                        {winga?.city && winga?.country && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{`${winga?.city}, ${winga?.country}`}</span>
                          </div>
                        )}
                        
                        {winga?.website && (
                          <div className="flex items-center gap-2">
                            <Globe className="h-4 w-4 text-muted-foreground" />
                            <a 
                              href={winga?.website.startsWith('http') ? winga?.website : `https://${winga.website}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm hover:underline flex items-center gap-1"
                            >
                              {winga?.website}
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                        )}
                      </div>
                      
                      <Separator />
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Default Commission</span>
                          <Badge variant="outline" className="font-normal">
                            {winga?.commission_rate ? `${winga?.commission_rate}%` : 'N/A'}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Joined</span>
                          <span className="text-sm">
                            {winga?.created_at ? formatDate(winga?.created_at) : 'N/A'}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Winga ID</span>
                          <span className="text-sm font-mono">{winga?.winga_id || 'N/A'}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Main Content - Details */}
                  <div className="col-span-2 space-y-6">
                    {/* Address Information */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2">
                          <MapPin className="h-5 w-5 text-primary" />
                          Address Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm font-medium">Address Line 1</p>
                              <p className="text-sm">{winga?.address_line1}</p>
                            </div>
                            
                            {winga?.address_line2 && (
                              <div>
                                <p className="text-sm font-medium">Address Line 2</p>
                                <p className="text-sm">{winga?.address_line2}</p>
                              </div>
                            )}
                            
                            <div>
                              <p className="text-sm font-medium">City</p>
                              <p className="text-sm">{winga?.city}</p>
                            </div>
                            
                            <div>
                              <p className="text-sm font-medium">State/Province</p>
                              <p className="text-sm">{winga?.state_province}</p>
                            </div>
                            
                            <div>
                              <p className="text-sm font-medium">Postal Code</p>
                              <p className="text-sm">{winga?.postal_code}</p>
                            </div>
                            
                            <div>
                              <p className="text-sm font-medium">Country</p>
                              <p className="text-sm">{winga?.country}</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  
                    {/* Bank Account Details */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2">
                          <CreditCard className="h-5 w-5 text-primary" />
                          Banking Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {winga?.bank_account ? (
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm font-medium">Bank Name</p>
                                <p className="text-sm">{winga?.bank_account.bank_name}</p>
                              </div>
                              
                              <div>
                                <p className="text-sm font-medium">Account Name</p>
                                <p className="text-sm">{winga?.bank_account.account_name}</p>
                              </div>
                              
                              <div>
                                <p className="text-sm font-medium">Account Number</p>
                                <p className="text-sm font-mono">{winga?.bank_account.account_number}</p>
                              </div>
                              
                              {winga?.bank_account.swift_bic && (
                                <div>
                                  <p className="text-sm font-medium">SWIFT/BIC</p>
                                  <p className="text-sm font-mono">{winga?.bank_account.swift_bic}</p>
                                </div>
                              )}
                              
                              {winga?.bank_account.branch_code && (
                                <div>
                                  <p className="text-sm font-medium">Branch Code</p>
                                  <p className="text-sm font-mono">{winga?.bank_account.branch_code}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">No banking information provided</p>
                        )}
                      </CardContent>
                    </Card>
                      
                    {/* Commission Information */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2">
                          <Percent className="h-5 w-5 text-primary" />
                          Commission Details
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm font-medium">Default Commission Rate</p>
                            <Badge className="mt-1" variant="outline">
                              {winga?.commission_rate ? `${winga?.commission_rate}%` : 'Not set'}
                            </Badge>
                            <p className="text-xs text-muted-foreground mt-1">
                              Applied when no specific rate is set for a vendor
                            </p>
                          </div>
                          
                          <div>
                            <p className="text-sm font-medium">Vendor Relationships</p>
                            <p className="text-sm mt-1">
                              {vendorRelationships && vendorRelationships.length > 0 
                                ? `${vendorRelationships.length} Vendor${vendorRelationships.length > 1 ? 's' : ''}` 
                                : 'No vendors'}
                            </p>
                            {vendorRelationships && vendorRelationships.length > 0 && (
                              <Button 
                                variant="link" 
                                className="px-0 text-sm h-auto"
                                onClick={() => setActiveTab('vendors')}
                              >
                                View Relationships
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>
            
              {/* Vendor Relationships Tab */}
              <TabsContent value="vendors" className="space-y-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2">
                      <StoreIcon className="h-5 w-5 text-primary" />
                      Vendor Relationships
                    </CardTitle>
                    <CardDescription>
                      Vendors this affiliate is currently working with and their commission arrangements
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {relationshipsLoading ? (
                      <div className="flex justify-center py-6">
                        <Spinner className="h-8 w-8" />
                      </div>
                    ) : vendorRelationships && vendorRelationships.length > 0 ? (
                      <div className="space-y-4">
                        {vendorRelationships.map((relationship, index) => (
                          <div key={index} className="border rounded-lg p-4 space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10">
                                  <AvatarFallback className="bg-primary/10 text-primary">
                                    {relationship.vendor_name ? getInitials(relationship.vendor_name) : 'VN'}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <h3 className="font-medium">{relationship.vendor_name || 'Unknown Vendor'}</h3>
                                  <p className="text-xs text-muted-foreground">
                                    Vendor ID: {relationship.vendor_id || 'N/A'}
                                  </p>
                                </div>
                              </div>
                              <Badge variant="outline" className="font-normal">
                                {relationship.status || 'Active'}
                              </Badge>
                            </div>
                            
                            <Separator />
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm font-medium">Commission Rate</p>
                                <p className="text-sm">
                                  {relationship.commission_rate ? `${relationship.commission_rate}%` : 'Default Rate'}
                                </p>
                              </div>
                              
                              <div>
                                <p className="text-sm font-medium">Products</p>
                                <p className="text-sm">
                                  {relationship.product_scope === 'all' ? 'All Products' : 
                                  relationship.product_count ? `${relationship.product_count} Products` : 'Specific Products'}
                                </p>
                              </div>
                              
                              {relationship.start_date && (
                                <div>
                                  <p className="text-sm font-medium">Start Date</p>
                                  <p className="text-sm">{formatDate(relationship.start_date)}</p>
                                </div>
                              )}
                              
                              {relationship.end_date && (
                                <div>
                                  <p className="text-sm font-medium">End Date</p>
                                  <p className="text-sm">{formatDate(relationship.end_date)}</p>
                                </div>
                              )}
                            </div>
                            
                            <div className="pt-2 flex justify-end">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="text-xs gap-1"
                                onClick={() => router.push(`/dashboard/vendors/${relationship.vendor_id}`)}
                              >
                                <StoreIcon className="h-3 w-3" />
                                View Vendor
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <div className="mb-4">
                          <StoreIcon className="h-12 w-12 text-muted-foreground mx-auto opacity-20" />
                        </div>
                        <h3 className="text-lg font-medium mb-1">No Vendor Relationships</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          This affiliate is not currently associated with any vendors
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* End of tabs content */}
            </Tabs>
          </div>
          
          {/* Sidebar - 2 columns */}
          <div className="md:col-span-2 space-y-6">
            {/* Verification Documents Card */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Verification Documents
                </CardTitle>
              </CardHeader>
              <CardContent>
                {winga?.verification_documents && winga?.verification_documents.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4">
                    {winga?.verification_documents.map((document, index) => (
                      <VerificationDocumentCard
                        key={index}
                        document={{
                          id: document.id || document.document_id || `doc-${index}`,
                          document_type: document.document_type,
                          document_url: document.document_url,
                          verification_status: document.verification_status || 'pending',
                          file_name: document.file_name,
                          expires_at: document.expires_at,
                          rejection_reason: document.rejection_reason,
                        }}
                        onPreview={() => handleDocumentPreview(document)}
                        onVerify={() => handleDocumentVerification(document)}
                        showVerificationControls={winga?.verification_status === 'pending'}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <div className="mb-2">
                      <FileText className="h-8 w-8 text-muted-foreground mx-auto opacity-20" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      No documents submitted
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Actions Card */}
            <Card>
              <CardHeader className="">
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-primary" />
                  Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {winga?.verification_status === 'pending' && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Verification</h4>
                    <div className="flex flex-col gap-2">
                      <Button 
                        size="sm"
                        className="bg-green-500 hover:bg-green-600 w-full justify-start"
                        onClick={handleApprove} 
                        disabled={isUpdating}
                      >
                        <Check className="h-4 w-4 mr-2" /> Approve Affiliate
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600 w-full justify-start"
                        onClick={handleReject} 
                        disabled={isUpdating}
                      >
                        <X className="h-4 w-4 mr-2" /> Reject Affiliate
                      </Button>
                    </div>
                  </div>
                )}
                
                {winga?.verification_status === 'approved' && (
                  <div className="space-y-2">
                    <div className="flex flex-col gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600 w-full justify-start"
                        onClick={handleReject} 
                        disabled={isUpdating}
                      >
                        <X className="h-4 w-4 mr-2" /> Deactivate Affiliate
                      </Button>
                    </div>
                  </div>
                )}
                
                {winga?.verification_status === 'rejected' && (
                  <div className="space-y-2">
                    <div className="flex flex-col gap-2">
                      <Button 
                        size="sm"
                        className="bg-green-500 hover:bg-green-600 w-full justify-start"
                        onClick={handleApprove} 
                        disabled={isUpdating}
                      >
                        <Check className="h-4 w-4 mr-2" /> Reactivate Affiliate
                      </Button>
                    </div>
                  </div>
                )}
                
                <div className="space-y-2">
                  <div className="flex flex-col gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="w-full justify-start"
                      onClick={handleEdit}
                    >
                      <Edit className="h-4 w-4 mr-2" /> Edit Affiliate
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="w-full justify-start"
                      onClick={handleRefresh} 
                      disabled={loading || isUpdating}
                    >
                      <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Refresh Data
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <WingaDialog
        action={dialogAction}
        title={dialogAction === 'approve' ? "Approve Affiliate" : "Reject Affiliate"}
        description={
          dialogAction === 'approve'
            ? "Are you sure you want to approve this affiliate? This will allow them to operate on the platform."
            : "Are you sure you want to reject this affiliate? Please provide a reason for rejection."
        }
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onConfirm={handleConfirmAction}
        confirmLabel={dialogAction === 'approve' ? "Approve" : "Reject"}
        withReason={dialogAction === 'reject'}
      />
    </div>
  );
}
