"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Upload,
  X,
  CreditCard,
  FileText,
  BarChart3,
  Check,
  Truck,
  Badge,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import { PhoneInput } from "@/components/ui/phone-input";
import { RequiredField } from "@/components/ui/required-field";
import { MultiSelect } from "@/components/ui/multi-select";
import { ImageUpload } from "@/components/ui/image-upload";
import { ColorPicker } from "@/components/ui/color-picker";
import { BannerEditor } from "@/components/ui/banner-editor";
import { Spinner } from "@/components/ui/spinner";
import { ErrorCard } from "@/components/ui/error-card";

import {
  countries,
  currencies,
  languages,
  documentTypes,
  vehicleTypes,
} from "@/features/settings/data/localization";
import { platformModules } from "@/features/settings/data/modules";
import { mockBillingHistory } from "../data/billing";
import { tenantFormSchema } from "../schema";
import { TenantFormValues, BillingHistoryItem } from "../types";

// Default tenant values that match the API structure
const defaultValues: Partial<TenantFormValues> = {
  first_name: "",
  last_name: "",
  name: "",
  domain: "",
  admin_email: "",
  admin_phone: "",
  banners: [],
  plan: "monthly",
  fee: "",
  country_code: "TZ",
  currency: "TZS",
  languages: ["en-US", "sw"],
  document_types: ["id_card", "passport"],
  vehicle_types: ["motorcycle", "car"],
  // IMPORTANT: Remove modules completely from React Hook Form
  // We'll handle this separately to avoid infinite loops
  is_active: false,
  trial_ends_at: "",
  branding: {
    logoUrl: "",
    theme: {
      logo: {
        primary: null,
        secondary: null,
        icon: null,
      },
      colors: {
        primary: "#3182CE",
        secondary: "#E2E8F0",
        accent: "#ED8936",
        text: {
          primary: "#000000",
          secondary: "#4A5568",
        },
        background: {
          primary: "#FFFFFF",
          secondary: "#F7FAFC",
        },
        border: "#E2E8F0",
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
  isSubmitting?: boolean;
}

// Global module state management - outside component to avoid re-renders
let moduleState: Record<string, boolean> = {};

// Initialize module state with all modules set to false
platformModules.forEach((module) => {
  moduleState[module.name] = false;
});

export function TenantForm({
  onSubmit,
  onCancel,
  initialData,
  isEditable = true,
  id,
  isSubmitting: externalIsSubmitting,
}: TenantFormProps) {
  const { data: session } = useSession();
  const userRole = session?.user?.role || "";
  const isSuperOwner = userRole === "super_owner";
  const isAddPage = !initialData?.id;

  // Initialize module state from initialData if available
  useEffect(() => {
    if (initialData?.modules) {
      platformModules.forEach((module) => {
        moduleState[module.name] = !!initialData.modules?.[module.name];
      });
    }
  }, [initialData]);

  // Form state management
  const [activeTab, setActiveTab] = useState("details");
  const [internalIsSubmitting, setInternalIsSubmitting] = useState(false);
  const isSubmitting =
    externalIsSubmitting !== undefined
      ? externalIsSubmitting
      : internalIsSubmitting;
  const [formError, setFormError] = useState<string | null>(null);

  // File upload state management
  const [primaryLogoFile, setPrimaryLogoFile] = useState<File | null>(null);
  const [secondaryLogoFile, setSecondaryLogoFile] = useState<File | null>(null);
  const [iconFile, setIconFile] = useState<File | null>(null);

  // Data display state
  const [showMoreHistory, setShowMoreHistory] = useState(false);
  const [billingHistory] = useState<BillingHistoryItem[]>(mockBillingHistory);

  const form = useForm<TenantFormValues>({
    resolver: zodResolver(tenantFormSchema),
    defaultValues: initialData || defaultValues,
  });

  // Tab navigation with field validation
  const tabValidationMap = {
    details: [
      "first_name",
      "last_name",
      "name",
      "domain",
      "admin_email",
      "admin_phone",
      ...(isSuperOwner ? ["plan", "fee"] : []),
    ],
    branding: [
      "branding.logoUrl",
      "branding.theme.colors.primary",
      "branding.theme.colors.secondary",
      "branding.theme.colors.accent",
      "branding.theme.colors.text.primary",
      "branding.theme.colors.text.secondary",
      "branding.theme.colors.background.primary",
      "branding.theme.colors.background.secondary",
      "branding.theme.colors.border",
    ],
    configuration: [
      "country_code",
      "currency",
      "languages",
      "document_types",
      "vehicle_types",
    ],
    modules: ["modules"],
  };

  const tabFlow = ["details", "branding", "banners", "configuration", "modules"];

  const nextTab = () => {
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
  };

  const prevTab = () => {
    const currentTabIndex = tabFlow.indexOf(activeTab);
    if (currentTabIndex > 0) {
      setActiveTab(tabFlow[currentTabIndex - 1]);
    }
  };

  // Handle file upload for form submission
  const handleFileUpload = useCallback((file: File, fieldName: string) => {
    console.log(`Uploading file for ${fieldName}:`, file);
  }, []);

  // Handle form submission with error handling and validation navigation
  const handleFormSubmit = useCallback(
    async (data: TenantFormValues, e?: React.BaseSyntheticEvent) => {
      try {
        setFormError(null);
        setInternalIsSubmitting(true);

        // Make a clean copy of form data
        const dataToSubmit = JSON.parse(JSON.stringify(data));

        // Construct the user object
        dataToSubmit.user = {
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.admin_email,
          phone_number: data.admin_phone,
        };

        // Remove fields that are not part of the final payload
        delete dataToSubmit.first_name;
        delete dataToSubmit.last_name;

        // Manually add modules from our global state
        if (isSuperOwner) {
          dataToSubmit.modules = {};
          // Copy module values from our global state
          platformModules.forEach((module) => {
            dataToSubmit.modules[module.name] = !!moduleState[module.name];
          });
          console.debug("Submitting with modules:", dataToSubmit.modules);
        }

        // Remove restricted fields for non-superOwner users
        if (!isSuperOwner) {
          // These fields should be excluded for non-superOwner users
          const restrictedFields = [
            "modules",
            "fee",
            "plan",
            "trial_ends_at",
            "is_active",
          ];

          // Remove each restricted field from the submission data
          restrictedFields.forEach((field) => {
            if (field in dataToSubmit) {
              delete dataToSubmit[field as keyof TenantFormValues];
            }
          });

          // Log what we're actually submitting for debugging
          console.debug("Submitting tenant data (filtered):", dataToSubmit);
        } else {
          console.debug("Submitting tenant data (super_owner):", dataToSubmit);
        }

        await onSubmit(dataToSubmit);

        setActiveTab("details");
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "An error occurred";
        setFormError(errorMessage);
      } finally {
        setInternalIsSubmitting(false);
      }
    },
    [onSubmit, isSuperOwner]
  );

  const handleDeleteBanner = async (resourceId: string, bannerId: string) => {
    if (!resourceId) {
      toast.error("Cannot delete banner: Tenant ID is missing.");
      return;
    }
    console.log("Deleting banner:", { resourceId, bannerId });
    toast.promise(
      new Promise<void>(async (resolve, reject) => {
        try {
          // This is a placeholder for the actual API call.
          // We optimistically remove the banner from the form state.
          const currentBanners = form.getValues("banners") || [];
          const updatedBanners = currentBanners.filter((b) => b.id !== bannerId);
          form.setValue("banners", updatedBanners, { shouldDirty: true });
          resolve();
        } catch (error) {
          console.error("Failed to delete banner:", error);
          reject(error);
        }
      }),
      {
        loading: "Deleting banner...",
        success: "Banner removed from form.",
        error: "Failed to remove banner.",
      }
    );
  };

  const handleUpdateTenant = async (
    resourceId: string,
    entityId: string,
    data: any
  ) => {
    if (!resourceId) {
      toast.error("Cannot update banners: Tenant ID is missing.");
      return;
    }
    console.log("Updating tenant resource for banners:", { resourceId, data });
    toast.info(
      "Banner order saved locally. Submit the form to persist changes."
    );
  };

  // Handle form errors by navigating to the tab with the first error
  const handleFormError = useCallback((errors: any) => {
    // Immediately find which tab has errors
    const tabWithErrors = findTabWithErrors(errors);

    // Always switch to the tab containing errors
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

  // If there's a form error and we're not in the loading state, show error card
  if (formError && !isSubmitting) {
    return (
      <ErrorCard
        title={`Failed to ${isAddPage ? "create" : "update"} tenant`}
        error={{ status: "Error", message: formError }}
        buttonText="Try Again"
        buttonAction={() => setFormError(null)}
        buttonIcon={RefreshCw}
      />
    );
  }

  return (
    <fieldset disabled={isSubmitting}>
      <Card className="mx-4">
        <CardContent className="p-6">
          <Form {...form}>
            <form
              id="marketplace-tenant-form"
              onSubmit={form.handleSubmit(handleFormSubmit, handleFormError)}
              className="space-y-6"
            >
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="w-full">
                  <TabsTrigger value="details">Basic Details</TabsTrigger>
                  <TabsTrigger value="branding">Branding</TabsTrigger>
                  <TabsTrigger value="configuration">Configuration</TabsTrigger>
                  <TabsTrigger value="modules">Modules</TabsTrigger>
                  {!isAddPage && (
                    <TabsTrigger value="billing-history">
                      Billing History
                    </TabsTrigger>
                  )}
                  {isSuperOwner && !isAddPage && (
                    <TabsTrigger value="revenue">Revenue</TabsTrigger>
                  )}
                </TabsList>

                <DetailsTab />

                <BrandingTab />

                <ConfigurationTab />

                <ModulesTab />

                <BillingHistoryTab />

                {isSuperOwner && !isAddPage && <RevenueTab />}
              </Tabs>

              {isEditable && (
                <div className="flex flex-col-reverse sm:flex-row gap-2 justify-end mt-6">
                  {activeTab !== "billing-history" &&
                    activeTab !== "revenue" && (
                      <>
                        {activeTab !== "details" && (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={prevTab}
                          >
                            Previous
                          </Button>
                        )}

                        {activeTab !== "modules" ? (
                          <Button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              nextTab();
                            }}
                          >
                            Next
                          </Button>
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
                      </>
                    )}
                </div>
              )}
            </form>
          </Form>
        </CardContent>
      </Card>
    </fieldset>
  );

  function DetailsTab() {
    return (
      <TabsContent value="details" className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Makertplace Name <RequiredField />
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Example Store"
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
            name="domain"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Domain <RequiredField />
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="example-store.marketplace.com"
                    {...field}
                    readOnly={!isEditable}
                  />
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
              name="first_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    First Name <RequiredField />
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="John"
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
              name="last_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Last Name <RequiredField />
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Doe"
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
              name="admin_email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Email <RequiredField />
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="admin@example.com"
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
              name="admin_phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Phone <RequiredField />
                  </FormLabel>
                  <FormControl>
                    <PhoneInput
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      readOnly={!isEditable}
                      ref={field.ref}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {isSuperOwner && (
          <>
            <Separator />
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Subscription Details</h3>
              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="plan"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Billing Plan <RequiredField />
                      </FormLabel>
                      <Select
                        disabled={!isEditable}
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a billing plan" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="quarterly">Quarterly</SelectItem>
                          <SelectItem value="annually">Annually</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Select the billing plan for the tenant
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="fee"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subscription Fee</FormLabel>
                      <FormControl>
                        <Input {...field} readOnly={!isEditable} />
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

            <Separator />

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Status</h3>
              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="is_active"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 py-6">
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={!isEditable}
                          className="disabled:opacity-80"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Active Status</FormLabel>
                        <FormDescription>
                          Toggle to activate or deactivate the tenant account
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="trial_ends_at"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Trial End Date <RequiredField />
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="datetime-local"
                          {...field}
                          readOnly={!isEditable}
                        />
                      </FormControl>
                      <FormDescription>
                        Set the date when the trial period ends
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </>
        )}
      </TabsContent>
    );
  }

  function BrandingTab() {
    return (
      <TabsContent value="branding" className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Store Branding</h3>

          <div className="grid gap-6 md:grid-cols-4">
            <FormField
              control={form.control}
              name="branding.logoUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Logo URL</FormLabel>
                  <FormControl>
                    <ImageUpload
                      id="logo-upload"
                      value={field.value}
                      onChange={field.onChange}
                      previewAlt="Store Logo Preview"
                      onFileChange={(file) => handleFileUpload(file, "logoUrl")}
                      readOnly={!isEditable}
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
                          onFileChange={(file) => handleFileUpload(file, "primaryLogo")}
                          height="h-32"
                          buttonText="Primary Logo"
                          readOnly={!isEditable}
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
                          onFileChange={(file) => handleFileUpload(file, "secondaryLogo")}
                          height="h-32"
                          buttonText="Secondary Logo"
                          readOnly={!isEditable}
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
                          onFileChange={(file) => handleFileUpload(file, "iconLogo")}
                          height="h-32"
                          buttonText="Icon Logo"
                          readOnly={!isEditable}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator className="mt-12" />
            <div className="space-y-2">
              <h4 className="text-md font-medium">Brand Colors</h4>
              <div className="grid gap-6 md:grid-cols-3">
                <FormField
                  control={form.control}
                  name="branding.theme.colors.primary"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Primary Color <RequiredField />
                      </FormLabel>
                      <FormControl>
                        <ColorPicker
                          color={field.value}
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
                  name="branding.theme.colors.secondary"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Secondary Color <RequiredField />
                      </FormLabel>
                      <FormControl>
                        <ColorPicker
                          color={field.value}
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
                  name="branding.theme.colors.accent"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Accent Color <RequiredField />
                      </FormLabel>
                      <FormControl>
                        <ColorPicker
                          color={field.value}
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

            <Separator className="mt-12" />
            <div className="space-y-2">
            <h4 className="text-md font-medium">Text, Background & Border Colors</h4>
            <div className="grid gap-6 md:grid-cols-5">
              <FormField
                control={form.control}
                name="branding.theme.colors.text.primary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Primary Text <RequiredField />
                    </FormLabel>
                    <FormControl>
                      <ColorPicker
                        color={field.value}
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
                name="branding.theme.colors.text.secondary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Secondary Text <RequiredField />
                    </FormLabel>
                    <FormControl>
                      <ColorPicker
                        color={field.value}
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
                name="branding.theme.colors.background.primary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Primary Background <RequiredField />
                    </FormLabel>
                    <FormControl>
                      <ColorPicker
                        color={field.value}
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
                name="branding.theme.colors.background.secondary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Secondary Background <RequiredField />
                    </FormLabel>
                    <FormControl>
                      <ColorPicker
                        color={field.value}
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
                name="branding.theme.colors.border"
                render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Border Color <RequiredField />
                  </FormLabel>
                  <FormControl>
                    <ColorPicker
                      color={field.value}
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

          <Separator className="mt-14" />
          <FormField
            control={form.control}
            name="banners"
            render={({ field }) => (
              <BannerEditor
                banners={field.value ?? []}
                onChange={field.onChange}
                readOnly={!isEditable}
                resourceId={id || initialData?.id || ""}
                entityId={id || initialData?.id || ""}
                onDeleteBanner={handleDeleteBanner}
                onUpdateResource={handleUpdateTenant}
              />
            )}
          />
        </div>
      </TabsContent>
    );
  }

  function ConfigurationTab() {
    return (
      <TabsContent value="configuration" className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Marketplace Configurations</h3>
          <p className="text-sm text-muted-foreground">
            Configure country, currency, languages, and other marketplace
            settings
          </p>

          <div className="space-y-6">
            <h4 className="text-md font-medium">Localization Settings</h4>
            <div className="grid gap-6 md:grid-cols-3">
              <FormField
                control={form.control}
                name="country_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Country <RequiredField />
                    </FormLabel>
                    <Select
                      disabled={!isEditable}
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a country code" />
                      </SelectTrigger>
                      <SelectContent>
                        {countries.map((code) => (
                          <SelectItem key={code.value} value={code.value}>
                            {code.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Currency <RequiredField />
                    </FormLabel>
                    <Select
                      disabled={!isEditable}
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a currency" />
                      </SelectTrigger>
                      <SelectContent>
                        {currencies.map((currency) => (
                          <SelectItem
                            key={currency.value}
                            value={currency.value}
                          >
                            {currency.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="languages"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Languages <RequiredField />
                    </FormLabel>
                    <MultiSelect
                      placeholder="Select languages"
                      selected={field.value || []}
                      options={languages.map((language) => ({
                        value: language.value,
                        label: language.label,
                      }))}
                      onChange={(selected) => field.onChange(selected)}
                      className="w-full"
                      readOnly={!isEditable}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator className="my-4" />

            <div className="space-y-4">
              <h4 className="text-md font-medium">Document & Vehicle Types</h4>
              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="document_types"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Document Types <RequiredField />
                      </FormLabel>
                      <MultiSelect
                        placeholder="Select document types"
                        selected={field.value || []}
                        options={documentTypes.map((type) => ({
                          value: type.value,
                          label: type.label,
                        }))}
                        onChange={(selected) => field.onChange(selected)}
                        className="w-full"
                        readOnly={!isEditable}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="vehicle_types"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Vehicle Types <RequiredField />
                      </FormLabel>
                      <MultiSelect
                        placeholder="Select vehicle types"
                        selected={field.value || []}
                        options={vehicleTypes.map((type) => ({
                          value: type.value,
                          label: type.label,
                        }))}
                        onChange={(selected) => field.onChange(selected)}
                        className="w-full"
                        readOnly={!isEditable}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>
        </div>
      </TabsContent>
    );
  }

  function ModulesTab() {
    // Force re-render when module state changes
    const [_, forceUpdate] = useState({});

    // Update module state and force component to re-render
    const updateModuleState = (moduleName: string, value: boolean) => {
      moduleState[moduleName] = value;
      forceUpdate({});
    };

    return (
      <TabsContent value="modules" className="space-y-4 mt-4">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Module Configuration</h3>
          {!isSuperOwner && (
            <>
              <Alert className="mb-4">
                <FileText className="h-4 w-4" />
                <AlertTitle>View Only</AlertTitle>
                <AlertDescription>
                  Only super admins can modify module configurations
                </AlertDescription>
              </Alert>
              <p className="text-sm text-muted-foreground">
                Marketplace modules configurations
              </p>
            </>
          )}

          <div className="space-y-4">
            {platformModules.map((module) => (
              <div
                key={module.name}
                className="flex flex-row items-center justify-between rounded-lg border p-4"
              >
                <div className="space-y-0.5">
                  <p className="text-base font-medium">{module.label}</p>
                  <p className="text-sm text-muted-foreground">
                    {module.description}
                  </p>
                </div>
                <Switch
                  checked={moduleState[module.name] || false}
                  onCheckedChange={(checked) => {
                    updateModuleState(module.name, checked);
                  }}
                  disabled={!isSuperOwner || !isEditable}
                  className="disabled:opacity-80"
                />
              </div>
            ))}
          </div>
        </div>
      </TabsContent>
    );
  }

  function BillingHistoryTab() {
    return (
      <TabsContent value="billing-history" className="space-y-4 mt-4">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Billing History</h3>
          <p className="text-sm text-muted-foreground">
            Recent payment activities and transaction history
          </p>

          {billingHistory.length === 0 ? (
            <div className="text-center py-8 border rounded-md">
              <p className="text-muted-foreground">
                No billing history available
              </p>
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
                      <div
                        key={item.id}
                        className="grid grid-cols-4 px-6 py-4 text-sm"
                      >
                        <div className="text-gray-900">
                          {new Date(item.date).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </div>
                        <div className="text-gray-900">{item.description}</div>
                        <div className="text-gray-900 font-medium">
                          {item.amount}
                        </div>
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
    );
  }

  function RevenueTab() {
    return (
      <TabsContent value="revenue" className="space-y-4 mt-4">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Revenue Summary</h3>
          <p className="text-sm text-muted-foreground">
            Revenue and commission information for this tenant
          </p>

          <div className="grid gap-6 md:grid-cols-3">
            <Card className="p-4 flex flex-col gap-2">
              <div className="text-sm font-medium text-muted-foreground">
                Total Revenue
              </div>
              <div className="text-2xl font-bold">TZS 12,896,540</div>
              <div className="text-xs text-muted-foreground">
                Since tenant inception
              </div>
            </Card>

            <Card className="p-4 flex flex-col gap-2">
              <div className="text-sm font-medium text-muted-foreground">
                Commission Earned
              </div>
              <div className="text-2xl font-bold">TZS 1,289,654</div>
              <div className="text-xs text-muted-foreground">
                Based on current rate
              </div>
            </Card>

            <Card className="p-4 flex flex-col gap-2">
              <div className="text-sm font-medium text-muted-foreground">
                Monthly Average
              </div>
              <div className="text-2xl font-bold">TZS 1,074,711</div>
              <div className="text-xs text-muted-foreground">
                Last 12 months
              </div>
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
                    <div
                      key={index}
                      className="grid grid-cols-4 px-6 py-4 text-sm"
                    >
                      <div className="text-gray-900">
                        {new Date(2024, 4 - index, 1).toLocaleDateString(
                          "en-US",
                          { year: "numeric", month: "short" }
                        )}
                      </div>
                      <div className="text-gray-900">
                        TZS {(1200000 - index * 50000).toLocaleString()}
                      </div>
                      <div className="text-gray-900 font-medium">
                        TZS {(120000 - index * 5000).toLocaleString()}
                      </div>
                      <div>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            index % 3 === 0
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {index % 3 === 0 ? "+" : ""}
                          {6 - index}%
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
    );
  }
}
