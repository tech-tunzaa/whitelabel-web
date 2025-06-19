"use client"

import { useEffect, useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Spinner } from "@/components/ui/spinner";
import { RequiredField } from "@/components/ui/required-field";
import { ImageUpload } from "@/components/ui/image-upload";

import { Category } from "../types";
import { categoryFormSchema, CategoryFormValues } from "../schema";

interface CategoryFormProps {
  formId?: string;
  initialData?: Category | null;
  parentCategories: Category[];
  onFormSubmit: (data: CategoryFormValues) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

export function CategoryForm({ formId, initialData, parentCategories, onFormSubmit, onCancel, isSubmitting }: CategoryFormProps) {
  const { t } = useTranslation();
  const [isImageUploading, setIsImageUploading] = useState(false);

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: initialData?.name || "",
      slug: initialData?.slug || "",
      description: initialData?.description || "",
      parent_id: initialData?.parent_id || null,
      image_url: initialData?.image_url || "",
      is_active: initialData?.is_active ?? true,
    },
  });

  const currentCategoryId = initialData?.category_id;

  const generateSlug = (name: string): string => {
    return name
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/&/g, '-and-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-');
  };

  const watchName = form.watch("name");

  useEffect(() => {
    if (watchName && !form.getValues("slug")) {
      const newSlug = generateSlug(watchName);
      form.setValue("slug", newSlug, { shouldValidate: true });
    }
  }, [watchName, form]);

  const filteredParentCategories = useMemo(() => {
    return parentCategories.filter(cat => cat.category_id !== currentCategoryId);
  }, [parentCategories, currentCategoryId]);

  const handleSubmit = (values: CategoryFormValues) => {
    if (!values.slug && values.name) {
      values.slug = generateSlug(values.name);
    }
    onFormSubmit(values);
  };

  return (
    <Form {...form}>
      <form id={formId} onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <fieldset disabled={isSubmitting} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('form.name_label')} <RequiredField /></FormLabel>
                  <FormControl>
                    <Input placeholder={t('form.name_placeholder')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('form.slug')} <RequiredField /></FormLabel>
                  <FormControl>
                    <Input placeholder={t('form.slug_placeholder_detailed')} {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('common:form.description_optional')}</FormLabel>
                <FormControl>
                  <Textarea placeholder={t('form.description_placeholder')} {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="parent_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('form.parent_category')}</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(value === "none" ? null : value)}
                  value={field.value ?? "none"}
                  disabled={isSubmitting}
                >
                  <FormControl>
                    <SelectTrigger className="w-full md:w-1/2">
                      <SelectValue placeholder={t('form.select_parent_category')} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">{t('common:form.none')}</SelectItem>
                    {filteredParentCategories.map((cat) => (
                      <SelectItem key={cat.category_id} value={cat.category_id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  {t('form.parent_category_description')}
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
                <FormLabel>{t('form.image_label')}</FormLabel>
                <FormControl>
                  <ImageUpload
                    id="category-image-upload"
                    value={field.value}
                    onChange={field.onChange}
                    onUploadingChange={setIsImageUploading}
                    imgHeight="h-60"
                  />
                </FormControl>
                <FormDescription>
                  {t('form.image_description')}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="is_active"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel>{t('common:status.active')}</FormLabel>
                  <FormDescription>
                    {t('form.active_description')}
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </fieldset>


      </form>
    </Form>
  );
}

