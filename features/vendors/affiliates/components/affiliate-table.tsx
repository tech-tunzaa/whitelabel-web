import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Eye, FileEdit, Check, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Affiliate } from "../types";
import { useAffiliateStore } from "../store";
import { useUserStore as useAuthUserStore } from "@/features/auth/stores/user-store"; // Aliasing to avoid naming conflict if useUserStore is already used for affiliate's own store

interface AffiliateTableProps {
  filterStatus?: string;
  search?: string;
  vendorId?: string;
  onStatusChange?: (id: string, status: string, reason?: string) => Promise<void>;
}

export function AffiliateTable({ filterStatus, search, vendorId, onStatusChange }: AffiliateTableProps) {
  const router = useRouter();
  const { affiliates, loading, fetchAffiliates } = useAffiliateStore();
  const { user } = useAuthUserStore();
  const tenantId = user?.tenant_id; // Assuming tenant_id exists on the User object from useUserStore
  const [currentPage, setCurrentPage] = useState(1);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchData = async () => {
      const filters: {
        skip?: number;
        limit?: number;
        search?: string;
        verification_status?: string;
        vendor_id?: string;
      } = {
        skip: (currentPage - 1) * itemsPerPage,
        limit: itemsPerPage,
      };

      if (search) {
        filters.search = search;
      }

      if (filterStatus && filterStatus !== "all") {
        filters.status = filterStatus; // Changed from verification_status to status
      }

      if (vendorId) {
        filters.vendor_id = vendorId;
      }

      const headers: Record<string, string> = {};
      if (tenantId) {
        headers['X-Tenant-ID'] = tenantId;
      } else {
        console.warn('AffiliateTable: Tenant ID is missing. API call may be incomplete.');
        // Optionally, you might prevent the fetchAffiliates call if tenantId is strictly required
      }
      await fetchAffiliates(filters, headers);
    };

    fetchData();
  }, [fetchAffiliates, currentPage, filterStatus, search, vendorId, tenantId]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline">Pending</Badge>;
      case "approved":
        return <Badge variant="success">Approved</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleView = (id: string) => {
    router.push(`/dashboard/vendors/affiliates/${id}`);
  };

  const handleEdit = (id: string) => {
    router.push(`/dashboard/vendors/affiliates/edit/${id}`);
  };

  const handleStatusChange = async (id: string, status: "approved" | "rejected") => {
    if (!onStatusChange) return;
    try {
      setProcessingId(id);
      let reason: string | undefined;
      if (status === "rejected") {
        reason = window.prompt("Enter rejection reason", "Invalid information") || "Rejected by admin";
      }
      await onStatusChange(id, status, reason);
    } catch (err) {
      console.error("Failed to update affiliate status", err);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Affiliate Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : affiliates.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center">
                  No affiliates found.
                </TableCell>
              </TableRow>
            ) : (
              affiliates.map((affiliate) => (
                <TableRow key={affiliate.id}> {/* Changed key to affiliate.id */}
                  <TableCell className="font-medium">
                    {affiliate.name} {/* Changed to affiliate.name */}
                  </TableCell>
                  <TableCell>{affiliate.email}</TableCell> {/* Changed to affiliate.email */}
                  <TableCell>{affiliate.phone}</TableCell> {/* Changed to affiliate.phone */}
                  <TableCell>
                    {getStatusBadge(affiliate.status)} {/* Changed to affiliate.status */}
                  </TableCell>
                  <TableCell>{formatDate(affiliate.created_at)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleView(affiliate.id)}>
                          <Eye className="mr-2 h-4 w-4" /> View
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(affiliate.id)}>
                          <FileEdit className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        {affiliate.status === "pending" && (
                          <>
                            <DropdownMenuItem disabled={processingId === affiliate.id} onClick={() => handleStatusChange(affiliate.id, "approved")}> 
                              <Check className="mr-2 h-4 w-4" /> Approve
                            </DropdownMenuItem>
                            <DropdownMenuItem disabled={processingId === affiliate.id} onClick={() => handleStatusChange(affiliate.id, "rejected")}> 
                              <X className="mr-2 h-4 w-4" /> Reject
                            </DropdownMenuItem>
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
      </div>

      {/* Pagination controls */}
      <div className="flex items-center justify-end space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1 || loading}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage((prev) => prev + 1)}
          disabled={affiliates.length < itemsPerPage || loading}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
