"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, X } from "lucide-react";
import { use } from "react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { deliveryPartners } from "@/features/delivery-partners/data/delivery-partners";

interface DeliveryPartnerPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function DeliveryPartnerPage({ params }: DeliveryPartnerPageProps) {
  const router = useRouter();
  const { id } = use(params);
  const partner = deliveryPartners.find((p) => p._id === id);

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
      case "suspended":
        return "destructive";
      default:
        return "secondary";
    }
  };

  if (!partner) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Delivery Partner Not Found</h1>
            <p className="text-muted-foreground">
              The delivery partner you are looking for does not exist.
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
              </CardHeader>
              <CardContent>
                <div className="flex items-center mb-6">
                  <Avatar className="h-24 w-24 mr-6">
                    <AvatarImage src={partner.profilePicture} alt={partner.name} />
                    <AvatarFallback>{partner.name.substring(0, 2).toUpperCase()}</AvatarFallback>
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
                    <p className="text-sm font-medium">Last Updated</p>
                    <p className="text-sm">{format(new Date(partner.updatedAt), "PPP")}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {partner.vehicleInfo && (
              <Card>
                <CardHeader>
                  <CardTitle>Vehicle Information</CardTitle>
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
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>KYC Documents</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {partner.kyc.documents.map((doc, index) => (
                    <div key={index} className="border rounded-md p-3">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium">
                          {doc.type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                        </p>
                        <Badge variant="outline">{doc.number}</Badge>
                      </div>
                      <div className="h-32 bg-muted rounded-md overflow-hidden">
                        <img 
                          src={doc.link} 
                          alt={doc.type} 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {partner.type === "business" && partner.drivers && (
              <Card>
                <CardHeader>
                  <CardTitle>Drivers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {partner.drivers.map((driverId, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded-md">
                        <p className="text-sm">{driverId}</p>
                        <Button size="sm" variant="ghost">View</Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  className="w-full" 
                  variant="outline" 
                  onClick={() => router.push(`/dashboard/delivery-partners/${partner._id}/edit`)}
                >
                  Edit Partner
                </Button>
                <Button 
                  className="w-full" 
                  variant="outline"
                >
                  View Deliveries
                </Button>
                <Button 
                  className="w-full" 
                  variant={partner.status === "active" ? "destructive" : "default"}
                >
                  {partner.status === "active" ? "Suspend" : "Activate"} Partner
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
