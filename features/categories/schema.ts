import { z } from "zod";

// Define the category form validation schema
export const categoryFormSchema = z.object({
  category_id: z.string().optional(),
  name: z.string().min(2, {
    message: "Category name is required and must be at least 2 characters",
  }),
  slug: z.string().min(2, {
    message: "Category slug is required",
  }),
  description: z.string().optional().nullable().transform(val => val === null ? undefined : val),
  parent_id: z.string().optional().nullable().transform(val => val === null ? undefined : val),
  image_url: z.string().optional().nullable().transform(val => val === null ? undefined : val),
  is_active: z.boolean().default(true),
});

export type CategoryFormValues = z.infer<typeof categoryFormSchema>;
