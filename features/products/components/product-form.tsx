"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ArrowLeft, X, Plus, Save, Trash } from "lucide-react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { MultiSelect } from "@/components/ui/multi-select";
import { MultiImageUpload, ImageFile } from "@/components/ui/multi-image-upload";

import { useCategoryStore } from "@/features/categories/store";
import { useVendorStore } from "@/features/vendors/store";
import { productFormSchema, ProductFormValues } from "../schema";
import { Product } from "../types";

// Helper component for required field indicator
const RequiredField = () => <span className="text-destructive ml-1">*</span>;

// Default values for the form
const defaultValues: Partial<ProductFormValues> = {
  name: "",
  description: "",
  short_description: "",
  sku: "",
  base_price: 0,
  sale_price: 0,
  cost_price: 0,
  inventory_quantity: 0,
  inventory_tracking: true,
  low_stock_threshold: 10,
  category_ids: [],
  tags: [],
  images: [],
  has_variants: false,
  variants: [],
  weight: 0,
  dimensions: {
    length: 0,
    width: 0,
    height: 0
  },
  requires_shipping: true,
  is_active: true,
  is_featured: false,
  promotion: null,
  store_id: "6960bda2-4a94-4cfd-a6dc-1e2e4b3acbfc" // Default store ID
};

interface ProductFormProps {
  initialData?: Partial<Product>;
  onSubmit: (data: ProductFormValues) => Promise<void>;
  onCancel?: () => void;
  title?: string;
  description?: string;
  isSubmitting?: boolean;
}

// Helper function for generating slug from name
const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .trim();
};

