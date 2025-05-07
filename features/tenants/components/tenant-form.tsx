"use client"

import { useState, useEffect } from "react";
import { Upload, X, CreditCard, FileText, BarChart3, Check, Truck, Badge } from "lucide-react";
import { useSession } from "next-auth/react";
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { toast } from "sonner"
import { PhoneInput } from "@/components/ui/phone-input"
import { RequiredField } from "@/components/ui/required-field"
import { Checkbox } from "@/components/ui/checkbox"
import { MultiSelect } from "@/components/ui/multi-select"
import { ImageUpload } from "@/components/ui/image-upload"

import { countryCodes, currencies, languages, documentTypes, vehicleTypes } from "../data/localization"
import { mockBillingHistory, BillingHistoryItem } from "../data/billing"

// Define schemas
const brandingSchema = z.object({
  logoUrl: z.string().url("Invalid URL"),
  theme: z.object({
    logo: z.object({
      primary: z.string().url("Invalid URL"),
      secondary: z.string().url("Invalid URL"),
      icon: z.string().url("Invalid URL"),
    }),
    colors: z.object({
      primary: z.string().regex(/^#[0-9A-F]{6}$/i, {
        message: "Please enter a valid hex color code.",
      }),
      secondary: z.string().regex(/^#[0-9A-F]{6}$/i, {
        message: "Please enter a valid hex color code.",
      }),
      accent: z.string().regex(/^#[0-9A-F]{6}$/i, {
        message: "Please enter a valid hex color code.",
      }),
      text: z.object({
        primary: z.string().regex(/^#[0-9A-F]{6}$/i, {
          message: "Please enter a valid hex color code.",
        }),
        secondary: z.string().regex(/^#[0-9A-F]{6}$/i, {
          message: "Please enter a valid hex color code.",
        }),
      }),
      background: z.object({
        primary: z.string().regex(/^#[0-9A-F]{6}$/i, {
          message: "Please enter a valid hex color code.",
        }),
        secondary: z.string().regex(/^#[0-9A-F]{6}$/i, {
          message: "Please enter a valid hex color code.",
        }),
      }),
      border: z.string().regex(/^#[0-9A-F]{6}$/i, {
        message: "Please enter a valid hex color code.",
      }),
    })
  }),
});

const configurationSchema = z.object({
  country_codes: z.array(z.string()).min(1, {
    message: "At least one country code is required.",
  }),
  currencies: z.array(z.string()).min(1, {
    message: "At least one currency is required.",
  }),
  languages: z.array(z.string()).min(1, {
    message: "At least one language is required.",
  }),
  document_types: z.array(z.string()).min(1, {
    message: "At least one document type is required.",
  }),
  vehicle_types: z.array(z.string()).min(1, {
    message: "At least one vehicle type is required.",
  }),
});

const modulesSchema = z.object({
  payments: z.boolean(),
  promotions: z.boolean(),
  inventory: z.boolean(),
});

const billingSchema = z.object({
  billing_plan: z.enum(["monthly", "quarterly", "annually"], {
    required_error: "Please select a subscription plan.",
  }),
  subscription_fee: z.string().min(1, {
    message: "Subscription fee is required",
  }),
});

const revenueSchema = z.object({
  total_revenue: z.string().optional(),
  commission_rate: z.string().min(1, {
    message: "Commission rate is required",
  }),
  platform_fee: z.string().min(1, {
    message: "Platform fee is required",
  }),
});

const tenantFormSchema = z.object({
  name: z.string().min(2, {
    message: "Tenant name must be at least 2 characters.",
  }),
  domain: z.string().min(5, {
    message: "Domain must be at least 5 characters.",
  }).refine(value => value.includes("."), {
    message: "Domain must include at least one period (.)",
  }),
  admin_email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  admin_phone: z.string().min(10, {
    message: "Please enter a valid phone number.",
  }),
  billing: billingSchema,
  configuration: configurationSchema,
  modules: modulesSchema,
  branding: brandingSchema,
  revenue: revenueSchema.optional(),
});

type TenantFormValues = z.infer<typeof tenantFormSchema>;

