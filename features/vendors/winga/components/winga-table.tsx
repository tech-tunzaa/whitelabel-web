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
import { MoreHorizontal, Eye, FileEdit, Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Winga } from "../types";
import { useWingaStore } from "../store";

interface WingaTableProps {
  filterStatus?: string;
  search?: string;
  vendorId?: string;
}

export function WingaTable({ filterStatus, search, vendorId }: WingaTableProps) {
  const router = useRouter();
  const { wingas, loading, fetchWingas } = useWingaStore();
  const [currentPage, setCurrentPage] = useState(1);
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
        filters.verification_status = filterStatus;
      }

      if (vendorId) {
        filters.vendor_id = vendorId;
      }

      await fetchWingas(filters);
    };

    fetchData();
  }, [fetchWingas, currentPage, filterStatus, search, vendorId]);

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
    router.push(`/dashboard/vendors/winga/${id}`);
  };

  const handleEdit = (id: string) => {
    router.push(`/dashboard/vendors/winga/edit/${id}`);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Affiliate Name</TableHead>
              <TableHead>Contact Person</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Location</TableHead>
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
            ) : wingas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center">
                  No winga affiliates found.
                </TableCell>
              </TableRow>
            ) : (
              wingas.map((winga) => (
                <TableRow key={winga.winga_id}>
                  <TableCell className="font-medium">
                    {winga.affiliate_name}
                  </TableCell>
                  <TableCell>{winga.contact_person}</TableCell>
                  <TableCell>{winga.contact_email}</TableCell>
                  <TableCell>{winga.contact_phone}</TableCell>
                  <TableCell>
                    {winga.city}, {winga.country}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(winga.verification_status)}
                  </TableCell>
                  <TableCell>{formatDate(winga.created_at)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleView(winga.winga_id)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleEdit(winga.winga_id)}
                        >
                          <FileEdit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
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
          disabled={wingas.length < itemsPerPage || loading}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