export function ProductForm({
  initialData,
  onSubmit,
  onCancel,
  title = "Add New Product",
  description = "Create a new product for your marketplace",
  isSubmitting: externalIsSubmitting,
}: ProductFormProps) {
  // Get tenant ID from session
  const { data: session } = useSession();
  const tenantId = (session?.user as any)?.tenant_id || "";

  // Tab validation mapping - which fields belong to which tab
  const tabValidationMap = {
    basic: [
      "name", 
      "slug",
      "sku", 
      "category_ids",
      "tags"
    ],
    pricing: [
      "base_price", 
      "sale_price", 
      "cost_price",
    ],
    details: [
      "description", 
      "short_description", 
      "inventory_quantity",
      "inventory_tracking",
      "low_stock_threshold",
      "weight",
      "dimensions",
      "requires_shipping"
    ],
    images: [
      "images"
    ],
    variants: [
      "has_variants",
      "variants"
    ]
  };

  // Set up state
  const [activeTab, setActiveTab] = useState("basic");
  const [internalIsSubmitting, setInternalIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  
  // Determine if form is submitting from either external or internal state
  const isSubmitting = externalIsSubmitting || internalIsSubmitting;

  // Load vendors and categories
  const { vendors, fetchVendors } = useVendorStore();
  const { categories, fetchCategories } = useCategoryStore();

  useEffect(() => {
    // Fetch vendors and categories with tenant ID
    if (tenantId) {
      const headers = { 'X-Tenant-ID': tenantId };
      fetchVendors({}, headers);
      fetchCategories({}, headers);
    }
  }, [fetchVendors, fetchCategories, tenantId]);

  // Setup form with schema validation
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: initialData
      ? {
          tenant_id: tenantId,
          name: initialData.name || "",
          slug: initialData.slug || "",
          description: initialData.description || "",
          short_description: initialData.short_description || "",
          sku: initialData.sku || "",
          base_price: initialData.base_price || 0,
          sale_price: initialData.sale_price || 0,
          cost_price: initialData.cost_price || 0,
          inventory_quantity: initialData.inventory_quantity || 0,
          inventory_tracking: initialData.inventory_tracking !== false,
          low_stock_threshold: initialData.low_stock_threshold || 10,
          vendor_id: initialData.vendor_id || "",
          store_id: initialData.store_id || "6960bda2-4a94-4cfd-a6dc-1e2e4b3acbfc", // Default store ID
          category_ids: initialData.category_ids || [],
          tags: initialData.tags || [],
          images: (initialData.images || []).map(img => ({
            url: img.url || "",
            alt: img.alt || "",
            is_primary: img.is_primary || false
          })),
          has_variants: initialData.has_variants || false,
          variants: initialData.variants || [],
          weight: initialData.weight || 0,
          dimensions: initialData.dimensions || { length: 0, width: 0, height: 0 },
          requires_shipping: initialData.requires_shipping !== false,
          is_active: initialData.is_active !== false,
          is_featured: initialData.is_featured || false,
          promotion: initialData.promotion
        }
      : { ...defaultValues, tenant_id: tenantId }
  });

  // Create a constant reference to form control to fix any reference issues
  const formControl = form.control;

  // Handle form submission
  const handleFormSubmit = async (data: ProductFormValues) => {
    try {
      setFormError(null);
      setInternalIsSubmitting(true);
      
      // Generate slug from name if not provided
      const slug = data.slug || generateSlug(data.name);
      
      // Ensure images don't have File objects when sending to API
      const cleanedData = {
        ...data,
        slug,
        images: data.images?.map(img => ({
          url: img.url,
          alt: img.alt || "",
          is_primary: img.is_primary || false
        }))
      };
      
      await onSubmit(cleanedData);
      // Success is handled by the calling component
    } catch (error) {
      console.error("Form submission error:", error);
      setFormError(error instanceof Error ? error.message : "Failed to save product");
    } finally {
      setInternalIsSubmitting(false);
    }
  };

  // Handle form errors
  const handleFormError = (errors: any) => {
    console.error("Form validation errors:", errors);
    
    // Find which tab has errors
    for (const [tabName, fieldNames] of Object.entries(tabValidationMap)) {
      for (const fieldName of fieldNames) {
        const fieldHasError = errors[fieldName as keyof ProductFormValues];
        if (fieldHasError) {
          setActiveTab(tabName);
          return; // Exit after setting the first tab with errors
        }
      }
    }
  };

  // Navigation between tabs
  const setTabAndValidate = (nextTab: string) => {
    const currentTabFields = tabValidationMap[activeTab as keyof typeof tabValidationMap];
    
    if (currentTabFields && currentTabFields.length > 0) {
      // Validate only the fields in the current tab before allowing navigation
      form.trigger(currentTabFields as any).then((isValid) => {
        if (isValid) {
          setActiveTab(nextTab);
        }
      });
    } else {
      // No fields to validate, proceed to next tab
      setActiveTab(nextTab);
    }
  };

  // Add effect to update slug when name changes
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "name") {
        const productName = value.name as string;
        if (productName && !form.getValues("slug")) {
          const generatedSlug = generateSlug(productName);
          form.setValue("slug", generatedSlug);
        }
      }
    });
    
    return () => subscription.unsubscribe();
  }, [form]);

  return (
    <div className="flex flex-col h-full">
      <Form {...form}>
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center">
            {onCancel && (
              <Button
                onClick={onCancel}
                variant="ghost"
                size="icon"
                className="mr-4"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back</span>
              </Button>
            )}
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
              <p className="text-muted-foreground">{description}</p>
            </div>
          </div>
          
          <Button 
            type="submit" 
            form="product-form" 
            disabled={isSubmitting}
            className="ml-auto"
          >
            <Save className="h-4 w-4 mr-2" />
            {isSubmitting ? "Saving..." : initialData?.product_id ? "Update Product" : "Create Product"}
          </Button>
        </div>
        
        <div className="p-4 md:p-6 flex-1">
          {formError && (
            <Alert variant="destructive" className="mb-6">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          )}
          
          {/* Vendor selection above tabs */}
          <div className="mb-6">
            <FormField
              control={formControl}
              name="vendor_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Vendor <RequiredField />
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a vendor" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {vendors.map((vendor) => (
                        <SelectItem
                          key={ vendor.vendor_id }
                          value={ vendor.vendor_id }
                        >
                          {vendor.business_name || vendor.display_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <Card>
            <CardContent className="p-6">
              <form id="product-form" onSubmit={form.handleSubmit(handleFormSubmit, handleFormError)}>
                <fieldset disabled={isSubmitting} className="space-y-6">
                  {/* Tabs for form sections */}
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid grid-cols-5 w-full mb-6">
                      <TabsTrigger value="basic">Basic Info</TabsTrigger>
                      <TabsTrigger value="pricing">Pricing</TabsTrigger>
                      <TabsTrigger value="details">Details</TabsTrigger>
                      <TabsTrigger value="variants">Variants</TabsTrigger>
                      <TabsTrigger value="images">Images</TabsTrigger>
                    </TabsList>

                    {/* Basic Info Tab */}
                    <TabsContent value="basic" className="space-y-6 pt-2">
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Basic Product Information</h3>
                        <p className="text-sm text-muted-foreground">
                          Enter the essential information about your product.
                        </p>
                      </div>

                      <div className="grid gap-6 md:grid-cols-2">
                        <FormField
                          control={formControl}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Product Name <RequiredField />
                              </FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="Premium Wireless Headphones"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={formControl}
                          name="slug"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Slug</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="premium-wireless-headphones"
                                />
                              </FormControl>
                              <FormDescription>
                                URL-friendly version of the product name. Auto-generated if left empty.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={formControl}
                          name="sku"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                SKU <RequiredField />
                              </FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="PROD-001"
                                />
                              </FormControl>
                              <FormDescription>
                                Stock Keeping Unit - unique product identifier
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={formControl}
                        name="short_description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Short Description</FormLabel>
                            <FormControl>
                              <Textarea
                                {...field}
                                placeholder="Brief product description for listings"
                                className="h-20 resize-none"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Categories with multi-select */}
                      <FormField
                        control={formControl}
                        name="category_ids"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Categories <RequiredField />
                            </FormLabel>
                            <FormControl>
                              <MultiSelect
                                options={categories
                                  .filter(category => (category._id || category.category_id) && category.name)
                                  .map(category => ({
                                    label: category.name,
                                    value: category.category_id || category._id || ""
                                  }))}
                                selected={field.value || []}
                                onChange={field.onChange}
                                placeholder="Select product categories"
                              />
                            </FormControl>
                            <FormDescription>
                              Select one or more categories for your product
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Tags */}
                      <FormField
                        control={formControl}
                        name="tags"
                        render={({ field }) => {
                          const [tagInput, setTagInput] = useState("");
                          
                          const addTag = () => {
                            const tag = tagInput.trim();
                            if (tag && !field.value.includes(tag)) {
                              field.onChange([...field.value, tag]);
                            }
                            setTagInput("");
                          };
                          
                          const removeTag = (tagToRemove: string) => {
                            field.onChange(field.value.filter(tag => tag !== tagToRemove));
                          };
                          
                          return (
                            <FormItem>
                              <FormLabel>Tags</FormLabel>
                              <div className="flex gap-2">
                                <FormControl>
                                  <Input
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    placeholder="Add tags"
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        e.preventDefault();
                                        addTag();
                                      }
                                    }}
                                  />
                                </FormControl>
                                <Button 
                                  type="button"
                                  onClick={addTag}
                                >
                                  Add
                                </Button>
                              </div>
                              <div className="flex flex-wrap gap-2 mt-2">
                                {field.value?.map((tag, index) => (
                                  <div 
                                    key={index}
                                    className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full flex items-center gap-2"
                                  >
                                    {tag}
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      className="h-5 w-5 p-0"
                                      onClick={() => removeTag(tag)}
                                    >
                                      <span className="sr-only">Remove</span>
                                      <X className="h-3 w-3" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                              <FormDescription>
                                Tags help with search and categorization
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          );
                        }}
                      />

                      <div className="flex justify-end">
                        <Button 
                          type="button" 
                          onClick={() => setTabAndValidate("pricing")}
                        >
                          Next: Pricing
                        </Button>
                      </div>
                    </TabsContent>

                    {/* Pricing Tab */}
                    <TabsContent value="pricing" className="space-y-6 pt-2">
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Product Pricing</h3>
                        <p className="text-sm text-muted-foreground">
                          Set the pricing details for your product.
                        </p>
                      </div>

                      <div className="grid gap-6 md:grid-cols-3">
                        <FormField
                          control={formControl}
                          name="base_price"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Base Price <RequiredField />
                              </FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  type="number"
                                  step="0.01"
                                  placeholder="0.00"
                                />
                              </FormControl>
                              <FormDescription>
                                The original price of the product
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={formControl}
                          name="sale_price"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Sale Price <RequiredField />
                              </FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  type="number"
                                  step="0.01"
                                  placeholder="0.00"
                                />
                              </FormControl>
                              <FormDescription>
                                Current selling price
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={formControl}
                          name="cost_price"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Cost Price</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  type="number"
                                  step="0.01"
                                  placeholder="0.00"
                                />
                              </FormControl>
                              <FormDescription>
                                Your cost (not shown to customers)
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="flex justify-between mt-6">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setActiveTab("basic")}
                        >
                          Back: Basic Info
                        </Button>
                        <Button
                          type="button"
                          onClick={() => setTabAndValidate("details")}
                        >
                          Next: Details
                        </Button>
                      </div>
                    </TabsContent>

                    {/* Details Tab */}
                    <TabsContent value="details" className="space-y-6 pt-2">
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Product Details</h3>
                        <p className="text-sm text-muted-foreground">
                          Additional product details and inventory information.
                        </p>
                      </div>

                      <FormField
                        control={formControl}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Description <RequiredField />
                            </FormLabel>
                            <FormControl>
                              <Textarea
                                {...field}
                                placeholder="Detailed product description..."
                                className="min-h-[150px]"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-6">
                          <h4 className="text-md font-medium">Inventory Information</h4>
                          <FormField
                            control={formControl}
                            name="inventory_quantity"
                            render={({ field }) => (
                              <FormItem className="mb-4">
                                <FormLabel>Stock Quantity</FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    type="number"
                                    placeholder="0"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={formControl}
                            name="low_stock_threshold"
                            render={({ field }) => (
                              <FormItem className="mb-4">
                                <FormLabel>Low Stock Threshold</FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    type="number"
                                    placeholder="10"
                                  />
                                </FormControl>
                                <FormDescription>
                                  Get alerts when stock is below this level
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={formControl}
                            name="inventory_tracking"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between p-3 border rounded-lg shadow-sm">
                                <div className="space-y-0.5">
                                  <FormLabel className="cursor-pointer">Track Inventory</FormLabel>
                                  <FormDescription>
                                    Track stock levels for this product
                                  </FormDescription>
                                </div>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <div className="space-y-6">
                          <h4 className="text-md font-medium">Physical Properties</h4>
                          <FormField
                            control={formControl}
                            name="weight"
                            render={({ field }) => (
                              <FormItem className="mb-4">
                                <FormLabel>Weight (grams)</FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    type="number"
                                    placeholder="0"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <div className="grid grid-cols-3 gap-3">
                            <FormField
                              control={formControl}
                              name="dimensions.length"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Length (cm)</FormLabel>
                                  <FormControl>
                                    <Input
                                      {...field}
                                      type="number"
                                      step="0.1"
                                      placeholder="0"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={formControl}
                              name="dimensions.width"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Width (cm)</FormLabel>
                                  <FormControl>
                                    <Input
                                      {...field}
                                      type="number"
                                      step="0.1"
                                      placeholder="0"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={formControl}
                              name="dimensions.height"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Height (cm)</FormLabel>
                                  <FormControl>
                                    <Input
                                      {...field}
                                      type="number"
                                      step="0.1"
                                      placeholder="0"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <FormField
                            control={formControl}
                            name="requires_shipping"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between p-3 border rounded-lg shadow-sm">
                                <div className="space-y-0.5">
                                  <FormLabel className="cursor-pointer">Requires Shipping</FormLabel>
                                  <FormDescription>
                                    This product requires physical shipping
                                  </FormDescription>
                                </div>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>

                      <div className="flex justify-between mt-6">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setActiveTab("pricing")}
                        >
                          Back: Pricing
                        </Button>
                        <Button
                          type="button"
                          onClick={() => setTabAndValidate("variants")}
                        >
                          Next: Variants
                        </Button>
                      </div>
                    </TabsContent>
                    
                    {/* Variants Tab */}
                    <TabsContent value="variants" className="space-y-6 pt-2">
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Product Variants</h3>
                        <p className="text-sm text-muted-foreground">
                          Add variations of this product such as size or color options.
                        </p>
                      </div>
                      
                      <FormField
                        control={formControl}
                        name="has_variants"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between p-3 border rounded-lg shadow-sm mb-6">
                            <div className="space-y-0.5">
                              <FormLabel className="cursor-pointer">Product Has Variants</FormLabel>
                              <FormDescription>
                                This product comes in multiple variations (size, color, etc.)
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {form.watch("has_variants") && (
                        <div className="border rounded-lg p-4 space-y-4">
                          <h4 className="font-medium">Product Variants</h4>
                          <div className="space-y-4">
                            {form.watch("variants")?.map((_, index) => (
                              <div key={index} className="border rounded-lg p-4 relative">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="absolute top-2 right-2"
                                  onClick={() => {
                                    const currentVariants = [...(form.watch("variants") || [])];
                                    currentVariants.splice(index, 1);
                                    form.setValue("variants", currentVariants);
                                  }}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                                
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                  <FormField
                                    control={formControl}
                                    name={`variants.${index}.sku`}
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Variant SKU</FormLabel>
                                        <FormControl>
                                          <Input
                                            {...field}
                                            placeholder="VAR-001"
                                          />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  
                                  <FormField
                                    control={formControl}
                                    name={`variants.${index}.name`}
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Variant Name</FormLabel>
                                        <FormControl>
                                          <Input
                                            {...field}
                                            placeholder="Small Red"
                                          />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  
                                  <FormField
                                    control={formControl}
                                    name={`variants.${index}.price`}
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Price Adjustment</FormLabel>
                                        <FormControl>
                                          <Input
                                            {...field}
                                            type="number"
                                            step="0.01"
                                            placeholder="0.00"
                                          />
                                        </FormControl>
                                        <FormDescription>
                                          Additional cost for this variant
                                        </FormDescription>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                </div>

                                <div className="border-t pt-4 mt-4">
                                  <h5 className="text-sm font-medium mb-3">Variant Attributes</h5>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                      control={formControl}
                                      name={`variants.${index}.attributes.name`}
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel>Attribute Name</FormLabel>
                                          <FormControl>
                                            <Input
                                              {...field}
                                              placeholder="Red, Blue, etc."
                                            />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                    
                                    <FormField
                                      control={formControl}
                                      name={`variants.${index}.attributes.value`}
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel>Attribute Value</FormLabel>
                                          <FormControl>
                                            <Input
                                              {...field}
                                              placeholder="S, M, L, XL, etc."
                                            />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                  </div>
                                </div>
                              </div>
                            ))}
                            
                            <Button
                              type="button"
                              variant="outline"
                              className="w-full"
                              onClick={() => {
                                const currentVariants = [...(form.watch("variants") || [])];
                                form.setValue("variants", [
                                  ...currentVariants, 
                                  { 
                                    sku: "",
                                    name: "",
                                    price: 0,
                                    attribute
                                  }
                                ]);
                              }}
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Add Variant
                            </Button>
                          </div>
                        </div>
                      )}

                      <div className="flex justify-between mt-6">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setActiveTab("details")}
                        >
                          Back: Details
                        </Button>
                        <Button
                          type="button"
                          onClick={() => setTabAndValidate("images")}
                        >
                          Next: Images
                        </Button>
                      </div>
                    </TabsContent>

                    {/* Images Tab */}
                    <TabsContent value="images" className="space-y-6 pt-2">
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Product Images & Status</h3>
                        <p className="text-sm text-muted-foreground">
                          Upload product images and set visibility status.
                        </p>
                      </div>

                      <FormField
                        control={formControl}
                        name="images"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Product Images</FormLabel>
                            <FormControl>
                              <MultiImageUpload
                                id="product-images"
                                value={field.value || []}
                                onChange={field.onChange}
                                previewAlt="Product image"
                              />
                            </FormControl>
                            <FormDescription>
                              Upload high-quality product images. First or selected image will be used as the main image.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="space-y-4">
                        <h4 className="text-md font-medium">Visibility Settings</h4>
                        <div className="grid gap-6 md:grid-cols-2">
                          <FormField
                            control={formControl}
                            name="is_active"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between p-3 border rounded-lg shadow-sm">
                                <div className="space-y-0.5">
                                  <FormLabel className="cursor-pointer">Active</FormLabel>
                                  <FormDescription>
                                    Product is visible and can be purchased
                                  </FormDescription>
                                </div>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={formControl}
                            name="is_featured"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between p-3 border rounded-lg shadow-sm">
                                <div className="space-y-0.5">
                                  <FormLabel className="cursor-pointer">Featured</FormLabel>
                                  <FormDescription>
                                    Highlight this product on the homepage and featured sections
                                  </FormDescription>
                                </div>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>

                      <div className="flex justify-between mt-6">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setActiveTab("variants")}
                        >
                          Back: Variants
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                          {isSubmitting ? "Saving..." : initialData?.product_id ? "Update Product" : "Create Product"}
                        </Button>
                      </div>
                    </TabsContent>
                  </Tabs>
                </fieldset>
              </form>
            </CardContent>
          </Card>
        </div>
      </Form>
    </div>
  );
}
