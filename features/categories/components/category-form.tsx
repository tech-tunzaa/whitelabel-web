"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useSession } from "next-auth/react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Spinner } from "@/components/ui/spinner"
import { RequiredField } from "@/components/ui/required-field"
import { ImageUpload } from "@/components/ui/image-upload"

import { useCategoryStore } from "../store"
import { CategoryFormData } from "../types"
import { categoryFormSchema, CategoryFormValues } from "../schema"

// Using the CategoryFormValues type from the schema file

interface CategoryFormProps {
  initialData?: CategoryFormData
  onSubmit: (data: CategoryFormData) => void
  onCancel?: () => void
}

export function CategoryForm({ initialData, onSubmit, onCancel }: CategoryFormProps) {
  const { t } = useTranslation();
  const { data: session } = useSession()
  const { categories, fetchCategories } = useCategoryStore()
  const [isLoading, setIsLoading] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  
  // Get tenant ID from session or use default
  // Handle type issue by using a direct access with fallback
  const tenantId = (session?.user as any)?.tenant_id || "4c56d0c3-55d9-495b-ae26-0d922d430a42"
  
  // Define tenant headers
  const tenantHeaders = {
    "X-Tenant-ID": tenantId
  }

  // Only load categories when needed for parent dropdown and avoid duplicate requests
  useEffect(() => {
    // Skip loading if categories are already loaded
    if (categories.length === 0) {
      setIsLoading(true)
      fetchCategories(undefined, tenantHeaders)
        .then(() => setIsLoading(false))
        .catch(() => setIsLoading(false))
    } else {
      setIsLoading(false)
    }
  }, [fetchCategories, tenantId, categories.length])

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      category_id: initialData?.category_id || "",
      name: initialData?.name || "",
      slug: initialData?.slug || "",
      description: initialData?.description || "",
      parent_id: initialData?.parent_id || "none",
      image_url: initialData?.image_url || "",
      is_active: initialData?.is_active ?? true,
    },
  })
  
  // Keep track of the category being edited
  const currentCategoryId = initialData?.category_id

  // Function to generate slug from name
  const generateSlug = (name: string): string => {
    return name
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')       // Replace spaces with -
      .replace(/&/g, '-and-')     // Replace & with 'and'
      .replace(/[^\w\-]+/g, '')   // Remove all non-word characters
      .replace(/\-\-+/g, '-');     // Replace multiple - with single -
  };

  // Watch the name field to auto-generate slug
  const watchName = form.watch("name");
  
  useEffect(() => {
    // Only auto-generate slug if name changes and there's no custom slug already
    if (watchName && !initialData?.slug) {
      const newSlug = generateSlug(watchName);
      form.setValue("slug", newSlug);
    }
  }, [watchName, form, initialData?.slug]);

  const handleSubmit = (values: CategoryFormValues) => {
    // Ensure slug is generated even if the effect hasn't run yet
    if (!values.slug && values.name) {
      values.slug = generateSlug(values.name);
    }
    
    // Prepare the form data with tenant ID
    const formData = {
      ...values,
      tenant_id: tenantId
    };
    
    // If this is an edit, preserve the category_id
    if (initialData?.category_id) {
      formData.category_id = initialData.category_id;
    }
    
    // Handle image upload if there's a new image
    if (imageFile) {
      // In a real implementation, you would upload the image to a server here
      // and then set the returned URL to image_url
      console.log('Image file to upload:', imageFile);
      // For now, we'll just use the URL that was set via the ImageUpload component
    }
    
    onSubmit(formData);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('categories.form.category_name')} <RequiredField /></FormLabel>
              <FormControl>
                <Input placeholder={t('categories.form.name_placeholder_detailed')} {...field} />
              </FormControl>
              <FormDescription>
                {t('categories.form.name_description')}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('common.slug')} <RequiredField /></FormLabel>
              <FormControl>
                <Input
                  placeholder={t('categories.form.slug_placeholder_detailed')}
                  {...field}
                  value={field.value || ''}
                />
              </FormControl>
              <FormDescription>
                {t('categories.form.slug_description')}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('common.description_optional')}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={t('categories.form.description_placeholder_detailed')}
                  className="resize-none"
                  {...field}
                  value={field.value || ''}
                />
              </FormControl>
              <FormDescription>
                {t('categories.form.description_description')}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="parent_id"
          render={({ field }) => (
            <FormItem className="flex flex-col w-1/2">
              <FormLabel>{t('categories.form.parent_category_optional')}</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t('categories.form.select_parent_category')} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="none">{t('common.none')}</SelectItem>
                  {isLoading ? (
                    <div className="p-2 flex justify-center">
                      <Spinner size="sm" />
                    </div>
                  ) : (
                    categories
                      ?.filter(category => {
                        // Filter out the current category to prevent circular dependencies and categories with empty IDs
                        return (
                          (!currentCategoryId || category.category_id !== currentCategoryId) && 
                          !!category.category_id // Ensure category_id is not empty
                        );
                      })
                      .map((category) => (
                        <SelectItem 
                          key={category.category_id} 
                          value={category.category_id || `category-${category.name}`} // Fallback value if category_id is somehow empty
                        >
                          {category.name}
                        </SelectItem>
                      ))
                  )}
                </SelectContent>
              </Select>
              <FormDescription>
                {t('categories.form.parent_category_description')}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="image_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('categories.form.category_image')}</FormLabel>
              <FormControl>
                <ImageUpload
                  id="category-image"
                  value={field.value}
                  onChange={field.onChange}
                  onFileChange={(file) => setImageFile(file)}
                  height="h-36"
                  width="w-full"
                  buttonText={t('categories.form.upload_category_image')}
                  previewAlt={t('categories.form.category_image_alt', { name: form.getValues().name || 'Category' })}
                />
              </FormControl>
              <FormDescription>
                {t('categories.form.category_image_description')}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="is_active"
          render={({ field }) => (
            <FormItem>
              <div className="flex flex-row items-center justify-between rounded-lg border p-4 w-full">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">
                    {t('common.active')}
                  </FormLabel>
                  <FormDescription>
                    {t('categories.form.active_description')}
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Display Order field removed as requested */}

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => onCancel?.()}>
            {t('common.cancel')}
          </Button>
          <Button type="submit">{initialData ? t('categories.form.update_category') : t('categories.form.create_category')}</Button>
        </div>
      </form>
    </Form>
  )
}