const defaultValues: Partial<TenantFormValues> = {
  billing: {
    billing_plan: "monthly",
    subscription_fee: "199.99",
  },
  configuration: {
    country_codes: [],
    currencies: [],
    languages: [],
    document_types: ["nida", "passport", "drivers_license", "business_license"],
    vehicle_types: ["boda", "car", "truck"],
  },
  modules: {
    payments: false,
    promotions: false,
    inventory: false,
  },
  branding: {
    logoUrl: "",
    theme: {
      logo: {
        primary: "",
        secondary: "",
        icon: "",
      },
      colors: {
        primary: "#4285F4",
        secondary: "#34A853",
        accent: "#FBBC05",
        text: {
          primary: "#000000",
          secondary: "#666666",
        },
        background: {
          primary: "#FFFFFF",
          secondary: "#F5F5F5",
        },
        border: "#E5E5E5",
      },
    },
  },
};

interface TenantFormProps {
  onSubmit: (data: TenantFormValues) => void;
  onCancel?: () => void;
  initialData?: Partial<TenantFormValues> & { id?: string };
  isEditable?: boolean;
  id?: string;
}

// Type for billing history item
type BillingHistoryItem = {
  id: number;
  date: string;
  description: string;
  amount: string;
  status: 'paid' | 'pending' | 'failed';
};

