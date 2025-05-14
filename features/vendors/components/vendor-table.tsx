"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Check, Edit, Eye, MoreHorizontal, XCircle } from "lucide-react";

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

  // Filter vendors by status - directly using API response fields
  const pendingVendors = vendors.filter(
    (vendor) => vendor.verification_status === "pending"
  );
  const activeVendors = vendors.filter(
    (vendor) => vendor.verification_status === "approved" && vendor.is_active
  );
  const rejectedVendors = vendors.filter(
    (vendor) => vendor.verification_status === "rejected"
  );

  // Helper function to handle status change with loading state
  const handleStatusChange = async (
    vendorId: string | undefined,
    newStatus: string
  ) => {
    if (!onStatusChange || !vendorId) return; // Skip if no ID or handler
    try {
      setProcessingId(vendorId);
      await onStatusChange(vendorId, newStatus);
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
  const getStatusDisplayText = (vendor: Vendor) => {
    if (vendor.verification_status === "approved" && vendor.is_active) {
      return "Active";
    } else if (vendor.verification_status === "approved" && !vendor.is_active) {
      return "Inactive";
    } else {
      return (
        vendor.verification_status?.charAt(0).toUpperCase() +
          vendor.verification_status?.slice(1) || "Pending"
      );
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
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="all">
            All Vendors
            <Badge variant="secondary" className="ml-2">
              {vendors.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="pending">
            Pending
            <Badge variant="secondary" className="ml-2">
              {pendingVendors.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="active">
            Active
            <Badge variant="secondary" className="ml-2">
              {activeVendors.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

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
                          {vendor.store?.store_name || "N/A"}
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
                              {onStatusChange && (
                                <>
                                  {(!vendor.is_active ||
                                    vendor.verification_status !==
                                      "approved") && (
                                    <DropdownMenuItem
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleStatusChange(
                                          vendor.vendor_id,
                                          "approved"
                                        );
                                      }}
                                      disabled={
                                        processingId === vendor.vendor_id
                                      }
                                    >
                                      {processingId === vendor.vendor_id ? (
                                        <Spinner size="sm" className="mr-2" />
                                      ) : (
                                        <Check className="h-4 w-4 mr-2" />
                                      )}
                                      Activate
                                    </DropdownMenuItem>
                                  )}
                                  {vendor.verification_status !== "pending" && (
                                    <DropdownMenuItem
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleStatusChange(
                                          vendor.vendor_id,
                                          "pending"
                                        );
                                      }}
                                      disabled={
                                        processingId === vendor.vendor_id
                                      }
                                    >
                                      {processingId === vendor.vendor_id ? (
                                        <Spinner size="sm" className="mr-2" />
                                      ) : (
                                        <XCircle className="h-4 w-4 mr-2" />
                                      )}
                                      Deactivate
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
        </TabsContent>

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
                            <Button
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStatusChange(vendor.vendor_id, "active");
                              }}
                              disabled={processingId === vendor.vendor_id}
                            >
                              {processingId === vendor.vendor_id ? (
                                <Spinner size="sm" className="mr-2" />
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
                                handleStatusChange(vendor.id, "pending");
                              }}
                              disabled={processingId === vendor.id}
                            >
                              {processingId === vendor.id ? (
                                <Spinner size="sm" className="mr-2" />
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
      </Tabs>
    </div>
  );
}
