"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ArrowLeft, Upload, Plus, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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

import { useCategoryStore } from "@/features/products/categories/store";
import { useVendorStore } from "@/features/vendors/store";
import { Product } from "../types";
import { Category } from "../categories/types";

const ProductVariantSchema = z.object({
  type: z.string().min(1, { message: "Variant type is required." }),
  value: z.string().min(1, { message: "Variant value is required." }),
  price: z.coerce.number().min(0).optional(),
});

const productFormSchema = z.object({
  name: z.string().min(2, {
    message: "Product name must be at least 2 characters.",
  }),
  sku: z.string().min(1, {
    message: "SKU is required.",
  }),
  price: z.coerce.number().min(0.01, {
    message: "Price must be greater than 0.",
  }),
  compareAtPrice: z.coerce.number().min(0).optional(),
  cost: z.coerce.number().min(0).optional(),
  categoryId: z.string({
    required_error: "Please select a category.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  quantity: z.coerce.number().int().min(0, {
    message: "Quantity must be a positive integer.",
  }),
  vendor: z.string().min(1, {
    message: "Vendor is required.",
  }),
  variants: z.array(ProductVariantSchema).optional().default([]),
  featured: z.boolean().default(false),
  nonDeliverable: z.boolean().default(false),
  status: z.enum(["draft", "active", "pending"]),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

export type { ProductFormValues };

const defaultValues: Partial<ProductFormValues> = {
  description: "",
  compareAtPrice: undefined,
  cost: undefined,
  featured: false,
  nonDeliverable: false,
  status: "draft",
  quantity: 0,
  variants: [],
};

interface ProductFormProps {
  initialData?: Product;
  onSubmit: (data: ProductFormValues) => Promise<void>;
  onCancel?: () => void;
  title?: string;
  description?: string;
}

export function ProductForm({
  initialData,
  onSubmit,
  onCancel,
  title = "Add New Product",
  description = "Create a new product for your marketplace",
}: ProductFormProps) {
  const [activeTab, setActiveTab] = useState("basic");
  const [productImages, setProductImages] = useState<File[]>([]);
  const { categories, fetchCategories } = useCategoryStore();
  const { vendors } = useVendorStore();

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: initialData
      ? {
          name: initialData.name,
          price: initialData.price || 0,
          categoryId: initialData.categoryIds[0] || "",
          description: initialData.description || "",
          quantity: initialData.inventory?.stockLevel || 0,
          vendor: initialData.vendorId,
          featured: initialData.featured,
          nonDeliverable: initialData.nonDeliverable || false,
          status: initialData.status,
        }
      : defaultValues,
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      setProductImages((prev) => [...prev, ...filesArray]);
    }
  };

  const removeFile = (fileName: string) => {
    setProductImages(productImages.filter((file) => file.name !== fileName));
  };

  const renderFileList = () => {
    return productImages.length > 0 ? (
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {productImages.map((file) => (
          <div key={file.name} className="relative group">
            <div className="aspect-square bg-muted rounded-md flex items-center justify-center overflow-hidden">
              <img
                src={URL.createObjectURL(file) || "/placeholder.svg"}
                alt={file.name}
                className="object-cover w-full h-full"
              />
            </div>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => removeFile(file.name)}
            >
              Remove
            </Button>
            <p className="text-xs truncate mt-1">{file.name}</p>
          </div>
        ))}
      </div>
    ) : (
      <p className="text-sm text-muted-foreground mt-2">
        No images uploaded yet.
      </p>
    );
  };

  const nextTab = () => {
    if (activeTab === "basic") {
      form
        .trigger(["name", "sku", "price", "categoryId", "vendor"])
        .then((isValid) => {
          if (isValid) setActiveTab("details");
        });
    } else if (activeTab === "details") {
      form.trigger(["description", "quantity"]).then((isValid) => {
        if (isValid) setActiveTab("images");
      });
    }
  };

  const prevTab = () => {
    if (activeTab === "details") setActiveTab("basic");
    else if (activeTab === "images") setActiveTab("details");
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center p-4 border-b">
        {onCancel && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onCancel}
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Button>
        )}
        <div className={onCancel ? "ml-4" : ""}>
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          <p className="text-muted-foreground">{description}</p>
        </div>
      </div>

      <div className="p-4 md:p-6 flex-1">
        <Card>
          <CardContent className="p-6">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >

                <FormField
                  control={form.control}
                  name="vendor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center">Vendor <span className="text-destructive ml-1">*</span></FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl className="w-full">
                          <SelectTrigger>
                            <SelectValue placeholder="Select a vendor" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {vendors.map((vendor) => (
                            <SelectItem key={vendor.id} value={vendor.id.toString()}>
                              {vendor.businessName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Tabs
                  value={activeTab}
                  onValueChange={setActiveTab}
                  className="w-full"
                >
                  <TabsList className="grid w-full grid-cols-3 mb-8">
                    <TabsTrigger value="basic">Basic Info</TabsTrigger>
                    <TabsTrigger value="details">Details</TabsTrigger>
                    <TabsTrigger value="images">Images & Publish</TabsTrigger>
                  </TabsList>

                  <TabsContent value="basic" className="space-y-6">
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center">Product Name <span className="text-destructive ml-1">*</span></FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Premium Wireless Headphones"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="sku"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center">SKU <span className="text-destructive ml-1">*</span></FormLabel>
                              <FormControl>
                                <Input placeholder="WH-1000XM4" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="price"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center">Price <span className="text-destructive ml-1">*</span></FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.01"
                                  placeholder="299.99"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="compareAtPrice"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Compare at Price</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.01"
                                  placeholder="349.99"
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription>
                                Original price before discount, displayed as strikethrough
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="cost"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Cost per item</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.01"
                                  placeholder="199.99"
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription>
                                Used to calculate profit margins (not shown to customers)
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="categoryId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center">Category <span className="text-destructive ml-1">*</span></FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select a category" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {categories.map((category: Category) => (
                                    <SelectItem
                                      key={category._id}
                                      value={category._id}
                                    >
                                      {category.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <Button type="button" onClick={nextTab}>
                        Next: Details
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="details" className="space-y-6">
                    <div className="space-y-6">
                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center">Description <span className="text-destructive ml-1">*</span></FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Product description..."
                                className="min-h-[200px]"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="quantity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Quantity</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="100"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="nonDeliverable"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">
                                Non-Deliverable Product
                              </FormLabel>
                              <FormDescription>
                                Enable for service-based products or items that don't require physical delivery
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
                      
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <FormLabel className="text-base">Product Variants</FormLabel>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const currentVariants = form.getValues("variants") || [];
                              form.setValue("variants", [
                                ...currentVariants,
                                { type: "", value: "", price: undefined },
                              ]);
                            }}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Variant
                          </Button>
                        </div>
                        <FormField
                          control={form.control}
                          name="variants"
                          render={() => (
                            <FormItem>
                              <div className="space-y-4">
                                {form.watch("variants")?.map((_, index) => (
                                  <div
                                    key={index}
                                    className="flex items-end gap-4 rounded-lg border p-4 shadow-sm"
                                  >
                                    <FormField
                                      control={form.control}
                                      name={`variants.${index}.type`}
                                      render={({ field }) => (
                                        <FormItem className="flex-1">
                                          <FormLabel className="flex items-center">Variant Type <span className="text-destructive ml-1">*</span></FormLabel>
                                          <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                          >
                                            <FormControl className="w-full">
                                              <SelectTrigger>
                                                <SelectValue placeholder="Select type" />
                                              </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                              <SelectItem value="color">Color</SelectItem>
                                              <SelectItem value="size">Size</SelectItem>
                                              <SelectItem value="material">Material</SelectItem>
                                              <SelectItem value="package">Package</SelectItem>
                                              <SelectItem value="style">Style</SelectItem>
                                              <SelectItem value="weight">Weight</SelectItem>
                                              <SelectItem value="custom">Custom</SelectItem>
                                            </SelectContent>
                                          </Select>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                    <FormField
                                      control={form.control}
                                      name={`variants.${index}.value`}
                                      render={({ field }) => (
                                        <FormItem className="flex-1">
                                          <FormLabel className="flex items-center">Variant Value <span className="text-destructive ml-1">*</span></FormLabel>
                                          <FormControl>
                                            <Input
                                              placeholder="Red, XL, Plastic, Bundle..."
                                              {...field}
                                            />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                    <FormField
                                      control={form.control}
                                      name={`variants.${index}.price`}
                                      render={({ field }) => (
                                        <FormItem className="flex-1">
                                          <FormLabel>Price (Optional)</FormLabel>
                                          <FormControl>
                                            <Input
                                              type="number"
                                              step="0.01"
                                              placeholder="0"
                                              {...field}
                                            />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      className="self-end"
                                      onClick={() => {
                                        const currentVariants = form.getValues("variants") || [];
                                        form.setValue(
                                          "variants",
                                          currentVariants.filter((_, i) => i !== index)
                                        );
                                      }}
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>
                                ))}
                                {(!form.watch("variants") || form.watch("variants").length === 0) && (
                                  <p className="text-sm text-muted-foreground">
                                    No variants added. Add variants if your product comes in different options like colors, sizes, or packages.
                                  </p>
                                )}
                              </div>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <Button type="button" variant="outline" onClick={prevTab}>
                        Back: Basic Info
                      </Button>
                      <Button type="button" onClick={nextTab}>
                        Next: Images & Publish
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="images" className="space-y-6">
                    <div className="space-y-6">
                      <div>
                        <Label>Product Images</Label>
                        <div className="mt-2">
                          <div className="flex items-center justify-center w-full">
                            <label
                              htmlFor="product-images"
                              className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-muted hover:bg-muted/50"
                            >
                              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <Upload className="w-8 h-8 mb-4 text-muted-foreground" />
                                <p className="mb-2 text-sm text-muted-foreground">
                                  <span className="font-semibold">
                                    Click to upload
                                  </span>{" "}
                                  or drag and drop
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  PNG, JPG or GIF (MAX. 800x400px)
                                </p>
                              </div>
                              <input
                                id="product-images"
                                type="file"
                                className="hidden"
                                multiple
                                accept="image/*"
                                onChange={handleFileChange}
                              />
                            </label>
                          </div>
                          {renderFileList()}
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name="featured"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">
                                  Featured Product
                                </FormLabel>
                                <FormDescription>
                                  Featured products will be highlighted on the
                                  homepage
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

                        <FormField
                          control={form.control}
                          name="status"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Status</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select a status" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="draft">Draft</SelectItem>
                                  <SelectItem value="active">Active</SelectItem>
                                  <SelectItem value="pending">Pending</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <Button type="button" variant="outline" onClick={prevTab}>
                        Back: Details
                      </Button>
                      <Button type="submit">
                        {initialData ? "Update Product" : "Create Product"}
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}