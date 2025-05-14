"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { use } from "react";
import {
  ArrowLeft,
  Check,
  X,
  Edit,
  Store,
  Phone,
  Mail,
  Globe,
  MapPin,
  FileText,
  CreditCard,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Spinner } from "@/components/ui/spinner";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { ErrorCard } from "@/components/ui/error-card";

import { useVendorStore } from "@/features/vendors/store";
import { Vendor, VerificationDocument } from "@/features/vendors/types";

interface VendorPageProps {
  params: {
    id: string;
  };
}

export default function VendorPage({ params }: VendorPageProps) {
  const router = useRouter();
  const unwrappedParams = use(params);
  const id = unwrappedParams.id;
  const { vendor, loading, storeError, fetchVendor, updateVendorStatus } =
    useVendorStore();
  const [isUpdating, setIsUpdating] = useState(false);

  // Define tenant headers
  const tenantHeaders = {
    "X-Tenant-ID": "4c56d0c3-55d9-495b-ae26-0d922d430a42",
  };

  // Use ref to prevent duplicate API calls
  const fetchRequestRef = useRef(false);

  useEffect(() => {
    // Only fetch if not already fetched
    if (!fetchRequestRef.current) {
      fetchRequestRef.current = true;
      fetchVendor(id, tenantHeaders);
    }
  }, [id, fetchVendor]);

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "active":
        return "default";
      case "pending":
        return "secondary";
      case "rejected":
        return "destructive";
      default:
        return "secondary";
    }
  };

  // Helper to safely access vendor properties with appropriate fallbacks
  const vendorStatus =
    vendor?.verification_status || vendor?.is_active ? "active" : "pending";
  const vendorEmail = vendor?.contact_email || vendor?.email || "";
  const vendorLogo =
    vendor?.store?.branding?.logo_url || vendor?.logo || "/placeholder.svg";
  const vendorDocuments = vendor?.verification_documents || [];

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

  if (loading) {
    return <Spinner />;
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
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/dashboard/vendors")}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {vendor.business_name}
            </h1>
            <div className="flex items-center gap-2">
              <Badge variant={getStatusVariant(vendorStatus)}>
                {vendorStatus.charAt(0).toUpperCase() + vendorStatus.slice(1)}
              </Badge>
              <p className="text-sm text-muted-foreground">
                Joined on{" "}
                {format(
                  new Date(vendor.created_at || new Date()),
                  "MMMM d, yyyy"
                )}
              </p>
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
          {vendor.status === "active" ? (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleStatusChange("pending")}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <Spinner className="mr-2 h-4 w-4" />
              ) : (
                <X className="mr-2 h-4 w-4" />
              )}
              Deactivate
            </Button>
          ) : (
            <Button
              variant="default"
              size="sm"
              onClick={() => handleStatusChange("approved")}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <Spinner className="mr-2 h-4 w-4" />
              ) : (
                <Check className="mr-2 h-4 w-4" />
              )}
              Activate
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex-1 overflow-auto space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main details */}
          <div className="md:col-span-2 space-y-6">
            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Store className="h-5 w-5 mr-2" />
                  Store Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium mb-1">Business Name</p>
                    <p className="text-sm">{vendor.business_name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1">Display Name</p>
                    <p className="text-sm">{vendor.display_name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1">Store Name</p>
                    <p className="text-sm">
                      {vendor.store?.store_name || "Not specified"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1">Tax ID</p>
                    <p className="text-sm">{vendor.tax_id || "Not provided"}</p>
                  </div>
                </div>

                <Separator />

                {/* Contact Information */}
                <div>
                  <h3 className="text-sm font-medium mb-3">
                    Contact Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                      <p className="text-sm">
                        {vendor.contact_phone || "No phone number"}
                      </p>
                    </div>
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                      <p className="text-sm">
                        {vendorEmail || "No email address"}
                      </p>
                    </div>
                    {vendor.website && (
                      <div className="flex items-center">
                        <Globe className="h-4 w-4 mr-2 text-muted-foreground" />
                        <p className="text-sm">{vendor.website}</p>
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Address Information */}
                <div>
                  <h3 className="text-sm font-medium mb-3">Address</h3>
                  <div className="flex items-start">
                    <MapPin className="h-4 w-4 mr-2 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm">
                        {vendor.address?.street || "No street address"}
                      </p>
                      <p className="text-sm">
                        {[
                          vendor.address?.city,
                          vendor.address?.state,
                          vendor.address?.postal_code,
                          vendor.address?.country,
                        ]
                          .filter(Boolean)
                          .join(", ") || "No address details"}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Banking Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="h-5 w-5 mr-2" />
                  Banking Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium mb-1">Bank Name</p>
                    <p className="text-sm">
                      {vendor.bank_account?.bank_name || "Not provided"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1">Account Name</p>
                    <p className="text-sm">
                      {vendor.bank_account?.account_name || "Not provided"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1">Account Number</p>
                    <p className="text-sm">
                      {vendor.bank_account?.account_number || "Not provided"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1">Swift Code</p>
                    <p className="text-sm">
                      {vendor.bank_account?.swift_code || "Not provided"}
                    </p>
                  </div>
                </div>

                <Separator />

                <div>
                  <p className="text-sm font-medium mb-2">Banking Documents</p>
                  {vendorDocuments.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {vendorDocuments.map((doc, index) => (
                        <div key={index} className="space-y-2">
                          <div className="h-32 bg-muted rounded-md overflow-hidden">
                            <img
                              src={doc.url}
                              alt={doc.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <p className="text-xs text-muted-foreground truncate">
                            {doc.name}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No banking documents uploaded.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Profile */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center">
                  <Avatar className="h-20 w-20 mb-4">
                    {vendorLogo ? (
                      <AvatarImage
                        src={vendorLogo}
                        alt={vendor.business_name}
                      />
                    ) : (
                      <AvatarFallback>
                        {vendor.business_name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <h3 className="text-lg font-semibold">
                    {vendor.display_name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {vendor.store?.store_name || "No store"}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Verification Documents */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-sm">
                  <FileText className="h-4 w-4 mr-2" />
                  Verification Documents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {vendorDocuments.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No verification documents uploaded.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 gap-4">
                      {vendorDocuments.map((doc, index) => (
                        <div key={index} className="space-y-2">
                          <div className="h-32 bg-muted rounded-md overflow-hidden">
                            <img
                              src={doc.document_url}
                              alt={doc.document_type}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <p className="text-xs text-muted-foreground truncate">
                            {doc.document_type}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
