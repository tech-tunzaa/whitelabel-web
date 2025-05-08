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

import { vendors } from "@/features/vendors/data/vendors";

interface VendorPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function VendorPage({ params }: VendorPageProps) {
  const router = useRouter();
  const { id } = use(params);
  const vendor = vendors.find((v) => v.id === parseInt(id));

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

  if (!vendor) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Vendor Not Found</h1>
            <p className="text-muted-foreground">
              The vendor you are looking for does not exist.
            </p>
          </div>
        </div>
        <div className="p-4">
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard/vendors")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Vendors
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
          onClick={() => router.push("/dashboard/vendors")}
          className="mr-4"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only">Back</span>
        </Button>
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold tracking-tight">
            {vendor.businessName}
          </h1>
          <p className="text-sm text-muted-foreground">
            {vendor.category} • Registered on {format(new Date(vendor.registrationDate), "PPP")}
          </p>
        </div>
        <Badge variant={getStatusVariant(vendor.status)} className="ml-auto">
          {vendor.status.charAt(0).toUpperCase() + vendor.status.slice(1)}
        </Badge>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Vendor Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center mb-6">
                  <Avatar className="h-24 w-24 mr-6">
                    <AvatarImage src={vendor.logo} alt={vendor.businessName} />
                    <AvatarFallback>{vendor.businessName.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-semibold">{vendor.businessName}</h3>
                    <p className="text-sm text-muted-foreground">Category: {vendor.category}</p>
                    <p className="text-sm text-muted-foreground">Tax ID: {vendor.taxId}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium">Email</p>
                    <p className="text-sm">{vendor.email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Phone</p>
                    <p className="text-sm">{vendor.phone}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-sm font-medium">Description</p>
                    <p className="text-sm">{vendor.description}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Status</p>
                    <Badge variant={getStatusVariant(vendor.status)}>
                      {vendor.status.charAt(0).toUpperCase() + vendor.status.slice(1)}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Registration Date</p>
                    <p className="text-sm">{format(new Date(vendor.registrationDate), "PPP")}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Address Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium">Street Address</p>
                    <p className="text-sm">{vendor.address.street}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">City</p>
                    <p className="text-sm">{vendor.address.city}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">State/Province</p>
                    <p className="text-sm">{vendor.address.state}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Postal Code</p>
                    <p className="text-sm">{vendor.address.zip}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Country</p>
                    <p className="text-sm">{vendor.address.country}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Documents</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium mb-2">Identity Documents</p>
                    {vendor.documents.identity.map((doc, index) => (
                      <div key={index} className="border rounded-md p-3 mb-2">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-medium">{doc.name}</p>
                          <Button size="sm" variant="ghost">View</Button>
                        </div>
                        <div className="h-32 bg-muted rounded-md overflow-hidden">
                          <img 
                            src={doc.url} 
                            alt={doc.name} 
                            className="w-full h-full object-cover" 
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium mb-2">Business Documents</p>
                    {vendor.documents.business.map((doc, index) => (
                      <div key={index} className="border rounded-md p-3 mb-2">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-medium">{doc.name}</p>
                          <Button size="sm" variant="ghost">View</Button>
                        </div>
                        <div className="h-32 bg-muted rounded-md overflow-hidden">
                          <img 
                            src={doc.url} 
                            alt={doc.name} 
                            className="w-full h-full object-cover" 
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium mb-2">Banking Documents</p>
                    {vendor.documents.bank.map((doc, index) => (
                      <div key={index} className="border rounded-md p-3 mb-2">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-medium">{doc.name}</p>
                          <Button size="sm" variant="ghost">View</Button>
                        </div>
                        <div className="h-32 bg-muted rounded-md overflow-hidden">
                          <img 
                            src={doc.url} 
                            alt={doc.name} 
                            className="w-full h-full object-cover" 
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  className="w-full" 
                  variant="outline" 
                  onClick={() => router.push(`/dashboard/vendors/${vendor.id}/edit`)}
                >
                  Edit Vendor
                </Button>
                <Button 
                  className="w-full" 
                  variant="outline"
                >
                  View Products
                </Button>
                <Button 
                  className="w-full" 
                  variant={vendor.status === "active" ? "destructive" : "default"}
                >
                  {vendor.status === "active" ? "Suspend" : "Activate"} Vendor
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
