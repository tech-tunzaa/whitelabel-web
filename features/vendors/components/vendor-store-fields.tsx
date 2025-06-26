import React from "react";
import { Control } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ImageUpload } from "@/components/ui/image-upload";
import { RequiredField } from "@/components/ui/required-field";
import { MultiSelect } from "@/components/ui/multi-select";
import { FileUpload } from "@/components/ui/file-upload";
import { BannerEditor } from "@/components/ui/banner-editor";
import { Category } from "@/features/categories/types";
import { VendorFormValues } from "../types";

interface VendorStoreFormProps {
  control: Control<VendorFormValues>;
  fieldPrefix: string;
  categories: Category[];
}

const VendorStoreForm: React.FC<VendorStoreFormProps> = ({
  control,
  fieldPrefix,
  categories,
}) => {
  const categoryOptions =
    categories?.map((category) => ({
      value: String(category?.category_id || ""),
      label: String(category?.name || ""),
    })) || [];

  return (
    <>
      <div className="grid gap-6 md:grid-cols-2">
        <FormField
          control={control}
          name={`${fieldPrefix}.store_name`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Store Name <RequiredField />
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Your store name"
                  value={field.value || ""}
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
          control={control}
          name={`${fieldPrefix}.store_slug`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Store URL <RequiredField />
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="your-store"
                  value={field.value || ""}
                />
              </FormControl>
              <FormDescription>
                The URL for your store is derived from the store name.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <div className="space-y-4">
        <FormField
          control={control}
          name={`${fieldPrefix}.description`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Store Description <RequiredField />
              </FormLabel>
              <FormControl>
                <textarea
                  {...field}
                  className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Describe your store and what you sell..."
                  value={field.value || ""}
                />
              </FormControl>
              <FormDescription>
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
          control={control}
          name={`${fieldPrefix}.branding.logo_url`}
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
              <FormDescription>
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
          control={control}
          name={`${fieldPrefix}.categories`}
          render={({ field }) => {
            const selected = Array.isArray(field.value)
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
            control={control}
            name={`${fieldPrefix}.return_policy`}
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
                <FormDescription>
                  PDF document explaining your return policy
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Shipping Policy */}
          <FormField
            control={control}
            name={`${fieldPrefix}.shipping_policy`}
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
                <FormDescription>
                  PDF document explaining your shipping policy
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        {/* General Policy */}
        <FormField
          control={control}
          name={`${fieldPrefix}.general_policy`}
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
              <FormDescription>
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
          control={control}
          name={`${fieldPrefix}.banners`}
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
    </>
  );
};

export default VendorStoreForm;
