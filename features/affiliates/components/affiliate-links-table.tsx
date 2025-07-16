import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';
import { useRouter } from "next/navigation";
import { AffiliateLink } from "@/features/affiliates/types";
import Pagination from "@/components/ui/pagination";
import { Copy } from "@/components/ui/copy";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ExternalLink,
  Search,
} from "lucide-react";

interface AffiliateLinksTableProps {
  links: AffiliateLink[];
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  search: string;
  onSearchChange: (value: string) => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function AffiliateLinksTable({
  links = [],
  total,
  page,
  pageSize,
  onPageChange,
  search,
  onSearchChange,
  activeTab,
  onTabChange,
}: AffiliateLinksTableProps) {
  const router = useRouter();

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    try {
      return format(new Date(dateString), 'PPpp');
    } catch (e) {
      return 'Invalid date';
    }
  };

  const hasLinks = links && links.length > 0;

  return (
    <>
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center mb-2">
          <div className="relative w-[300px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search links..."
              className="pl-8"
              value={search}
              onChange={e => onSearchChange(e.target.value)}
            />
          </div>
        </div>
        <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-2">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="inactive">Inactive</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      <div className="rounded-md border overflow-hidden">
        <div className="relative overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Clicks</TableHead>
                <TableHead>Orders</TableHead>
                <TableHead>Commission</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Expiry</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {hasLinks ? (
                links.map((link) => (
                  <TableRow key={link.id}>
                    <TableCell className="font-mono text-sm flex items-center gap-2">
                      {link.code}
                      <Copy text={link.code} size={16} />
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-foreground hover:text-primary"
                        onClick={() => router.push(`/dashboard/vendors/${link.vendor_id}`)}
                      >
                        View Vendor
                        <ExternalLink className="ml-1 h-3 w-3" />
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-foreground hover:text-primary"
                        onClick={() => router.push(`/dashboard/products/${link.product_id}`)}
                      >
                        View Product
                        <ExternalLink className="ml-1 h-3 w-3" />
                      </Button>
                    </TableCell>
                    <TableCell>
                      {link.is_active ? (
                        <Badge variant="success">Active</Badge>
                      ) : (
                        <Badge variant="destructive">Inactive</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-center">
                        <Badge variant="outline">{link.clicks}</Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-center">
                        <Badge variant="outline">{link.orders}</Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-center">
                        <Badge variant="success">{link.total_commission}</Badge>
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(link.created_at)}</TableCell>
                    <TableCell>{link.expiry_date ? formatDate(link.expiry_date) : '-'}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} className="text-center p-8">
                    <p className="text-muted-foreground">No affiliate links found.</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      <Pagination
        currentPage={page}
        pageSize={pageSize}
        totalItems={total}
        onPageChange={onPageChange}
      />
    </>
  );
} 