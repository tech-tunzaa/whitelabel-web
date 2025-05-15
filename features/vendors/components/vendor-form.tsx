"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useSession } from "next-auth/react";
import {
  Loader2,
  Store,
  ArrowLeft,
  Upload,
  RefreshCw,
  Building2,
  CreditCard,
  FileText,
  Truck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import { DocumentUpload } from "@/components/ui/document-upload";
import { PhoneInput } from "@/components/ui/phone-input";
import { RequiredField } from "@/components/ui/required-field";
import { ImageUpload } from "@/components/ui/image-upload";
import { ColorPicker } from "@/components/ui/color-picker";
import { Spinner } from "@/components/ui/spinner";
import { ErrorCard } from "@/components/ui/error-card";

import { countries } from "@/features/settings/data/localization";
import { vendorFormSchema } from "../schema";
import { VendorFormValues } from "../types";
import { useTenantStore } from "@/features/tenants/store";

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
    branch_code: "",
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
        background: "#FFFFFF",
      },
    },
  },
};

const businessCategories = [
  "Apparel",
  "Electronics",
  "Food & Beverages",
  "Handmade Goods",
  "Health & Beauty",
  "Home & Garden",
  "Services",
  "Other",
];

const banks = [
  { id: "bank-001", name: "CRDB Bank" },
  { id: "bank-002", name: "NMB Bank" },
  { id: "bank-003", name: "NBC Bank" },
  { id: "bank-004", name: "Stanbic Bank" },
  { id: "bank-005", name: "Absa Bank" },
  { id: "bank-006", name: "DTB Bank" },
  { id: "bank-007", name: "Exim Bank" },
  { id: "bank-008", name: "KCB Bank" },
  { id: "bank-009", name: "Bank of Africa" },
  { id: "bank-010", name: "Standard Chartered Bank" },
  { id: "bank-011", name: "Equity Bank" },
  { id: "bank-012", name: "Access Bank" },
  { id: "bank-013", name: "Bank M" },
  { id: "bank-014", name: "Azania Bank" },
  { id: "bank-015", name: "TIB Bank" },
  { id: "bank-016", name: "Other" },
];

interface VendorFormProps {
  onSubmit: (data: VendorFormValues) => void;
  onCancel?: () => void;
  initialData?: Partial<VendorFormValues> & { id?: string };
  isEditable?: boolean;
  id?: string;
  isSubmitting?: boolean;
}

