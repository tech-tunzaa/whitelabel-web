import React, { useState } from "react";
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
import { ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface AffiliateRequest {
  id: string;
  affiliate_id: string;
  request_type: string;
  vendor_id: string;
  product_id?: string;
  status: string;
  message: string;
  response_message: string | null;
  created_at: string;
  updated_at: string | null;
  responded_at: string | null;
  affiliate?: {
    id: string;
    name: string;
    email: string;
  };
}

interface AffiliateRequestsTableProps {
  requests: AffiliateRequest[];
}

export function AffiliateRequestsTable({ requests = [] }: AffiliateRequestsTableProps) {
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  const router = useRouter();

  const toggleRow = (id: string) => {
    setExpandedRows(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };



  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    try {
      return format(new Date(dateString), 'PPpp');
    } catch (e) {
      return 'Invalid date';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <Badge variant="outline">Pending</Badge>;
      case 'approved':
        return <Badge variant="success">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Removed the early return to handle empty state within the component
  const hasRequests = requests && requests.length > 0;

  return (
    <div className="rounded-md border overflow-hidden">
      <div className="relative overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12"></TableHead>
              <TableHead>Request ID</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Affiliate</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Requested</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {hasRequests ? (
              requests.map((request) => (
                <React.Fragment key={request.id}>
                  <TableRow 
                    className={cn(
                      "cursor-pointer hover:bg-muted/50",
                      expandedRows[request.id] && "bg-muted/30"
                    )}
                    onClick={() => toggleRow(request.id)}
                  >
                    <TableCell className="w-12">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleRow(request.id);
                        }}
                      >
                        {expandedRows[request.id] ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="font-mono text-sm">
                        {request.id.substring(0, 6)}...
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {request.request_type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-foreground hover:text-primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/dashboard/affiliates/${request.affiliate_id}`);
                        }}
                      >
                        View Affiliate
                        <ExternalLink className="ml-1 h-3 w-3" />
                      </Button>
                    </TableCell>
                    <TableCell>
                      {request.product_id ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2 text-foreground hover:text-primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/dashboard/products/${request.product_id}`);
                          }}
                        >
                          View Product
                          <ExternalLink className="ml-1 h-3 w-3" />
                        </Button>
                      ) : (
                        <Badge>All</Badge>
                      )}
                    </TableCell>
                    <TableCell>{getStatusBadge(request.status)}</TableCell>
                    <TableCell>{formatDate(request.created_at)}</TableCell>
                  </TableRow>
                  {expandedRows[request.id] && (
                    <TableRow className="bg-muted/10">
                      <TableCell colSpan={8} className="p-4">
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-medium mb-2">Affiliate's Request</h4>
                            <div className="bg-muted/30 p-4 rounded-md">
                              <p className="whitespace-pre-wrap">{request.message || 'No message provided.'}</p>
                            </div>
                          </div>
                          {request.response_message && (
                            <div>
                              <h4 className="font-medium mb-2">Vendor's Response</h4>
                              <div className="bg-muted/30 p-4 rounded-md">
                                <p className="whitespace-pre-wrap">{request.response_message}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="text-center p-8">
                  <p className="text-muted-foreground">No affiliate requests found.</p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
