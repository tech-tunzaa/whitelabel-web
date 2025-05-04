"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Check, X } from "lucide-react"
import { DeliveryPartner } from "../types/delivery-partner"
import { CheckedState } from "@radix-ui/react-checkbox"

interface DeliveryPartnerDetailsProps {
  partner: DeliveryPartner
  onApprove: (id: string, commissionPercent: number, kycVerified: boolean) => void
  onReject: (id: string) => void
  isMobile?: boolean
}

export function DeliveryPartnerDetails({
  partner,
  onApprove,
  onReject,
  isMobile = false,
}: DeliveryPartnerDetailsProps) {
  const [kycVerified, setKycVerified] = useState<CheckedState>(false)
  const [commissionPercent, setCommissionPercent] = useState(partner.commissionPercent)

  const handleKycVerifiedChange = (checked: CheckedState) => {
    setKycVerified(checked)
  }

  return (
    <div className="space-y-6 py-4 px-2 md:px-6">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="documents">KYC Documents</TabsTrigger>
          <TabsTrigger value="approval">Approval</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Name</h3>
              <p className="text-base">{partner.name}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Type</h3>
              <p className="text-base">{partner.type}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">User ID</h3>
              <p className="text-base">{partner.userId}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Commission</h3>
              <p className="text-base">{partner.commissionPercent}%</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Registration Date</h3>
              <p className="text-base">{new Date(partner.createdAt).toLocaleDateString()}</p>
            </div>
          </div>

          {partner.location && (
            <>
              <Separator />
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Location</h3>
                <p className="text-base">
                  Coordinates: {partner.location.coordinates.lat}, {partner.location.coordinates.lng}
                </p>
                <p className="text-base">Service Radius: {partner.location.radiusKm} km</p>
              </div>
            </>
          )}

          {partner.vehicleInfo && (
            <>
              <Separator />
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Vehicle Information</h3>
                <p className="text-base">Type: {partner.vehicleInfo.type}</p>
                <p className="text-base">Details: {partner.vehicleInfo.details}</p>
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="documents" className="space-y-4 pt-4">
          <div className="space-y-4">
            <h3 className="text-base font-medium">KYC Documents</h3>
            {isMobile ? (
              <ScrollArea className="whitespace-nowrap pb-4">
                <div className="flex gap-4">
                  {partner.kyc.documents.map((doc, index) => (
                    <Card key={index} className="min-w-[200px]">
                      <CardContent className="p-2">
                        <img
                          src={doc.link || "/placeholder.svg"}
                          alt={doc.type}
                          className="h-32 w-full object-cover rounded-md"
                        />
                        <p className="text-xs mt-2 truncate">{doc.type}</p>
                        <p className="text-xs text-muted-foreground truncate">{doc.number}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {partner.kyc.documents.map((doc, index) => (
                  <Card key={index}>
                    <CardContent className="p-2">
                      <img
                        src={doc.link || "/placeholder.svg"}
                        alt={doc.type}
                        className="h-32 w-full object-cover rounded-md"
                      />
                      <p className="text-xs mt-2 truncate">{doc.type}</p>
                      <p className="text-xs text-muted-foreground truncate">{doc.number}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="approval" className="space-y-6 pt-4">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox id="kyc-verified" checked={kycVerified} onCheckedChange={handleKycVerifiedChange} />
              <Label htmlFor="kyc-verified">KYC Verified</Label>
            </div>
            <p className="text-sm text-muted-foreground">
              By checking this box, you confirm that you have reviewed all KYC documents and verified the delivery partner's
              identity.
            </p>
          </div>

          <Separator />

          <div className="space-y-4">
            <Label htmlFor="commission">Commission Percentage</Label>
            <Select value={commissionPercent.toString()} onValueChange={(value) => setCommissionPercent(Number(value))}>
              <SelectTrigger id="commission">
                <SelectValue placeholder="Select commission percentage" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5%</SelectItem>
                <SelectItem value="10">10%</SelectItem>
                <SelectItem value="15">15%</SelectItem>
                <SelectItem value="20">20%</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              The commission percentage determines how much of each delivery fee will be charged to the delivery partner.
            </p>
          </div>

          <Separator />

          <div className="flex flex-col sm:flex-row gap-4 justify-end">
            <Button variant="outline" onClick={() => onReject(partner._id)} className="sm:order-1 order-2">
              <X className="h-4 w-4 mr-2" /> Reject Application
            </Button>
            <Button
              onClick={() => onApprove(partner._id, commissionPercent, kycVerified === true)}
              disabled={kycVerified !== true}
              className="sm:order-2 order-1"
            >
              <Check className="h-4 w-4 mr-2" /> Approve Partner
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
} 