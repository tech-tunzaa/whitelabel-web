"use client";

import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Eye, MoreHorizontal, Package, Truck, PackageCheck, XCircle, Info, Hourglass } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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

import { Delivery } from "../types";

// A reusable badge component for delivery status, similar to the one on the details page
const PartnerInfo = ({ delivery }: { delivery: Delivery }) => {
  // 1. Use enriched deliveryPartner data if available
  if (delivery.deliveryPartner) {
    return (
      <div className="flex items-center gap-3">
        <Avatar className="h-9 w-9">
          <AvatarImage src={delivery.deliveryPartner.user.avatar_url || ''} alt={delivery.deliveryPartner.user.name} />
          <AvatarFallback>{delivery.deliveryPartner.user.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="grid gap-0.5">
          <p className="font-medium">{delivery.deliveryPartner.user.name}</p>
          <p className="text-xs text-muted-foreground">{delivery.deliveryPartner.user.email}</p>
        </div>
      </div>
    );
  }

  // 2. Fallback to the latest stage if deliveryPartner is not populated
  if (delivery.stages && delivery.stages.length > 0) {
    const latestStage = delivery.stages[delivery.stages.length - 1] as any;
    const partnerName = latestStage.partner_name;
    const partnerId = latestStage.partner_id;

    // Display name if available
    if (partnerName) {
      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarFallback>{partnerName.charAt(0) || 'P'}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{partnerName}</p>
            <p className="text-xs text-muted-foreground">ID: {partnerId}</p>
          </div>
        </div>
      );
    }
    
    // Fallback to ID if name is not available
    if (partnerId) {
      return (
         <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarFallback>#</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-muted-foreground">Partner ID</p>
            <p className="text-xs">{partnerId}</p>
          </div>
        </div>
      );
    }
  }

  // 3. If no partner info is available
  return <span className="text-muted-foreground">Not Assigned</span>;
};

const DeliveryStatusBadge = ({ status }: { status: string }) => {
  const statusStyles: { [key: string]: string } = {
    assigned: 'bg-blue-100 text-blue-800 border-blue-200',
    at_pickup: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    in_transit: 'bg-purple-100 text-purple-800 border-purple-200',
    delivered: 'bg-green-100 text-green-800 border-green-200',
    cancelled: 'bg-red-100 text-red-800 border-red-200',
    failed: 'bg-gray-100 text-gray-800 border-gray-200',
  };
  const statusIcons: { [key: string]: React.ReactNode } = {
    assigned: <Hourglass className="mr-1.5 h-3 w-3" />,
    at_pickup: <Package className="mr-1.5 h-3 w-3" />,
    in_transit: <Truck className="mr-1.5 h-3 w-3" />,
    delivered: <PackageCheck className="mr-1.5 h-3 w-3" />,
    cancelled: <XCircle className="mr-1.5 h-3 w-3" />,
    failed: <Info className="mr-1.5 h-3 w-3" />,
  };
  return (
    <Badge variant="outline" className={`capitalize ${statusStyles[status] || 'bg-gray-100 text-gray-800'}`}>
      {statusIcons[status] || null}
      {status.replace(/_/g, ' ')}
    </Badge>
  );
};


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

  // Corrected filtering logic
  const getFilteredDeliveries = () => {
    if (activeTab === 'all') return deliveries;
    const stageToFilter = activeTab.replace('-', '_');
    return deliveries.filter(d => d.current_stage === stageToFilter);
  };

  const filteredDeliveries = getFilteredDeliveries();

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Delivery Partner</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDeliveries.length > 0 ? (
              filteredDeliveries.map((delivery) => (
                <TableRow
                  key={delivery.id}
                  className="cursor-pointer"
                  onClick={() => onDeliveryClick(delivery)}
                >
                  <TableCell className="font-medium">
                    <div className="flex flex-col">
                      <span className="font-semibold">{delivery.order_id}</span>
                      <span className="text-xs text-muted-foreground">Delivery ID: {delivery.id}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <PartnerInfo delivery={delivery} />
                  </TableCell>
                  <TableCell>
                    <DeliveryStatusBadge status={delivery.current_stage} />
                  </TableCell>
                  <TableCell>
                    {format(new Date(delivery.created_at), "dd MMM, yyyy HH:mm:ss")}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          onDeliveryClick(delivery);
                        }}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No deliveries found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
