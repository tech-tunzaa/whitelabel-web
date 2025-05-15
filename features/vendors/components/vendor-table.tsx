"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Check, Edit, Eye, MoreHorizontal, RefreshCw, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

interface VendorTableProps {
  vendors: VendorListResponse["items"];
  onVendorClick: (vendor: VendorListResponse["items"][0]) => void;
  onStatusChange?: (vendorId: string, status: string) => Promise<void>;
}

export function VendorTable({
  vendors,
  onVendorClick,
  onStatusChange,
}: VendorTableProps) {
  const router = useRouter();
  const [processingId, setProcessingId] = useState<string | null>(null);

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
    try {
      setProcessingId(vendorId);
      
      // Map action to the right status change
      let status;
      switch(action) {
        case 'approve':
          status = 'approved';
          break;
        case 'reject':
          status = 'rejected';
          break;
        case 'activate':
          is_active = true;
          break;
        case 'deactivate':
          is_active = false;
          break;
      }
      
      await onStatusChange(vendorId, status);
    } catch (error) {
      console.error("Error changing vendor status:", error);
    } finally {
      setProcessingId(null);
    }
  };

  // Helper function to get badge variant based on status
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "approved":
        return "default";
      case "pending":
        return "secondary";
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

  return (
    <div className="space-y-4">
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-5 mb-4">
          <TabsTrigger value="all">
            All Vendors
            <Badge variant="secondary" className="ml-2">
              {vendors.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="active">
            Active
            <Badge variant="secondary" className="ml-2">
              {activeVendors.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="inactive">
            Inactive
            <Badge variant="secondary" className="ml-2">
              {inactiveVendors.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="pending">
            Pending
            <Badge variant="secondary" className="ml-2">
              {pendingVendors.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Rejected
            <Badge variant="secondary" className="ml-2">
              {rejectedVendors.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <AllVendorsTab />
        <ActiveTab />
        <InactiveTab />
        <PendingTab />
        <RejectedTab />
      </Tabs>
    </div>
  );

  function AllVendorsTab() {
    return (
      <TabsContent value="all" className="space-y-4">
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Business</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Email
                  </TableHead>
                  <TableHead className="hidden md:table-cell">
                    Category
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Registered
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vendors.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-6 text-muted-foreground"
                    >
                      No vendors found
                    </TableCell>
                  </TableRow>
                ) : (
                  vendors.map((vendor, index) => (
                    <TableRow
                      key={vendor.vendor_id || `vendor-${index}`}
                      onClick={() => onVendorClick(vendor)}
                      className="cursor-pointer"
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src={
                                vendor.store?.branding?.logo_url ||
                                "/placeholder.svg"
                              }
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
                            vendor.verification_status || "pending"
                          )}
                        >
                          {getStatusDisplayText(vendor)}
                        </Badge>
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
                            {onStatusChange && vendor.verification_status === "approved" && (
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
                                  <Spinner size="sm" />
                                ) : vendor.is_active ? (
                                  <XCircle className="h-4 w-4 mr-2" />
                                ) : (
                                  <Check className="h-4 w-4 mr-2" />
                                )}
                                {vendor.is_active ? "Deactivate" : "Activate"}
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>
    );
  }

  function ActiveTab() {
    return (
      <TabsContent value="active" className="space-y-4">
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Business</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Email
                  </TableHead>
                  <TableHead className="hidden md:table-cell">
                    Category
                  </TableHead>
                  <TableHead className="hidden md:table-cell">
                    Registered
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeVendors.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-6 text-muted-foreground"
                    >
                      No active vendors found
                    </TableCell>
                  </TableRow>
                ) : (
                  activeVendors.map((vendor, index) => (
                    <TableRow
                      key={vendor.vendor_id || `active-${index}`}
                      onClick={() => onVendorClick(vendor)}
                      className="cursor-pointer"
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src={vendor.logo || "/placeholder.svg"}
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
                              {vendor.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {vendor.email}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {vendor.category || "N/A"}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {formatDate(vendor.created_at)}
                      </TableCell>
                      <TableCell className="text-right">
                        {onStatusChange && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStatusChange(vendor.id, "deactivate");
                            }}
                            disabled={processingId === vendor.id}
                          >
                            {processingId === vendor.id ? (
                              <Spinner size="sm" />
                            ) : (
                              <XCircle className="h-4 w-4 mr-2" />
                            )}
                            Deactivate
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>
    );
  }

  function InactiveTab() {
    return (
      <TabsContent value="inactive" className="space-y-4">
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Business</TableHead>
                  <TableHead className="hidden md:table-cell">Email</TableHead>
                  <TableHead className="hidden md:table-cell">Category</TableHead>
                  <TableHead className="hidden md:table-cell">Registered</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inactiveVendors.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-6 text-muted-foreground"
                    >
                      No inactive vendors found
                    </TableCell>
                  </TableRow>
                ) : (
                  inactiveVendors.map((vendor, index) => (
                    <TableRow
                      key={vendor.vendor_id || `inactive-${index}`}
                      onClick={() => onVendorClick(vendor)}
                      className="cursor-pointer"
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src={"/placeholder.svg"}
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
                      <TableCell className="hidden md:table-cell">
                        {formatDate(vendor.created_at)}
                      </TableCell>
                      <TableCell className="text-right">
                        {onStatusChange && (
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStatusChange(vendor.vendor_id, "activate");
                            }}
                            disabled={processingId === vendor.vendor_id}
                          >
                            {processingId === vendor.vendor_id ? (
                              <Spinner size="sm" />
                            ) : (
                              <Check className="h-4 w-4 mr-2" />
                            )}
                            Activate
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>
    );
  }

  function PendingTab() {
    return (
      <TabsContent value="pending" className="space-y-4">
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Business</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Email
                  </TableHead>
                  <TableHead className="hidden md:table-cell">
                    Category
                  </TableHead>
                  <TableHead className="hidden md:table-cell">
                    Registered
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingVendors.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-6 text-muted-foreground"
                    >
                      No pending vendors found
                    </TableCell>
                  </TableRow>
                ) : (
                  pendingVendors.map((vendor, index) => (
                    <TableRow
                      key={vendor.vendor_id || `pending-${index}`}
                      onClick={() => onVendorClick(vendor)}
                      className="cursor-pointer"
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src={vendor.logo || "/placeholder.svg"}
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
                              {vendor.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {vendor.email}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {vendor.category || "N/A"}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {formatDate(vendor.created_at)}
                      </TableCell>
                      <TableCell className="text-right">
                        {onStatusChange && (
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStatusChange(vendor.vendor_id, "approve");
                              }}
                              disabled={processingId === vendor.vendor_id}
                            >
                              {processingId === vendor.vendor_id ? (
                                <Spinner size="sm" />
                              ) : (
                                <Check className="h-4 w-4 mr-2" />
                              )}
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStatusChange(vendor.vendor_id, "reject");
                              }}
                              disabled={processingId === vendor.vendor_id}
                            >
                              {processingId === vendor.vendor_id ? (
                                <Spinner size="sm" />
                              ) : (
                                <XCircle className="h-4 w-4 mr-2" />
                              )}
                              Reject
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>
    );
  }

  function RejectedTab() {
    return (
      <TabsContent value="rejected" className="space-y-4">
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Business</TableHead>
                  <TableHead className="hidden md:table-cell">Email</TableHead>
                  <TableHead className="hidden md:table-cell">Category</TableHead>
                  <TableHead className="hidden md:table-cell">Registered</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rejectedVendors.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-6 text-muted-foreground"
                    >
                      No rejected vendors found
                    </TableCell>
                  </TableRow>
                ) : (
                  rejectedVendors.map((vendor, index) => (
                    <TableRow
                      key={vendor.vendor_id || `rejected-${index}`}
                      onClick={() => onVendorClick(vendor)}
                      className="cursor-pointer"
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src={"/placeholder.svg"}
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
                      <TableCell className="hidden md:table-cell">
                        {formatDate(vendor.created_at)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Re-submit as pending for reconsideration
                            handleStatusChange(vendor.vendor_id, "approve");
                          }}
                          disabled={processingId === vendor.vendor_id}
                        >
                          {processingId === vendor.vendor_id ? (
                            <Spinner size="sm" />
                          ) : (
                            <RefreshCw className="h-4 w-4 mr-2" />
                          )}
                          Reconsider
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>
    );
  }
}