export function VendorForm({
  onSubmit,
  onCancel,
  initialData,
  isEditable = true,
  id,
  isSubmitting: externalIsSubmitting,
}: VendorFormProps) {
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
  const [activeTab, setActiveTab] = useState("business");
  const [internalIsSubmitting, setInternalIsSubmitting] = useState(false);
  const isSubmitting =
    externalIsSubmitting !== undefined
      ? externalIsSubmitting
      : internalIsSubmitting;
  const [formError, setFormError] = useState<string | null>(null);
  
  // Form ref to prevent bubbling
  const formRef = useRef<HTMLFormElement>(null);

  // Document uploads
  const [identityDocs, setIdentityDocs] = useState<File[]>([]);
  const [businessDocs, setBusinessDocs] = useState<File[]>([]);
  const [bankDocs, setBankDocs] = useState<File[]>([]);
  const [identityDocsExpiry, setIdentityDocsExpiry] = useState<
    Record<string, string>
  >({});
  const [businessDocsExpiry, setBusinessDocsExpiry] = useState<
    Record<string, string>
  >({});
  const [bankDocsExpiry, setBankDocsExpiry] = useState<Record<string, string>>(
    {}
  );

  // Logo upload
  const [logoFile, setLogoFile] = useState<File | null>(null);

  // Form validation tabs mapping
  const tabValidationMap = {
    business: [
      "tenant_id",
      "business_name",
      "display_name",
      "contact_email",
      "contact_phone",
      "tax_id",
    ],
    store: [
      "store.store_name",
      "store.store_slug",
      "store.description",
      "store.branding.colors.primary",
      "store.branding.colors.secondary",
      "store.branding.colors.accent",
      "store.branding.colors.text",
      "store.branding.colors.background",
    ],
    address: [
      "address_line1",
      "city",
      "state_province",
      "postal_code",
      "country",
    ],
    banking: [
      "bank_account.bank_name",
      "bank_account.account_number",
      "bank_account.account_name",
    ],
    documents: [], // Documents are optional
  };

  const tabFlow = [
    "business",
    "store",
    "address",
    "banking",
    "documents",
    "review",
  ];

  const form = useForm<VendorFormValues>({
    resolver: zodResolver(vendorFormSchema),
    defaultValues: initialData
      ? { ...defaultValues, ...initialData }
      : defaultValues,
    mode: "onBlur",
    shouldFocusError: false,
  });

  // Tab navigation with field validation
  const nextTab = useCallback(() => {
    const currentTabIndex = tabFlow.indexOf(activeTab);
    if (currentTabIndex === -1 || currentTabIndex === tabFlow.length - 1)
      return;

    // Get fields to validate for the current tab
    const fieldsToValidate =
      tabValidationMap[activeTab as keyof typeof tabValidationMap] || [];

    // Validate all required fields in the current tab
    const result = fieldsToValidate.every((field) =>
      form.trigger(field as any)
    );

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
  const handleFormSubmit = useCallback(
    async (data: VendorFormValues) => {
      try {
        setFormError(null);
        setInternalIsSubmitting(true);

        // Process files if needed
        if (logoFile) {
          const logoUrl = await handleFileUpload(logoFile, "logos");
          data.store.branding.logo_url = logoUrl;
        }

        // Convert document files to verification documents
        if (identityDocs.length || businessDocs.length || bankDocs.length) {
          const verificationDocs = [];

          for (const file of identityDocs) {
            const docUrl = await handleFileUpload(file, "identity");
            verificationDocs.push({
              document_type: "identity",
              document_url: docUrl,
              verification_status: "pending" as const,
            });
          }

          for (const file of businessDocs) {
            const docUrl = await handleFileUpload(file, "business");
            verificationDocs.push({
              document_type: "business_registration",
              document_url: docUrl,
              verification_status: "pending" as const,
            });
          }
          
          for (const file of bankDocs) {
            const docUrl = await handleFileUpload(file, "banking");
            verificationDocs.push({
              document_type: "banking",
              document_url: docUrl,
              verification_status: "pending" as const,
            });
          }

          data.verification_documents = verificationDocs;
        }

        await onSubmit(data);

        // Success would typically be handled by the parent component
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "An error occurred";
        setFormError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setInternalIsSubmitting(false);
      }
    },
    [logoFile, identityDocs, businessDocs, bankDocs, handleFileUpload, onSubmit]
  );

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
        title={`Failed to ${isAddPage ? "create" : "update"} vendor`}
        error={{ status: "Error", message: formError }}
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
              ref={formRef}
              onSubmit={form.handleSubmit(handleFormSubmit, handleFormError)}
              onClick={(e) => e.stopPropagation()}
            >
              <FormField
                control={form.control}
                name="tenant_id"
                render={({ field }) => (
                  <FormItem className="mb-6">
                    <FormLabel>
                      Marketplace <RequiredField />
                    </FormLabel>
                    <Select
                      disabled={!isEditable}
                      onValueChange={field.onChange}
                      value={field.value}
                    >
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
                        onClick={(e) => {
                          e.preventDefault();
                          nextTab();
                        }}
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
                        "Submit"
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
  );

  function BusinessTab() {
    return (
      <TabsContent value="business" className="space-y-6 pt-4" onClick={(e) => e.stopPropagation()}>
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
              <FormItem onClick={(e) => e.stopPropagation()}>
                <FormLabel>
                  Business Name <RequiredField />
                </FormLabel>
                <FormControl>
                  <Input
                    id="business_name"
                    placeholder="Your business name"
                    {...field}
                    readOnly={!isEditable}
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
              <FormItem onClick={(e) => e.stopPropagation()}>
                <FormLabel>
                  Display Name <RequiredField />
                </FormLabel>
                <FormControl>
                  <Input
                    id="display_name"
                    placeholder="Display name for your business"
                    {...field}
                    readOnly={!isEditable}
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
              <FormItem onClick={(e) => e.stopPropagation()}>
                <FormLabel>
                  Email <RequiredField />
                </FormLabel>
                <FormControl>
                  <Input
                    id="contact_email"
                    placeholder="Email address"
                    type="email"
                    {...field}
                    readOnly={!isEditable}
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
              <FormItem onClick={(e) => e.stopPropagation()}>
                <FormLabel>
                  Phone <RequiredField />
                </FormLabel>
                <FormControl>
                  <PhoneInput
                    id="contact_phone"
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
              <FormItem onClick={(e) => e.stopPropagation()}>
                <FormLabel>
                  Tax ID <RequiredField />
                </FormLabel>
                <FormControl>
                  <Input
                    id="tax_id"
                    placeholder="Tax ID"
                    {...field}
                    readOnly={!isEditable}
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
              <FormItem onClick={(e) => e.stopPropagation()}>
                <FormLabel>Website</FormLabel>
                <FormControl>
                  <Input
                    id="website"
                    placeholder="https://yourbusiness.com"
                    {...field}
                    readOnly={!isEditable}
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
            <FormItem onClick={(e) => e.stopPropagation()}>
              <FormLabel>Commission Rate</FormLabel>
              <FormControl>
                <Input
                  id="commission_rate"
                  placeholder="e.g. 10%"
                  {...field}
                  readOnly={!isEditable}
                />
              </FormControl>
              <FormDescription>
                Commission rate for products sold through the marketplace (if
                applicable).
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </TabsContent>
    );
  }

  function StoreTab() {
    return (
      <TabsContent value="store" className="space-y-6 pt-4" onClick={(e) => e.stopPropagation()}>
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
              <FormItem onClick={(e) => e.stopPropagation()}>
                <FormLabel>
                  Store Name <RequiredField />
                </FormLabel>
                <FormControl>
                  <Input
                    id="store_name"
                    placeholder="Your store name"
                    {...field}
                    readOnly={!isEditable}
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
              <FormItem onClick={(e) => e.stopPropagation()}>
                <FormLabel>
                  Store URL Slug <RequiredField />
                </FormLabel>
                <FormControl>
                  <Input
                    id="store_slug"
                    placeholder="your-store-name"
                    {...field}
                    readOnly={!isEditable}
                  />
                </FormControl>
                <FormDescription>
                  Used in your store's URL: marketplace.com/stores/
                  {field.value || "your-store-name"}
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
            <FormItem onClick={(e) => e.stopPropagation()}>
              <FormLabel>
                Store Description <RequiredField />
              </FormLabel>
              <FormControl>
                <Textarea
                  id="store_description"
                  placeholder="Tell customers about your store..."
                  className="min-h-[100px] resize-none"
                  {...field}
                  readOnly={!isEditable}
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
              <FormItem onClick={(e) => e.stopPropagation()}>
                <FormLabel>Store Logo</FormLabel>
                <FormControl>
                  <ImageUpload
                    id="store_logo"
                    value={field.value}
                    onChange={(url) => {
                      field.onChange(url);
                    }}
                    onRemove={() => field.onChange("")}
                    onUpload={(file) => {
                      // Set the file for later processing during submission
                      setLogoFile(file);
                      // For preview purposes, we can use a temporary URL
                      const previewUrl = URL.createObjectURL(file);
                      field.onChange(previewUrl);
                    }}
                    disabled={!isEditable}
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
                <FormItem onClick={(e) => e.stopPropagation()}>
                  <FormLabel>
                    Primary Color <RequiredField />
                  </FormLabel>
                  <FormControl>
                    <ColorPicker
                      id="primary_color"
                      value={field.value}
                      onChange={field.onChange}
                      disabled={!isEditable}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="store.branding.colors.secondary"
              render={({ field }) => (
                <FormItem onClick={(e) => e.stopPropagation()}>
                  <FormLabel>
                    Secondary Color <RequiredField />
                  </FormLabel>
                  <FormControl>
                    <ColorPicker
                      id="secondary_color"
                      value={field.value}
                      onChange={field.onChange}
                      disabled={!isEditable}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="store.branding.colors.accent"
              render={({ field }) => (
                <FormItem onClick={(e) => e.stopPropagation()}>
                  <FormLabel>
                    Accent Color <RequiredField />
                  </FormLabel>
                  <FormControl>
                    <ColorPicker
                      id="accent_color"
                      value={field.value}
                      onChange={field.onChange}
                      disabled={!isEditable}
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
              name="store.branding.colors.text"
              render={({ field }) => (
                <FormItem onClick={(e) => e.stopPropagation()}>
                  <FormLabel>
                    Text Color <RequiredField />
                  </FormLabel>
                  <FormControl>
                    <ColorPicker
                      id="text_color"
                      value={field.value}
                      onChange={field.onChange}
                      disabled={!isEditable}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="store.branding.colors.background"
              render={({ field }) => (
                <FormItem onClick={(e) => e.stopPropagation()}>
                  <FormLabel>
                    Background Color <RequiredField />
                  </FormLabel>
                  <FormControl>
                    <ColorPicker
                      id="background_color"
                      value={field.value}
                      onChange={field.onChange}
                      disabled={!isEditable}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      </TabsContent>
    );
  }

  function AddressTab() {
    return (
      <TabsContent value="address" className="space-y-6 pt-4" onClick={(e) => e.stopPropagation()}>
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
            <FormItem onClick={(e) => e.stopPropagation()}>
              <FormLabel>
                Address Line 1 <RequiredField />
              </FormLabel>
              <FormControl>
                <Input
                  id="address_line1"
                  placeholder="123 Main St"
                  {...field}
                  readOnly={!isEditable}
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
            <FormItem onClick={(e) => e.stopPropagation()}>
              <FormLabel>Address Line 2</FormLabel>
              <FormControl>
                <Input
                  id="address_line2"
                  placeholder="Suite 101"
                  {...field}
                  readOnly={!isEditable}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem onClick={(e) => e.stopPropagation()}>
                <FormLabel>
                  City <RequiredField />
                </FormLabel>
                <FormControl>
                  <Input
                    id="city"
                    placeholder="City"
                    {...field}
                    readOnly={!isEditable}
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
              <FormItem onClick={(e) => e.stopPropagation()}>
                <FormLabel>
                  State/Province <RequiredField />
                </FormLabel>
                <FormControl>
                  <Input
                    id="state_province"
                    placeholder="State or Province"
                    {...field}
                    readOnly={!isEditable}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="postal_code"
            render={({ field }) => (
              <FormItem onClick={(e) => e.stopPropagation()}>
                <FormLabel>
                  Postal Code <RequiredField />
                </FormLabel>
                <FormControl>
                  <Input
                    id="postal_code"
                    placeholder="Postal code"
                    {...field}
                    readOnly={!isEditable}
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
              <FormItem onClick={(e) => e.stopPropagation()}>
                <FormLabel>
                  Country <RequiredField />
                </FormLabel>
                <Select
                  disabled={!isEditable}
                  onValueChange={field.onChange}
                  value={field.value}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a country" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem key={country.code} value={country.name}>
                        {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </TabsContent>
    );
  }

  function BankingTab() {
    return (
      <TabsContent value="banking" className="space-y-6 pt-4" onClick={(e) => e.stopPropagation()}>
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
            <FormItem onClick={(e) => e.stopPropagation()}>
              <FormLabel>
                Bank Name <RequiredField />
              </FormLabel>
              <Select
                disabled={!isEditable}
                onValueChange={field.onChange}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a bank" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {banks.map((bank) => (
                    <SelectItem key={bank.id} value={bank.name}>
                      {bank.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="bank_account.account_number"
            render={({ field }) => (
              <FormItem onClick={(e) => e.stopPropagation()}>
                <FormLabel>
                  Account Number <RequiredField />
                </FormLabel>
                <FormControl>
                  <Input
                    id="account_number"
                    placeholder="Account number"
                    {...field}
                    readOnly={!isEditable}
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
              <FormItem onClick={(e) => e.stopPropagation()}>
                <FormLabel>
                  Account Name <RequiredField />
                </FormLabel>
                <FormControl>
                  <Input
                    id="account_name"
                    placeholder="Account holder name"
                    {...field}
                    readOnly={!isEditable}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="bank_account.swift_code"
            render={({ field }) => (
              <FormItem onClick={(e) => e.stopPropagation()}>
                <FormLabel>Swift Code</FormLabel>
                <FormControl>
                  <Input
                    id="swift_code"
                    placeholder="Swift code (optional)"
                    {...field}
                    readOnly={!isEditable}
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
              <FormItem onClick={(e) => e.stopPropagation()}>
                <FormLabel>Branch Code</FormLabel>
                <FormControl>
                  <Input
                    id="branch_code"
                    placeholder="Branch code (optional)"
                    {...field}
                    readOnly={!isEditable}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </TabsContent>
    );
  }

  function DocumentsTab() {
    return (
      <TabsContent value="documents" className="space-y-6 pt-4" onClick={(e) => e.stopPropagation()}>
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Identity Documents</h3>
          <DocumentUpload
            id="identity_documents"
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
            id="business_documents"
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
            id="banking_documents"
            label="Bank Statements, Financial Records, etc."
            description="Upload bank account information and financial records. You may set expiry dates for documents like statements that need to be renewed."
            files={bankDocs}
            setFiles={setBankDocs}
            expiryDates={bankDocsExpiry}
            setExpiryDates={setBankDocsExpiry}
          />
        </div>
      </TabsContent>
    );
  }

  function ReviewTab() {
    return (
      <TabsContent value="review" className="space-y-6 pt-4" onClick={(e) => e.stopPropagation()}>
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Review Your Information</h3>
          <p className="text-sm text-muted-foreground">
            Review your information before submitting.
          </p>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-4">Business Information</h3>
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
                <p className="text-base">{form.watch("display_name") || "—"}</p>
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
                <p className="text-base">{form.watch("tax_id") || "—"}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">
                  Website
                </h4>
                <p className="text-base">{form.watch("website") || "—"}</p>
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
            <h3 className="text-lg font-medium mb-4">Store Information</h3>
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
                    style={{
                      backgroundColor: form.watch(
                        "store.branding.colors.primary"
                      ),
                    }}
                  />
                  <span className="text-sm">Primary</span>
                </div>
                <div className="flex items-center">
                  <div
                    className="w-6 h-6 rounded-full mr-2 border border-gray-200"
                    style={{
                      backgroundColor: form.watch(
                        "store.branding.colors.secondary"
                      ),
                    }}
                  />
                  <span className="text-sm">Secondary</span>
                </div>
                <div className="flex items-center">
                  <div
                    className="w-6 h-6 rounded-full mr-2 border border-gray-200"
                    style={{
                      backgroundColor: form.watch(
                        "store.branding.colors.accent"
                      ),
                    }}
                  />
                  <span className="text-sm">Accent</span>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-medium mb-4">Business Address</h3>
            <p className="text-base">
              {form.watch("address_line1") || "—"}
              {form.watch("address_line2")
                ? `, ${form.watch("address_line2")}`
                : ""}
            </p>
            <p className="text-base">
              {form.watch("city") || "—"}, {form.watch("state_province") || "—"}{" "}
              {form.watch("postal_code") || "—"}
            </p>
            <p className="text-base">{form.watch("country") || "—"}</p>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-medium mb-4">Banking Information</h3>
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
            <h3 className="text-lg font-medium mb-4">Uploaded Documents</h3>
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
                          <span className="text-muted-foreground">
                            {" "}
                            - Expires: {identityDocsExpiry[file.name]}
                          </span>
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
                          <span className="text-muted-foreground">
                            {" "}
                            - Expires: {businessDocsExpiry[file.name]}
                          </span>
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
                          <span className="text-muted-foreground">
                            {" "}
                            - Expires: {bankDocsExpiry[file.name]}
                          </span>
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
            By submitting this application, you confirm that all information
            provided is accurate and complete. The vendor application will be
            reviewed by our team, and you will be notified once a decision has
            been made.
          </p>
        </div>
      </TabsContent>
    );
  }
}
