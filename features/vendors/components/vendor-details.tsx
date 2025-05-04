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
import { Vendor, VendorDocument } from "../types/vendor"
import { CheckedState } from "@radix-ui/react-checkbox"

interface VendorDetailsProps {
  vendor: Vendor
  onApprove: (id: number, commissionPlan: string, kycVerified: boolean) => void
  onReject: (id: number) => void
  isMobile?: boolean
}

export function VendorDetails({ vendor, onApprove, onReject, isMobile = false }: VendorDetailsProps) {
  const [kycVerified, setKycVerified] = useState<CheckedState>(false)
  const [commissionPlan, setCommissionPlan] = useState("standard")

  const handleKycVerifiedChange = (checked: CheckedState) => {
    setKycVerified(checked)
  }

  return (
    <div className="space-y-6 py-4 px-2 md:px-6">
      <Tabs defaultValue="business" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="business">Business Info</TabsTrigger>
          <TabsTrigger value="documents">KYC Documents</TabsTrigger>
          <TabsTrigger value="approval">Approval</TabsTrigger>
        </TabsList>

        <TabsContent value="business" className="space-y-4 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Business Name</h3>
              <p className="text-base">{vendor.businessName}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Email</h3>
              <p className="text-base">{vendor.email}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Phone</h3>
              <p className="text-base">{vendor.phone}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Category</h3>
              <p className="text-base">{vendor.category}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Registration Date</h3>
              <p className="text-base">{vendor.registrationDate}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Tax ID</h3>
              <p className="text-base">{vendor.taxId}</p>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Business Address</h3>
            <p className="text-base">{vendor.address.street}</p>
            <p className="text-base">
              {vendor.address.city}, {vendor.address.state} {vendor.address.zip}
            </p>
            <p className="text-base">{vendor.address.country}</p>
          </div>

          <Separator />

          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Business Description</h3>
            <p className="text-base">{vendor.description}</p>
          </div>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4 pt-4">
          <div className="space-y-4">
            <h3 className="text-base font-medium">Identity Documents</h3>
            {isMobile ? (
              <ScrollArea className="whitespace-nowrap pb-4">
                <div className="flex gap-4">
                  {vendor.documents.identity.map((doc: VendorDocument, index: number) => (
                    <Card key={index} className="min-w-[200px]">
                      <CardContent className="p-2">
                        <img
                          src={doc.url || "/placeholder.svg"}
                          alt={doc.name}
                          className="h-32 w-full object-cover rounded-md"
                        />
                        <p className="text-xs mt-2 truncate">{doc.name}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {vendor.documents.identity.map((doc: VendorDocument, index: number) => (
                  <Card key={index}>
                    <CardContent className="p-2">
                      <img
                        src={doc.url || "/placeholder.svg"}
                        alt={doc.name}
                        className="h-32 w-full object-cover rounded-md"
                      />
                      <p className="text-xs mt-2 truncate">{doc.name}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="text-base font-medium">Business Certificates</h3>
            {isMobile ? (
              <ScrollArea className="whitespace-nowrap pb-4">
                <div className="flex gap-4">
                  {vendor.documents.business.map((doc: VendorDocument, index: number) => (
                    <Card key={index} className="min-w-[200px]">
                      <CardContent className="p-2">
                        <img
                          src={doc.url || "/placeholder.svg"}
                          alt={doc.name}
                          className="h-32 w-full object-cover rounded-md"
                        />
                        <p className="text-xs mt-2 truncate">{doc.name}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {vendor.documents.business.map((doc: VendorDocument, index: number) => (
                  <Card key={index}>
                    <CardContent className="p-2">
                      <img
                        src={doc.url || "/placeholder.svg"}
                        alt={doc.name}
                        className="h-32 w-full object-cover rounded-md"
                      />
                      <p className="text-xs mt-2 truncate">{doc.name}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="text-base font-medium">Bank Information</h3>
            {isMobile ? (
              <ScrollArea className="whitespace-nowrap pb-4">
                <div className="flex gap-4">
                  {vendor.documents.bank.map((doc: VendorDocument, index: number) => (
                    <Card key={index} className="min-w-[200px]">
                      <CardContent className="p-2">
                        <img
                          src={doc.url || "/placeholder.svg"}
                          alt={doc.name}
                          className="h-32 w-full object-cover rounded-md"
                        />
                        <p className="text-xs mt-2 truncate">{doc.name}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {vendor.documents.bank.map((doc: VendorDocument, index: number) => (
                  <Card key={index}>
                    <CardContent className="p-2">
                      <img
                        src={doc.url || "/placeholder.svg"}
                        alt={doc.name}
                        className="h-32 w-full object-cover rounded-md"
                      />
                      <p className="text-xs mt-2 truncate">{doc.name}</p>
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
              By checking this box, you confirm that you have reviewed all KYC documents and verified the vendor's
              identity.
            </p>
          </div>

          <Separator />

          <div className="space-y-4">
            <Label htmlFor="commission-plan">Commission Plan</Label>
            <Select value={commissionPlan} onValueChange={setCommissionPlan}>
              <SelectTrigger id="commission-plan">
                <SelectValue placeholder="Select a commission plan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="starter">Starter (5%)</SelectItem>
                <SelectItem value="standard">Standard (10%)</SelectItem>
                <SelectItem value="premium">Premium (15%)</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              The commission plan determines the percentage of each sale that will be charged to the vendor.
            </p>
          </div>

          <Separator />

          <div className="flex flex-col sm:flex-row gap-4 justify-end">
            <Button variant="outline" onClick={() => onReject(vendor.id)} className="sm:order-1 order-2">
              <X className="h-4 w-4 mr-2" /> Reject Application
            </Button>
            <Button
              onClick={() => onApprove(vendor.id, commissionPlan, kycVerified === true)}
              disabled={kycVerified !== true}
              className="sm:order-2 order-1"
            >
              <Check className="h-4 w-4 mr-2" /> Approve Vendor
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
} 