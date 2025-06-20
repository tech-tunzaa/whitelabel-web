import { useForm } from "react-hook-form";
import { useVendorStore } from "../store";
import { Store } from "../types";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ImageUpload } from "@/components/ui/image-upload";
import { Spinner } from "@/components/ui/spinner";
import { RequiredField } from "@/components/ui/required-field";
import { Button } from "@/components/ui/button";
import { MultiSelect } from "@/components/ui/multi-select";
import { FileUpload } from "@/components/ui/file-upload";
import { BannerEditor } from "@/components/ui/banner-editor";
import { useCategoryStore } from "@/features/categories/store";
import React, { useMemo } from "react";
import { useSession } from "next-auth/react";

const StoreFormCard: React.FC<{
  store: Store;
  storeId: string;
  onStoreUpdated?: (store: Store) => void;
}> = ({ store, storeId, onStoreUpdated }) => {
  const { data: session } = useSession();
  const tenantId = useMemo(
    () => (session?.user as any)?.tenant_id || "",
    [session]
  );
  const { updateStore, loading } = useVendorStore();
  const form = useForm<Store>({
    defaultValues: store,
    mode: "onBlur",
  });
  const fetchCategories = useCategoryStore((state) => state.fetchCategories);
  const categories = useCategoryStore((state) => state.categories);

  // Fetch categories on mount if not already loaded
  React.useEffect(() => {
    if (!categories || categories.length === 0) {
      fetchCategories();
    }
  }, [categories, fetchCategories]);

  const handleSubmit = async (values: Store) => {
    try {
      const updated = await updateStore(storeId, values, undefined, tenantId);
      if (onStoreUpdated) onStoreUpdated(updated);
      toast.success("Store updated successfully");
    } catch (e) {
      toast.error("Failed to update store");
    }
  };

  return (
    <Card className="mt-8">
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Store Information</h3>
              <p className="text-sm text-muted-foreground">
                Provide details about your online store.
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="store_name"
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
                name="store_slug"
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
                name="description"
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
                name="branding.logo_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Store Logo</FormLabel>
                    <FormControl>
                      <ImageUpload
                        id="store-logo-upload"
                        value={field.value as string}
                        onChange={field.onChange}
                        className="mt-2"
                        imgHeight="h-70"
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
                name="categories"
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
                  name="return_policy"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Return Policy</FormLabel>
                      <FormControl>
                        <FileUpload
                          value={field.value as string}
                          onChange={field.onChange}
                          onRemove={() => field.onChange("")}
                          accept=".pdf"
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
                  name="shipping_policy"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Shipping Policy</FormLabel>
                      <FormControl>
                        <FileUpload
                          value={field.value as string}
                          onChange={field.onChange}
                          onRemove={() => field.onChange("")}
                          accept=".pdf"
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
                name="general_policy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>General Terms & Conditions</FormLabel>
                    <FormControl>
                      <FileUpload
                        value={field.value as string}
                        onChange={field.onChange}
                        onRemove={() => field.onChange("")}
                        accept=".pdf"
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
            {/* Store Banners using BannerEditor Component */}
            <div className="space-y-4 border-t pt-5 mt-5">
              <h4 className="text-md font-medium">Store Banners</h4>
              <FormField
                control={form.control}
                name="banners"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <BannerEditor
                        banners={field.value ?? []}
                        onChange={field.onChange}
                        readOnly={false}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={loading}>
                {loading ? <Spinner size="sm" color="white" /> : "Save Store"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default StoreFormCard;
