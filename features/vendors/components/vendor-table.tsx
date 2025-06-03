"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Check, Edit, Eye, MoreHorizontal, RefreshCw, XCircle, AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Spinner } from "@/components/ui/spinner";

import { VendorListResponse } from "../types";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface VendorTableProps {
  vendors: VendorListResponse["items"];
  onVendorClick: (vendor: VendorListResponse["items"][0]) => void;
  onStatusChange?: (vendorId: string, status: string, rejectionReason?: string) => Promise<void>;
  activeTab?: string;
}

export function VendorTable({
  vendors,
  onVendorClick,
  onStatusChange,
  activeTab = "all"
}: VendorTableProps) {
  const router = useRouter();
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectVendorId, setRejectVendorId] = useState<string | null>(null);
  const [rejectionType, setRejectionType] = useState("incomplete_documents");
  const [rejectionReason, setRejectionReason] = useState("");
  const [customReason, setCustomReason] = useState("");

  // Filter vendors by various status combinations
  const allApprovedVendors = vendors.filter(
    (vendor) => vendor.verification_status === "approved"
  );
  const activeVendors = vendors.filter(
    (vendor) => vendor.verification_status === "approved" && vendor.is_active
  );
  const inactiveVendors = vendors.filter(
    (vendor) => vendor.verification_status === "approved" && !vendor.is_active
  );
  const pendingVendors = vendors.filter(
    (vendor) => vendor.verification_status === "pending"
  );
  const rejectedVendors = vendors.filter(
    (vendor) => vendor.verification_status === "rejected"
  );

  // Helper function to handle status change with loading state
  const handleStatusChange = async (
    vendorId: string | undefined,
    action: 'approve' | 'reject' | 'activate' | 'deactivate'
  ) => {
    if (!onStatusChange || !vendorId) return; // Skip if no ID or handler

    // For rejection, show the dialog instead of immediate action
    if (action === 'reject') {
      setRejectVendorId(vendorId);
      setRejectionType("incomplete_documents");
      setCustomReason("");
      setRejectionReason("");
      setShowRejectDialog(true);
      return;
    }

    try {
      setProcessingId(vendorId);
      
      // Map action to the right status change according to API expectations
      let status;
      let isActive;
      
      switch(action) {
        case 'approve':
          // API expects: status: "approved", is_active: false
          status = 'approved';
          break;
        case 'activate':
          // API expects: is_active: true
          status = 'active'; // This will be mapped to is_active: true in the store
          break;
        case 'deactivate':
          // API expects: is_active: false
          status = 'inactive'; // This will be mapped to is_active: false in the store
          break;
        default:
          return;
      }
      
      await onStatusChange(vendorId, status);
    } catch (error) {
      console.error("Error changing vendor status:", error);
    } finally {
      setProcessingId(null);
    }
  };

  // Handle the rejection confirmation
  const handleRejectConfirm = async () => {
    if (!rejectVendorId || !onStatusChange) return;
    
    try {
      setProcessingId(rejectVendorId);
      
      // Prepare rejection reason
      let finalReason = rejectionType === "other" 
        ? customReason 
        : getRejectionReasonText(rejectionType);
      
      setRejectionReason(finalReason);
      
      // Pass the rejection reason to the onStatusChange function
      // API expects: status: "rejected", rejection_reason: "....", is_active: false
      await onStatusChange(rejectVendorId, "rejected", finalReason);
      setShowRejectDialog(false);
    } catch (error) {
      console.error("Error rejecting vendor:", error);
    } finally {
      setProcessingId(null);
    }
  };

  // Helper to get rejection reason text based on type
  const getRejectionReasonText = (type: string) => {
    switch (type) {
      case "incomplete_documents":
        return "Incomplete or missing verification documents";
      case "invalid_documents":
        return "Invalid or expired verification documents";
      case "business_information":
        return "Inconsistent business information";
      case "policy_violation":
        return "Violation of platform policies";
      default:
        return customReason;
    }
  };

  // Helper function to get badge variant based on status
  const getStatusBadgeVariant = (status: string, isActive: boolean = true) => {
    // If the vendor is verified but not active, show special status
    if (status === "approved" && !isActive) {
      return "outline";
    }

    switch (status) {
      case "approved":
        return "success";
      case "pending":
        return "warning";
      case "rejected":
        return "destructive";
      default:
        return "secondary";
    }
  };

  // Helper to get displayed status text
  const getStatusDisplayText = (vendor: any) => {
    if (vendor.verification_status === "approved") {
      return vendor.is_active ? "Active" : "Inactive";
    } else if (vendor.verification_status === "rejected") {
      return "Rejected";
    } else {
      return "Pending";
    }
  };

  // Format date helper with consistent formatting to prevent hydration errors
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "N/A";

    try {
      // Check if the date is in DD/MM/YYYY format
      if (dateString.includes("/")) {
        const [day, month, year] = dateString.split("/");
        return format(new Date(`${year}-${month}-${day}`), "MMM d, yyyy");
      }

      return format(new Date(dateString), "MMM d, yyyy");
    } catch (error) {
      return "Invalid date";
    }
  };

  // Render table based on active tab
  const renderTable = () => {
    switch (activeTab) {
      case "active":
        return renderVendorTable(activeVendors);
      case "inactive":
        return renderVendorTable(inactiveVendors);
      case "pending":
        return renderVendorTable(pendingVendors);
      case "rejected":
        return renderVendorTable(rejectedVendors);
      case "all":
      default:
        return renderVendorTable(vendors);
    }
  };

  // Generic vendor table renderer
  const renderVendorTable = (vendorList: VendorListResponse["items"]) => {
    return (
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Business</TableHead>
                <TableHead className="hidden md:table-cell">Email</TableHead>
                <TableHead className="hidden md:table-cell">Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Registered</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vendorList.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-6 text-muted-foreground"
                  >
                    No vendors found
                  </TableCell>
                </TableRow>
              ) : (
                vendorList.map((vendor, index) => (
                  <TableRow
                    key={vendor.vendor_id || `vendor-${index}`}
                    onClick={() => onVendorClick(vendor)}
                    className="cursor-pointer"
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src="/placeholder.svg"
                            alt={vendor.business_name}
                          />
                          <AvatarFallback>
                            {vendor.business_name
                              ?.substring(0, 2)
                              .toUpperCase() || "VD"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div>{vendor.business_name}</div>
                          <div className="text-xs text-muted-foreground md:hidden">
                            {vendor.contact_email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {vendor.contact_email}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {"N/A"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={getStatusBadgeVariant(
                          vendor.verification_status || "pending",
                          vendor.is_active
                        ) as any}
                        className={`${
                          vendor.verification_status === "approved" && vendor.is_active
                            ? "bg-green-500 hover:bg-green-600 text-white"
                            : vendor.verification_status === "approved" && !vendor.is_active
                            ? "bg-slate-200 text-slate-800 border-slate-400"
                            : vendor.verification_status === "pending"
                            ? "bg-amber-500 hover:bg-amber-600 text-white"
                            : vendor.verification_status === "rejected"
                            ? "bg-red-500 hover:bg-red-600 text-white"
                            : ""
                        }`}
                      >
                        {getStatusDisplayText(vendor)}
                      </Badge>
                      {vendor.verification_status === "rejected" && vendor.rejection_reason && (
                        <div className="hidden group-hover:block absolute mt-1 bg-white p-2 rounded shadow-md text-xs max-w-xs z-10">
                          {vendor.rejection_reason}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {formatDate(vendor.created_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(
                                `/dashboard/vendors/${vendor.vendor_id}`
                              );
                            }}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(
                                `/dashboard/vendors/${vendor.vendor_id}/edit`
                              );
                            }}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          
                          <DropdownMenuSeparator />
                          
                          {/* Status-specific actions */}
                          {onStatusChange && (
                            <>
                              {/* For pending vendors */}
                              {vendor.verification_status === "pending" && (
                                <>
                                  <DropdownMenuItem 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleStatusChange(
                                        vendor.vendor_id,
                                        "approve"
                                      );
                                    }}
                                    disabled={processingId === vendor.vendor_id}
                                  >
                                    {processingId === vendor.vendor_id ? (
                                      <Spinner size="sm" className="mr-2 h-4 w-4" />
                                    ) : (
                                      <Check className="h-4 w-4 mr-2" />
                                    )}
                                    Approve
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleStatusChange(
                                        vendor.vendor_id,
                                        "reject"
                                      );
                                    }}
                                    disabled={processingId === vendor.vendor_id}
                                  >
                                    {processingId === vendor.vendor_id ? (
                                      <Spinner size="sm" className="mr-2 h-4 w-4" />
                                    ) : (
                                      <XCircle className="h-4 w-4 mr-2" />
                                    )}
                                    Reject
                                  </DropdownMenuItem>
                                </>
                              )}
                              
                              {/* For rejected vendors */}
                              {vendor.verification_status === "rejected" && (
                                <DropdownMenuItem 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleStatusChange(
                                      vendor.vendor_id,
                                      "approve"
                                    );
                                  }}
                                  disabled={processingId === vendor.vendor_id}
                                >
                                  {processingId === vendor.vendor_id ? (
                                    <Spinner size="sm" className="mr-2 h-4 w-4" />
                                  ) : (
                                    <RefreshCw className="h-4 w-4 mr-2" />
                                  )}
                                  Reconsider
                                </DropdownMenuItem>
                              )}
                              
                              {/* For approved vendors */}
                              {vendor.verification_status === "approved" && (
                                <DropdownMenuItem 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleStatusChange(
                                      vendor.vendor_id,
                                      vendor.is_active ? "deactivate" : "activate"
                                    );
                                  }}
                                  disabled={processingId === vendor.vendor_id}
                                >
                                  {processingId === vendor.vendor_id ? (
                                    <Spinner size="sm" className="mr-2 h-4 w-4" />
                                  ) : vendor.is_active ? (
                                    <XCircle className="h-4 w-4 mr-2" />
                                  ) : (
                                    <Check className="h-4 w-4 mr-2" />
                                  )}
                                  {vendor.is_active ? "Deactivate" : "Activate"}
                                </DropdownMenuItem>
                              )}
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-4">
      {renderTable()}

      {/* Rejection Dialog */}
      <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Vendor</AlertDialogTitle>
            <AlertDialogDescription>
              Please select a reason for rejecting this vendor. This will be visible to the vendor.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <RadioGroup value={rejectionType} onValueChange={setRejectionType} className="space-y-3">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="incomplete_documents" id="incomplete_documents" />
                <Label htmlFor="incomplete_documents" className="flex flex-col font-normal">
                  <div className="font-medium me-auto">Incomplete Documents</div>
                  <div className="text-sm text-muted-foreground">Required verification documents are missing</div>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="invalid_documents" id="invalid_documents" />
                <Label htmlFor="invalid_documents" className="flex flex-col font-normal">
                  <div className="font-medium me-auto">Invalid Documents</div>
                  <div className="text-sm text-muted-foreground">Provided documents are invalid or expired</div>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="business_information" id="business_information" />
                <Label htmlFor="business_information" className="flex flex-col font-normal">
                  <div className="font-medium me-auto">Business Information Issues</div>
                  <div className="text-sm text-muted-foreground">Inconsistent or incomplete business information</div>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="policy_violation" id="policy_violation" />
                <Label htmlFor="policy_violation" className="flex flex-col font-normal">
                  <div className="font-medium me-auto">Policy Violation</div>
                  <div className="text-sm text-muted-foreground">Vendor does not comply with platform policies</div>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="other" id="other" />
                <Label htmlFor="other" className="flex flex-col font-normal">
                  <div className="font-medium me-auto">Other Reason</div>
                  <div className="text-sm text-muted-foreground">Provide a custom reason for rejection</div>
                </Label>
              </div>
            </RadioGroup>

            {rejectionType === "other" && (
              <div className="mt-4">
                <Label htmlFor="custom-reason">Custom Reason</Label>
                <Textarea
                  id="custom-reason"
                  placeholder="Please provide a detailed reason for rejecting this vendor"
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  className="mt-1"
                />
              </div>
            )}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={processingId === rejectVendorId}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleRejectConfirm();
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={processingId === rejectVendorId || (rejectionType === "other" && !customReason.trim())}
            >
              {processingId === rejectVendorId ? (
                <Spinner size="sm" className="mr-2 h-4 w-4" />
              ) : (
                <AlertTriangle className="mr-2 h-4 w-4" />
              )}
              Reject Vendor
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
