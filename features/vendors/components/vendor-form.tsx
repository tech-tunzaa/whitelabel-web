"use client"

import { useState, useCallback, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useSession } from "next-auth/react"
import { Loader2, Store, ArrowLeft, Upload, RefreshCw, Building2, CreditCard, FileText, Truck } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
import { DocumentUpload } from "@/components/ui/document-upload"
import { PhoneInput } from "@/components/ui/phone-input"
import { RequiredField } from "@/components/ui/required-field"
import { ImageUpload } from "@/components/ui/image-upload"
import { ColorPicker } from "@/components/ui/color-picker"
import { Spinner } from "@/components/ui/spinner"
import { ErrorCard } from "@/components/ui/error-card"

import { countries } from "@/features/settings/data/localization"
import { vendorFormSchema } from "../schema"
import { VendorFormValues } from "../types"
import { useTenantStore } from "@/features/tenants/store"

// Default values that match the API structure
const defaultValues: Partial<VendorFormValues> = {
  tenant_id: "",
  business_name: "",
  display_name: "",
  contact_email: "",
  contact_phone: "",
  website: "",
  address_line1: "",
  address_line2: "",
  city: "",
  state_province: "",
  postal_code: "",
  country: "Tanzania",
  tax_id: "",
  bank_account: {
    bank_name: "",
    account_number: "",
    account_name: "",
    swift_code: "",
    branch_code: ""
  },
  store: {
    store_name: "",
    store_slug: "",
    description: "",
    branding: {
      logo_url: "",
      colors: {
        primary: "#3182CE",
        secondary: "#E2E8F0",
        accent: "#ED8936",
        text: "#000000",
        background: "#FFFFFF"
      }
    }
  }
}

const businessCategories = [
  "Apparel",
  "Electronics",
  "Food & Beverages",
  "Handmade Goods",
  "Health & Beauty",
  "Home & Garden",
  "Jewelry & Accessories",
  "Sports & Outdoors",
  "Toys & Games",
  "Other",
]

const bankNames = [
  "CRDB Bank",
  "NMB Bank",
  "NBC Bank",
  "Stanbic Bank",
  "Absa Bank",
  "Equity Bank",
  "Standard Chartered",
  "DTB Bank",
  "Access Bank",
  "TPB Bank",
  "Other"
]

interface VendorFormProps {
  onSubmit: (data: VendorFormValues) => void;
  onCancel?: () => void;
  initialData?: Partial<VendorFormValues> & { id?: string };
  isEditable?: boolean;
  id?: string;
  isSubmitting?: boolean;
}

