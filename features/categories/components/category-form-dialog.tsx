"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { ImageUpload } from "@/components/ui/image-upload";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useCategoryStore } from "@/features/categories/store";
import { Category } from "@/features/categories/types";
import { RequiredField } from "@/components/ui/required-field";

const getCategoryFormSchema = (t: (key: string) => string) => z.object({
  name: z.string().min(1, t('zod.name_required')),
  slug: z.string().optional(),
  description: z.string().optional(),
  parent_id: z.string().nullable().optional(),
  image_url: z.string().url(t('zod.url_invalid')).optional().or(z.literal('')),
  is_active: z.boolean().optional(),
});

type CategoryFormValues = z.infer<ReturnType<typeof getCategoryFormSchema>>;

interface CategoryFormDialogProps {
  category?: Category | null;
  tenantId: string | undefined;
  onClose: () => void;
}

export function CategoryFormDialog({ category, tenantId, onClose }: CategoryFormDialogProps) {
  const { t } = useTranslation(['categories', 'common']);
  const {
    addCategory,
    updateCategory,
    fetchCategories,
    categories,
  } = useCategoryStore();

  const isEditMode = !!category;
  const [isImageUploading, setIsImageUploading] = useState(false);

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(getCategoryFormSchema(t)),
    defaultValues: {
      name: category?.name || "",
      slug: category?.slug || "",
      description: category?.description || "",
      parent_id: category?.parent_id || null,
      image_url: category?.image_url || "",
      is_active: category?.is_active ?? true,
    },
  });
  
  useEffect(() => {
    if (categories.length === 0 && tenantId) {
      fetchCategories({}, { "X-Tenant-ID": tenantId });
    }
  }, [categories.length, fetchCategories, tenantId]);

  const onSubmit = async (values: CategoryFormValues) => {
    if (!tenantId) {
      toast.error(t('common:messages.tenant_id_missing_for_delete'));
      return;
    }
    const tenantHeaders = { "X-Tenant-ID": tenantId };

    try {
      if (isEditMode) {
        await updateCategory(category.category_id, values, tenantHeaders);
        toast.success(t('notifications.updated_successfully'));
      } else {
        await addCategory(values, tenantHeaders);
        toast.success(t('notifications.created_successfully'));
      }
      fetchCategories({}, tenantHeaders);
      onClose();
    } catch (error) {
      toast.error(isEditMode ? t('notifications.failed_to_update') : t('notifications.failed_to_create'));
      console.error(error);
    }
  };
  
    

  const parentCategories = categories.filter(c => {
    const hasValidId = typeof c.category_id === 'string' && c.category_id.trim().length > 0;
    const isNotSelf = isEditMode ? c.category_id !== category?.category_id : true;
    return hasValidId && isNotSelf;
  });

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditMode ? t('form.edit_title') : t('form.add_title')}</DialogTitle>
          <DialogDescription>
            {isEditMode ? t('form.edit_description') : t('form.add_description')}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                  >
                    <FormControl>
                      <SelectTrigger className="w-1/2">
                        <SelectValue placeholder={t('form.select_parent_category')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">{t('common:form.none')}</SelectItem>
                      {parentCategories.map((cat) => (
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
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 py-5">
                  <div className="space-y-0.5">
                    <FormLabel>{t('common:status.active')}</FormLabel>
                    <DialogDescription>
                      {t('form.active_description')}
                    </DialogDescription>
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
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">{t('common:actions.cancel')}</Button>
              </DialogClose>
              <Button type="submit" disabled={form.formState.isSubmitting || isImageUploading}>
                {form.formState.isSubmitting ? t('common:actions.saving') : (isEditMode ? t('form.update_button') : t('form.create_button'))}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
