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
  DollarSign,
  TrendingUp,
  ShoppingCart,
  RefreshCw
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

import { useVendorStore } from "@/features/vendors/store";
import { Vendor, VerificationDocument, Store as VendorStore } from "@/features/vendors/types";
import { FilePreviewModal } from "@/components/ui/file-preview-modal";
import { DocumentVerificationDialog } from "@/components/ui/document-verification-dialog";
import { VerificationDocumentCard } from "@/components/ui/verification-document-card";
import { isImageFile, isPdfFile } from "@/lib/services/file-upload.service";

interface VendorPageProps {
  params: {
    id: string;
  };
}

export default function VendorPage({ params }: VendorPageProps) {
  const router = useRouter();
  const session = useSession();
  const tenant_id = session?.data?.user?.tenant_id;
  const unwrappedParams = use(params);
  const id = unwrappedParams.id;
  const { vendor, loading, storeError, fetchVendor, updateVendorStatus, fetchStoreByVendor } =
    useVendorStore();
  const [isUpdating, setIsUpdating] = useState(false);
  const [storeData, setStoreData] = useState<VendorStore | null>(null);
  const [storeLoading, setStoreLoading] = useState(false);
  
  // UI States
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  
  // Image Preview States
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  
  // Document Verification States
  const [verificationDoc, setVerificationDoc] = useState<{
    id: string;
    type: string;
    name: string;
    url: string;
    expiryDate?: string;
  } | null>(null);

  // Define tenant headers
  const tenantHeaders = {
    "X-Tenant-ID": tenant_id,
  };

  // Use ref to prevent duplicate API calls
  const fetchRequestRef = useRef(false);

  useEffect(() => {
    // Only fetch if not already fetched
    if (!fetchRequestRef.current) {
      fetchRequestRef.current = true;
      
      // First fetch the vendor data
      fetchVendor(id, tenantHeaders)
        .then(() => {
          // Then fetch the store data using the vendor ID
          setStoreLoading(true);
          return fetchStoreByVendor(id, tenantHeaders);
        })
        .then((store) => {
          setStoreData(store);
        })
        .catch((error) => {
          console.error('Error fetching vendor or store data:', error);
        })
        .finally(() => {
          setStoreLoading(false);
        });
    }
  }, [id, fetchVendor, fetchStoreByVendor]);

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "approved":
      case "active":
        return "success";
      case "pending":
        return "warning";
      case "rejected":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const getBadgeStyles = (status: string) => {
    switch (status) {
      case "approved":
      case "active":
        return "bg-green-500 hover:bg-green-600 text-white";
      case "pending":
        return "bg-amber-500 hover:bg-amber-600 text-white";
      case "rejected":
        return "bg-red-500 hover:bg-red-600 text-white";
      default:
        return "";
    }
  };

  // Helper to safely access vendor properties with appropriate fallbacks
  const vendorStatus = vendor?.verification_status || (vendor?.is_active ? "active" : "pending");
  const vendorEmail = vendor?.contact_email || vendor?.email || "";
  const vendorLogo = vendor?.store?.branding?.logo_url || vendor?.logo || "/placeholder.svg";
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
    if (isImageFile(url) || isPdfFile(url)) {
      setPreviewImage(url);
    } else {
      window.open(url, "_blank");
    }
  };

  // Handle status change
  const handleStatusChange = async (status: string) => {
    try {
      setIsUpdating(true);
      await updateVendorStatus(id, status, tenantHeaders);
      toast.success(`Vendor status updated to ${status} successfully`);
    } catch (error) {
      toast.error("Failed to update vendor status");
      console.error(error);
    } finally {
      setIsUpdating(false);
    }
  };
  
  // Handle document verification
  const handleVerifyDocument = (doc: VerificationDocument) => {
    // Log the document to help with debugging
    console.log('Document to verify:', doc);
    
    setVerificationDoc({
      // Support both ID field names
      id: doc.document_id || doc.id || "",
      
      // Important: Don't default document_type to prevent overriding actual selection
      type: doc.document_type || "",
      
      // Support both naming conventions for the file name
      name: doc.file_name || doc.document_name || "",
      
      // Support both URL field names
      url: doc.file_url || doc.document_url || "",
      
      // Support both expiry date field names
      expiryDate: doc.expires_at || doc.expiry_date || undefined
    });
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
      <div className="flex items-center justify-center h-full">
        <Spinner />
      </div>
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
                <Badge variant={getStatusVariant(vendorStatus)} className={getBadgeStyles(vendorStatus)}>
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
      <div className="p-4 overflow-auto space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main details */}
          <div className="md:col-span-2 space-y-6">
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
                    <p>{vendor.business_name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Display Name</p>
                    <p>{vendor.display_name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Tax ID</p>
                    <p>{vendor.tax_id || "Not provided"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Commission Rate</p>
                    <p>{typeof vendor.commission_rate === 'number' ? 
                      `${vendor.commission_rate}%` : 
                      (vendor.commission_rate ? `${vendor.commission_rate}` : "Not set")}</p>
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
                      <a href={`tel:${vendor.contact_phone}`} className="text-sm hover:underline">
                        {vendor.contact_phone}
                      </a>
                    </div>
                    {vendor.website && (
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
                      <p className="text-sm">{vendor.address_line1}</p>
                      {vendor.address_line2 && <p className="text-sm">{vendor.address_line2}</p>}
                      <p className="text-sm">
                        {[
                          vendor.city,
                          vendor.state_province,
                          vendor.postal_code,
                        ].filter(Boolean).join(", ")}
                      </p>
                      <p className="text-sm font-medium">{vendor.country}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Banking Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Landmark className="h-5 w-5 mr-2" />
                  Banking Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Bank Name</p>
                    <p>{vendor.bank_account?.bank_name || "Not provided"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Account Name</p>
                    <p>{vendor.bank_account?.account_name || "Not provided"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Account Number</p>
                    <p>{vendor.bank_account?.account_number || "Not provided"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Swift Code</p>
                    <p>{vendor.bank_account?.swift_code || "Not provided"}</p>
                  </div>
                  {vendor.bank_account?.branch_code && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Branch Code</p>
                      <p>{vendor.bank_account.branch_code}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Profile Card */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <Avatar className="h-24 w-24 mb-4">
                    <AvatarImage
                      src={vendorLogo}
                      alt={vendor.business_name}
                    />
                    <AvatarFallback className="text-xl">
                      {vendor.business_name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="text-xl font-semibold">{vendor.display_name}</h3>
                  <p className="text-sm text-muted-foreground">{vendor.store?.store_name || vendor.business_name}</p>
                  
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <Badge variant={getStatusVariant(vendorStatus)} className="capitalize">
                      {vendorStatus}
                    </Badge>
                    
                    {typeof vendor.rating === 'number' && vendor.rating > 0 && (
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
                  <span className="font-medium">{formatDate(vendor.created_at)}</span>
                </div>
                {vendor.approved_at && (
                  <div className="w-full flex justify-between text-sm">
                    <span className="text-muted-foreground">Approved:</span>
                    <span className="font-medium">{formatDate(vendor.approved_at)}</span>
                  </div>
                )}
              </CardFooter>
            </Card>

            {/* Verification Documents */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Verification Documents
                </CardTitle>
                <CardDescription>
                  Documents submitted for verification
                </CardDescription>
              </CardHeader>
              <CardContent>
                {vendorDocuments.length === 0 ? (
                  <div className="p-4 text-center">
                    <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                    <p className="text-sm text-muted-foreground">No documents uploaded</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {vendorDocuments.map((doc, index) => (
                      <VerificationDocumentCard
                        key={doc.document_id || doc.id || index}
                        document={{
                          // Support both ID field naming conventions
                          document_id: doc.document_id || doc.id,
                          
                          // Important: preserve original document_type without defaulting
                          document_type: doc.document_type,
                          
                          // Support both URL field naming conventions
                          document_url: doc.document_url || doc.file_url,
                          
                          // Support both file name field naming conventions
                          file_name: doc.file_name || doc.document_name,
                          
                          // Support both expiry date field naming conventions
                          expires_at: doc.expires_at || doc.expiry_date,
                          
                          verification_status: doc.verification_status as "pending" | "approved" | "rejected",
                          rejection_reason: doc.rejection_reason,
                          submitted_at: doc.submitted_at,
                          verified_at: doc.verified_at
                        }}
                        onApprove={async (documentId) => {
                          await handleDocumentApprove(documentId);
                          return Promise.resolve();
                        }}
                        onReject={async (documentId, reason) => {
                          await handleDocumentReject(documentId, reason);
                          return Promise.resolve();
                        }}
                        showActions={doc.verification_status !== "approved"}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Revenue Summary Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="h-5 w-5 mr-2" />
                  Revenue Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <ShoppingCart className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-sm">Total Orders</span>
                    </div>
                    <span className="font-medium">0</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-sm">Total Revenue</span>
                    </div>
                    <span className="font-medium">$0.00</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Percent className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-sm">Commission</span>
                    </div>
                    <span className="font-medium">{vendor.commission_rate || 0}%</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <TrendingUp className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-sm">This Month</span>
                    </div>
                    <span className="font-medium">$0.00</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
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
                      variant="success"
                      className="w-full bg-green-600 hover:bg-green-700"
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
                      variant="destructive"
                      className="w-full"
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
                    variant="success"
                    className="w-full bg-green-600 hover:bg-green-700"
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
                    variant={vendor.is_active ? "destructive" : "success"}
                    className={`w-full ${!vendor.is_active ? "bg-green-600 hover:bg-green-700" : ""}`}
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
                      <span className="font-semibold">Rejection Reason:</span> {rejectionReason}
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
        </div>
      </div>
      
      {/* Image Preview Modal */}
      <FilePreviewModal
        src={previewImage || ""}
        alt="Document Preview"
        isOpen={!!previewImage}
        onClose={() => setPreviewImage(null)}
      />
      
      {/* Document Verification Dialog */}
      <DocumentVerificationDialog
        isOpen={!!verificationDoc}
        onClose={() => setVerificationDoc(null)}
        documentId={verificationDoc?.id || ""}
        documentType={verificationDoc?.type || ""}
        documentName={verificationDoc?.name || ""}
        documentUrl={verificationDoc?.url || ""}
        expiryDate={verificationDoc?.expiryDate}
        onApprove={handleDocumentApprove}
        onReject={handleDocumentReject}
        onPreview={handlePreviewDocument}
      />
    </div>
  );
}
