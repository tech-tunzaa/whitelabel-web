"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray, Control } from "react-hook-form";
import { Spinner } from "@/components/ui/spinner";
import { Plus, Trash } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label"
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
import { DocumentUpload, DocumentWithMeta } from "@/components/ui/document-upload";

import { DOCUMENT_TYPES, DocumentTypeOption } from "@/features/settings/data/document-types";
import { VendorFormValues, StoreBanner } from "../types";
import { Category } from "@/features/categories/types";
import { Tenant } from "@/features/tenants/types";
import { useCategoryStore } from "@/features/categories/store";
import { useTenantStore } from "@/features/tenants/store";
import { useVendorStore } from "../store";
import { vendorFormSchema } from "../schema";

interface VendorFormProps {
  onSubmit: (data: VendorFormValues) => void;
  onCancel?: () => void;
  initialData?: Partial<VendorFormValues> & { id?: string };
  id?: string;
  isSubmitting?: boolean;
}

export function VendorFormNew({
  onSubmit,
  onCancel,
  initialData,
  id,
  isSubmitting: externalIsSubmitting,
}: VendorFormProps) {
  const { data: session } = useSession();
  const tenantId = (session?.user as any)?.tenant_id || "";
  const userRole = session?.user?.role || "";
  const isSuperOwner = userRole === "super_owner";
  
  // Tab validation mapping - which fields belong to which tab
  const tabValidationMap = {
    business: [
      "tenant_id", 
      "business_name", 
      "display_name", 
      "contact_email", 
      "contact_phone",
      "categories",
      "commission_rate"
    ],
    store: [
      "store.store_name", 
      "store.store_slug", 
      "store.description"
    ],
    address: [
      "address_line1", 
      "city", 
      "state_province", 
      "postal_code", 
      "country"
    ],
    banking: [
      "bank_account.bank_name", 
      "bank_account.account_number", 
      "bank_account.account_name"
    ],
    documents: [] // Documents are optional
  };

  const tabFlow = ["business", "store", "address", "banking", "documents", "review"];

  // State for component
  const [activeTab, setActiveTab] = useState("business");
  const [internalIsSubmitting, setInternalIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  
  // Determine if form is submitting from either external or internal state
  const isSubmitting = externalIsSubmitting || internalIsSubmitting;
  const isAddPage = !initialData?.id;

  // Get tenants and categories
  const { fetchTenants } = useTenantStore();
  const { fetchCategories } = useCategoryStore();
  const tenants = useTenantStore((state) => state.tenants);
  const categories = useCategoryStore((state) => state.categories);

  // Initialize React Hook Form with explicit type to fix TypeScript errors
  const form = useForm<VendorFormValues>({
    resolver: zodResolver(vendorFormSchema) as any,
    mode: "onSubmit",
    defaultValues: initialData || {
      tenant_id: tenantId,
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
      categories: [],
      commission_rate: 0,
      bank_account: {
        bank_name: "",
        account_number: "",
        account_name: "",
        swift_bic: "",
        branch_code: ""
      },
      store: {
        store_name: "",
        store_slug: "",
        description: "",
        logo_url: "",
        banners: []
      },
      verification_documents: [],
    }
  });
  
  // For FormControl types to work with nested fields, we cast to specific type
  const formControl = form.control as Control<VendorFormValues>;

  // Set up field array for banners with proper typing
  const { fields: bannerFields, append: appendBanner, remove: removeBanner } = useFieldArray({
    control: formControl,
    name: "store.banners"
  });
  
  // Default banner to add when "Add Banner" is clicked
  const defaultBanner = {
    title: "",
    image_url: "",
    alt_text: "",
    display_order: bannerFields.length,
    is_active: true,
    start_date: "",
    end_date: ""
  };

  // Fetch tenants and categories on component mount
  useEffect(() => {
    fetchTenants();
    // Fetch categories for the correct tenant
    fetchCategories(undefined, { "X-Tenant-ID": tenantId })
      .then(() => {
        console.log("Categories fetched successfully");
      })
      .catch(error => {
        console.error("Error fetching categories:", error);
      });
  }, [fetchTenants, fetchCategories, tenantId]);

  // Log categories for debugging
  useEffect(() => {
    console.log("Categories in state:", categories);
  }, [categories]);

  // Get API functions from store
  const { createVendor, updateVendor } = useVendorStore();

  // Navigation functions
  const nextTab = () => {
    const currentTabIndex = tabFlow.indexOf(activeTab);
    if (currentTabIndex === -1 || currentTabIndex === tabFlow.length - 1) return;

    // Get fields to validate for the current tab
    const fieldsToValidate =
      tabValidationMap[activeTab as keyof typeof tabValidationMap] || [];

    // Validate only if we're going to the next tab via the Next button
    if (fieldsToValidate.length > 0) {
      // Trigger validation for all required fields in the current tab
      const result = fieldsToValidate.every((field) =>
        form.trigger(field as any)
      );

      if (result) {
        // If validation passes, go to next tab
        setActiveTab(tabFlow[currentTabIndex + 1]);
      } else {
        toast.error("Please complete all required fields before proceeding.");
      }
    } else {
      // If there are no fields to validate, just go to the next tab
      setActiveTab(tabFlow[currentTabIndex + 1]);
    }
  };

  const prevTab = () => {
    const currentTabIndex = tabFlow.indexOf(activeTab);
    if (currentTabIndex > 0) {
      // Going back doesn't trigger validation
      setActiveTab(tabFlow[currentTabIndex - 1]);
    }
  };

  // Handle file upload for form submission
  const handleFileUpload = useCallback((file: File, fieldName: string) => {
    console.log(`Uploading file for ${fieldName}:`, file);
  }, []);

  // Function to find which tab contains field errors - exactly matching tenant form implementation
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

  // Handle form submission with error handling and validation navigation - matching tenant form
  const handleFormSubmit = useCallback(
    async (data: VendorFormValues, e?: React.BaseSyntheticEvent) => {
      try {
        setFormError(null);
        setInternalIsSubmitting(true);

        // Make a clean copy of form data
        const dataToSubmit = JSON.parse(JSON.stringify(data));

        // For non-superOwner users, set tenant_id from session
        if (!isSuperOwner && tenantId) {
          dataToSubmit.tenant_id = tenantId;
        }
        
        // Process files: Extract actual File objects to handle separately
        const filesToUpload: File[] = [];
        
        if (dataToSubmit.verification_documents) {
          dataToSubmit.verification_documents = dataToSubmit.verification_documents.map((doc: any) => {
            // If this document has an actual File object, save it for upload
            if (doc.file) {
              filesToUpload.push(doc.file);
              // Clone the document without the file property 
              const { file, ...docWithoutFile } = doc;
              return docWithoutFile;
            }
            return doc;
          });
        }

        console.log("Submitting vendor data:", dataToSubmit);
        console.log("Files to upload:", filesToUpload.length);
        
        await onSubmit(dataToSubmit);
        
        // Reset to first tab after successful submission
        setActiveTab("business");
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "An unknown error occurred";
        
        setFormError(errorMessage);
        console.error("Form submission error:", error);
        toast.error(errorMessage);
      } finally {
        setInternalIsSubmitting(false);
      }
    },
    [onSubmit, isSuperOwner, tenantId]
  );

  // Handle form errors by navigating to the tab with the first error
  const handleFormError = useCallback((errors: any) => {
    console.log("Form validation errors:", errors);
    
    // Immediately find which tab has errors
    const tabWithErrors = findTabWithErrors(errors);

    // Always switch to the tab containing errors
    setActiveTab(tabWithErrors);

    // Show a toast message to guide the user
    toast.error("Please fix the validation errors before submitting");

    // Scroll to the first error field if possible
    setTimeout(() => {
      const firstErrorElement = document.querySelector('.form-error-field');
      if (firstErrorElement) {
        firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  }, []);

  // Handle business name change
  const handleBusinessNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const businessName = e.target.value;
    
    // Only set store name if it's empty or not set yet
    const currentStoreName = form.getValues('store.store_name');
    if (!currentStoreName) {
      form.setValue('store.store_name', businessName, { shouldValidate: false });
    }
    
    // Only set store slug if it's empty or not set yet
    const currentStoreSlug = form.getValues('store.store_slug');
    if (!currentStoreSlug) {
      // Create a slug from the business name
      const slug = businessName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      form.setValue('store.store_slug', slug, { shouldValidate: false });
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
            <form id={id || "marketplace-vendor-form"} onSubmit={form.handleSubmit(handleFormSubmit, handleFormError)}>
              {/* Save isEditable in a local variable to fix reference issues throughout the form */}
              <fieldset disabled={isSubmitting} className="space-y-6">
                {/* Tenant selector (superowner only) */}
                {isSuperOwner && (
                  <FormField
                    control={formControl}
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
                              .filter(tenant => tenant.id && tenant.id.trim() !== '')
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
                <Tabs defaultValue="business" value={activeTab} className="mt-2" onValueChange={value => setActiveTab(value)}>
                  <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
                    <TabsTrigger value="business" className="text-center">Business</TabsTrigger>
                    <TabsTrigger value="store" className="text-center">Store</TabsTrigger>
                    <TabsTrigger value="address" className="text-center">Address</TabsTrigger>
                    <TabsTrigger value="banking" className="text-center">Banking</TabsTrigger>
                    <TabsTrigger value="documents" className="text-center">Documents</TabsTrigger>
                    <TabsTrigger value="review" className="text-center">Review</TabsTrigger>
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
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                      >
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

  // Business Tab Component
  function BusinessTab() {
    const control = formControl;
    // Access categories from the store
    const categoryItems = useCategoryStore((state) => state.categories);
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
            control={control}
            name="business_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Business Name <RequiredField />
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    className="mt-2"
                    placeholder="Your business name"
                    onChange={(e) => {
                      field.onChange(e);
                      // Call the business name change handler
                      handleBusinessNameChange(e);
                    }}
                  />
                </FormControl>
                <FormDescription className="text-sm text-muted-foreground mt-2">
                  The official name of your business.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={control}
            name="display_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Display Name <RequiredField />
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    className="mt-2"
                    placeholder="Display name for your business"
                  />
                </FormControl>
                <FormDescription className="text-sm text-muted-foreground mt-2">
                  How your business will be displayed to customers.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            control={control}
            name="contact_email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Email <RequiredField />
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="email"
                    className="mt-2"
                    placeholder="contact@yourbusiness.com"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={control}
            name="contact_phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Phone <RequiredField />
                </FormLabel>
                <FormControl>
                  <PhoneInput 
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            control={control}
            name="website"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Website
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    className="mt-2"
                    placeholder="https://yourbusiness.com"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={control}
            name="tax_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Tax ID <RequiredField />
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    className="mt-2"
                    placeholder="TIN or business tax ID"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Categories field with multi-select */}
        <div>
          <FormField
            control={control}
            name="categories"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Business Categories <RequiredField />
                </FormLabel>
                <FormControl>
                  <MultiSelect
                    options={categoryItems
                      .filter(category => (category._id || category.category_id) && category.name)
                      .map(category => ({
                        label: category.name,
                        value: category.category_id || category._id
                      }))}
                    selected={field.value || []}
                    onChange={field.onChange}
                    placeholder="Select business categories"
                    className="mt-2"
                  />
                </FormControl>
                <FormDescription className="text-sm text-muted-foreground mt-2">
                  Select one or more categories that describe your business.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Commission Rate field */}
        <div>
          <FormField
            control={control}
            name="commission_rate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Commission Rate <RequiredField />
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    className="mt-2"
                    placeholder="e.g. 10"
                  />
                </FormControl>
                <FormDescription className="text-sm text-muted-foreground mt-2">
                  The commission rate for this vendor (e.g. 10%).
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </TabsContent>
    );
  }

  // Store Tab Component
  function StoreTab() {
    // Handle business name changes through form field change
    const handleBusinessNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const businessName = e.target.value;
      
      // Only set store name if it's empty or not set yet
      const currentStoreName = form.getValues('store.store_name');
      if (!currentStoreName) {
        form.setValue('store.store_name', businessName, { shouldValidate: false });
      }
      
      // Only set store slug if it's empty or not set yet
      const currentStoreSlug = form.getValues('store.store_slug');
      if (!currentStoreSlug) {
        // Create a slug from the business name
        const slug = businessName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '');
        form.setValue('store.store_slug', slug, { shouldValidate: false });
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
                  />
                </FormControl>
                <FormDescription className="text-sm text-muted-foreground mt-2">
                  The URL for your store: https://example.com/<strong>{field.value || 'your-store'}</strong>
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
                  />
                </FormControl>
                <FormDescription className="text-sm text-muted-foreground mt-2">
                  Provide a description of your store to help customers understand what you offer.
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
                <FormLabel>
                  Store Logo
                </FormLabel>
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

        {/* Store Banners Repeater Field */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-md font-medium">Store Banners</h4>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => appendBanner(defaultBanner)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Banner
            </Button>
          </div>
          
          {bannerFields.map((bannerField, index) => (
            <div key={bannerField.id} className="border rounded-md p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h5 className="text-sm font-medium">Banner {index + 1}</h5>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeBanner(index)}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name={`store.banners.${index}.title`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Banner Title <RequiredField />
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="mt-2"
                          placeholder="banner title"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={formControl}
                  name={`store.banners.${index}.alt_text`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Alt Text <RequiredField />
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="mt-2"
                          placeholder="Alternative text for accessibility"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={formControl}
                  name={`store.banners.${index}.image_url`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Banner Image <RequiredField />
                      </FormLabel>
                      <FormControl>
                        <ImageUpload
                          id={`banner-image-${index}`}
                          value={field.value}
                          onChange={field.onChange}
                          className="w-60 object-fit"
                          previewAlt={`Banner ${index + 1}`}
                          buttonText="Upload Banner"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name={`store.banners.${index}.is_active`}
                  render={({ field }) => (
                    <FormItem className="flex flex-col justify-content-center">
                      <FormLabel>
                        Active Status
                      </FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={(value) => field.onChange(value === "true")}
                          defaultValue={String(field.value)}
                        >
                          <FormControl>
                            <SelectTrigger className="mt-2">
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="true">Active</SelectItem>
                            <SelectItem value="false">Inactive</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name={`store.banners.${index}.start_date`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Start Date
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="date"
                          className="mt-2"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name={`store.banners.${index}.end_date`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        End Date
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="date"
                          className="mt-2"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          ))}
        </div>
      </TabsContent>
    )
  }

  // Address Tab Component
  function AddressTab() {
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
                <FormLabel>
                  Address Line 2
                </FormLabel>
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
                  <Input
                    {...field}
                    className="mt-2"
                    placeholder="City"
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
      </TabsContent>
    )
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
              control={formControl}
              name="bank_account.bank_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Bank Name <RequiredField />
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="CRDB Bank"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={formControl}
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
              control={formControl}
              name="bank_account.account_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Account Number <RequiredField />
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="12345678901"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={formControl}
              name="bank_account.branch_code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Branch Code
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="123"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            <FormField
              control={formControl}
              name="bank_account.swift_bic"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    SWIFT/BIC Code
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="EXAMPLECODE"
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
  
  // Documents Tab Component
  function DocumentsTab() {
    // Separate state for existing and new documents
    const [existingDocuments, setExistingDocuments] = useState<any[]>(
      initialData?.verification_documents || []
    );
    const [newDocuments, setNewDocuments] = useState<any[]>([]);
    
    // Update form values whenever documents change
    useEffect(() => {
      // Combine both existing and new documents for the form value
      const allDocuments = [...existingDocuments, ...newDocuments];
      
      form.setValue("verification_documents", allDocuments, {
        shouldValidate: false,
        shouldDirty: true,
        shouldTouch: false
      });
    }, [existingDocuments, newDocuments]);
    
    // Handle adding/updating a new document
    const handleAddNewDocument = (newDoc: DocumentWithMeta) => {
      setNewDocuments(prev => {
        // Look for existing document with the same file name
        const index = prev.findIndex(doc => doc.file_name === newDoc.file_name);
        
        if (index >= 0) {
          // Update existing document
          const updated = [...prev];
          updated[index] = {
            ...updated[index],
            ...newDoc
          };
          return updated;
        } else {
          // Add new document
          return [...prev, {
            ...newDoc,
            verification_status: "pending",
            document_url: ""
          }];
        }
      });
    };
    
    // Handle removing a new document
    const handleRemoveNewDocument = (fileName: string) => {
      setNewDocuments(prev => 
        prev.filter(doc => doc.file_name !== fileName)
      );
    };
    
    // Handle removing an existing document
    const handleRemoveExistingDocument = (documentId: string) => {
      setExistingDocuments(prev => 
        prev.filter(doc => (doc.document_id !== documentId) && (doc.id !== documentId))
      );
    };

    return (
      <TabsContent value="documents" className="space-y-4 mt-4">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Document Verification</h3>
          <p className="text-sm text-muted-foreground">
            Upload verification documents to prove your identity and business ownership
          </p>

          {/* Improved Document Upload Component */}
          <DocumentUpload
            existingDocuments={existingDocuments}
            newDocuments={newDocuments}
            documentTypes={DOCUMENT_TYPES}
            onAddNewDocument={handleAddNewDocument}
            onRemoveNewDocument={handleRemoveNewDocument}
            onRemoveExistingDocument={handleRemoveExistingDocument}
            label="Upload Business Documents"
            description="Provide documentation to verify your business identity, such as registration certificates, licenses, or other relevant documents."
          />
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
      if (activeTab === 'review') {
        setReviewValues(form.getValues());
      }
    }, [activeTab]);
    
    return (
      <TabsContent value="review" className="space-y-6 pt-4">
        <div className="space-y-4">
          <h3 className="text-xl font-medium">Review Vendor Information</h3>
          <p className="text-sm text-muted-foreground">
            Review all information before submission. Make sure all required fields are complete.
          </p>
        </div>

        <div className="space-y-6">
          <div className="bg-muted/50 p-4 rounded-lg">
            <div className="space-y-6">
              {/* Business Info Review */}
              <div>
                <h4 className="font-medium text-md border-b pb-2 mb-2">Business Information</h4>
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <div>
                    <dt className="font-medium text-muted-foreground">Business Name</dt>
                    <dd>{reviewValues.business_name || '-'}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-muted-foreground">Display Name</dt>
                    <dd>{reviewValues.display_name || '-'}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-muted-foreground">Contact Email</dt>
                    <dd>{reviewValues.contact_email || '-'}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-muted-foreground">Contact Phone</dt>
                    <dd>{reviewValues.contact_phone || '-'}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-muted-foreground">Website</dt>
                    <dd>{reviewValues.website || "Not provided"}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-muted-foreground">Tax ID</dt>
                    <dd>{reviewValues.tax_id || "Not provided"}</dd>
                  </div>
                </dl>
              </div>

              {/* Address Info Review */}
              <div>
                <h4 className="font-medium text-md border-b pb-2 mb-2">Address Information</h4>
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <div>
                    <dt className="font-medium text-muted-foreground">Address</dt>
                    <dd>
                      {reviewValues.address_line1 || '-'}<br />
                      {reviewValues.address_line2 && <>{reviewValues.address_line2}<br /></>}
                      {reviewValues.city && reviewValues.state_province ? `${reviewValues.city}, ${reviewValues.state_province} ${reviewValues.postal_code}` : '-'}<br />
                      {reviewValues.country || '-'}
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Banking Info Review */}
              <div>
                <h4 className="font-medium text-md border-b pb-2 mb-2">Banking Information</h4>
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <div>
                    <dt className="font-medium text-muted-foreground">Bank Name</dt>
                    <dd>{reviewValues.bank_account?.bank_name || '-'}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-muted-foreground">Account Name</dt>
                    <dd>{reviewValues.bank_account?.account_name || '-'}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-muted-foreground">Account Number</dt>
                    <dd>{reviewValues.bank_account?.account_number || '-'}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-muted-foreground">Branch Code</dt>
                    <dd>{reviewValues.bank_account?.branch_code || "Not provided"}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-muted-foreground">SWIFT/BIC</dt>
                    <dd>{reviewValues.bank_account?.swift_bic || "Not provided"}</dd>
                  </div>
                </dl>
              </div>

              {/* Documents Review */}
              <div>
                <h4 className="font-medium text-md border-b pb-2 mb-2">Documents Uploaded</h4>
                <div className="text-sm">
                  {reviewValues.verification_documents && reviewValues.verification_documents.length > 0 ? (
                    <ul className="list-disc pl-5">
                      {reviewValues.verification_documents.map((doc, index) => (
                        <li key={index}>
                          {doc.document_type}: {doc.file_name}
                          {doc.expiry_date && <span className="ml-2 text-muted-foreground">Expires: {doc.expiry_date}</span>}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted-foreground">No documents uploaded</p>
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
