"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray, useWatch, Control } from "react-hook-form";
import { Spinner } from "@/components/ui/spinner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { RequiredField } from "@/components/ui/required-field";
import { PhoneInput } from "@/components/ui/phone-input";
import { MultiSelect } from "@/components/ui/multi-select";
import { ImageUpload } from "@/components/ui/image-upload";
import { MapPicker } from "@/components/ui/map-picker"
import {
  DocumentUpload,
  DocumentWithMeta,
  DocumentType,
} from "@/components/ui/document-upload";
import { FileUpload } from "@/components/ui/file-upload";
import {
  DOCUMENT_TYPES,
  DocumentTypeOption,
} from "@/features/settings/data/document-types";
import {
  VendorFormValues,
  VerificationDocument as VendorVerificationDocument,
  StoreBanner,
} from "../types";
import { Category } from "@/features/categories/types";
import { Tenant } from "@/features/tenants/types";
import { useCategoryStore } from "@/features/categories/store";
import { useTenantStore } from "@/features/tenants/store";
import { useVendorStore } from "../store";
import { BannerEditor } from "@/components/ui/banner-editor";
import { vendorFormSchema } from "../schema";
import { cn } from "@/lib/utils";

// Default values for the form, providing a clean slate for new vendors.
const defaultValues: Partial<VendorFormValues> = {
  verification_documents: [],
  country: "Tanzania",
  commission_rate: "0",
  bank_account: {
    bank_name: "",
    account_number: "",
    account_name: "",
    swift_bic: "",
    branch_code: "",
  },
  store: {
    store_name: "",
    store_slug: "",
    description: "",
    logo_url: "",
    banners: [],
    categories: [],
    return_policy: "",
    shipping_policy: "",
    general_policy: "",
    location: { lat: -6.7924, lng: 39.2083 }, // Default to Dar es Salaam
  },
  verification_documents: [],
  user: {
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    password: "",
  },
};

interface VendorFormProps {
  onSubmit: (data: VendorFormValues) => Promise<any>;
  onCancel?: () => void;
  initialData?: Partial<VendorFormValues> & { id?: string };
  id?: string;
  isSubmitting?: boolean;
}