export function TenantForm({ onSubmit, onCancel, initialData, isEditable = true, id }: TenantFormProps) {
  const { data: session } = useSession();
  const userRole = session?.user?.role || "";
  const isSuperOwner = userRole === "super_owner";
  const isAddPage = !initialData?.id;

  const [activeTab, setActiveTab] = useState("details");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [primaryLogoFile, setPrimaryLogoFile] = useState<File | null>(null);
  const [secondaryLogoFile, setSecondaryLogoFile] = useState<File | null>(null);
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [showMoreHistory, setShowMoreHistory] = useState(false);
  const [billingHistory] = useState<BillingHistoryItem[]>(mockBillingHistory);

  const form = useForm<TenantFormValues>({
    resolver: zodResolver(tenantFormSchema),
    defaultValues: initialData ? { ...defaultValues, ...initialData } : defaultValues,
  });

  const nextTab = () => {
    if (activeTab === "details") {
      const detailsFields = ["name", "domain", "admin_email", "admin_phone", "billing_plan", "subscription_fee"];
      const result = detailsFields.every((field) =>
        form.trigger(field as keyof TenantFormValues)
      );

      if (result) {
        setActiveTab("branding");
      } else {
        toast.error("Please complete all required fields.");
      }
    } else if (activeTab === "branding") {
      const brandingFields = ["logoUrl", "theme"];
      const result = brandingFields.every((field) =>
        form.trigger(field as keyof TenantFormValues)
      );

      if (result) {
        setActiveTab("configuration");
      } else {
        toast.error("Please complete all required fields.");
      }
    } else if (activeTab === "configuration") {
      setActiveTab("modules");
    }
  };

  const prevTab = () => {
    if (activeTab === "branding") {
      setActiveTab("details");
    } else if (activeTab === "configuration") {
      setActiveTab("branding");
    } else if (activeTab === "modules") {
      setActiveTab("configuration");
    }
  };

  // Handle file upload for form submission
  const handleFileUpload = (file: File, fieldName: string) => {
    console.log(`Uploading file for ${fieldName}:`, file);
    // In a real application, you would upload the file to a server here
    // and get back a URL to use in the form submission
    // For now, we'll just use the file object directly
  };

  return (
    <Card className="mx-4">
      <CardContent className="p-6">
        <Form {...form}>
          <form
            id={id}
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6"
          >
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full">
                <TabsTrigger value="details">Basic Details</TabsTrigger>
                <TabsTrigger value="branding">Branding</TabsTrigger>
                <TabsTrigger value="configuration">Configuration</TabsTrigger>
                <TabsTrigger value="modules">Modules</TabsTrigger>
                {!isAddPage && (
                  <TabsTrigger value="billing-history">Billing History</TabsTrigger>
                )}
                {isSuperOwner && !isAddPage && (
                  <TabsTrigger value="revenue">Revenue</TabsTrigger>
                )}
              </TabsList>

              <TabsContent value="details" className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tenant Name <RequiredField /></FormLabel>
                        <FormControl>
                          <Input placeholder="Example Store" {...field} readOnly={!isEditable} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="domain"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Domain <RequiredField /></FormLabel>
                        <FormControl>
                          <Input placeholder="example-store.marketplace.com" {...field} readOnly={!isEditable} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Administrator Contact</h3>
                  <div className="grid gap-6 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="admin_email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email <RequiredField /></FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="admin@example.com" {...field} readOnly={!isEditable} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="admin_phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone <RequiredField /></FormLabel>
                          <FormControl>
                            <PhoneInput placeholder="+255712345678" {...field} disabled={!isEditable} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Subscription Details</h3>
                  <div className="grid gap-6 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="billing.billing_plan"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Billing Plan <RequiredField /></FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a billing plan" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="monthly">Monthly</SelectItem>
                              <SelectItem value="quarterly">Quarterly</SelectItem>
                              <SelectItem value="annually">Annually</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="billing.subscription_fee"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Subscription Fee <RequiredField /></FormLabel>
                          <FormControl>
                            <Input placeholder="199.99" {...field} />
                          </FormControl>
                          <FormDescription>
                            Monthly subscription amount
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="branding" className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Store Branding</h3>

                  <div className="grid gap-6 md:grid-cols-4">
                    <FormField
                      control={form.control}
                      name="branding.logoUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Logo URL <RequiredField /></FormLabel>
                          <FormControl>
                            <ImageUpload
                              id="logo-upload"
                              value={field.value}
                              onChange={field.onChange}
                              previewAlt="Store Logo Preview"
                              onFileChange={(file) => handleFileUpload(file, 'logoUrl')}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-md font-medium">Logo Variants</h4>
                    <div className="grid gap-8 md:grid-cols-4">
                      <FormField
                        control={form.control}
                        name="branding.theme.logo.primary"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Primary Logo</FormLabel>
                            <FormControl>
                              <ImageUpload
                                id="primary-logo-upload"
                                value={field.value}
                                onChange={field.onChange}
                                previewAlt="Primary Logo Preview"
                                onFileChange={(file) => handleFileUpload(file, 'primaryLogo')}
                                height="h-32"
                                buttonText="Primary Logo"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="branding.theme.logo.secondary"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Secondary Logo</FormLabel>
                            <FormControl>
                              <ImageUpload
                                id="secondary-logo-upload"
                                value={field.value}
                                onChange={field.onChange}
                                previewAlt="Secondary Logo Preview"
                                onFileChange={(file) => handleFileUpload(file, 'secondaryLogo')}
                                height="h-32"
                                buttonText="Secondary Logo"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="branding.theme.logo.icon"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Icon Logo</FormLabel>
                            <FormControl>
                              <ImageUpload
                                id="icon-logo-upload"
                                value={field.value}
                                onChange={field.onChange}
                                previewAlt="Icon Logo Preview"
                                onFileChange={(file) => handleFileUpload(file, 'iconLogo')}
                                height="h-32"
                                buttonText="Icon Logo"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <h4 className="text-md font-medium">Brand Colors</h4>
                    <div className="grid gap-6 md:grid-cols-3">
                      <FormField
                        control={form.control}
                        name="branding.theme.colors.primary"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Primary Color <RequiredField /></FormLabel>
                            <FormControl>
                              <div className="flex gap-2">
                                <div 
                                  className="w-10 h-10 rounded-md border" 
                                  style={{ backgroundColor: field.value }}
                                />
                                <Input type="text" placeholder="#4285F4" {...field} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="branding.theme.colors.secondary"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Secondary Color <RequiredField /></FormLabel>
                            <FormControl>
                              <div className="flex gap-2">
                                <div 
                                  className="w-10 h-10 rounded-md border" 
                                  style={{ backgroundColor: field.value }}
                                />
                                <Input type="text" placeholder="#34A853" {...field} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="branding.theme.colors.accent"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Accent Color <RequiredField /></FormLabel>
                            <FormControl>
                              <div className="flex gap-2">
                                <div 
                                  className="w-10 h-10 rounded-md border" 
                                  style={{ backgroundColor: field.value }}
                                />
                                <Input type="text" placeholder="#FBBC05" {...field} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <h4 className="text-md font-medium">Text & Background Colors</h4>
                    <div className="grid gap-6 md:grid-cols-4">
                      <FormField
                        control={form.control}
                        name="branding.theme.colors.text.primary"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Primary Text <RequiredField /></FormLabel>
                            <FormControl>
                              <div className="flex gap-2">
                                <div 
                                  className="w-10 h-10 rounded-md border" 
                                  style={{ backgroundColor: field.value }}
                                />
                                <Input type="text" placeholder="#000000" {...field} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="branding.theme.colors.text.secondary"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Secondary Text <RequiredField /></FormLabel>
                            <FormControl>
                              <div className="flex gap-2">
                                <div 
                                  className="w-10 h-10 rounded-md border" 
                                  style={{ backgroundColor: field.value }}
                                />
                                <Input type="text" placeholder="#666666" {...field} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="branding.theme.colors.background.primary"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Primary Background <RequiredField /></FormLabel>
                            <FormControl>
                              <div className="flex gap-2">
                                <div 
                                  className="w-10 h-10 rounded-md border" 
                                  style={{ backgroundColor: field.value }}
                                />
                                <Input type="text" placeholder="#FFFFFF" {...field} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="branding.theme.colors.background.secondary"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Secondary Background <RequiredField /></FormLabel>
                            <FormControl>
                              <div className="flex gap-2">
                                <div 
                                  className="w-10 h-10 rounded-md border" 
                                  style={{ backgroundColor: field.value }}
                                />
                                <Input type="text" placeholder="#F5F5F5" {...field} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <FormField
                    control={form.control}
                    name="branding.theme.colors.border"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Border Color <RequiredField /></FormLabel>
                        <FormControl>
                          <div className="flex gap-2">
                            <div 
                              className="w-10 h-10 rounded-md border-4" 
                              style={{ borderColor: field.value }}
                            />
                            <Input type="text" placeholder="#E5E5E5" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>

              <TabsContent value="configuration" className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Marketplace Configurations</h3>
                  <p className="text-sm text-muted-foreground">
                    Configure countries, languages, currencies, and other marketplace settings
                  </p>

                  <div className="space-y-6">
                    <h4 className="text-md font-medium">Localization Settings</h4>
                    <div className="grid gap-6 md:grid-cols-3">
                      <FormField
                        control={form.control}
                        name="configuration.country_codes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Countries <RequiredField /></FormLabel>
                            <FormControl>
                              <MultiSelect
                                options={countryCodes}
                                selected={field.value}
                                onChange={field.onChange}
                                placeholder="Select countries"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="configuration.currencies"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Currencies <RequiredField /></FormLabel>
                            <FormControl>
                              <MultiSelect
                                options={currencies}
                                selected={field.value}
                                onChange={field.onChange}
                                placeholder="Select currencies"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="configuration.languages"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Languages <RequiredField /></FormLabel>
                            <FormControl>
                              <MultiSelect
                                options={languages}
                                selected={field.value}
                                onChange={field.onChange}
                                placeholder="Select languages"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <Separator className="my-4" />
                  
                    <h4 className="text-md font-medium">Document & Vehicle Types</h4>
                    <div className="grid gap-6 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="configuration.document_types"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Document Types <RequiredField /></FormLabel>
                            <FormControl>
                              <MultiSelect
                                options={documentTypes}
                                selected={field.value}
                                onChange={field.onChange}
                                placeholder="Select document types"
                              />
                            </FormControl>
                            <FormDescription>
                              Document types accepted across this marketplace
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="configuration.vehicle_types"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Vehicle Types <RequiredField /></FormLabel>
                            <FormControl>
                              <MultiSelect
                                options={vehicleTypes}
                                selected={field.value}
                                onChange={field.onChange}
                                placeholder="Select vehicle types"
                              />
                            </FormControl>
                            <FormDescription>
                              Vehicle types available for delivery partners
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="modules" className="space-y-4 mt-4">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Module Configuration</h3>
                  {!isSuperOwner && (
                    <Alert className="mb-4">
                      <FileText className="h-4 w-4" />
                      <AlertTitle>View Only</AlertTitle>
                      <AlertDescription>
                        Only super admins can modify module configurations
                      </AlertDescription>
                    </Alert>
                  )}
                  <p className="text-sm text-muted-foreground">
                    Enable or disable specific marketplace modules for this tenant
                  </p>

                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="modules.payments"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              Payments Module
                            </FormLabel>
                            <FormDescription>
                              Enables payment processing and transaction management
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              disabled={!isSuperOwner}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="modules.promotions"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              Promotions Module
                            </FormLabel>
                            <FormDescription>
                              Enables discounts, coupons, and marketing campaigns
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              disabled={!isSuperOwner}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="modules.inventory"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              Inventory Module
                            </FormLabel>
                            <FormDescription>
                              Enables inventory tracking and management
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              disabled={!isSuperOwner}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </TabsContent>
              
              {isSuperOwner && !isAddPage && (
                <TabsContent value="revenue" className="space-y-4 mt-4">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Revenue Summary</h3>
                    <p className="text-sm text-muted-foreground">
                      Revenue and commission information for this tenant
                    </p>

                    <div className="grid gap-6 md:grid-cols-3">
                      <Card className="p-4 flex flex-col gap-2">
                        <div className="text-sm font-medium text-muted-foreground">Total Revenue</div>
                        <div className="text-2xl font-bold">TZS 12,896,540</div>
                        <div className="text-xs text-muted-foreground">Since tenant inception</div>
                      </Card>
                      
                      <Card className="p-4 flex flex-col gap-2">
                        <div className="text-sm font-medium text-muted-foreground">Commission Earned</div>
                        <div className="text-2xl font-bold">TZS 1,289,654</div>
                        <div className="text-xs text-muted-foreground">Based on current rate</div>
                      </Card>
                      
                      <Card className="p-4 flex flex-col gap-2">
                        <div className="text-sm font-medium text-muted-foreground">Monthly Average</div>
                        <div className="text-2xl font-bold">TZS 1,074,711</div>
                        <div className="text-xs text-muted-foreground">Last 12 months</div>
                      </Card>
                    </div>
                    
                    <Separator className="my-6" />
                    
                    <div className="space-y-4">
                      <h4 className="text-md font-medium">Revenue Breakdown</h4>
                      
                      <div className="border rounded-md overflow-hidden">
                        <div className="min-w-full divide-y divide-gray-200">
                          <div className="bg-gray-50">
                            <div className="grid grid-cols-4 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              <div>Month</div>
                              <div>Revenue</div>
                              <div>Commission</div>
                              <div>Growth</div>
                            </div>
                          </div>
                          <div className="bg-white divide-y divide-gray-200">
                            {[...Array(6)].map((_, index) => (
                              <div key={index} className="grid grid-cols-4 px-6 py-4 text-sm">
                                <div className="text-gray-900">{new Date(2024, 4 - index, 1).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}</div>
                                <div className="text-gray-900">TZS {(1200000 - index * 50000).toLocaleString()}</div>
                                <div className="text-gray-900 font-medium">TZS {(120000 - index * 5000).toLocaleString()}</div>
                                <div>
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${index % 3 === 0 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                    {index % 3 === 0 ? '+' : ''}{6 - index}%
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              )}

              <TabsContent value="billing-history" className="space-y-4 mt-4">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Billing History</h3>
                  <p className="text-sm text-muted-foreground">
                    Recent payment activities and transaction history
                  </p>

                  {billingHistory.length === 0 ? (
                    <div className="text-center py-8 border rounded-md">
                      <p className="text-muted-foreground">No billing history available</p>
                    </div>
                  ) : (
                    <div className="border rounded-md overflow-hidden">
                      <div className="min-w-full divide-y divide-gray-200">
                        <div className="bg-gray-50">
                          <div className="grid grid-cols-4 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            <div>Date</div>
                            <div>Description</div>
                            <div>Amount</div>
                            <div>Status</div>
                          </div>
                        </div>
                        <div className="bg-white divide-y divide-gray-200">
                          {billingHistory
                            .slice(0, showMoreHistory ? 10 : 5)
                            .map((item) => (
                              <div key={item.id} className="grid grid-cols-4 px-6 py-4 text-sm">
                                <div className="text-gray-900">
                                  {new Date(item.date).toLocaleDateString('en-US', { 
                                    year: 'numeric', 
                                    month: 'short', 
                                    day: 'numeric' 
                                  })}
                                </div>
                                <div className="text-gray-900">{item.description}</div>
                                <div className="text-gray-900 font-medium">{item.amount}</div>
                                <div>
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    {item.status}
                                  </span>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {billingHistory.length > 5 && (
                    <div className="text-center">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowMoreHistory(!showMoreHistory)}
                      >
                        {showMoreHistory ? "Show Less" : "Show More"}
                      </Button>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
            
            {/* TODO: for marketplace page do not show the previous, next or submit buttons */}
            {isEditable && (
              <div className="flex flex-col-reverse sm:flex-row gap-2 justify-end mt-6">
                {activeTab !== "billing-history" && activeTab !== "revenue" && (
                  <>
                    {activeTab !== "details" && (
                      <Button type="button" variant="outline" onClick={prevTab}>
                        Previous
                      </Button>
                    )}

                    {activeTab !== "modules" ? (
                      <Button type="button" onClick={nextTab}>
                        Next
                      </Button>
                    ) : (
                      <Button type="submit">Submit</Button>
                    )}
                  </>
                )}
              </div>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
