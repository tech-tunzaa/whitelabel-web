"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Eye, MoreHorizontal, RefreshCw, AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

import { Delivery } from "../types";

interface DeliveryTableProps {
  deliveries: Delivery[];
  onDeliveryClick: (delivery: Delivery) => void;
  activeTab?: string;
}

export function DeliveryTable({
  deliveries,
  onDeliveryClick,
  activeTab = "all"
}: DeliveryTableProps) {
  const router = useRouter();
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Filter deliveries by various status combinations
  const allDeliveries = deliveries;
  const assignedDeliveries = deliveries.filter(
    (delivery) => delivery.stage === "assigned"
  );
  const inTransitDeliveries = deliveries.filter(
    (delivery) => delivery.stage === "in_transit"
  );
  const deliveredDeliveries = deliveries.filter(
    (delivery) => delivery.stage === "delivered"
  );
  const failedDeliveries = deliveries.filter(
    (delivery) => delivery.stage === "failed"
  );

  const filteredDeliveries = () => {
    switch (activeTab) {
      case "assigned":
        return assignedDeliveries;
      case "in-transit":
        return inTransitDeliveries;
      case "delivered":
        return deliveredDeliveries;
      case "failed":
        return failedDeliveries;
      default:
        return allDeliveries;
    }
  };

  return (
    <Card>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Partner</TableHead>
              <TableHead>Current Stage</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDeliveries().map((delivery) => (
              <TableRow
                key={delivery.id}
                className="cursor-pointer hover:bg-muted"
                onClick={() => onDeliveryClick(delivery)}
              >
                <TableCell>{delivery.order_id}</TableCell>
                <TableCell>{delivery.partner?.name || "N/A"}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="capitalize">
                    {delivery.stage}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      delivery.stage === "delivered"
                        ? "success"
                        : delivery.stage === "failed"
                        ? "destructive"
                        : "default"
                    }
                  >
                    {delivery.stage}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => onDeliveryClick(delivery)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