export function VendorForm({ onSubmit, onCancel, initialData, isEditable = true, id, isSubmitting: externalIsSubmitting }: VendorFormProps) {
  const { data: session } = useSession();
  const userRole = session?.user?.role || "";
  const isSuperOwner = userRole === "super_owner";
  const isAddPage = !initialData?.id;

  const { fetchTenants } = useTenantStore();

  useEffect(() => {
    fetchTenants();
  }, [fetchTenants]);

  const tenants = useTenantStore((state) => state.tenants);


  // Form state management
  const [activeTab, setActiveTab] = useState("business")
  const [internalIsSubmitting, setInternalIsSubmitting] = useState(false);
  const isSubmitting = externalIsSubmitting !== undefined ? externalIsSubmitting : internalIsSubmitting;
  const [formError, setFormError] = useState<string | null>(null);
  
  // Document uploads
  const [identityDocs, setIdentityDocs] = useState<File[]>([])
  const [businessDocs, setBusinessDocs] = useState<File[]>([])
  const [bankDocs, setBankDocs] = useState<File[]>([])
  const [identityDocsExpiry, setIdentityDocsExpiry] = useState<Record<string, string>>({})
  const [businessDocsExpiry, setBusinessDocsExpiry] = useState<Record<string, string>>({})
  const [bankDocsExpiry, setBankDocsExpiry] = useState<Record<string, string>>({})
  
  // Logo upload
  const [logoFile, setLogoFile] = useState<File | null>(null);

  // Form validation tabs mapping
  const tabValidationMap = {
    "business": [
      "business_name", 
      "display_name", 
      "contact_email", 
      "contact_phone", 
      "tax_id"
    ],
    "store": [
      "store.store_name", 
      "store.store_slug", 
      "store.description", 
      "store.branding.colors.primary",
      "store.branding.colors.secondary",
      "store.branding.colors.accent",
      "store.branding.colors.text",
      "store.branding.colors.background"
    ],
    "address": [
      "address_line1", 
      "city", 
      "state_province", 
      "postal_code", 
      "country"
    ],
    "banking": [
      "bank_account.bank_name", 
      "bank_account.account_number", 
      "bank_account.account_name"
    ],
    "documents": [] // Documents are optional
  };
  
  const tabFlow = ["business", "store", "address", "banking", "documents", "review"];

  const form = useForm<VendorFormValues>({
    resolver: zodResolver(vendorFormSchema),
    defaultValues: initialData ? { ...defaultValues, ...initialData } : defaultValues,
  })

  // Tab navigation with field validation
  const nextTab = useCallback(() => {
    const currentTabIndex = tabFlow.indexOf(activeTab);
    if (currentTabIndex === -1 || currentTabIndex === tabFlow.length - 1) return;
    
    // Get fields to validate for the current tab
    const fieldsToValidate = tabValidationMap[activeTab as keyof typeof tabValidationMap] || [];
    
    // Validate all required fields in the current tab
    const result = fieldsToValidate.every(field => form.trigger(field as any));
    
    if (result) {
      setActiveTab(tabFlow[currentTabIndex + 1]);
    } else {
      toast.error("Please complete all required fields before proceeding.");
    }
  }, [activeTab, form, tabFlow, tabValidationMap]);

  const prevTab = useCallback(() => {
    const currentTabIndex = tabFlow.indexOf(activeTab);
    if (currentTabIndex > 0) {
      setActiveTab(tabFlow[currentTabIndex - 1]);
    }
  }, [activeTab, tabFlow]);

  // Handle file upload for form submission
  const handleFileUpload = useCallback((file: File, fieldName: string) => {
    console.log(`Uploading file for ${fieldName}:`, file);
    return `https://storage.example.com/${fieldName}/${file.name}`;
  }, []);

  // Handle form submission with error handling and validation
  const handleFormSubmit = useCallback(async (data: VendorFormValues) => {
    try {
      setFormError(null);
      setInternalIsSubmitting(true);
      
      // Process files if needed
      if (logoFile) {
        const logoUrl = await handleFileUpload(logoFile, 'logos');
        data.store.branding.logo_url = logoUrl;
      }
      
      // Convert document files to verification documents
      if (identityDocs.length || businessDocs.length) {
        const verificationDocs = [];
        
        for (const file of identityDocs) {
          const docUrl = await handleFileUpload(file, 'identity');
          verificationDocs.push({
            document_type: 'identity',
            document_url: docUrl,
            verification_status: 'pending' as const
          });
        }
        
        for (const file of businessDocs) {
          const docUrl = await handleFileUpload(file, 'business');
          verificationDocs.push({
            document_type: 'business_registration',
            document_url: docUrl,
            verification_status: 'pending' as const
          });
        }
        
        data.verification_documents = verificationDocs;
      }
      
      await onSubmit(data);
      
      // Success would typically be handled by the parent component
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      setFormError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setInternalIsSubmitting(false);
    }
  }, [logoFile, identityDocs, businessDocs, handleFileUpload, onSubmit]);
  
  // Handle form errors by navigating to the tab with the first error
  const handleFormError = useCallback((errors: any) => {
    // Find which tab has errors
    const tabWithErrors = findTabWithErrors(errors);
    
    // Switch to the tab containing errors
    setActiveTab(tabWithErrors);
    toast.error("Please fix the validation errors before submitting");
    
    // Log validation errors for debugging
    console.error("Form validation errors:", errors);
  }, []);

  // Function to find which tab contains field errors
  const findTabWithErrors = (errors: any): string => {
    // Check each field against our tab mapping to find which tab has errors
    for (const [tabName, fields] of Object.entries(tabValidationMap)) {
      for (const field of fields) {
        // Handle nested fields (with dots)
        if (field.includes(".")) {
          const parts = field.split(".");
          let currentObj = errors;
          let hasError = true;
          
          // Navigate through the nested error object
          for (const part of parts) {
            if (!currentObj || !currentObj[part]) {
              hasError = false;
              break;
            }
            currentObj = currentObj[part];
          }
          
          if (hasError) return tabName;
        } else if (errors[field]) {
          return tabName;
        }
      }
    }
    
    // If no tab with errors is found, stay on the current tab
    return activeTab;
  };

  // If there's a form error and we're not loading, show error card
  if (formError && !isSubmitting) {
    return (
      <ErrorCard
        title={`Failed to ${isAddPage ? 'create' : 'update'} vendor`}
        error={{ status: 'Error', message: formError }}
        buttonText="Try Again"
        buttonAction={() => setFormError(null)}
        buttonIcon={RefreshCw}
      />
    );
  }

  return (
    <fieldset disabled={isSubmitting}>
      <Card className="w-full">
        <CardContent className="p-6">
          <Form {...form}>
            <form 
              id={id}
              onSubmit={form.handleSubmit(handleFormSubmit, handleFormError)}
            >
              <FormField
                control={form.control}
                name="tenant_id"
                render={({ field }) => (
                  <FormItem className="mb-6">
                    <FormLabel>Marketplace <RequiredField /></FormLabel>
                    <Select>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a marketplace" />
                      </SelectTrigger>
                      <SelectContent>
                        {tenants.map((tenant) => (
                          <SelectItem key={tenant.id} value={tenant.id}>
                            {tenant.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Select the marketplace for this vendor
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-6">
                  <TabsTrigger value="business">Business</TabsTrigger>
                  <TabsTrigger value="store">Store</TabsTrigger>
                  <TabsTrigger value="address">Address</TabsTrigger>
                  <TabsTrigger value="banking">Banking</TabsTrigger>
                  <TabsTrigger value="documents">Documents</TabsTrigger>
                  <TabsTrigger value="review">Review</TabsTrigger>
                </TabsList>

                <BusinessTab />
                
                <StoreTab />
                
                <AddressTab />
                
                <BankingTab />

                <DocumentsTab />

                <ReviewTab />
              </Tabs>

              {isEditable && (
                <div className="flex flex-col-reverse sm:flex-row gap-2 justify-end mt-6">
                  {activeTab !== "review" ? (
                    <div className="flex gap-2">
                      {activeTab !== tabFlow[0] && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={prevTab}
                        >
                          Previous
                        </Button>
                      )}
                      <Button
                        type="button"
                        onClick={nextTab}
                      >
                        Next
                      </Button>
                    </div>
                  ) : (
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Spinner size="sm" color="white" />
                          Processing...
                        </>
                      ) : (
                        'Submit'
                      )}
                    </Button>
                  )}
                </div>
              )}
            </form>
          </Form>
        </CardContent>
      </Card>
    </fieldset>
  )
  
  function BusinessTab() {
    return (
      <TabsContent value="business" className="space-y-6 pt-4">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Business Information</h3>
          <p className="text-sm text-muted-foreground">
            Provide your business details to get started.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="business_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Business Name <RequiredField /></FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Your business name" 
                    value={field.value} 
                    onChange={field.onChange} 
                    onBlur={field.onBlur} 
                    name={field.name} 
                    ref={field.ref} 
                  />
                </FormControl>
                <FormDescription>
                  The official name of your business.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="display_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Display Name <RequiredField /></FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Display name for your business" 
                    value={field.value} 
                    onChange={field.onChange} 
                    onBlur={field.onBlur} 
                    name={field.name} 
                    ref={field.ref} 
                  />
                </FormControl>
                <FormDescription>
                  How your business name will be displayed to customers.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="contact_email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email <RequiredField /></FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Email address" 
                    type="email" 
                    value={field.value} 
                    onChange={field.onChange} 
                    onBlur={field.onBlur} 
                    name={field.name} 
                    ref={field.ref} 
                  />
                </FormControl>
                <FormDescription>
                  Your business contact email address.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="contact_phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone <RequiredField /></FormLabel>
                <FormControl>
                  <PhoneInput 
                    value={field.value} 
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    disabled={!isEditable} 
                    ref={field.ref}
                  />
                </FormControl>
                <FormDescription>
                  Your business contact phone number.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="tax_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tax ID <RequiredField /></FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Tax ID" 
                    value={field.value} 
                    onChange={field.onChange} 
                    onBlur={field.onBlur} 
                    name={field.name} 
                    ref={field.ref} 
                  />
                </FormControl>
                <FormDescription>
                  Your business tax identification number.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="website"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Website</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="https://yourbusiness.com" 
                    value={field.value} 
                    onChange={field.onChange} 
                    onBlur={field.onBlur} 
                    name={field.name} 
                    ref={field.ref} 
                  />
                </FormControl>
                <FormDescription>
                  Your business website URL (optional).
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="commission_rate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Commission Rate</FormLabel>
              <FormControl>
                <Input 
                  placeholder="e.g. 10%" 
                  value={field.value} 
                  onChange={field.onChange} 
                  onBlur={field.onBlur} 
                  name={field.name} 
                  ref={field.ref} 
                />
              </FormControl>
              <FormDescription>
                Commission rate for products sold through the marketplace (if applicable).
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </TabsContent>
    )
  }

  function StoreTab() {
    return (
      <TabsContent value="store" className="space-y-6 pt-4">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Store Information</h3>
          <p className="text-sm text-muted-foreground">
            Set up your online storefront details.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="store.store_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Store Name <RequiredField /></FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Your store name" 
                    value={field.value} 
                    onChange={field.onChange} 
                    onBlur={field.onBlur} 
                    name={field.name} 
                    ref={field.ref} 
                  />
                </FormControl>
                <FormDescription>
                  The name of your online store.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="store.store_slug"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Store URL Slug <RequiredField /></FormLabel>
                <FormControl>
                  <Input 
                    placeholder="your-store-name" 
                    value={field.value} 
                    onChange={field.onChange} 
                    onBlur={field.onBlur} 
                    name={field.name} 
                    ref={field.ref} 
                  />
                </FormControl>
                <FormDescription>
                  Used in your store's URL: marketplace.com/stores/{field.value || 'your-store-name'}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="store.description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Store Description <RequiredField /></FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Tell customers about your store..."
                  className="min-h-[100px] resize-none"
                  value={field.value} 
                  onChange={field.onChange} 
                  onBlur={field.onBlur} 
                  name={field.name} 
                  ref={field.ref}
                />
              </FormControl>
              <FormDescription>
                Describe what your store offers to customers.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Store Branding</h3>
          <FormField
            control={form.control}
            name="store.branding.logo_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Store Logo</FormLabel>
                <FormControl>
                  <ImageUpload
                    value={field.value}
                    onChange={(url) => {
                      field.onChange(url)
                    }}
                    onRemove={() => field.onChange('')}
                    onUpload={(file) => {
                      // Set the file for later processing during submission
                      setLogoFile(file);
                      // For preview purposes, we can use a temporary URL
                      const previewUrl = URL.createObjectURL(file);
                      field.onChange(previewUrl);
                    }}
                  />
                </FormControl>
                <FormDescription>
                  Upload your store logo (recommended size: 400x400px).
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Brand Colors</h3>
          <div className="grid gap-4 md:grid-cols-3">
            <FormField
              control={form.control}
              name="store.branding.colors.primary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Primary Color <RequiredField /></FormLabel>
                  <FormControl>
                    <ColorPicker value={field.value} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="store.branding.colors.secondary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Secondary Color <RequiredField /></FormLabel>
                  <FormControl>
                    <ColorPicker value={field.value} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="store.branding.colors.accent"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Accent Color <RequiredField /></FormLabel>
                  <FormControl>
                    <ColorPicker value={field.value} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="store.branding.colors.text"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Text Color <RequiredField /></FormLabel>
                  <FormControl>
                    <ColorPicker value={field.value} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="store.branding.colors.background"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Background Color <RequiredField /></FormLabel>
                  <FormControl>
                    <ColorPicker value={field.value} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      </TabsContent>
    )
  }
  
  function AddressTab() {
    return (
      <TabsContent value="address" className="space-y-6 pt-4">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Business Address</h3>
          <p className="text-sm text-muted-foreground">
            Provide your business location information.
          </p>
        </div>
        <FormField
          control={form.control}
          name="address_line1"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address Line 1 <RequiredField /></FormLabel>
              <FormControl>
                <Input 
                  placeholder="123 Main St" 
                  value={field.value} 
                  onChange={field.onChange} 
                  onBlur={field.onBlur} 
                  name={field.name} 
                  ref={field.ref} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="address_line2"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address Line 2</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Suite 101" 
                  value={field.value} 
                  onChange={field.onChange} 
                  onBlur={field.onBlur} 
                  name={field.name} 
                  ref={field.ref} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>City <RequiredField /></FormLabel>
                <FormControl>
                  <Input 
                    placeholder="City" 
                    value={field.value} 
                    onChange={field.onChange} 
                    onBlur={field.onBlur} 
                    name={field.name} 
                    ref={field.ref} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="state_province"
            render={({ field }) => (
              <FormItem>
                <FormLabel>State/Province <RequiredField /></FormLabel>
                <FormControl>
                  <Input 
                    placeholder="State or Province" 
                    value={field.value} 
                    onChange={field.onChange} 
                    onBlur={field.onBlur} 
                    name={field.name} 
                    ref={field.ref} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="postal_code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Postal Code <RequiredField /></FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Postal code" 
                    value={field.value} 
                    onChange={field.onChange} 
                    onBlur={field.onBlur} 
                    name={field.name} 
                    ref={field.ref} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="country"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Country <RequiredField /></FormLabel>
                <FormControl>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    name={field.name}
                    ref={field.ref}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a country" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem key={country.value} value={country.value}>
                      {country.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </TabsContent>
    )
  }

  function BankingTab() {
    return (
      <TabsContent value="banking" className="space-y-6 pt-4">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Banking Information</h3>
          <p className="text-sm text-muted-foreground">
            Provide your banking details for payments and settlements.
          </p>
        </div>
        
        <FormField
          control={form.control}
          name="bank_account.bank_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bank Name <RequiredField /></FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select bank" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {bankNames.map((bank) => (
                    <SelectItem key={bank} value={bank}>
                      {bank}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="bank_account.account_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Account Number <RequiredField /></FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Account number" 
                    value={field.value} 
                    onChange={field.onChange} 
                    onBlur={field.onBlur} 
                    name={field.name} 
                    ref={field.ref} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="bank_account.account_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Account Name <RequiredField /></FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Account holder name" 
                    value={field.value} 
                    onChange={field.onChange} 
                    onBlur={field.onBlur} 
                    name={field.name} 
                    ref={field.ref} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="bank_account.swift_code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Swift Code</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Swift code (optional)" 
                    value={field.value} 
                    onChange={field.onChange} 
                    onBlur={field.onBlur} 
                    name={field.name} 
                    ref={field.ref} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="bank_account.branch_code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Branch Code</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Branch code (optional)" 
                    value={field.value} 
                    onChange={field.onChange} 
                    onBlur={field.onBlur} 
                    name={field.name} 
                    ref={field.ref} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </TabsContent>
    )
  }
  
  function DocumentsTab(){
    return (
      <TabsContent value="documents" className="space-y-6 pt-4">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Identity Documents</h3>
          <DocumentUpload
            label="National ID, Passport, Driver's License, etc."
            description="Upload clear images of relevant identity documents. You may add an expiry date for any document that requires renewal."
            files={identityDocs}
            setFiles={setIdentityDocs}
            expiryDates={identityDocsExpiry}
            setExpiryDates={setIdentityDocsExpiry}
          />
        </div>

        <Separator />

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Business Documents</h3>
          <DocumentUpload
            label="Business Registration, License, Certificates, etc."
            description="Upload clear images of all required business documents. Set expiry dates for any licenses or certificates that require renewal."
            files={businessDocs}
            setFiles={setBusinessDocs}
            expiryDates={businessDocsExpiry}
            setExpiryDates={setBusinessDocsExpiry}
          />
        </div>

        <Separator />

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Banking Information</h3>
          <DocumentUpload
            label="Bank Statements, Financial Records, etc."
            description="Upload bank account information and financial records. You may set expiry dates for documents like statements that need to be renewed."
            files={bankDocs}
            setFiles={setBankDocs}
            expiryDates={bankDocsExpiry}
            setExpiryDates={setBankDocsExpiry}
          />
        </div>
      </TabsContent>
    )
  }
  
  function ReviewTab(){
    return (
      <TabsContent value="review" className="space-y-6 pt-4">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Review Your Information</h3>
          <p className="text-sm text-muted-foreground">
            Review your information before submitting.
          </p>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-4">
              Business Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">
                  Business Name
                </h4>
                <p className="text-base">
                  {form.watch("business_name") || "—"}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">
                  Display Name
                </h4>
                <p className="text-base">
                  {form.watch("display_name") || "—"}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">
                  Email
                </h4>
                <p className="text-base">
                  {form.watch("contact_email") || "—"}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">
                  Phone
                </h4>
                <p className="text-base">
                  {form.watch("contact_phone") || "—"}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">
                  Tax ID
                </h4>
                <p className="text-base">
                  {form.watch("tax_id") || "—"}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">
                  Website
                </h4>
                <p className="text-base">
                  {form.watch("website") || "—"}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">
                  Commission Rate
                </h4>
                <p className="text-base">
                  {form.watch("commission_rate") || "—"}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-medium mb-4">
              Store Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">
                  Store Name
                </h4>
                <p className="text-base">
                  {form.watch("store.store_name") || "—"}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">
                  Store URL Slug
                </h4>
                <p className="text-base">
                  {form.watch("store.store_slug") || "—"}
                </p>
              </div>
            </div>
            <div className="mt-4">
              <h4 className="text-sm font-medium text-muted-foreground mb-2">
                Store Description
              </h4>
              <p className="text-base">
                {form.watch("store.description") || "—"}
              </p>
            </div>
            <div className="mt-4">
              <h4 className="text-sm font-medium text-muted-foreground mb-2">
                Brand Colors
              </h4>
              <div className="flex flex-wrap gap-3 mt-2">
                <div className="flex items-center">
                  <div
                    className="w-6 h-6 rounded-full mr-2 border border-gray-200"
                    style={{ backgroundColor: form.watch("store.branding.colors.primary") }}
                  />
                  <span className="text-sm">Primary</span>
                </div>
                <div className="flex items-center">
                  <div
                    className="w-6 h-6 rounded-full mr-2 border border-gray-200"
                    style={{ backgroundColor: form.watch("store.branding.colors.secondary") }}
                  />
                  <span className="text-sm">Secondary</span>
                </div>
                <div className="flex items-center">
                  <div
                    className="w-6 h-6 rounded-full mr-2 border border-gray-200"
                    style={{ backgroundColor: form.watch("store.branding.colors.accent") }}
                  />
                  <span className="text-sm">Accent</span>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-medium mb-4">
              Business Address
            </h3>
            <p className="text-base">
              {form.watch("address_line1") || "—"}
              {form.watch("address_line2") ? `, ${form.watch("address_line2")}` : ""}
            </p>
            <p className="text-base">
              {form.watch("city") || "—"},{" "}
              {form.watch("state_province") || "—"}{" "}
              {form.watch("postal_code") || "—"}
            </p>
            <p className="text-base">
              {form.watch("country") || "—"}
            </p>
          </div>

          <Separator />
          
          <div>
            <h3 className="text-lg font-medium mb-4">
              Banking Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">
                  Bank Name
                </h4>
                <p className="text-base">
                  {form.watch("bank_account.bank_name") || "—"}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">
                  Account Number
                </h4>
                <p className="text-base">
                  {form.watch("bank_account.account_number") || "—"}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">
                  Account Name
                </h4>
                <p className="text-base">
                  {form.watch("bank_account.account_name") || "—"}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">
                  Swift Code
                </h4>
                <p className="text-base">
                  {form.watch("bank_account.swift_code") || "—"}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">
                  Branch Code
                </h4>
                <p className="text-base">
                  {form.watch("bank_account.branch_code") || "—"}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-medium mb-4">
              Uploaded Documents
            </h3>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">
                  Identity Documents
                </h4>
                {identityDocs.length > 0 ? (
                  <ul className="list-disc list-inside">
                    {identityDocs.map((file) => (
                      <li key={file.name} className="text-sm">
                        {file.name}
                        {identityDocsExpiry[file.name] && (
                          <span className="text-muted-foreground"> - Expires: {identityDocsExpiry[file.name]}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No identity documents uploaded.
                  </p>
                )}
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">
                  Business Documents
                </h4>
                {businessDocs.length > 0 ? (
                  <ul className="list-disc list-inside">
                    {businessDocs.map((file) => (
                      <li key={file.name} className="text-sm">
                        {file.name}
                        {businessDocsExpiry[file.name] && (
                          <span className="text-muted-foreground"> - Expires: {businessDocsExpiry[file.name]}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No business documents uploaded.
                  </p>
                )}
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">
                  Banking Documents
                </h4>
                {bankDocs.length > 0 ? (
                  <ul className="list-disc list-inside">
                    {bankDocs.map((file) => (
                      <li key={file.name} className="text-sm">
                        {file.name}
                        {bankDocsExpiry[file.name] && (
                          <span className="text-muted-foreground"> - Expires: {bankDocsExpiry[file.name]}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No banking documents uploaded.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            By submitting this application, you confirm that all
            information provided is accurate and complete. The
            vendor application will be reviewed by our team, and
            you will be notified once a decision has been made.
          </p>
        </div>
      </TabsContent>
    )
  }
}