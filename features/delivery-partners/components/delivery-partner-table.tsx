"use client";

import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Check, MoreHorizontal, X } from "lucide-react";
import { DeliveryPartner } from "../types";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface DeliveryPartnerTableProps {
  deliveryPartners: DeliveryPartner[];
  onPartnerClick: (partner: DeliveryPartner) => void;
  onStatusChange: (partnerId: string, status: string, rejectionReason?: string) => void;
  activeTab?: string;
}

export function DeliveryPartnerTable({
  deliveryPartners,
  onPartnerClick,
  onStatusChange,
  activeTab = "all",
}: DeliveryPartnerTableProps) {
  const isMobile = useIsMobile();
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [partnerToReject, setPartnerToReject] = useState<string | null>(null);
  
  // Handle partner rejection with reason
  const handleRejectWithReason = () => {
    if (partnerToReject) {
      onStatusChange(partnerToReject, "rejected", rejectionReason);
      setIsRejectDialogOpen(false);
      setRejectionReason("");
      setPartnerToReject(null);
    }
  };
  
  // Open rejection dialog
  const openRejectDialog = (e: React.MouseEvent, partnerId: string) => {
    e.stopPropagation();
    setPartnerToReject(partnerId);
    setIsRejectDialogOpen(true);
  };
  
  // Status badges mapping
  const getStatusBadge = (partner: DeliveryPartner) => {
    if (partner.status === "active") {
      return <Badge variant="success">Active</Badge>;
    } else if (partner.status === "rejected") {
      return <Badge variant="destructive">Rejected</Badge>;
    } else if (partner.status === "suspended") {
      return <Badge variant="outline">Suspended</Badge>;
    } else {
      return <Badge variant="warning">Pending</Badge>;
    }
  };
  
  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Partner</TableHead>
                <TableHead className="hidden md:table-cell">Type</TableHead>
                <TableHead className="hidden md:table-cell">Commission</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Registered</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deliveryPartners && deliveryPartners.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6">
                    No delivery partners found
                  </TableCell>
                </TableRow>
              ) : (
                deliveryPartners.map((partner) => (
                  <TableRow
                    key={partner.id}
                    onClick={() => onPartnerClick(partner)}
                    className="cursor-pointer"
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={partner.profilePicture || "/placeholder.svg"}
                            alt={partner.name || "Partner"}
                          />
                          <AvatarFallback>
                            {partner.name.substring(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div>{partner.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {partner.userId}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge variant="outline">{partner.type}</Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {partner.commissionPercent}%
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(partner)}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {new Date(partner.createdAt).toLocaleDateString(
                        "en-US",
                        { year: "numeric", month: "2-digit", day: "2-digit" }
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              onPartnerClick(partner);
                            }}
                          >
                            View Details
                          </DropdownMenuItem>
                          
                          {partner.is_active && (
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                onStatusChange(partner.id, "suspended");
                              }}
                            >
                              <X className="mr-2 h-4 w-4" />
                              Suspend
                            </DropdownMenuItem>
                          )}
                          
                          {!partner.is_active && (
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                onStatusChange(partner.id, "active");
                              }}
                            >
                              <Check className="mr-2 h-4 w-4 text-success" />
                              Activate
                            </DropdownMenuItem>
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
        
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Delivery Partner</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this delivery partner. This will be visible to the partner.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="Enter rejection reason..."
            className="min-h-[100px]"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleRejectWithReason}
              disabled={!rejectionReason.trim()}
            >
              Reject Partner
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