export function VendorForm({
  onSubmit,
  onCancel,
  initialData,
  id,
  isSubmitting: externalIsSubmitting,
}: VendorFormProps) {
  const { data: session } = useSession();
  const tenantId = useMemo(() => (session?.user as any)?.tenant_id || "", [session]);
  const isSuperOwner = useMemo(() => session?.user?.role === "super", [session]);
  const isAddPage = !initialData?.id;

  const [activeTab, setActiveTab] = useState<Tab>("business");
  const [internalIsSubmitting, setInternalIsSubmitting] = useState(false);
  const isSubmitting = externalIsSubmitting || internalIsSubmitting;
  const [formError, setFormError] = useState<string | null>(null);

  const fetchTenants = useTenantStore((state) => state.fetchTenants);
  const tenants = useTenantStore((state) => state.tenants);
  const fetchCategories = useCategoryStore((state) => state.fetchCategories);
  const categories = useCategoryStore((state) => state.categories);

  const form = useForm<VendorFormValues>({
    resolver: zodResolver(vendorFormSchema),
    defaultValues: initialData
      ? { ...defaultValues, ...initialData, tenant_id: initialData.tenant_id || (isSuperOwner ? "" : tenantId), verification_documents: initialData.verification_documents || [] }
      : { ...defaultValues, tenant_id: isSuperOwner ? "" : tenantId },
    mode: "onBlur",
  });

  const watchedTenantId = form.watch("tenant_id");

  useEffect(() => {
    if (isSuperOwner) {
      fetchTenants();
    }
  }, [isSuperOwner, fetchTenants]);

  useEffect(() => {
    if (watchedTenantId) {
      fetchCategories(undefined, { 'X-Tenant-ID': watchedTenantId });
    }
  }, [watchedTenantId, fetchCategories]);

  const tabFlow = [
    "business",
    "store",
    "address",
    "banking",
    "documents",
    "review",
  ] as const;
  type Tab = typeof tabFlow[number];

  const tabFields: Partial<Record<Tab, (keyof VendorFormValues)[]>> = {
    business: [
      "tenant_id",
      "business_name",
      "display_name",
      "user.first_name",
      "user.last_name",
      "contact_email",
      "contact_phone",
      "commission_rate",
    ],
    store: [
      "store.store_name",
      "store.store_slug",
      "store.description",
      "store.categories",
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
      "bank_account.account_name",
      "bank_account.account_number",
    ],
  };

  const nextTab = async () => {
    const fieldsToValidate = tabFields[activeTab];

    // If the current tab has no fields to validate (e.g., review tab), just proceed
    if (!fieldsToValidate) {
      const currentTabIndex = tabFlow.indexOf(activeTab);
      if (currentTabIndex < tabFlow.length - 1) {
        setActiveTab(tabFlow[currentTabIndex + 1]);
      }
      return;
    }

    const isValid = await form.trigger(fieldsToValidate as any);

    if (isValid) {
      const currentTabIndex = tabFlow.indexOf(activeTab);
      if (currentTabIndex < tabFlow.length - 1) {
        setActiveTab(tabFlow[currentTabIndex + 1]);
      }
    } else {
      toast.error("Please correct the errors on this tab before proceeding.");
    }
  };

  const prevTab = () => {
    const currentTabIndex = tabFlow.indexOf(activeTab);
    if (currentTabIndex > 0) {
      setActiveTab(tabFlow[currentTabIndex - 1]);
    }
  };

  const handleSubmit = useCallback(
    async (data: VendorFormValues) => {
      try {
        setFormError(null);
        setInternalIsSubmitting(true);
        const dataToSubmit = JSON.parse(JSON.stringify(data));
        if (!isSuperOwner) {
          dataToSubmit.tenant_id = tenantId;
        }
        if (dataToSubmit.verification_documents) {
          dataToSubmit.verification_documents = dataToSubmit.verification_documents.map((doc: any) => {
            const { file, ...docWithoutFile } = doc;
            return docWithoutFile;
          });
        }
        
        await onSubmit(dataToSubmit);
        setActiveTab("business");
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        setFormError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setInternalIsSubmitting(false);
      }
    },
    [onSubmit, isSuperOwner, tenantId]
  );

  const handleFormError = (errors: any) => {
    const firstErrorField = Object.keys(errors)[0];
    if (firstErrorField) {
      const fieldRoot = firstErrorField.split('.')[0];
      for (const tabName in tabFields) {
        if (tabFields[tabName].some(field => field === firstErrorField || field === fieldRoot)) {
          if (activeTab !== tabName) {
            setActiveTab(tabName);
          }
          break;
        }
      }
    }
    toast.error("Please fix the validation errors before submitting.");
  };

  const { fields: bannerFields, append: appendBanner, remove: removeBanner } = useFieldArray({
    control: form.control,
    name: "store.banners",
  });


  const handleBusinessNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const businessName = e.target.value;
    form.setValue("business_name", businessName, { shouldValidate: true });

    const currentStoreName = form.getValues("store.store_name");
    if (!currentStoreName) {
      form.setValue("store.store_name", businessName, { shouldValidate: false });
    }

    const currentStoreSlug = form.getValues("store.store_slug");
    if (!currentStoreSlug) {
      const slug = businessName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      form.setValue("store.store_slug", slug, { shouldValidate: false });
    }
  };



  return (
    <div className="space-y-6">
      {formError && (
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      )}

      <Card className="w-full">
        <CardContent className="p-6">
          <Form {...form}>
            <form
              id={id || "marketplace-vendor-form"}
              onSubmit={form.handleSubmit(handleSubmit, handleFormError)}
            >
              {/* Save isEditable in a local variable to fix reference issues throughout the form */}
              <fieldset disabled={isSubmitting} className="space-y-6">
                {/* Tenant selector (superowner only) */}
                {isSuperOwner && (
                  <FormField
                    control={form.control}
                    name="tenant_id"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormLabel>
                          Tenant <RequiredField />
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select a tenant" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {tenants
                              .filter(
                                (tenant) => tenant.id && tenant.id.trim() !== ""
                              )
                              .map((tenant) => (
                                <SelectItem
                                  key={tenant.id || `tenant-${Math.random()}`}
                                  value={tenant.id}
                                >
                                  {tenant.name}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                        <FormDescription className="text-sm text-muted-foreground">
                          The tenant this vendor belongs to
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {/* Tabs for form sections */}
                <Tabs
                  defaultValue="business"
                  value={activeTab}
                  className="mt-2"
                  onValueChange={(value) => setActiveTab(value)}
                >
                  <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
                    <TabsTrigger value="business" className="text-center">
                      Business
                    </TabsTrigger>
                    <TabsTrigger value="store" className="text-center">
                      Store
                    </TabsTrigger>
                    <TabsTrigger value="address" className="text-center">
                      Address
                    </TabsTrigger>
                    <TabsTrigger value="banking" className="text-center">
                      Banking
                    </TabsTrigger>
                    <TabsTrigger value="documents" className="text-center">
                      Documents
                    </TabsTrigger>
                    <TabsTrigger value="review" className="text-center">
                      Review
                    </TabsTrigger>
                  </TabsList>

                  <div className="mt-6">
                    <BusinessTab />
                    <StoreTab />
                    <AddressTab />
                    <BankingTab />
                    <DocumentsTab />
                    <ReviewTab />
                  </div>
                </Tabs>

                {/* Navigation Buttons - moved to the right */}
                <div className="flex justify-end mt-6">
                  <div className="flex gap-2">
                    {/* Cancel button */}
                    {onCancel && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={onCancel}
                        disabled={isSubmitting}
                      >
                        Cancel
                      </Button>
                    )}

                    {/* Previous button */}
                    {activeTab !== tabFlow[0] && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={prevTab}
                        disabled={isSubmitting}
                      >
                        Previous
                      </Button>
                    )}

                    {/* Next button - show except on last tab */}
                    {activeTab !== tabFlow[tabFlow.length - 1] && (
                      <Button
                        type="button"
                        onClick={nextTab}
                        disabled={isSubmitting}
                      >
                        Next
                      </Button>
                    )}

                    {/* Save button - only on last tab */}
                    {activeTab === tabFlow[tabFlow.length - 1] && (
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? (
                          <>
                            <Spinner size="sm" color="white" />
                            Saving...
                          </>
                        ) : (
                          <>Save Vendor</>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </fieldset>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );

  // Business Tab Component with first_name and last_name fields
  function BusinessTab() {
    return (
      <TabsContent value="business" className="space-y-6 mt-4">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Business Name Field */}
            <FormField
              control={form.control}
              name="business_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Business Name <RequiredField />
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        handleBusinessNameChange(e);
                      }}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Display Name Field */}
            <FormField
              control={form.control}
              name="display_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Display Name <RequiredField />
                  </FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* First Name Field */}
            <FormField
              control={form.control}
              name="user.first_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Owner First Name <RequiredField />
                  </FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Last Name Field */}
            <FormField
              control={form.control}
              name="user.last_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Owner Last Name <RequiredField />
                  </FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Contact Email Field */}
            <FormField
              control={form.control}
              name="contact_email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Contact Email <RequiredField />
                  </FormLabel>
                  <FormControl>
                    <Input {...field} type="email" value={field.value || ""} />
                  </FormControl>
                  <FormDescription>
                    Used for account login and notifications
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Contact Phone Field */}
            <FormField
              control={form.control}
              name="contact_phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Contact Phone <RequiredField />
                  </FormLabel>
                  <FormControl>
                    <PhoneInput {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Website Field */}
            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Website</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Tax ID Field */}
            <FormField
              control={form.control}
              name="tax_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tax ID</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Categories moved to store tab */}

            {/* Commission Rate Field */}
            <FormField
              control={form.control}
              name="commission_rate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Commission Rate (%) <RequiredField />
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="text"
                      pattern="^\d*(\.\d{0,2})?$"
                      placeholder="Enter commission rate"
                      value={field.value?.toString() || ""}
                      onChange={(e) => {
                        // Only allow numeric input with up to 2 decimal places
                        const value = e.target.value;
                        if (value === "" || /^\d*(\.\d{0,2})?$/.test(value)) {
                          field.onChange(value);
                        }
                      }}
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

  // Store Tab Component
  function StoreTab() {
    // Handle business name changes through form field change
    const handleBusinessNameChange = (
      e: React.ChangeEvent<HTMLInputElement>
    ) => {
      const businessName = e.target.value;

      // Only set store name if it's empty or not set yet
      const currentStoreName = form.getValues("store.store_name");
      if (!currentStoreName) {
        form.setValue("store.store_name", businessName, {
          shouldValidate: false,
        });
      }

      // Only set store slug if it's empty or not set yet
      const currentStoreSlug = form.getValues("store.store_slug");
      if (!currentStoreSlug) {
        // Create a slug from the business name
        const slug = businessName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "");
        form.setValue("store.store_slug", slug, { shouldValidate: false });
      }
    };

    return (
      <TabsContent value="store" className="space-y-6 pt-4">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Store Information</h3>
          <p className="text-sm text-muted-foreground">
            Provide details about your online store.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="store.store_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Store Name <RequiredField />
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    className="mt-2"
                    placeholder="Your store name"
                    value={field.value || ""}
                  />
                </FormControl>
                <FormDescription className="text-sm text-muted-foreground mt-2">
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
                <FormLabel>
                  Store URL <RequiredField />
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    className="mt-2"
                    placeholder="your-store"
                    value={field.value || ""}
                  />
                </FormControl>
                <FormDescription className="text-sm text-muted-foreground mt-2">
                  The URL for your store: https://example.com/
                  <strong>{field.value || "your-store"}</strong>
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-4">
          <FormField
            control={form.control}
            name="store.description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Store Description <RequiredField />
                </FormLabel>
                <FormControl>
                  <textarea
                    {...field}
                    className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-2"
                    placeholder="Describe your store and what you sell..."
                    value={field.value || ""}
                  />
                </FormControl>
                <FormDescription className="text-sm text-muted-foreground mt-2">
                  Provide a description of your store to help customers
                  understand what you offer.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-4">
          <FormField
            control={form.control}
            name="store.logo_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Store Logo</FormLabel>
                <FormControl>
                  <ImageUpload
                    id="store-logo-upload"
                    value={field.value as string}
                    onChange={field.onChange}
                    className="mt-2"
                    previewAlt="Store Logo"
                    buttonText="Upload Logo"
                  />
                </FormControl>
                <FormDescription className="text-sm text-muted-foreground mt-2">
                  Upload your store logo image.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Store Categories Field */}
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="store.categories"
            render={({ field }) => {
              const categoryOptions =
                categories?.map((category) => ({
                  value: String(category?.category_id || ""),
                  label: String(category?.name || ""),
                })) || [];

              const selected: string[] = Array.isArray(field.value)
                ? field.value.map((id) => String(id || ""))
                : [];

              return (
                <FormItem>
                  <FormLabel>
                    Store Categories <RequiredField />
                  </FormLabel>
                  <FormControl>
                    <MultiSelect
                      options={categoryOptions}
                      selected={selected}
                      onChange={field.onChange}
                      placeholder="Select categories"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
        </div>

        {/* Policy Documents Section */}
        <div className="space-y-5 border-t pt-5 mt-5">
          <h4 className="text-md font-medium">Store Policies</h4>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Return Policy */}
            <FormField
              control={form.control}
              name="store.return_policy"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Return Policy</FormLabel>
                  <FormControl>
                    <FileUpload
                      id="return-policy-upload"
                      value={field.value as string}
                      onChange={field.onChange}
                      onRemove={() => field.onChange("")}
                      acceptedTypes={[".pdf"]}
                      disabled={isSubmitting}
                      buttonText="Upload Return Policy"
                    />
                  </FormControl>
                  <FormDescription className="text-sm text-muted-foreground mt-2">
                    PDF document explaining your return policy
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Shipping Policy */}
            <FormField
              control={form.control}
              name="store.shipping_policy"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Shipping Policy</FormLabel>
                  <FormControl>
                    <FileUpload
                      id="shipping-policy-upload"
                      value={field.value as string}
                      onChange={field.onChange}
                      onRemove={() => field.onChange("")}
                      acceptedTypes={[".pdf"]}
                      disabled={isSubmitting}
                      buttonText="Upload Shipping Policy"
                    />
                  </FormControl>
                  <FormDescription className="text-sm text-muted-foreground mt-2">
                    PDF document explaining your shipping policy
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* General Policy */}
          <FormField
            control={form.control}
            name="store.general_policy"
            render={({ field }) => (
              <FormItem>
                <FormLabel>General Terms & Conditions</FormLabel>
                <FormControl>
                  <FileUpload
                    id="general-policy-upload"
                    value={field.value as string}
                    onChange={field.onChange}
                    onRemove={() => field.onChange("")}
                    acceptedTypes={[".pdf"]}
                    disabled={isSubmitting}
                    buttonText="Upload Terms & Conditions"
                  />
                </FormControl>
                <FormDescription className="text-sm text-muted-foreground mt-2">
                  PDF document with general terms and conditions
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Store Banners using StoreBannerEditor Component */}
        <div className="space-y-4 border-t pt-5 mt-5">
          <div className="flex items-center justify-between">
            <h4 className="text-md font-medium">Store Banners</h4>
          </div>
          <FormField
            control={form.control}
            name="store.banners"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Store Banners</FormLabel>
                <FormControl>
                  <BannerEditor
                    tenantId={watchedTenantId}
                    value={field.value}
                    onChange={field.onChange}
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

  // Address Tab Component
  function AddressTab() {
    // Handle address data from map picker
    const handleAddressFound = (addressData: {
      address_line1?: string;
      city?: string;
      state_province?: string;
      postal_code?: string;
      country?: string;
    }) => {
      // Update form fields with the geocoded address data
      if (addressData.address_line1) {
        form.setValue("address_line1", addressData.address_line1, {
          shouldValidate: true,
        });
      }

      if (addressData.city) {
        form.setValue("city", addressData.city, { shouldValidate: true });
      }

      if (addressData.state_province) {
        form.setValue("state_province", addressData.state_province, {
          shouldValidate: true,
        });
      }

      if (addressData.postal_code) {
        form.setValue("postal_code", addressData.postal_code, {
          shouldValidate: true,
        });
      }

      if (addressData.country) {
        form.setValue("country", addressData.country, { shouldValidate: true });
      }
    };

    return (
      <TabsContent value="address" className="space-y-6 pt-4">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Address Information</h3>
          <p className="text-sm text-muted-foreground">
            Provide your business address details.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="address_line1"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Address Line 1 <RequiredField />
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    className="mt-2"
                    placeholder="Street address, P.O. box, etc."
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
                    {...field}
                    className="mt-2"
                    placeholder="Apartment, suite, unit, building, floor, etc."
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
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  City <RequiredField />
                </FormLabel>
                <FormControl>
                  <Input {...field} className="mt-2" placeholder="City" />
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
                <FormLabel>
                  State/Province <RequiredField />
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    className="mt-2"
                    placeholder="State, province, region"
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
              <FormItem>
                <FormLabel>
                  Postal Code <RequiredField />
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    className="mt-2"
                    placeholder="Postal code"
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
                <FormLabel>
                  Country <RequiredField />
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select a country" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Tanzania">Tanzania</SelectItem>
                    <SelectItem value="Kenya">Kenya</SelectItem>
                    <SelectItem value="Uganda">Uganda</SelectItem>
                    <SelectItem value="Rwanda">Rwanda</SelectItem>
                    {/* Add more countries as needed */}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Coordinates Map Picker */}
        <div className="md:col-span-2 mt-4">
          <FormField
            control={form.control}
            name="coordinates"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location Coordinates</FormLabel>
                <FormControl>
                  <MapPicker
                    value={field.value as [number, number] | null}
                    onChange={field.onChange}
                    onAddressFound={handleAddressFound}
                    height="350px"
                    className="mt-2"
                  />
                </FormControl>
                <FormDescription className="text-sm text-muted-foreground mt-2">
                  Click on the map to set your business location or use the "Use
                  Current Location" button.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </TabsContent>
    );
  }

  // Banking Tab Component
  function BankingTab() {
    return (
      <TabsContent value="banking" className="space-y-6 pt-4">
        <div className="space-y-4">
          <h3 className="text-xl font-medium">Banking Information</h3>
          <p className="text-sm text-muted-foreground">
            Provide your business banking details for payments.
          </p>
        </div>

        <div className="space-y-4">
          {/* Bank Information */}
          <div className="grid md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="bank_account.bank_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Bank Name <RequiredField />
                  </FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="CRDB Bank" />
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
                  <FormLabel>
                    Account Name <RequiredField />
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Business name on the account"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="bank_account.account_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Account Number <RequiredField />
                  </FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="12345678901" />
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
                    <Input {...field} placeholder="123" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="bank_account.swift_bic"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SWIFT/BIC Code</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="EXAMPLECODE" />
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

  // Documents Tab Component - Temporarily simplified for debugging
  function DocumentsTab() {
    return (
      <TabsContent value="documents" className="space-y-6 mt-4">
        <div className="p-4 border-2 border-dashed border-yellow-400 bg-yellow-50 rounded-md">
          <h3 className="text-lg font-medium text-yellow-800">Under Investigation</h3>
          <p className="text-sm text-yellow-700">
            This section is temporarily disabled while we resolve a technical issue.
          </p>
        </div>
      </TabsContent>
    );
  }

  // Review Tab Component
  function ReviewTab() {
    // Only get values when the tab is opened
    const [reviewValues, setReviewValues] = useState(() => form.getValues());

    // Update values when tab becomes active
    useEffect(() => {
      if (activeTab === "review") {
        setReviewValues(form.getValues());
      }
    }, [activeTab]);

    return (
      <TabsContent value="review" className="space-y-6 pt-4">
        <div className="space-y-4">
          <h3 className="text-xl font-medium">Review Vendor Information</h3>
          <p className="text-sm text-muted-foreground">
            Review all information before submission. Make sure all required
            fields are complete.
          </p>
        </div>

        <div className="space-y-6">
          <div className="bg-muted/50 p-4 rounded-lg">
            <div className="space-y-6">
              {/* Business Info Review */}
              <div>
                <h4 className="font-medium text-md border-b pb-2 mb-2">
                  Business Information
                </h4>
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <div>
                    <dt className="font-medium text-muted-foreground">
                      Business Name
                    </dt>
                    <dd>{reviewValues.business_name || "-"}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-muted-foreground">
                      Display Name
                    </dt>
                    <dd>{reviewValues.display_name || "-"}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-muted-foreground">
                      Contact Email
                    </dt>
                    <dd>{reviewValues.contact_email || "-"}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-muted-foreground">
                      Contact Phone
                    </dt>
                    <dd>{reviewValues.contact_phone || "-"}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-muted-foreground">
                      Website
                    </dt>
                    <dd>{reviewValues.website || "Not provided"}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-muted-foreground">
                      Tax ID
                    </dt>
                    <dd>{reviewValues.tax_id || "Not provided"}</dd>
                  </div>
                </dl>
              </div>

              {/* Address Info Review */}
              <div>
                <h4 className="font-medium text-md border-b pb-2 mb-2">
                  Address Information
                </h4>
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <div>
                    <dt className="font-medium text-muted-foreground">
                      Address
                    </dt>
                    <dd>
                      {reviewValues.address_line1 || "-"}
                      <br />
                      {reviewValues.address_line2 && (
                        <>
                          {reviewValues.address_line2}
                          <br />
                        </>
                      )}
                      {reviewValues.city && reviewValues.state_province
                        ? `${reviewValues.city}, ${reviewValues.state_province} ${reviewValues.postal_code}`
                        : "-"}
                      <br />
                      {reviewValues.country || "-"}
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Banking Info Review */}
              <div>
                <h4 className="font-medium text-md border-b pb-2 mb-2">
                  Banking Information
                </h4>
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <div>
                    <dt className="font-medium text-muted-foreground">
                      Bank Name
                    </dt>
                    <dd>{reviewValues.bank_account?.bank_name || "-"}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-muted-foreground">
                      Account Name
                    </dt>
                    <dd>{reviewValues.bank_account?.account_name || "-"}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-muted-foreground">
                      Account Number
                    </dt>
                    <dd>{reviewValues.bank_account?.account_number || "-"}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-muted-foreground">
                      Branch Code
                    </dt>
                    <dd>
                      {reviewValues.bank_account?.branch_code || "Not provided"}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-medium text-muted-foreground">
                      SWIFT/BIC
                    </dt>
                    <dd>
                      {reviewValues.bank_account?.swift_bic || "Not provided"}
                    </dd>
                  </div>
                </dl>
              </div>

            {/* Store Info Review */}
            <div>
              <h4 className="font-medium text-md border-b pb-2 mb-2">
                Store Information
              </h4>
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <div>
                  <dt className="font-medium text-muted-foreground">
                    Store Name
                  </dt>
                    <dd>{reviewValues.store?.store_name || "-"}</dd>
                </div>
                <div>
                  <dt className="font-medium text-muted-foreground">
                    Store Slug
                  </dt>
                    <dd>{reviewValues.store?.store_slug || "-"}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-muted-foreground">
                      Description
                    </dt>
                    <dd>{reviewValues.store?.description || "Not provided"}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-muted-foreground">Logo</dt>
                    <dd>
                      {reviewValues.store?.logo_url
                        ? "Uploaded"
                        : "Not uploaded"}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-medium text-muted-foreground">
                      Categories
                    </dt>
                    <dd>
                      {reviewValues.store?.categories &&
                      reviewValues.store.categories.length > 0
                        ? reviewValues.store.categories
                            .map((cat: any) => cat.label || cat.name)
                            .join(", ")
                        : "None selected"}
                    </dd>
                </div>
              </dl>
            </div>

              {/* Store Policies Review */}
              <div>
                <h4 className="font-medium text-md border-b pb-2 mb-2">
                  Store Policies
                </h4>
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <div>
                    <dt className="font-medium text-muted-foreground">
                      Return Policy
                    </dt>
                    <dd>
                      {reviewValues.store?.return_policy
                        ? "Uploaded"
                        : "Not uploaded"}
                    </dd>
          </div>
                  <div>
                    <dt className="font-medium text-muted-foreground">
                      Shipping Policy
                    </dt>
                    <dd>
                      {reviewValues.store?.shipping_policy
                        ? "Uploaded"
                        : "Not uploaded"}
                    </dd>
        </div>
                  <div>
                    <dt className="font-medium text-muted-foreground">
                      Terms & Conditions
                    </dt>
                    <dd>
                      {reviewValues.store?.general_policy
                        ? "Uploaded"
                        : "Not uploaded"}
                    </dd>
      </div>
                </dl>
              </div>

              {/* Documents Review */}
              <div>
                <h4 className="font-medium text-md border-b pb-2 mb-2">
                  Documents Uploaded
                </h4>
                <div className="text-sm">
                  {reviewValues.verification_documents &&
                  reviewValues.verification_documents.length > 0 ? (
                    <ul className="list-disc pl-5">
                      {reviewValues.verification_documents.map(
                        (doc: any, index: number) => (
                          <li key={index}>
                            {doc.document_type}: {doc.file_name}
                            {doc.expiry_date && (
                              <span className="ml-2 text-muted-foreground">
                                Expires: {doc.expiry_date}
                              </span>
                            )}
                          </li>
                        )
                      )}
                    </ul>
                  ) : (
                    <p className="text-muted-foreground">
                      No documents uploaded
                    </p>
                  )}
          </div>
          </div>
            </div>
          </div>
        </div>
      </TabsContent>
    );
  }
}