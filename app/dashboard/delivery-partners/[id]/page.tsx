"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, Package, ShoppingBag, Store, Truck, User, X } from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Spinner } from "@/components/ui/spinner";

import { useDeliveryPartnerStore } from "@/features/delivery-partners/store";
import { DeliveryPartner } from "@/features/delivery-partners/types";

interface DeliveryPartnerPageProps {
  params: {
    id: string;
  };
}

export default function DeliveryPartnerPage({ params }: DeliveryPartnerPageProps) {
  const router = useRouter();
  const { id } = params;
  const [partner, setPartner] = useState<DeliveryPartner | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { fetchDeliveryPartner } = useDeliveryPartnerStore();
  
  useEffect(() => {
    const loadPartner = async () => {
      try {
        setLoading(true);
        setError(null);
        const partnerData = await fetchDeliveryPartner(id);
        setPartner(partnerData);
      } catch (err) {
        console.error('Error fetching delivery partner:', err);
        setError('Failed to load delivery partner details. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    loadPartner();
  }, [id, fetchDeliveryPartner]);

  const getPartnerTypeLabel = (type: string) => {
    switch (type) {
      case "individual":
        return "Individual";
      case "business":
        return "Business";
      case "pickup_point":
        return "Pickup Point";
      default:
        return type;
    }
  };

  const getVehicleTypeLabel = (type: string = "") => {
    switch (type) {
      case "boda":
      case "motorcycle":
        return "Motorcycle (Boda Boda)";
      case "car":
        return "Car";
      case "bicycle":
        return "Bicycle";
      case "truck":
        return "Truck";
      default:
        return type || "N/A";
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "active":
        return "default";
      case "pending":
        return "secondary";
      case "rejected":
      case "suspended":
        return "destructive";
      default:
        return "secondary";
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center p-4 border-b">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/dashboard/delivery-partners")}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Loading Partner Details</h1>
        </div>
        <div className="flex justify-center items-center h-64">
          <Spinner size="lg" />
        </div>
      </div>
    );
  }
  
  if (error || !partner) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Delivery Partner Not Found</h1>
            <p className="text-muted-foreground">
              {error || "The delivery partner you are looking for does not exist."}
            </p>
          </div>
        </div>
        <div className="p-4">
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard/delivery-partners")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Delivery Partners
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center p-4 border-b">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/dashboard/delivery-partners")}
          className="mr-4"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only">Back</span>
        </Button>
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold tracking-tight">
            {partner.name}
          </h1>
          <p className="text-sm text-muted-foreground">
            {getPartnerTypeLabel(partner.type)} • ID: {partner._id}
          </p>
        </div>
        <Badge variant={getStatusVariant(partner.status)} className="ml-auto">
          {partner.status.charAt(0).toUpperCase() + partner.status.slice(1)}
        </Badge>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Partner Details</CardTitle>
                <CardDescription>
                  {getPartnerTypeLabel(partner.type)} Delivery Partner
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center mb-6">
                  <Avatar className="h-24 w-24 mr-6">
                    <AvatarImage src={partner.profilePicture} alt={partner.name} />
                    <AvatarFallback>
                      {partner.type === 'individual' ? (
                        <User className="h-12 w-12" />
                      ) : partner.type === 'business' ? (
                        <Truck className="h-12 w-12" />
                      ) : (
                        <Package className="h-12 w-12" />
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-semibold">{partner.name}</h3>
                    <p className="text-sm text-muted-foreground">Type: {getPartnerTypeLabel(partner.type)}</p>
                    <p className="text-sm text-muted-foreground">Since: {format(new Date(partner.createdAt), "MMMM yyyy")}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium">User ID</p>
                    <p className="text-sm">{partner.userId}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Commission</p>
                    <p className="text-sm">{partner.commissionPercent}%</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">KYC Verified</p>
                    <Badge variant={partner.kyc.verified ? "default" : "secondary"}>
                      {partner.kyc.verified ? "Verified" : "Pending Verification"}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Status</p>
                    <Badge variant={getStatusVariant(partner.status)}>
                      {partner.status.charAt(0).toUpperCase() + partner.status.slice(1)}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Last Updated</p>
                    <p className="text-sm">{format(new Date(partner.updatedAt), "PPP")}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Type-specific cards */}
            {partner.type === 'individual' && partner.vehicleInfo && (
              <Card>
                <CardHeader>
                  <CardTitle>Individual Partner Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium">Vehicle Type</p>
                      <p className="text-sm">{getVehicleTypeLabel(partner.vehicleInfo.type)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Vehicle Details</p>
                      <p className="text-sm">{partner.vehicleInfo.details}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {partner.type === 'business' && (
              <Card>
                <CardHeader>
                  <CardTitle>Business Partner Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {partner.vehicleInfo && (
                      <>
                        <div>
                          <p className="text-sm font-medium">Vehicle Type</p>
                          <p className="text-sm">{getVehicleTypeLabel(partner.vehicleInfo.type)}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Vehicle Details</p>
                          <p className="text-sm">{partner.vehicleInfo.details}</p>
                        </div>
                      </>
                    )}
                    <div>
                      <p className="text-sm font-medium">Drivers</p>
                      <p className="text-sm">{partner.drivers && partner.drivers.length > 0 ? partner.drivers.length : 'No'} registered drivers</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {partner.type === 'pickup_point' && (
              <Card>
                <CardHeader>
                  <CardTitle>Pickup Point Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium">Pickup Point Type</p>
                      <p className="text-sm">Public Pickup Location</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Operating Hours</p>
                      <p className="text-sm">Standard Hours (9 AM - 5 PM)</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {partner.location && (
              <Card>
                <CardHeader>
                  <CardTitle>Location Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium">Coordinates</p>
                      <p className="text-sm">Lat: {partner.location.coordinates.lat}, Lng: {partner.location.coordinates.lng}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Service Radius</p>
                      <p className="text-sm">{partner.location.radiusKm} km</p>
                    </div>
                  </div>
                  <div className="mt-4 h-60 bg-muted rounded-md flex items-center justify-center">
                    <p className="text-muted-foreground">Map View (Placeholder)</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>KYC Documents</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {partner.kyc.documents.length === 0 ? (
                  <p className="text-sm">No KYC documents uploaded yet.</p>
                ) : (
                  partner.kyc.documents.map((doc, index) => (
                    <div key={index} className="border p-3 rounded-md">
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-sm font-medium">{doc.type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</p>
                        <Badge variant={doc.verified ? "default" : "secondary"}>
                          {doc.verified ? "Verified" : "Pending"}
                        </Badge>
                      </div>
                      <p className="text-sm mb-2">Number: {doc.number}</p>
                      <a 
                        href={doc.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline"
                      >
                        View Document
                      </a>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {partner.status === "pending" && (
                  <>
                    <Button 
                      className="w-full" 
                      onClick={() => router.push(`/dashboard/delivery-partners/${partner._id}/approve`)}
                    >
                      <Check className="mr-2 h-4 w-4" /> Approve Partner
                    </Button>
                    <Button 
                      variant="destructive" 
                      className="w-full" 
                      onClick={() => router.push(`/dashboard/delivery-partners/${partner._id}/reject`)}
                    >
                      <X className="mr-2 h-4 w-4" /> Reject Partner
                    </Button>
                  </>
                )}
                {partner.status === "active" && (
                  <Button 
                    variant="destructive" 
                    className="w-full" 
                    onClick={() => router.push(`/dashboard/delivery-partners/${partner._id}/suspend`)}
                  >
                    <X className="mr-2 h-4 w-4" /> Suspend Partner
                  </Button>
                )}
                {partner.status === "suspended" && (
                  <Button 
                    className="w-full" 
                    onClick={() => router.push(`/dashboard/delivery-partners/${partner._id}/reactivate`)}
                  >
                    <Check className="mr-2 h-4 w-4" /> Reactivate Partner
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => router.push(`/dashboard/delivery-partners/${partner._id}/edit`)}
                >
                  Edit Partner Details
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
