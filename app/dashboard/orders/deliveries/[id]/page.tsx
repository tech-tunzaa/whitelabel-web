"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { format } from "date-fns";
import { ArrowLeft, User, MapPin, Phone, Calendar, Clock, Package, Truck, PackageCheck, XCircle, Info, Hourglass, Eye, Image as ImageIcon, FileText, MapPin as MapPinIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { ErrorCard } from "@/components/ui/error-card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Copy } from "@/components/ui/copy";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { EmptyPlaceholder } from "@/components/ui/empty-placeholder";
import { FilePreviewModal } from "@/components/ui/file-preview-modal";

import { useDeliveryStore } from "@/features/orders/deliveries/store";
import { useOrderStore } from "@/features/orders/store";
import { formatDate, formatTime, formatPartnerId } from "@/lib/utils";

export default function DeliveryDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const session = useSession();
  const tenantId = session?.data?.user?.tenant_id as string | undefined;
  const { delivery, loading, storeError, fetchDelivery } = useDeliveryStore();
  const { order, fetchOrder } = useOrderStore();
  const [proofModalOpen, setProofModalOpen] = useState(false);
  const [selectedProof, setSelectedProof] = useState("");

  // Fetch delivery and order details
  useEffect(() => {
    if (!params?.id) return;
    const headers = tenantId ? { "X-Tenant-ID": tenantId } : undefined;
    fetchDelivery(params.id as string, headers).then((delivery) => {
      if (delivery?.order_id) {
        fetchOrder(delivery.order_id, headers);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params?.id, tenantId]);

  if (loading && !delivery) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Delivery Details</h1>
            <p className="text-muted-foreground">View delivery and order details</p>
          </div>
        </div>
        <div className="flex items-center justify-center h-64">
          <Spinner />
        </div>
      </div>
    );
  }

  if (storeError && !loading) {
    return (
      <ErrorCard
        title="Failed to load delivery"
        error={{ status: storeError.status?.toString() || "Error", message: storeError.message }}
        buttonText="Retry"
        buttonAction={() => fetchDelivery(params.id as string)}
        buttonIcon={ArrowLeft}
      />
    );
  }

  if (!delivery) {
    return null;
  }

  // Helper: Delivery status badge
  const DeliveryStatusBadge = ({ status }: { status: string }) => {
    const statusStyles: { [key: string]: string } = {
      assigned: "bg-blue-100 text-blue-800 border-blue-200",
      at_pickup: "bg-yellow-100 text-yellow-800 border-yellow-200",
      in_transit: "bg-purple-100 text-purple-800 border-purple-200",
      delivered: "bg-green-100 text-green-800 border-green-200",
      cancelled: "bg-red-100 text-red-800 border-red-200",
      failed: "bg-gray-100 text-gray-800 border-gray-200",
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
      <Badge className={`capitalize ${statusStyles[status] || "bg-gray-100 text-gray-800"}`}>
        {statusIcons[status] || null}
        {status.replace(/_/g, " ")}
      </Badge>
    );
  };

  // Helper: Partner info
  const PartnerInfo = () => {
    const partner = delivery.deliveryPartner;
    if (!partner) return <span className="text-muted-foreground">Not Assigned</span>;
    return (
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={partner.profile_picture || ""} alt={partner.name} />
          <AvatarFallback>{partner.name?.charAt(0) || "P"}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium">{partner.name}</p>
          {partner.user_details?.email && (
            <p className="text-xs text-muted-foreground">{partner.user_details.email}</p>
          )}
        </div>
      </div>
    );
  };

  // Helper: Customer info
  const CustomerInfo = () => {
    if (!order) return null;
    const addr = order.shipping_address;
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{addr.first_name} {addr.last_name}</span>
        </div>
        <div className="flex items-center gap-2">
          <Phone className="h-4 w-4 text-muted-foreground" />
          <a href={`tel:${addr.phone}`} className="hover:underline">{addr.phone}</a>
        </div>
        <div className="flex items-start gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
          <span className="text-sm">{addr.address_line1}, {addr.city}, {addr.country}</span>
        </div>
      </div>
    );
  };

  // Helper: Order items table
  const OrderItemsTable = () => {
    if (!order) return null;
    return (
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Qty</TableHead>
              <TableHead>Unit Price</TableHead>
              <TableHead>Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {order.items.map((item) => (
              <TableRow key={item.item_id}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell className="font-mono text-sm">{item.sku}</TableCell>
                <TableCell>{item.quantity}</TableCell>
                <TableCell>${item.unit_price}</TableCell>
                <TableCell className="font-medium">${item.total}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  };

  // Helper: Timeline icon and color
  const stageMeta = {
    assigned: {
      icon: <Hourglass className="h-4 w-4" />, color: "bg-blue-100 text-blue-800", label: "Assigned"
    },
    at_pickup: {
      icon: <Package className="h-4 w-4" />, color: "bg-yellow-100 text-yellow-800", label: "At Pickup"
    },
    in_transit: {
      icon: <Truck className="h-4 w-4" />, color: "bg-purple-100 text-purple-800", label: "In Transit"
    },
    delivered: {
      icon: <PackageCheck className="h-4 w-4" />, color: "bg-green-100 text-green-800", label: "Delivered"
    },
    cancelled: {
      icon: <XCircle className="h-4 w-4" />, color: "bg-red-100 text-red-800", label: "Cancelled"
    },
    failed: {
      icon: <Info className="h-4 w-4" />, color: "bg-gray-100 text-gray-800", label: "Failed"
    },
  };

  // Helper: Get partner display info for a stage
  const getPartnerInfo = (partnerId: string) => {
    // Try to use enriched deliveryPartner if matches
    if (delivery.deliveryPartner && (delivery.deliveryPartner.partner_id === partnerId || delivery.deliveryPartner._id === partnerId)) {
      return {
        name: delivery.deliveryPartner.name,
        avatar: delivery.deliveryPartner.profile_picture,
        email: delivery.deliveryPartner.user_details?.email,
      };
    }
    // Fallback: just show ID
    return { name: null, avatar: null, email: null };
  };

  // Helper: Render proof preview (image/file)
  const ProofPreview = ({ proof }: { proof: string }) => {
    return (
      <div className="flex items-center gap-2">
        <img
          src={proof}
          alt="Proof"
          className="h-8 w-8 rounded object-cover border"
          onClick={() => { setSelectedProof(proof); setProofModalOpen(true); }}
          style={{ cursor: "pointer" }}
        />
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-2 text-xs text-blue-600 hover:text-blue-700"
          onClick={() => { setSelectedProof(proof); setProofModalOpen(true); }}
        >
          <Eye className="h-3 w-3 mr-1" />
          View
        </Button>
        <Copy text={proof} size={12} />
      </div>
    );
  };

  // Helper: Render location info
  const LocationPreview = ({ location }: { location: { latitude?: number; longitude?: number } | null }) => {
    if (!location || typeof location.latitude !== 'number' || typeof location.longitude !== 'number') {
      return <span className="text-xs text-muted-foreground">Location unavailable</span>;
    }
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="flex items-center gap-1 text-xs text-blue-600 cursor-pointer underline">
              <MapPinIcon className="h-4 w-4" />
              {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
            </span>
          </TooltipTrigger>
          <TooltipContent side="top">
            Lat: {location.latitude}, Lng: {location.longitude}
            <Copy text={`${location.latitude},${location.longitude}`} size={12} className="ml-2" />
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  // Timeline component (info-rich, with partner names and avatars)
  const DeliveryTimeline = () => {
    if (!delivery.stages || delivery.stages.length === 0) {
      return (
        <EmptyPlaceholder className="my-4">
          <div className="flex flex-col items-center gap-2">
            <Info className="h-6 w-6 text-muted-foreground" />
            <span className="text-muted-foreground text-sm">No delivery stages yet.</span>
          </div>
        </EmptyPlaceholder>
      );
    }
    // Icon mapping for stages
    const stageIcons = {
      assigned: Hourglass,
      picked_up: Truck,
      in_transit: MapPin,
      delivered: PackageCheck,
      cancelled: XCircle,
      failed: Info,
      default: Hourglass,
    };
    return (
      <div className="space-y-6">
        {delivery.stages.map((stage, idx) => {
          const Icon = stageIcons[stage.stage] || stageIcons.default;
          const partner = delivery.partner_details?.[stage.partner_id];
          return (
            <div key={idx} className="flex items-start gap-4">
              {/* Timeline icon and vertical line */}
              <div className="flex flex-col items-center">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Icon className="h-5 w-5" />
                </div>
                {idx < delivery.stages.length - 1 && (
                  <div className="h-8 w-px bg-border my-1" />
                )}
              </div>
              {/* Timeline content */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {partner?.profile_picture ? (
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={partner.profile_picture} alt={partner.name || "Partner"} />
                      <AvatarFallback>{partner.name?.charAt(0) || "P"}</AvatarFallback>
                    </Avatar>
                  ) : (
                    <Avatar className="h-6 w-6"><AvatarFallback>P</AvatarFallback></Avatar>
                  )}
                  <span className="font-medium text-sm">{partner?.name || "Partner"}</span>
                  <span className="text-xs text-muted-foreground">({formatPartnerId(stage.partner_id)})</span>
                  <Copy text={stage.partner_id} size={12} />
                </div>
                <p className="font-semibold capitalize">
                  {(stage.stage === "assigned" && idx > 0 ? "reassigned" : stage.stage).replace(/_/g, " ")}
                </p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(stage.timestamp)} at {formatTime(stage.timestamp)}
                </p>
                {/* Proof image if present */}
                {stage.proof && stage.proof.photo_url && (
                  <div className="mt-2 flex items-center gap-2">
                    <img
                      src={stage.proof.photo_url}
                      alt="Proof"
                      className="h-12 w-12 rounded object-cover border cursor-pointer"
                      onClick={() => { setSelectedProof(stage.proof.photo_url); setProofModalOpen(true); }}
                    />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Delivery summary info (improved UI)
  const DeliverySummary = () => (
    <Card>
      <CardHeader className="pb-3 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <div>
          <CardTitle className="text-lg flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            Delivery Summary
          </CardTitle>
          <CardDescription className="flex items-center gap-2 mt-1">
            <span className="text-muted-foreground text-xs">Order Number:</span>
            <span className="font-mono text-xs font-semibold">{order?.order_number}</span>
            {order?.order_number && <Copy text={order.order_number} size={14} />}
            <Button
              size="sm"
              variant="outline"
              className="ml-2 px-2 py-1 text-xs"
              onClick={() => router.push(`/dashboard/orders/${order?.order_id}`)}
              disabled={!order?.order_id}
            >
              View Order
            </Button>
          </CardDescription>
        </div>
        <div className="flex flex-col md:items-end gap-1">
          <Badge className="capitalize text-xs px-2 py-1">{delivery.current_stage.replace(/_/g, " ")}</Badge>
          <span className="text-xs text-muted-foreground">{formatDate(delivery.created_at)} {formatTime(delivery.created_at)}</span>
        </div>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-sm">Delivery ID:</span>
          <span className="ml-1 font-mono text-xs">{delivery.id}</span>
          <Copy text={delivery.id} size={14} />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-sm">Order ID:</span>
          <span className="ml-1 font-mono text-xs">{delivery.order_id}</span>
          <Copy text={delivery.order_id} size={14} />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-sm">Current Stage:</span>
          <span className="ml-1 font-semibold capitalize">{delivery.current_stage.replace(/_/g, " ")}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-sm">Created:</span>
          <span className="ml-1">{formatDate(delivery.created_at)} {formatTime(delivery.created_at)}</span>
        </div>
        {delivery.actual_delivery_time && (
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-sm">Delivered At:</span>
            <span className="ml-1">{formatDate(delivery.actual_delivery_time)} {formatTime(delivery.actual_delivery_time)}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="flex flex-col h-full">
      {/* Header - match order details style */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/dashboard/orders/deliveries")}
            className="shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Button>

          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback>
                <Truck className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>

            <div>
              <div className="flex items-center gap-4 mb-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold tracking-tight">
                    Delivery: #{delivery.id}
                  </h1>
                  <Copy text={delivery.id} size={16} />
                </div>
                <Badge className="capitalize" variant="outline">
                  {delivery.current_stage.replace(/_/g, " ")}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Created: {formatDate(delivery.created_at)} {formatTime(delivery.created_at)}
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="p-4 space-y-4 overflow-auto">
        <DeliverySummary />
        {/* Main content - 2 column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Left column - Timeline */}
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Delivery Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <DeliveryTimeline />
              </CardContent>
            </Card>
          </div>

          {/* Right column - Order Info, Customer, Items */}
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Order Info</CardTitle>
                <CardDescription className="text-sm">ID: {delivery.order_id} <Copy text={delivery.order_id} size={14} /></CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {order && (
                  <>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground text-sm">Order Number:</span>
                      <span className="font-medium">{order.order_number}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground text-sm">Status:</span>
                      <Badge className="capitalize">{order.status}</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground text-sm">Created:</span>
                      <span>{format(new Date(order.created_at), "dd MMM, yyyy HH:mm")}</span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Customer Info</CardTitle>
              </CardHeader>
              <CardContent>
                <CustomerInfo />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Order Items</CardTitle>
              </CardHeader>
              <CardContent>
                <OrderItemsTable />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Proof Preview Modal */}
      <FilePreviewModal
        isOpen={proofModalOpen}
        onClose={() => setProofModalOpen(false)}
        src={selectedProof}
        alt="Delivery proof"
      />
    </div>
  );
}