"use client";

import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { use } from "react";
import { 
  ArrowLeft,
  Check,
  X,
  Edit,
  Store as StoreIcon,
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
  Image as ImageIcon,
  Truck,
  FileTerminal,
  DollarSign,
  TrendingUp,
  ShoppingCart,
  RefreshCw,
  Info,
  Link,
  UserCog,
  Eye
} from "lucide-react";
import { format } from "date-fns";

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

import { useVendorStore, vendorStore } from "@/features/vendors/store";
import { useCategoryStore } from '@/features/categories/store';
import { storeStore } from '@/features/store/store';
import { Vendor, VerificationDocument, Store as VendorStore } from "@/features/vendors/types";
import { FilePreviewModal } from "@/components/ui/file-preview-modal";
import { DocumentVerificationDialog } from "@/components/ui/document-verification-dialog";
import { VerificationDocumentCard } from "@/components/ui/verification-document-card";
import { isImageFile, isPdfFile } from "@/lib/services/file-upload.service";
import { BannerEditor } from "@/components/ui/banner-editor";

interface VendorPageProps {
  params: {
    id: string;
  };
}

export default function VendorPage({ params }: VendorPageProps) {
  const router = useRouter();
  const session = useSession();
  // Extract tenant ID from session if available
  const tenant_id = session?.data?.user?.tenant_id as string | undefined;
  const unwrappedParams = use(params);
  const id = unwrappedParams.id;
  const { vendor, loading, storeError, fetchVendor, updateVendorStatus, fetchStoreByVendor } =
    useVendorStore();
  const [isUpdating, setIsUpdating] = useState(false);
  const [storeData, setStoreData] = useState<VendorStore[] | null>(null);
  const [storeLoading, setStoreLoading] = useState(false);
  
  // UI States
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  
  // Image Preview States
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  
  // Document Verification States
  const [verificationDoc, setVerificationDoc] = useState<VerificationDocument | null>(null);
  
  // Verification modal states
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [verificationDocumentData, setVerificationDocumentData] = useState<VerificationDocument | null>(null);
  
  // File preview state for the new VerificationDocumentCard
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Define tenant headers
  const tenantHeaders = {
    "X-Tenant-ID": tenant_id,
  };

  // Category state
  const [categories, setCategories] = useState<any[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [policyDocUrl, setPolicyDocUrl] = useState("");
  const [isPolicyDocOpen, setIsPolicyDocOpen] = useState(false);
  
  // Use ref to prevent duplicate API calls
  const fetchRequestRef = useRef(false);

  // Fetch all categories for mapping IDs to names
  const { categories: storeCategories, loading: storeCategoriesLoading, fetchCategories: fetchStoreCategories } = useCategoryStore();
  
  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true);
      // Use the categories store to fetch all categories
      await fetchStoreCategories({}, tenantHeaders as Record<string, string>);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setCategoriesLoading(false);
    }
  };

  // Get category name by ID using the appropriate categories store
  const getCategoryName = (categoryId: string) => {
    // Default fallback to ID if category not found
    if (!storeCategories || storeCategories.length === 0) {
      return categoryId; 
    }
    
    // Find the category by ID
    const category = storeCategories.find(cat => 
      cat.id === categoryId || 
      cat.category_id === categoryId || 
      cat._id === categoryId
    );
    
    // Return the name if found, otherwise return the ID
    return category ? category.name : categoryId;
  };  

  // Handler for policy document preview
  const handlePolicyDocPreview = (url: string) => {
    setPolicyDocUrl(url);
    setIsPolicyDocOpen(true);
  };

  useEffect(() => {
    // Only fetch if not already fetched
    if (!fetchRequestRef.current) {
      fetchRequestRef.current = true;
      
      // First fetch the vendor data
      fetchVendor(id, tenantHeaders)
        .then(() => {
          // Then fetch the store data using the vendor ID with limit:1
          setStoreLoading(true);
          // Pass headers as the second parameter, limit as the third parameter
          return fetchStoreByVendor(id, tenantHeaders, 1);
        })
        .then((storeResponse) => {
          // Handle the store response as an array
          if (Array.isArray(storeResponse)) {
            setStoreData(storeResponse);
          } else {
            // Handle backwards compatibility if the response is a single object
            setStoreData([storeResponse]);
          }
          // Also fetch categories for mapping
          return fetchCategories();
        })
        .catch((error) => {
          console.error('Error fetching vendor or store data:', error);
        })
        .finally(() => {
          setStoreLoading(false);
        });
    }
  }, [id, fetchVendor, fetchStoreByVendor]);

  // Get badge variant for status based on vendor status
  const getStatusVariant = (status: string): "default" | "outline" | "secondary" | "success" | "warning" | "destructive" => {
    switch (status.toLowerCase()) {
      case "active":
        return "success";
      case "pending":
        return "warning";
      case "inactive":
        return "secondary";
      case "rejected":
        return "destructive";
      default:
        return "secondary";
    }
  };
  
  // Get badge custom class for status (for additional styling)
  const getBadgeStyles = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-50 text-green-700 border-green-200";
      case "pending":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "inactive":
        return "bg-gray-50 text-gray-700 border-gray-200";
      case "rejected":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  // Helper to safely access vendor properties with appropriate fallbacks
  const categoriesStore = useCategoryStore();
  const vendorStatus = vendor?.verification_status || (vendor?.is_active ? "active" : "pending");
  const vendorEmail = vendor?.contact_email || vendor?.email || "";
  // Get the first store from the array if available
  const firstStore = storeData && storeData.length > 0 ? storeData[0] : null;
  const vendorLogo = firstStore?.branding?.logo_url || vendor?.store?.branding?.logo_url || vendor?.logo || "/placeholder.svg";
  const vendorDocuments = vendor?.verification_documents || [];
  const rejectionReason = vendor?.rejection_reason || "";

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "Not specified";
    try {
      return format(new Date(dateString), "MMMM d, yyyy");
    } catch (e) {
      return "Invalid date";
    }
  };

  // Handle document preview
  const handlePreviewDocument = (url: string) => {
    if (!url) {
      toast.error("No document URL available");
      return;
    }
    setPreviewImage(url);
  };

  // Handle status change
  const handleStatusChange = async (status: string) => {
    try {
      setIsUpdating(true);
      // Handle different status updates according to API expectations
      if (status === 'active' || status === 'inactive') {
        // For active/inactive toggle, API expects is_active: true/false
        const isActive = status === 'active';
        await updateVendorStatus(id, status, tenantHeaders, undefined, isActive);
        toast.success(`Vendor ${isActive ? 'activated' : 'deactivated'} successfully`);
      } else if (status === 'approved') {
        // For approval, API expects status: "approved", is_active: false
        await updateVendorStatus(id, status, tenantHeaders);
        toast.success('Vendor approved successfully');
      } else {
        // For other status changes
        await updateVendorStatus(id, status, tenantHeaders);
        toast.success(`Vendor status updated to ${status} successfully`);
      }
      // Refresh vendor data
      fetchVendor(id, tenantHeaders);
    } catch (error) {
      toast.error("Failed to update vendor status");
      console.error(error);
    } finally {
      setIsUpdating(false);
    }
  };
  
  // Handle document verification
  const handleVerifyDocument = (doc: VerificationDocument) => {
    if (!doc) {
      toast.error("No document provided for verification");
      return;
    }

    // Handle document verification flow
    setVerificationDoc(doc);
    // Make sure we're using the right properties for the verification dialog
    setVerificationDocumentData(doc);
    setIsVerificationModalOpen(true);
    
    // Log for debugging
    console.log("Opening verification modal for document:", doc);
  };
  
  // Handle document approve
  const handleDocumentApprove = async (documentId: string, expiryDate?: string) => {
    // This would connect to your API
    try {
      console.log('Approving document:', { documentId, expiryDate });
      
      // Ensure we're passing the expiry date in the right format
      // This handles both field naming conventions (expires_at and expiry_date)
      const formattedExpiryDate = expiryDate ? new Date(expiryDate).toISOString() : undefined;
      
      toast.success("Document approved successfully");
      // Simulate an API call for demo purposes
      await new Promise(resolve => setTimeout(resolve, 500));
      // In a real app, you would make an API call here
      // await approveDocument(documentId, formattedExpiryDate);
      
      // Refresh vendor data to get updated document statuses
      fetchVendor(id, tenantHeaders);
      return Promise.resolve();
    } catch (error) {
      console.error('Error approving document:', error);
      toast.error("Failed to approve document");
      return Promise.reject(error);
    }
  };
  
  // Handle document reject
  const handleDocumentReject = async (documentId: string, reason: string) => {
    // This would connect to your API
    try {
      console.log('Rejecting document:', { documentId, reason });
      
      // Validate rejection reason is provided
      if (!reason) {
        toast.error("Rejection reason is required");
        return Promise.reject(new Error("Rejection reason is required"));
      }
      
      toast.success("Document rejected");
      // Simulate an API call for demo purposes
      await new Promise(resolve => setTimeout(resolve, 500));
      // In a real app, you would make an API call here
      // await rejectDocument(documentId, reason);
      
      // Reset verification doc
      setVerificationDoc(null);
      
      // Refresh vendor data to get updated document statuses
      fetchVendor(id, tenantHeaders);
      return Promise.resolve();
    } catch (error) {
      console.error('Error rejecting document:', error);
      toast.error("Failed to reject document");
      return Promise.reject(error);
    }
  };
  
  // Handle vendor delete
  const handleDeleteVendor = async () => {
    try {
      setIsDeleting(true);
      // This would connect to your API
      // In a real app, you would delete the vendor
      // await deleteVendor(id);
      toast.success("Vendor deleted successfully");
      
      // Redirect back to vendors list
      router.push("/dashboard/vendors");
    } catch (error) {
      toast.error("Failed to delete vendor");
      console.error(error);
    } finally {
      setIsDeleting(false);
      setConfirmDelete(false);
    }
  };

  if (loading) {
    return (
      <Spinner />
    );
  }

  if (!vendor) {
    return (
      <ErrorCard
        title="Failed to load vendor"
        error={storeError || { message: "Vendor not found", status: "404" }}
        buttonText="Back to Vendors"
        buttonAction={() => router.push("/dashboard/vendors")}
        buttonIcon={ArrowLeft}
      />
    );
  }

  const canManageVendor = true;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
              onClick={() => router.push("/dashboard/vendors")} 
            className="shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Button>
          
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage 
                src={vendorLogo} 
                alt={vendor.business_name}
              />
              <AvatarFallback>
                {vendor.business_name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{vendor.business_name}</h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Badge variant={getStatusVariant(vendorStatus)} className={`${getBadgeStyles(vendorStatus)}`}>
                  {vendorStatus.charAt(0).toUpperCase() + vendorStatus.slice(1)}
                </Badge>
                {vendor.website && (
                  <a 
                    href={vendor.website.startsWith('http') ? vendor.website : `https://${vendor.website}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:underline flex items-center"
                  >
                    <Globe className="h-3 w-3 mr-1" />
                    {vendor.website.replace(/^https?:\/\/(www\.)?/, '')}
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/dashboard/vendors/${id}/edit`)}
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 overflow-auto">
        <div className="grid grid-cols-1 md:grid-cols-7 gap-6">
          {/* Main Content Area */}
          <div className="md:col-span-5">
            <Tabs defaultValue="vendor" className="w-full">
              <TabsList className="w-full">
                <TabsTrigger value="vendor" className="flex items-center gap-2">
                  <Building className="h-4 w-4" /> Vendor Information
                </TabsTrigger>
                <TabsTrigger value="store" className="flex items-center gap-2">
                  <StoreIcon className="h-4 w-4" /> Store Information
                </TabsTrigger>
                <TabsTrigger value="affiliate" className="flex items-center gap-2">
                  <UserCog className="h-4 w-4" /> Affiliates
                </TabsTrigger>
              </TabsList>
              
              {/* Vendor Information Tab */}
              <VendorInfoTab />
          
              {/* Store Information Tab */}
              <StoreInfoTab />

              {/* Affiliates Information Tab */}
              <AffiliatesTab />
            </Tabs>
          </div>
          
          {/* Sidebar */}
          <Sidebar />
        </div>
      </div>
      
      {/* File Preview Modal */}
      <FilePreviewModal
        isOpen={!!previewImage}
        onClose={() => setPreviewImage(null)}
        src={previewImage || ""}
        alt="Image preview"
      />
      
      {/* File Preview Modal for Policy Documents */}
      <FilePreviewModal
        isOpen={isPolicyDocOpen}
        onClose={() => setIsPolicyDocOpen(false)}
        src={policyDocUrl}
        alt="Document preview"
      />
      
      {/* File Preview Modal for Verification Documents */}
      <FilePreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        src={policyDocUrl}
        alt="Verification document preview"
      />
      
      {/* Document Verification Dialog */}
      {isVerificationModalOpen && verificationDocumentData && (
        <DocumentVerificationDialog 
          isOpen={isVerificationModalOpen}
          setIsOpen={setIsVerificationModalOpen}
          document={verificationDocumentData}
          vendorId={vendor?.id}
          onSuccess={() => fetchVendor(id)}
        />
      )}
    </div>
  );

  function VendorInfoTab() {
    return (
      <TabsContent value="vendor" className="space-y-4 mt-4">
        {/* Revenue Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col space-y-1.5">
                <p className="text-sm font-medium flex items-center gap-1 text-muted-foreground">
                  <DollarSign className="h-4 w-4" /> Total Revenue
                </p>
                <p className="text-2xl font-bold">TZS {(vendor?.revenue || 0).toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col space-y-1.5">
                <p className="text-sm font-medium flex items-center gap-1 text-muted-foreground">
                  <ShoppingCart className="h-4 w-4" /> Total Orders
                </p>
                <p className="text-2xl font-bold">{vendor?.order_count || 0}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col space-y-1.5">
                <p className="text-sm font-medium flex items-center gap-1 text-muted-foreground">
                  <TrendingUp className="h-4 w-4" /> Commission Rate
                </p>
                <p className="text-2xl font-bold">
                  {typeof vendor?.commission_rate === 'number' ? 
                    `${vendor.commission_rate}%` : 
                    (vendor?.commission_rate ? `${vendor.commission_rate}` : "0%")}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Business Information Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building className="h-5 w-5 mr-2" />
              Business Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Business Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Business Name</p>
                <p>{vendor?.business_name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Display Name</p>
                <p>{vendor?.display_name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Tax ID</p>
                <p>{vendor?.tax_id || "Not provided"}</p>
              </div>
            </div>

            <Separator />

            {/* Contact Information */}
            <div>
              <h3 className="text-sm font-medium mb-3">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a href={`mailto:${vendorEmail}`} className="text-sm hover:underline">
                    {vendorEmail}
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <a href={`tel:${vendor?.contact_phone}`} className="text-sm hover:underline">
                    {vendor?.contact_phone}
                  </a>
                </div>
                {vendor?.website && (
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <a 
                      href={vendor.website} 
                      target="_blank"
                      rel="noopener noreferrer" 
                      className="text-sm hover:underline"
                    >
                      {vendor.website}
                    </a>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Address Information */}
            <div>
              <h3 className="text-sm font-medium mb-3">Address</h3>
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm">{vendor?.address_line1}</p>
                  {vendor?.address_line2 && <p className="text-sm">{vendor.address_line2}</p>}
                  <p className="text-sm">
                    {
                      [
                        vendor?.city,
                        vendor?.state_province,
                        vendor?.postal_code,
                      ].filter(Boolean).join(", ")
                    }
                  </p>
                  <p className="text-sm font-medium">{vendor?.country}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Banking Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Landmark className="h-5 w-5 mr-2" />
              Banking Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Bank Name</p>
                <p>{vendor?.bank_account?.bank_name || "Not provided"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Account Name</p>
                <p>{vendor?.bank_account?.account_name || "Not provided"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Account Number</p>
                <p>{vendor?.bank_account?.account_number || "Not provided"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Swift/BIC Code</p>
                <p>{vendor?.bank_account?.swift_bic || "Not provided"}</p>
              </div>
              {vendor?.bank_account?.branch_code && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Branch Code</p>
                  <p>{vendor.bank_account.branch_code}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    );
  }

  function StoreInfoTab() {
    return (
      <TabsContent value="store" className="space-y-4 mt-4">
        {storeData && storeData.length > 0 ? (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <StoreIcon className="h-5 w-5 mr-2" />
                  Store Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Store Details */}
                <div>
                  <div className="mb-4">
                    <p className="text-sm font-medium text-muted-foreground mb-1">Store Name</p>
                    <p>{storeData[0]?.store_name}</p>
                  </div>
                
                  <div className="mb-4">
                    <p className="text-sm font-medium text-muted-foreground mb-1">Description</p>
                    <p className="text-sm">{storeData[0]?.description || 'No description provided'}</p>
                  </div>
                </div>
            
                <Separator />
            
                {/* Store Categories */}
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Categories</p>
                  <div className="flex flex-wrap gap-2">
                    {storeData[0]?.categories && storeData[0].categories.length > 0 ? (
                      storeData[0].categories.map((category, index) => (
                        <Badge key={index} variant="outline" className="text-xs py-0.5">
                          {getCategoryName(category)}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">No categories assigned</span>
                    )}
                  </div>
                </div>
            
                <Separator />
            
                {/* Store Policies */}
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Store Policies</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="flex items-center p-3 rounded-md bg-muted/50">
                      <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                      <div>
                        <p className="text-xs font-medium">Return Policy</p>
                        {storeData[0]?.return_policy ? (
                          <button 
                            onClick={() => {
                              setPolicyDocUrl(storeData[0].return_policy || '');
                              setIsPreviewOpen(true);
                            }}
                            className="text-xs text-blue-600 hover:underline"
                          >
                            View Document
                          </button>
                        ) : (
                          <p className="text-xs text-muted-foreground">Not provided</p>
                        )}
                      </div>
                    </div>
                  
                    <div className="flex items-center p-3 rounded-md bg-muted/50">
                      <Truck className="h-4 w-4 mr-2 text-muted-foreground" />
                      <div>
                        <p className="text-xs font-medium">Shipping Policy</p>
                        {storeData[0]?.shipping_policy ? (
                          <button 
                            onClick={() => {
                              setPolicyDocUrl(storeData[0].shipping_policy || '');
                              setIsPreviewOpen(true);
                            }}
                            className="text-xs text-blue-600 hover:underline"
                          >
                            View Document
                          </button>
                        ) : (
                          <p className="text-xs text-muted-foreground">Not provided</p>
                        )}
                      </div>
                    </div>
                  
                    <div className="flex items-center p-3 rounded-md bg-muted/50">
                      <FileTerminal className="h-4 w-4 mr-2 text-muted-foreground" />
                      <div>
                        <p className="text-xs font-medium">Terms & Conditions</p>
                        {storeData[0]?.general_policy ? (
                          <button 
                            onClick={() => {
                              setPolicyDocUrl(storeData[0].general_policy || '');
                              setIsPreviewOpen(true);
                            }}
                            className="text-xs text-blue-600 hover:underline"
                          >
                            View Document
                          </button>
                        ) : (
                          <p className="text-xs text-muted-foreground">Not provided</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                {/* Store Banners */}
                <div>
                  <h3 className="text-sm font-medium mb-4">Store Banners</h3>
                  {!storeData[0]?.banners || storeData[0].banners.length === 0 ? (
                    <div className="bg-muted/20 rounded-md p-6 text-center">
                      <ImageIcon className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground text-sm">No banners found.</p>
                      {canManageVendor && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-3"
                          onClick={() => {
                            // Implement banner add functionality
                            router.push(`/dashboard/vendors/${id}/edit?tab=store`);
                          }}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Banners
                        </Button>
                      )}
                    </div>
                  ) : (
                    <BannerEditor
                      banners={storeData[0].banners}
                      onChange={async (updatedBanners) => {
                        // Handle the updates for store banners
                        if (storeData[0]?.id && vendor?.id) {
                          try {
                            await vendorStore.updateStore(
                              vendor.id,
                              storeData[0].id,
                              { banners: updatedBanners },
                              tenantHeaders as Record<string, string>
                            );
                            // Refresh vendor data
                            fetchVendor(id, tenantHeaders);
                            toast.success("Store banners updated successfully");
                          } catch (error) {
                            console.error("Failed to update store banners:", error);
                            toast.error("Failed to update store banners");
                          }
                        }
                      }}
                      resourceId={storeData[0].id}
                      entityId={vendor?.id}
                      readOnly={!canManageVendor}
                      onDeleteBanner={async (resourceId, bannerId) => {
                        if (!resourceId || !bannerId) return;
                        try {
                          await vendorStore.deleteStoreBanner(resourceId, bannerId, tenantHeaders as Record<string, string>);
                          toast.success("Banner deleted successfully");
                          // Refresh vendor data
                          fetchVendor(id, tenantHeaders);
                        } catch (error) {
                          console.error("Failed to delete banner:", error);
                          toast.error("Failed to delete banner");
                          throw error;
                        }
                      }}
                      onUpdateResource={async (resourceId, entityId, data) => {
                        if (!resourceId || !entityId) return Promise.reject("Missing required parameters");
                        try {
                          await vendorStore.updateStore(entityId, resourceId, data, tenantHeaders as Record<string, string>);
                          toast.success("Banner updated successfully");
                          return Promise.resolve();
                        } catch (error) {
                          console.error("Failed to update banner:", error);
                          toast.error("Failed to update banner");
                          return Promise.reject(error);
                        }
                      }}
                      className="max-h-[500px] overflow-y-auto"
                    />
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            <StoreIcon className="h-10 w-10 mx-auto mb-2 opacity-30" />
            <p>No store data available for this vendor.</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-4"
              onClick={() => router.push(`/dashboard/vendors/${id}/edit`)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Add Store Details
            </Button>
          </div>
        )}
      </TabsContent>
    );
  }

  function AffiliatesTab() {
    return (
      <TabsContent value="affiliate" className="space-y-4 mt-4">
        {/* Affiliates Tab Content */}
      </TabsContent>
    );
  }

  function Sidebar() {
    return (
      <div className="md:col-span-2 space-y-6">
        {/* Profile Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <Avatar className="h-24 w-24 mb-4">
                <AvatarImage
                  src={vendorLogo}
                  alt={vendor?.business_name}
                />
                <AvatarFallback className="text-xl">
                  {vendor?.business_name?.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <h3 className="text-xl font-semibold">{vendor?.display_name}</h3>
              <p className="text-sm text-muted-foreground">{firstStore?.store_name || vendor?.store?.store_name || vendor?.business_name}</p>
              
              <div className="flex items-center justify-center gap-2 mt-2">
                <Badge variant={getStatusVariant(vendorStatus)} className={`${getBadgeStyles(vendorStatus)} capitalize`}>
                  {vendorStatus}
                </Badge>
                
                {typeof vendor?.rating === 'number' && vendor?.rating > 0 && (
                  <Badge variant="outline" className="flex items-center">
                    <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
                    {vendor.rating.toFixed(1)}
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-2 pt-2">
            <div className="w-full flex justify-between text-sm">
              <span className="text-muted-foreground">Registered:</span>
              <span className="font-medium">{formatDate(vendor?.created_at)}</span>
            </div>
            {vendor?.approved_at && (
              <div className="w-full flex justify-between text-sm">
                <span className="text-muted-foreground">Approved:</span>
                <span className="font-medium">{formatDate(vendor.approved_at)}</span>
              </div>
            )}
          </CardFooter>
        </Card>

        {/* Verification Documents */}
        <div className="mt-8 space-y-4">
          <h2 className="text-xl font-semibold">Verification Documents</h2>
          <div className="bg-gray-50 rounded-lg p-4">
            {vendorDocuments.length > 0 ? (
              <div className="flex flex-col gap-4">
                {vendorDocuments.map((doc, index) => {
                  // Convert the document to the format expected by VerificationDocumentCard
                  const formattedDoc: any = {
                    id: doc.id,
                    document_id: doc.id,
                    document_type: doc.document_type,
                    document_url: doc.document_url,
                    file_name: doc.file_name,
                    file_size: doc.file_size,
                    mime_type: doc.mime_type,
                    expires_at: doc.expires_at || doc.expiry_date,
                    verification_status: doc.verification_status || 'pending',
                    rejection_reason: doc.rejection_reason,
                    submitted_at: doc.submitted_at,
                    verified_at: doc.verified_at
                  };
                  
                  return (
                    <VerificationDocumentCard
                      key={doc.id || `doc-${index}`}
                      document={formattedDoc}
                      onApprove={documentId => handleDocumentApprove(documentId)}
                      onReject={handleDocumentReject}
                      onPreview={(url) => {
                        setPolicyDocUrl(url);
                        setIsPreviewOpen(true);
                      }}
                      showActions={true}
                      className="shadow-sm"
                    />
                  );
                })}
              </div>
            ) : (
              <div className="py-6 text-center">
                <p className="text-muted-foreground">No verification documents found</p>
              </div>
            )}
          </div>
        </div>

        {/* Actions Card */}
        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Show different actions based on vendor status */}
            {vendorStatus === "pending" && (
              <>
                <Button
                  variant="outline"
                  className="w-full text-green-600"
                  disabled={isUpdating}
                  onClick={() => handleStatusChange("approved")}
                >
                  {isUpdating ? (
                    <Spinner className="h-4 w-4 mr-2" color="white" />
                  ) : (
                    <Check className="h-4 w-4 mr-2" />
                  )}
                  Approve Vendor
                </Button>
                <Button
                  variant="outline"
                  className="w-full text-red-600"
                  disabled={isUpdating}
                  onClick={() => handleStatusChange("rejected")}
                >
                  {isUpdating ? (
                    <Spinner className="h-4 w-4 mr-2" color="white" />
                  ) : (
                    <X className="h-4 w-4 mr-2" />
                  )}
                  Reject Vendor
                </Button>
              </>
            )}
          
            {vendorStatus === "rejected" && (
              <Button
                variant="outline"
                className="w-full text-green-600"
                disabled={isUpdating}
                onClick={() => handleStatusChange("approved")}
              >
                {isUpdating ? (
                  <Spinner className="h-4 w-4 mr-2" color="white" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Reconsider Vendor
              </Button>
            )}
          
            {vendorStatus === "approved" && (
              <Button
                variant="outline"
                className={`w-full ${!vendor.is_active ? "text-green-600" : "text-red-600"}`}
                disabled={isUpdating}
                onClick={() => handleStatusChange(vendor.is_active ? "inactive" : "active")}
              >
                {isUpdating ? (
                  <Spinner className="h-4 w-4 mr-2" color="white" />
                ) : vendor.is_active ? (
                  <>
                    <X className="h-4 w-4 mr-2" />
                    Deactivate Vendor
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Activate Vendor
                  </>
                )}
              </Button>
            )}
          
            {/* Show rejection reason if rejected */}
            {vendorStatus === "rejected" && rejectionReason && (
              <div className="mt-2 p-3 bg-red-50 rounded-md">
                <p className="text-sm text-red-800">
                  <span className="font-medium">Rejection Reason:</span> {rejectionReason}
                </p>
              </div>
            )}
          
            <Button
              variant="outline"
              className="w-full"
              onClick={() => router.push(`/dashboard/vendors/${id}/edit`)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Vendor
            </Button>
            <Button
              variant="outline"
              className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={() => setConfirmDelete(true)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Vendor
            </Button>
          
            {/* Inline delete confirmation */}
            {confirmDelete && (
              <div className="mt-4 p-3 border border-red-200 rounded-md bg-red-50">
                <p className="text-sm text-red-800 mb-2">
                  Are you sure you want to delete this vendor? This action cannot be undone.
                </p>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline" 
                    size="sm"
                    onClick={() => setConfirmDelete(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={handleDeleteVendor} 
                    disabled={isDeleting}
                  >
                    {isDeleting && <Spinner className="mr-2 h-3 w-3" color="white" />}
                    Confirm Delete
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }
}
