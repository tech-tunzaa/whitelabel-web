"use client";

import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
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
  Info,
  History,
  CalendarDays,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Spinner } from "@/components/ui/spinner";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { ErrorCard } from "@/components/ui/error-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useAffiliateStore } from "@/features/affiliates/store";
import { Affiliate, VerificationDocument, VendorPartnerRequest } from "@/features/affiliates/types";
import { AffiliateVerificationDialog } from "@/features/affiliates/components";
import { FilePreviewModal } from "@/components/ui/file-preview-modal";
import { DocumentVerificationDialog } from "@/components/ui/document-verification-dialog";
import { VerificationDocumentCard } from "@/components/ui/verification-document-card";
import { isImageFile, isPdfFile } from "@/lib/services/file-upload.service";
import { formatCurrency } from "@/lib/utils";

function PageSkeleton() {
  return (
    <div className="flex flex-col h-full p-4 md:p-6 gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-1">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-24 rounded-md" />
          <Skeleton className="h-9 w-24 rounded-md" />
        </div>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader><Skeleton className="h-6 w-1/3" /></CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </CardContent>
          </Card>
        </div>
        <div className="space-y-6">
          <Card>
            <CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function AffiliateDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { data: session } = useSession();
  const tenantId = (session?.user as any)?.tenant_id; // TODO: Properly type NextAuth session user

  const id = params.id; // Access id from the hook's result

  // Destructure store state and actions
  const {
    affiliate,
    loading,
    storeError,
    fetchAffiliate,
    updateAffiliateStatus,
    vendorPartnerRequests,
    vendorPartnerRequestsLoading,
    vendorPartnerRequestsError,
    fetchVendorPartnerRequests,
  } = useAffiliateStore();




  // UI States
  const [activeTab, setActiveTab] = useState("overview");
  const [dialogAction, setDialogAction] = useState<"approve" | "reject" | null>(
    null
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Document and Verification States
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewType, setPreviewType] = useState<"image" | "pdf" | null>(null);
  const [verificationDoc, setVerificationDoc] =
    useState<VerificationDocument | null>(null);
  const [showVerificationDialog, setShowVerificationDialog] = useState(false);


  // Define tenant headers
  const tenantHeaders = {
    "X-Tenant-ID": tenantId,
  };

  // Effect for fetching affiliate data using the store's method
  // This ensures that we use the memoized version of the fetch function
  // and correctly update component state based on store changes.
  useEffect(() => {
    if (id && tenantId) {
      fetchAffiliate(id as string, { 'x-tenant-id': tenantId });
    } else {
      // Optionally, you might want to keep a log or set an error state if id or tenantId is missing
      // For now, removing the console.warn as requested.
    }

    // Fetch vendor partner requests
    if (id && tenantId) {
      fetchVendorPartnerRequests(id as string, { skip: 0, limit: 10 }, { 'x-tenant-id': tenantId });
    }
  }, [id, tenantId, fetchAffiliate, fetchVendorPartnerRequests]);

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
        if (typeof window !== "undefined") {
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
      fetchAffiliate(id, tenantHeaders);
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
    setDialogAction("approve");
    setIsDialogOpen(true);
  };

  const handleReject = () => {
    setDialogAction("reject");
    setIsDialogOpen(true);
  };

  const handleConfirmAction = async (reason?: string) => {
    try {
      setIsUpdating(true);
      if (dialogAction === "approve") {
        await updateAffiliateStatus(id, "approved", tenantHeaders);
        toast.success("Affiliate approved successfully");
      } else if (dialogAction === "reject") {
        await updateAffiliateStatus(id, "rejected", tenantHeaders, reason);
        toast.success("Affiliate rejected successfully");
      }

      // Refresh the data
      fetchAffiliate(id, tenantHeaders);
    } catch (error) {
      console.error(`Error ${dialogAction}ing affiliate:`, error);
      toast.error(`Failed to ${dialogAction} affiliate`);
    } finally {
      setIsUpdating(false);
      setIsDialogOpen(false);
      setDialogAction(null);
    }
  };

  const handleEdit = () => {
    router.push(`/dashboard/affiliates/${id}/edit`);
  };

  const handleRefresh = () => {
    // Refresh affiliate details
    fetchAffiliate(id, tenantHeaders);

    // TODO: refresh vendorPartners as well
  };

  // Helper functions
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge
            variant="outline"
            className="text-amber-500 border-amber-200 bg-amber-50"
          >
            Pending
          </Badge>
        );
      case "approved":
        return (
          <Badge
            variant="outline"
            className="text-green-500 border-green-200 bg-green-50"
          >
            Approved
          </Badge>
        );
      case "rejected":
        return (
          <Badge
            variant="outline"
            className="text-red-500 border-red-200 bg-red-50"
          >
            Rejected
          </Badge>
        );
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
    if (!date) return "N/A";

    const dateObj = typeof date === "string" ? new Date(date) : date;

    if (isNaN(dateObj.getTime())) {
      return "Invalid Date";
    }

    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };

    return new Intl.DateTimeFormat("en-US", options).format(dateObj);
  };

  if (loading) {
    return <Spinner />;
  }

  if (!affiliate && storeError) {
    console.log("Render case: Affiliate not found");
    return (
      <ErrorCard
        title="Affiliate Not Found"
        error={{
          status: "404",
          message: `The affiliate with ID "${id}" could not be found.`,
        }}
        buttonText="Go Back"
        buttonAction={() => router.back()}
        buttonIcon={ArrowLeft}
      />
    );
  }

  console.log("Render case: Rendering main content");
  // Main content for an existing affiliate
  return affiliate ? (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/dashboard/affiliates")}
            className="shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Button>

          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              {affiliate?.profile_image ? (
                <AvatarImage
                  src={affiliate?.profile_image}
                  alt={affiliate?.name}
                />
              ) : (
                <AvatarFallback style={{ backgroundColor: "#4f46e5" }}>
                  {getInitials(affiliate?.name || "W")}
                </AvatarFallback>
              )}
            </Avatar>

            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                {affiliate?.name}
              </h1>
              {affiliate?.website && (
                <p className="text-muted-foreground text-sm flex items-center gap-1">
                  <Globe className="h-3 w-3" />
                  <a
                    href={
                      affiliate.website.startsWith("http")
                        ? affiliate?.website
                        : `https://${affiliate.website}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline flex items-center"
                  >
                    {affiliate?.website}
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge
            variant={
              affiliate?.status === "approved"
                ? "default"
                : affiliate?.status === "rejected"
                ? "destructive"
                : "outline"
            }
            className={
              affiliate?.status === "approved"
                ? "bg-green-500 hover:bg-green-600 px-2 py-1"
                : affiliate?.status === "rejected"
                ? "px-2 py-1"
                : "text-amber-500 border-amber-200 bg-amber-50 px-2 py-1"
            }
          >
            {affiliate?.status === "approved"
              ? "Approved"
              : affiliate?.status === "rejected"
              ? "Rejected"
              : "Pending"}
          </Badge>

          <div className="flex items-center gap-2 ml-2">
            <Button variant="outline" size="sm" onClick={handleEdit}>
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
                  <StoreIcon className="h-4 w-4" /> Vendor Partners
                </TabsTrigger>
              </TabsList>

              <OverviewTab />
              <VendorsTab />

            </Tabs>
          </div>

          <Sidebar />
        </div>
      </div>

      <AffiliateVerificationDialog
        action={dialogAction}
        title={
          dialogAction === "approve" ? "Approve Affiliate" : "Reject Affiliate"
        }
        description={
          dialogAction === "approve"
            ? "Are you sure you want to approve this affiliate? This will allow them to operate on the platform."
            : "Are you sure you want to reject this affiliate? Please provide a reason for rejection."
        }
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onConfirm={handleConfirmAction}
        confirmLabel={dialogAction === "approve" ? "Approve" : "Reject"}
        withReason={dialogAction === "reject"}
      />
    </div>
  ) : null;

  function OverviewTab() {
    return (
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
                  {affiliate?.profile_image ? (
                    <AvatarImage
                      src={affiliate?.profile_image}
                      alt={affiliate?.name}
                    />
                  ) : (
                    <AvatarFallback className="text-lg">
                      {getInitials(affiliate?.name || "W")}
                    </AvatarFallback>
                  )}
                </Avatar>
                <h3 className="text-lg font-medium">
                  {affiliate?.name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {affiliate?.role || "Affiliate"}
                </p>
                {affiliate?.status && (
                  <Badge
                    variant="outline"
                    className={`mt-2 ${
                      affiliate?.status === "approved"
                        ? "text-green-600 border-green-200 bg-green-50"
                        : affiliate?.status === "rejected"
                        ? "text-red-600 border-red-200 bg-red-50"
                        : "text-amber-600 border-amber-200 bg-amber-50"
                    }`}
                  >
                    {affiliate?.status
                      .charAt(0)
                      .toUpperCase() +
                      affiliate?.status.slice(1)}
                  </Badge>
                )}
              </div>

              <Separator />

              <div className="space-y-3">
                {affiliate?.contact_email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <a
                      href={`mailto:${affiliate?.contact_email}`}
                      className="text-sm hover:underline"
                    >
                      {affiliate?.contact_email}
                    </a>
                  </div>
                )}

                {affiliate?.contact_phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <a
                      href={`tel:${affiliate?.contact_phone}`}
                      className="text-sm hover:underline"
                    >
                      {affiliate?.contact_phone}
                    </a>
                  </div>
                )}

                {affiliate?.city && affiliate?.country && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{`${affiliate?.city}, ${affiliate?.country}`}</span>
                  </div>
                )}

                {affiliate?.website && (
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <a
                      href={
                        affiliate?.website.startsWith("http")
                          ? affiliate?.website
                          : `https://${affiliate.website}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm hover:underline flex items-center gap-1"
                    >
                      {affiliate?.website}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                )}
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    Default Commission
                  </span>
                  <Badge variant="outline" className="font-normal">
                    {affiliate?.commission_rate
                      ? `${affiliate?.commission_rate}%`
                      : "N/A"}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-muted-foreground" />
                    Joined
                  </span>
                  <span className="text-sm">
                    {affiliate?.created_at
                      ? formatDate(affiliate?.created_at)
                      : "N/A"}
                  </span>
                </div>

                {affiliate?.updated_at && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium flex items-center gap-2">
                      <History className="h-4 w-4 text-muted-foreground" />
                      Last Updated
                    </span>
                    <span className="text-sm">
                      {formatDate(affiliate.updated_at)}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    Affiliate ID
                  </span>
                  <span className="text-sm font-mono">
                    {affiliate?.affiliate_id || affiliate?.id || "N/A"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main Content - Details */}
          <div className="col-span-2 space-y-6">
            {/* Biography Card */}
            {affiliate?.bio && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5 text-primary" />
                  Biography
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {affiliate.bio}
                </p>
              </CardContent>
            </Card>
            )}

            {/* Bank Account Details */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-primary" />
                  Banking Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                {affiliate?.bank_account ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium">Bank Name</p>
                        <p className="text-sm">
                          {affiliate?.bank_account.bank_name}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm font-medium">
                          Account Name
                        </p>
                        <p className="text-sm">
                          {affiliate?.bank_account.account_name}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm font-medium">
                          Account Number
                        </p>
                        <p className="text-sm font-mono">
                          {affiliate?.bank_account.account_number}
                        </p>
                      </div>

                      {affiliate?.bank_account.swift_bic && (
                        <div>
                          <p className="text-sm font-medium">
                            SWIFT/BIC
                          </p>
                          <p className="text-sm font-mono">
                            {affiliate?.bank_account.swift_bic}
                          </p>
                        </div>
                      )}

                      {affiliate?.bank_account.branch_code && (
                        <div>
                          <p className="text-sm font-medium">
                            Branch Code
                          </p>
                          <p className="text-sm font-mono">
                            {affiliate?.bank_account.branch_code}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No banking information provided.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </TabsContent>
    );
  }

  function VendorsTab() {
    const activePartners = vendorPartnerRequests.filter(p => p.status === 'approved' || p.status === 'active');

    const renderContent = () => {
      if (vendorPartnerRequestsLoading) {
        return (
          <div className="flex items-center justify-center py-10">
            <Spinner />
          </div>
        );
      }

      if (vendorPartnerRequestsError) {
        return (
          <ErrorCard
            title="Failed to Load Partnerships"
            error={vendorPartnerRequestsError}
            buttonText="Retry"
            buttonAction={() => fetchVendorPartnerRequests(id as string, { skip: 0, limit: 10 }, { 'x-tenant-id': tenantId })}
            buttonIcon={<RefreshCw className="h-4 w-4 mr-2" />}
          />
        );
      }

      if (activePartners.length === 0) {
        return (
          <div className="flex flex-col items-center justify-center text-center py-10">
            <Building className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">No Partnerships</h3>
            <p className="text-sm text-muted-foreground mt-1">
              This affiliate does not have any vendor partnerships yet.
            </p>
          </div>
        );
      }

      return (
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {activePartners.map((partner) => (
            <li key={partner.vendor_id} className="py-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="h-10 w-10 border">
                  {/* Assuming vendor_name exists. Add a fallback. */}
                  <AvatarFallback>{partner.vendor_name?.charAt(0).toUpperCase() || 'V'}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-sm text-gray-900 dark:text-gray-100">{partner.vendor_name}</p>
                  <p className="text-xs text-muted-foreground">
                    Joined: {format(new Date(partner.joined_at), "PPP")}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-sm text-green-600">{partner.commission_rate}%</p>
                <p className="text-xs text-muted-foreground">Commission</p>
              </div>
            </li>
          ))}
        </ul>
      );
    };

    return (
      <TabsContent value="vendors" className="space-y-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <StoreIcon className="h-5 w-5 text-primary" />
              Active Vendor Partners
            </CardTitle>
            <CardDescription>
              Vendors this affiliate is actively partnered with.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {renderContent()}
          </CardContent>
        </Card>
      </TabsContent>
    );
  }

  function Sidebar() {
    return (
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
            {affiliate?.verification_documents &&
            affiliate?.verification_documents.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {affiliate?.verification_documents.map(
                  (document, index) => (
                    <VerificationDocumentCard
                      key={index}
                      document={{
                        id:
                          document.id ||
                          document.document_id ||
                          `doc-${index}`,
                        document_type: document.document_type,
                        document_url: document.document_url,
                        status:
                          document.status || "pending",
                        file_name: document.file_name,
                        expires_at: document.expires_at,
                        rejection_reason: document.rejection_reason,
                      }}
                      onPreview={() => handleDocumentPreview(document)}
                      onVerify={() => handleDocumentVerification(document)}
                      showVerificationControls={
                        affiliate?.status === "pending"
                      }
                    />
                  )
                )}
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
            {affiliate?.status === "pending" && (
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

            {affiliate?.status === "approved" && (
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

            {affiliate?.status === "rejected" && (
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
                  <RefreshCw
                    className={`h-4 w-4 mr-2 ${
                      loading ? "animate-spin" : ""
                    }`}
                  />{" "}
                  Refresh Data
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }
}
