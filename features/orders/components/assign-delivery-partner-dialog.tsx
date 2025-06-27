"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Mail, Phone, User } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useDebounce } from "@/hooks/use-debounce";

import { useDeliveryPartnerStore } from "@/features/delivery-partners/store";
import {
  DeliveryPartnerFilter,
  PartnerType,
} from "@/features/delivery-partners/types";
import { useOrderStore } from "@/features/orders/store";

interface AssignDeliveryPartnerDialogProps {
  orderId: string;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onAssignmentSuccess: () => void;
}

export const AssignDeliveryPartnerDialog: React.FC<AssignDeliveryPartnerDialogProps> = ({
  orderId,
  isOpen,
  onOpenChange,
  onAssignmentSuccess,
}) => {
  const { data: session } = useSession();
  const {
    deliveryPartners,
    loading: loadingPartners,
    fetchDeliveryPartners,
  } = useDeliveryPartnerStore();
  const { assignDeliveryPartner, activeAction } = useOrderStore();

  const [partnerType, setPartnerType] = useState<PartnerType>("business");
  const [partnerSearchTerm, setPartnerSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(partnerSearchTerm, 500);
  const [assigningPartnerId, setAssigningPartnerId] = useState<string | null>(
    null
  );

  const loadDeliveryPartners = async () => {
    if (!session) return;
    const tenantId = (session.user as any)?.tenant_id;
    if (!tenantId) {
      toast.error("Tenant ID not found. Cannot fetch partners.");
      return;
    }

    const filter: DeliveryPartnerFilter = {
      type: partnerType,
      is_active: true,
      search: debouncedSearchTerm,
    };

    try {
      await fetchDeliveryPartners(filter, { "X-Tenant-ID": tenantId });
    } catch (error) {
      toast.error("Failed to load delivery partners.");
      console.error(error);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadDeliveryPartners();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, debouncedSearchTerm, partnerType, session]);

  const handleAssignPartner = async (partnerId: string) => {
    if (!session) {
      toast.error("You must be logged in to assign a partner.");
      return;
    }
    const tenantId = (session.user as any)?.tenant_id;
    if (!tenantId) {
      toast.error("Tenant ID not found.");
      return;
    }

    setAssigningPartnerId(partnerId);
    try {
      await assignDeliveryPartner(
        orderId,
        { partner_id: partnerId },
        { "X-Tenant-ID": tenantId }
      );
      toast.success("Delivery partner assigned successfully!");
      onAssignmentSuccess();
      onOpenChange(false);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to assign partner.";
      toast.error(errorMessage);
      console.error(error);
    } finally {
      setAssigningPartnerId(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px]">
        <DialogHeader>
          <DialogTitle>Assign Delivery Partner</DialogTitle>
          <DialogDescription>
            Select a partner type, view available verified partners, and search by
            name.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col space-y-4">
          <Tabs
            value={partnerType}
            onValueChange={(value) => setPartnerType(value as any)}
          >
            <TabsList className="w-full">
              <TabsTrigger value="business">Business</TabsTrigger>
              <TabsTrigger value="pickup_point">Pickup Point</TabsTrigger>
              <TabsTrigger value="individual">Individual</TabsTrigger>
            </TabsList>
          </Tabs>
          <Input
            placeholder="Search by partner name..."
            value={partnerSearchTerm}
            onChange={(e) => setPartnerSearchTerm(e.target.value)}
          />
          <div className="relative min-h-[300px] max-h-[50vh] overflow-y-auto rounded-md border p-4">
            {loadingPartners && activeAction !== "assignDelivery" ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <Spinner />
              </div>
            ) : !deliveryPartners || deliveryPartners.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">
                  No available partners found.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {deliveryPartners.map((partner) => (
                  <div
                    key={partner.partner_id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-semibold">{partner.name}</p>
                        <div className="text-sm text-muted-foreground flex items-center space-x-4">
                          <span className="flex items-center space-x-1">
                            <Mail className="w-3 h-3" />
                            <span>{partner?.user?.email || "N/A"}</span>
                          </span>
                          {partner?.user?.phone_number && (
                            <span className="flex items-center space-x-1">
                              <Phone className="w-3 h-3" />
                              <span>
                                {partner?.user?.phone_number || "N/A"}
                              </span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge
                        variant={
                          partner.kyc.verified ? "success" : "secondary"
                        }
                      >
                        {partner.kyc.verified ? "Verified" : "Not Verified"}
                      </Badge>
                      <Button
                        size="sm"
                        onClick={() =>
                          handleAssignPartner(partner.partner_id)
                        }
                        disabled={!!assigningPartnerId}
                      >
                        {assigningPartnerId === partner.partner_id ? (
                          <Spinner size="sm" />
                        ) : (
                          "Assign"
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
