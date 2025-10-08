"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  FileText,
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
import { FileUpload } from "@/components/ui/file-upload";
import { TenantConfiguration, TenantConfigurationHandle } from "./extra-config-fields";
import { useConfigurationStore } from '@/features/configurations/store';

import {
  countries,
  currencies,
  languages,
  documentTypes,
  vehicleTypes,
} from "@/features/settings/data/localization";
import { platformModules } from "@/features/settings/data/modules";
import { tenantFormSchema } from "../schema";
import { TenantFormValues } from "../types";
import { saveConfigurations } from './extra-config-fields';

// Default values for the form, providing a good starting point.
const defaultValues: Partial<TenantFormValues> = {
  plan: "monthly",
  country_code: "TZ",
  currency: "TZS",
  languages: ["en-US", "sw"],
  is_active: true,
  banners: [],
  branding: {
    logoUrl: "",
    theme: {
      logo: {
        primary: "",
        secondary: "",
        icon: "",
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
  modules: platformModules.reduce((acc, module) => {
    acc[module.name] = false; // Initialize all modules to false
    return acc;
  }, {} as Record<string, boolean>),
};

interface TenantFormProps {
  onSubmit: (data: TenantFormValues) => Promise<any>; // Allow promise for response
  onCancel?: () => void;
  initialData?: Partial<TenantFormValues> & { id?: string };
  isEditable?: boolean;
  id?: string;
  isSubmitting?: boolean;
}

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
  const isSuperOwner = userRole === "super"; // TODO:
  const isAddPage = !initialData?.id;

  const [activeTab, setActiveTab] = useState("details");
  const [internalIsSubmitting, setInternalIsSubmitting] = useState(false);
  const isSubmitting =
    externalIsSubmitting !== undefined
      ? externalIsSubmitting
      : internalIsSubmitting;
  const [formError, setFormError] = useState<string | null>(null);
  // 1. Add state for configurations and vehicleTypes in the parent
  const [configurations, setConfigurations] = useState<Record<string, any>>({});
  const [vehicleTypes, setVehicleTypes] = useState<any[]>([]);
  const [isConfigLoading, setIsConfigLoading] = useState(true);
  const { fetchVehicleTypes, fetchEntities } = useConfigurationStore();
  const [configActiveTab, setConfigActiveTab] = useState('delivery');

  // 2. Fetch initial data when tenantId changes
  useEffect(() => {
    async function fetchInitialConfig() {
      if (!initialData?.tenant_id) return;
      setIsConfigLoading(true);
      await fetchVehicleTypes(initialData.tenant_id);
      setVehicleTypes(useConfigurationStore.getState().vehicleTypes || []);
      const entities = await fetchEntities(initialData.tenant_id);
      const configObj: Record<string, any> = {};
      for (const entity of entities) {
        configObj[entity.name] = {
          ...entity,
          document_types: Array.isArray(entity.document_types) ? entity.document_types : [],
        };
      }
      setConfigurations(configObj);
      setIsConfigLoading(false);
    }
    fetchInitialConfig();
  }, [initialData?.tenant_id, fetchVehicleTypes, fetchEntities]);

  // 3. Remove configRef and pass state/setters to TenantConfiguration
  // Ref for TenantConfiguration
  // const configRef = useRef<TenantConfigurationHandle>(null);

  const form = useForm<TenantFormValues>({
    resolver: zodResolver(tenantFormSchema),
    defaultValues: initialData
      ? { ...defaultValues, ...initialData }
      : defaultValues,
    mode: "onBlur",
  });

  const tabFlow = [
    "details",
    "branding",
    "configuration",
    "modules",
    "billing-history",
    "revenue",
  ];

  const handleNextTab = () => {
    const currentTabIndex = tabFlow.indexOf(activeTab);
    if (currentTabIndex < tabFlow.length - 1) {
      const nextAvailableTab = tabFlow
        .slice(currentTabIndex + 1)
        .find(tab => {
          if (tab === 'billing-history' && isAddPage) return false;
          if (tab === 'revenue' && (isAddPage || !isSuperOwner)) return false;
          return true;
        });
      if(nextAvailableTab) setActiveTab(nextAvailableTab);
    }
  };

  const handlePrevTab = () => {
    const currentTabIndex = tabFlow.indexOf(activeTab);
    if (currentTabIndex > 0) {
       const prevAvailableTab = tabFlow
        .slice(0, currentTabIndex)
        .reverse()
        .find(tab => {
          if (tab === 'billing-history' && isAddPage) return false;
          if (tab === 'revenue' && (isAddPage || !isSuperOwner)) return false;
          return true;
        });
      if(prevAvailableTab) setActiveTab(prevAvailableTab);
    }
  };
  
  const handleFileUpload = useCallback((file: File, fieldName: string) => {
    // This is a placeholder. In a real app, you'd upload the file
    // and call form.setValue(fieldName, uploadedUrl)
  }, []);

  // Handle form submission with error handling and validation navigation
  const handleFormSubmit = useCallback(
    async (data: TenantFormValues) => {
      try {
        setFormError(null);
        setInternalIsSubmitting(true);

        // 1. Prepare the tenant data payload
        const dataToSubmit = JSON.parse(JSON.stringify(data));

        dataToSubmit.user = {
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.admin_email,
          phone_number: data.admin_phone,
        };

        delete dataToSubmit.first_name;
        delete dataToSubmit.last_name;
        delete dataToSubmit.admin_email;
        delete dataToSubmit.admin_phone;

        if (!isSuperOwner) {
          delete dataToSubmit.modules;
          delete dataToSubmit.fee;
          delete dataToSubmit.plan;
          delete dataToSubmit.trial_ends_at;
          delete dataToSubmit.is_active;
        }

        // 2. Submit tenant data and get the ID from the response
        const response = await onSubmit(dataToSubmit);
        const tenantId = response?.id || id;

        if (!tenantId) {
          throw new Error('Failed to get tenant ID after submission.');
        }

        // 4. On submit, call saveConfigurations with parent's state
        // console.log('[TenantForm] Submitting configurations:', configurations);
        // console.log('[TenantForm] Submitting vehicleTypes:', vehicleTypes);
        await saveConfigurations(tenantId, configurations, vehicleTypes);

        toast.success(`Tenant ${id ? 'updated' : 'created'} successfully!`);
        if (!id) { // If it was a new tenant, reset form or navigate
            form.reset();
        }
        setActiveTab("details");

      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "An unexpected error occurred.";
        setFormError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setInternalIsSubmitting(false);
      }
    },
    [onSubmit, isSuperOwner, id, form, configurations, vehicleTypes]
  );

  // Import the saveConfigurations function from extra-config-fields
  // (You may need to export it from that file)
  // import { saveConfigurations } from './extra-config-fields';
  // For now, assume it is available in scope

  const handleDeleteBanner = async (resourceId: string, bannerId: string) => {
    if (!resourceId) {
      toast.error("Cannot delete banner: Tenant ID is missing.");
      return;
    }
    toast.promise(
      new Promise<void>(async (resolve, reject) => {
        try {
          // This is a placeholder for the actual API call.
          // We optimistically remove the banner from the form state.
          const currentBanners = form.getValues("banners") || [];
          const updatedBanners = currentBanners.filter(
            (b) => b.id !== bannerId
          );
          form.setValue("banners", updatedBanners, { shouldDirty: true });
          resolve();
        } catch (error) {
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
    toast.info(
      "Banner order saved locally. Submit the form to persist changes."
    );
  };

  // Handle form errors by navigating to the tab with the first error
  const handleFormError = (errors: any) => {
    const fieldToTabMap: Record<string, string> = {
      first_name: "details",
      last_name: "details",
      name: "details",
      domain: "details",
      admin_email: "details",
      admin_phone: "details",
      branding: "branding",
      banners: "branding",
      country_code: "configuration",
      currency: "configuration",
      languages: "configuration",
      document_types: "configuration",
      vehicle_types: "configuration",
      modules: "modules",
    };

    const firstErrorField = Object.keys(errors)[0];
    if (firstErrorField) {
      const tab = fieldToTabMap[firstErrorField.split('.')[0]];
      if (tab) {
        setActiveTab(tab);
      }
    }
    console.log('[TenantForm] Form error:', errors);
    toast.error("Please fix the validation errors before submitting");
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
      <Card className="">
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
                            onClick={handlePrevTab}
                          >
                            Previous
                          </Button>
                        )}

                        {activeTab !== "modules" ? (
                          <Button
                            type="button"
                            onClick={handleNextTab}
                          >
                            Next
                          </Button>
                        ) : (
                          <Button type="submit" disabled={isSubmitting || isConfigLoading}>
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

        <Separator />
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Status</h3>
          {isSuperOwner && (
            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 py-6">
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={!isEditable && isSuperOwner}
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
          )}
          {!isSuperOwner && (
            <div className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 py-6">
              <Switch
                checked={form.getValues("is_active")}
                disabled
                className="disabled:opacity-80"
              />
              <div className="space-y-1 leading-none ms-2">
                <FormLabel>Active Status</FormLabel>
                <FormDescription>
                  You do not have permission to change the status.
                </FormDescription>
              </div>
            </div>
          )}
        </div>
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
                        onFileChange={(file) =>
                          handleFileUpload(file, "primaryLogo")
                        }
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
                        onFileChange={(file) =>
                          handleFileUpload(file, "secondaryLogo")
                        }
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
                        onFileChange={(file) =>
                          handleFileUpload(file, "iconLogo")
                        }
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
            <h4 className="text-md font-medium">
              Text, Background & Border Colors
            </h4>
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
          <div className="grid grid-cols-2 gap-4">
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

            <FormField
              control={form.control}
              name="metadata.banners"
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

            {/* Legal Documents */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="metadata.terms_conditions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Terms & Conditions</FormLabel>
                    <FormControl>
                      <FileUpload
                        label="Upload Terms & Conditions"
                        description="Upload your terms and conditions document (PDF format recommended)"
                        value={field.value || ""}
                        onChange={(fileUrl) => field.onChange(fileUrl)}
                        onRemove={() => field.onChange("")}
                        disabled={!isEditable}
                        accept=".pdf"
                        maxSizeMB={10}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="metadata.privacy_policy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Privacy Policy</FormLabel>
                    <FormControl>
                      <FileUpload
                        label="Upload Privacy Policy"
                        description="Upload your privacy policy document (PDF format recommended)"
                        value={field.value || ""}
                        onChange={(fileUrl) => field.onChange(fileUrl)}
                        onRemove={() => field.onChange("")}
                        disabled={!isEditable}
                        accept=".pdf"
                        maxSizeMB={10}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator className="my-6 mt-8" />

            {/* Extra Configuration Fields - now controlled */}
            <TenantConfiguration
              tenantId={initialData?.tenant_id}
              isEditable={isEditable}
              configurations={configurations}
              setConfigurations={setConfigurations}
              vehicleTypes={vehicleTypes}
              setVehicleTypes={setVehicleTypes}
              loading={isConfigLoading}
              activeTab={configActiveTab}
              setActiveTab={setConfigActiveTab}
            />
          </div>
        </div>
      </TabsContent>
    );
  }

  function ModulesTab() {
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
        </div>
        <div className="space-y-4">
          {platformModules.map((module) => (
            <FormField
              key={module.name}
              control={form.control}
              name={`modules.${module.name}`}
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base font-medium">
                      {module.label}
                    </FormLabel>
                    <FormDescription>
                      {module.description}
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={!isSuperOwner || !isEditable}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          ))}
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

          <div className="text-center py-8 border rounded-md">
            <p className="text-muted-foreground">
              No billing history available
            </p>
          </div>
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


          <div className="text-center py-8 border rounded-md">
            <p className="text-muted-foreground">
              No revenue information available
            </p>
          </div>
        </div>
      </TabsContent>
    );
  }
}