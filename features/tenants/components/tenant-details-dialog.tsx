"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tenant } from "../types/tenant"
import { toast } from "sonner"
import { AlertTriangle, Calendar, ChartBar, CheckCircle, Clock, Copy, Edit, Pencil, Tag, TrendingUp } from "lucide-react"
import { useTenantStore } from "../stores/tenant-store"

interface TenantDetailsDialogProps {
  tenant: Tenant | null
  isOpen: boolean
  onClose: () => void
  onActivate: (tenantId: string) => void
  onDeactivate: (tenantId: string) => void
}

export function TenantDetailsDialog({ 
  tenant, 
  isOpen, 
  onClose, 
  onActivate, 
  onDeactivate 
}: TenantDetailsDialogProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("details")
  
  if (!tenant) return null

  // Format currency with en-US locale to prevent hydration errors
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'TZS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const copyToClipboard = (text: string, message: string) => {
    navigator.clipboard.writeText(text)
    toast.success(message)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500">Active</Badge>
      case "inactive":
        return <Badge variant="secondary">Inactive</Badge>
      case "pending":
        return <Badge variant="outline">Pending</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div 
              className="w-8 h-8 rounded-md flex items-center justify-center overflow-hidden bg-muted" 
              style={{ backgroundColor: tenant.branding.theme.colors.background.primary }}
            >
              {tenant.branding.logoUrl ? (
                <img 
                  src={tenant.branding.logoUrl} 
                  alt={tenant.name} 
                  className="object-contain w-6 h-6" 
                />
              ) : (
                <span 
                  className="text-sm font-medium" 
                  style={{ color: tenant.branding.theme.colors.text.primary }}
                >
                  {tenant.name.charAt(0)}
                </span>
              )}
            </div>
            <DialogTitle className="text-xl">{tenant.name}</DialogTitle>
          </div>
          <DialogDescription className="flex items-center gap-2">
            <span>{tenant.domain}</span>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-5 w-5" 
              onClick={() => copyToClipboard(tenant.domain, "Domain copied to clipboard")}
            >
              <Copy className="h-3 w-3" />
            </Button>
            {getStatusBadge(tenant.status)}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-5 w-full">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="branding">Branding</TabsTrigger>
              <TabsTrigger value="modules">Modules</TabsTrigger>
              <TabsTrigger value="billing-history">Billing</TabsTrigger>
              <TabsTrigger value="revenue">Revenue</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 grid-cols-2">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Admin Email</p>
                    <p className="font-medium">{tenant.admin_email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Admin Phone</p>
                    <p className="font-medium">{tenant.admin_phone}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Created At</p>
                    <p className="font-medium">{new Date(tenant.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Last Updated</p>
                    <p className="font-medium">{new Date(tenant.updated_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Localization</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Countries</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {tenant.country_codes.map((code) => (
                        <Badge key={code} variant="outline">{code}</Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Currencies</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {tenant.currencies.map((currency) => (
                        <Badge key={currency} variant="outline">{currency}</Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Languages</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {tenant.languages.map((language) => (
                        <Badge key={language} variant="outline">{language}</Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Billing Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 grid-cols-2">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Billing Period</p>
                      <p className="font-medium">Monthly</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Subscription Fee</p>
                      <p className="font-medium">$199.99/month</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Next Billing Date</p>
                      <p className="font-medium">{new Date(new Date().setDate(new Date().getDate() + 15)).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Payment Status</p>
                      <p className="font-medium flex items-center gap-1">
                        <CheckCircle className="h-4 w-4 text-green-500" /> Active
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="branding" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Theme Colors</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">Primary</p>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-8 h-8 rounded-md border" 
                          style={{ backgroundColor: tenant.branding.theme.colors.primary }}
                        />
                        <span>{tenant.branding.theme.colors.primary}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">Secondary</p>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-8 h-8 rounded-md border" 
                          style={{ backgroundColor: tenant.branding.theme.colors.secondary }}
                        />
                        <span>{tenant.branding.theme.colors.secondary}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">Accent</p>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-8 h-8 rounded-md border" 
                          style={{ backgroundColor: tenant.branding.theme.colors.accent }}
                        />
                        <span>{tenant.branding.theme.colors.accent}</span>
                      </div>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">Text Colors</p>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-8 h-8 rounded-md border" 
                          style={{ backgroundColor: tenant.branding.theme.colors.text.primary }}
                        />
                        <span>Primary: {tenant.branding.theme.colors.text.primary}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-8 h-8 rounded-md border" 
                          style={{ backgroundColor: tenant.branding.theme.colors.text.secondary }}
                        />
                        <span>Secondary: {tenant.branding.theme.colors.text.secondary}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">Background Colors</p>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-8 h-8 rounded-md border" 
                          style={{ backgroundColor: tenant.branding.theme.colors.background.primary }}
                        />
                        <span>Primary: {tenant.branding.theme.colors.background.primary}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-8 h-8 rounded-md border" 
                          style={{ backgroundColor: tenant.branding.theme.colors.background.secondary }}
                        />
                        <span>Secondary: {tenant.branding.theme.colors.background.secondary}</span>
                      </div>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Border Color</p>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-8 h-8 rounded-md border-4" 
                        style={{ borderColor: tenant.branding.theme.colors.border }}
                      />
                      <span>{tenant.branding.theme.colors.border}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Logos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">Primary Logo</p>
                      <div className="aspect-video bg-muted rounded-md flex items-center justify-center p-4">
                        <img 
                          src={tenant.branding.theme.logo.primary || '/placeholder.svg'} 
                          alt="Primary Logo" 
                          className="max-h-full max-w-full object-contain" 
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">Secondary Logo</p>
                      <div className="aspect-video bg-muted rounded-md flex items-center justify-center p-4">
                        <img 
                          src={tenant.branding.theme.logo.secondary || '/placeholder.svg'} 
                          alt="Secondary Logo" 
                          className="max-h-full max-w-full object-contain" 
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">Icon</p>
                      <div className="aspect-video bg-muted rounded-md flex items-center justify-center p-4">
                        <img 
                          src={tenant.branding.theme.logo.icon || '/placeholder.svg'} 
                          alt="Icon" 
                          className="max-h-full max-w-full object-contain" 
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="modules" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Enabled Modules</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4">
                    <div className={`flex items-start p-4 rounded-lg border ${tenant.modules.payments ? 'border-green-500 bg-green-50' : 'bg-gray-50'}`}>
                      <div className="mr-4">
                        {tenant.modules.payments ? (
                          <CheckCircle className="h-6 w-6 text-green-500" />
                        ) : (
                          <AlertTriangle className="h-6 w-6 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium">Payments Module</h4>
                        <p className="text-sm text-muted-foreground">
                          {tenant.modules.payments 
                            ? "Payment processing and transaction management are enabled" 
                            : "Payment processing and transaction management are disabled"}
                        </p>
                      </div>
                    </div>

                    <div className={`flex items-start p-4 rounded-lg border ${tenant.modules.promotions ? 'border-green-500 bg-green-50' : 'bg-gray-50'}`}>
                      <div className="mr-4">
                        {tenant.modules.promotions ? (
                          <CheckCircle className="h-6 w-6 text-green-500" />
                        ) : (
                          <AlertTriangle className="h-6 w-6 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium">Promotions Module</h4>
                        <p className="text-sm text-muted-foreground">
                          {tenant.modules.promotions 
                            ? "Discounts, coupons, and marketing campaigns are enabled" 
                            : "Discounts, coupons, and marketing campaigns are disabled"}
                        </p>
                      </div>
                    </div>

                    <div className={`flex items-start p-4 rounded-lg border ${tenant.modules.inventory ? 'border-green-500 bg-green-50' : 'bg-gray-50'}`}>
                      <div className="mr-4">
                        {tenant.modules.inventory ? (
                          <CheckCircle className="h-6 w-6 text-green-500" />
                        ) : (
                          <AlertTriangle className="h-6 w-6 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium">Inventory Module</h4>
                        <p className="text-sm text-muted-foreground">
                          {tenant.modules.inventory 
                            ? "Inventory tracking and management are enabled" 
                            : "Inventory tracking and management are disabled"}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="billing-history" className="space-y-4 mt-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">Billing History</CardTitle>
                  {tenant.billing_history && tenant.billing_history.length > 0 && (
                    <Button variant="outline" size="sm">
                      <Calendar className="mr-2 h-4 w-4" />
                      View All Invoices
                    </Button>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  {tenant.billing_history && tenant.billing_history.length > 0 ? (
                    <div className="rounded-md border">
                      <table className="w-full caption-bottom text-sm">
                        <thead>
                          <tr className="border-b bg-muted/50">
                            <th className="h-10 px-4 text-left font-medium">Date</th>
                            <th className="h-10 px-4 text-left font-medium">Description</th>
                            <th className="h-10 px-4 text-left font-medium">Amount</th>
                            <th className="h-10 px-4 text-left font-medium">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {tenant.billing_history.map((item) => (
                            <tr key={item.id} className="border-b">
                              <td className="p-4">{new Date(item.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                              <td className="p-4">{item.description}</td>
                              <td className="p-4">{formatCurrency(parseInt(item.amount))}</td>
                              <td className="p-4">
                                <Badge
                                  className={
                                    item.status === 'paid' ? 'bg-green-500' : 
                                    item.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
                                  }
                                >
                                  {item.status}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <Clock className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium">No billing history available</h3>
                      <p className="text-sm text-muted-foreground">
                        There is no billing history for this tenant yet.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="revenue" className="space-y-4 mt-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">Revenue Summary</CardTitle>
                  {tenant.revenue && (
                    <Button variant="outline" size="sm">
                      <TrendingUp className="mr-2 h-4 w-4" />
                      View Full Analytics
                    </Button>
                  )}
                </CardHeader>
                <CardContent>
                  {tenant.revenue ? (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card className="bg-muted/30">
                          <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                                <h3 className="text-2xl font-bold mt-1">{formatCurrency(tenant.revenue.summary.total)}</h3>
                              </div>
                              <div className="p-2 bg-green-100 rounded-full">
                                <ChartBar className="h-5 w-5 text-green-600" />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                        
                        <Card className="bg-muted/30">
                          <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium text-muted-foreground">Growth Rate</p>
                                <h3 className="text-2xl font-bold mt-1">{tenant.revenue.summary.growth}%</h3>
                              </div>
                              <div className="p-2 bg-blue-100 rounded-full">
                                <TrendingUp className="h-5 w-5 text-blue-600" />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                        
                        <Card className="bg-muted/30">
                          <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Transactions</p>
                                <h3 className="text-2xl font-bold mt-1">{tenant.revenue.summary.transactions}</h3>
                              </div>
                              <div className="p-2 bg-orange-100 rounded-full">
                                <Tag className="h-5 w-5 text-orange-600" />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                      
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Monthly Revenue Breakdown</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="rounded-md border">
                            <table className="w-full caption-bottom text-sm">
                              <thead>
                                <tr className="border-b bg-muted/50">
                                  <th className="h-10 px-4 text-left font-medium">Month</th>
                                  <th className="h-10 px-4 text-left font-medium">Revenue</th>
                                </tr>
                              </thead>
                              <tbody>
                                {tenant.revenue.monthly.map((item, idx) => (
                                  <tr key={idx} className="border-b">
                                    <td className="p-4 font-medium">{item.month}</td>
                                    <td className="p-4">{formatCurrency(item.amount)}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <ChartBar className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium">No revenue data available</h3>
                      <p className="text-sm text-muted-foreground">
                        There is no revenue data for this tenant yet.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="mt-6 flex gap-2 justify-between">
          <Button
            variant="outline"
            onClick={() => router.push(`/dashboard/tenants/${tenant.id}/edit`)}
          >
            <Pencil className="h-4 w-4 mr-2" />
            Manage Tenant
          </Button>
          <div className="space-x-2">
            {tenant.status === "active" ? (
              <Button 
                variant="destructive" 
                onClick={() => {
                  onDeactivate(tenant.id)
                  toast.success("Tenant has been deactivated")
                }}
              >
                Deactivate
              </Button>
            ) : (
              <Button 
                onClick={() => {
                  onActivate(tenant.id)
                  toast.success("Tenant has been activated")
                }}
              >
                Activate
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
