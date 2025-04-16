"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { ArrowLeft, Upload } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"

import { mockCategories } from "../../data/categories"

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
  featured: z.boolean().default(false),
  status: z.enum(["draft", "active", "pending"]),
})

type ProductFormValues = z.infer<typeof productFormSchema>

const defaultValues: Partial<ProductFormValues> = {
  description: "",
  compareAtPrice: undefined,
  cost: undefined,
  featured: false,
  status: "draft",
  quantity: 0,
}

export default function AddProductPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("basic")
  const [productImages, setProductImages] = useState<File[]>([])

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues,
  })

  function onSubmit(data: ProductFormValues) {
    // In a real application, you would:
    // 1. Upload the product images to your storage
    // 2. Create the product in your database
    // 3. Redirect to the product list or the new product's details page

    toast.success("Product created successfully", {
      description:
        data.status === "active"
          ? "The product is now live on your marketplace."
          : data.status === "pending"
            ? "The product is awaiting approval."
            : "The product has been saved as a draft.",
    })

    console.log("Form data:", data)
    console.log("Product images:", productImages)

    // Redirect back to products list
    setTimeout(() => {
      router.push("/admin/products")
    }, 1500)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files)
      setProductImages((prev) => [...prev, ...filesArray])
    }
  }

  const removeFile = (fileName: string) => {
    setProductImages(productImages.filter((file) => file.name !== fileName))
  }

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
      <p className="text-sm text-muted-foreground mt-2">No images uploaded yet.</p>
    )
  }

  const nextTab = () => {
    if (activeTab === "basic") {
      form.trigger(["name", "sku", "price", "categoryId", "vendor"]).then((isValid) => {
        if (isValid) setActiveTab("details")
      })
    } else if (activeTab === "details") {
      form.trigger(["description", "quantity"]).then((isValid) => {
        if (isValid) setActiveTab("images")
      })
    }
  }

  const prevTab = () => {
    if (activeTab === "details") setActiveTab("basic")
    else if (activeTab === "images") setActiveTab("details")
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center p-4 border-b">
        <Button variant="ghost" size="icon" onClick={() => router.push("/admin/products")}>
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only">Back</span>
        </Button>
        <div className="ml-4">
          <h1 className="text-2xl font-bold tracking-tight">Add New Product</h1>
          <p className="text-muted-foreground">Create a new product for your marketplace</p>
        </div>
      </div>

      <div className="p-4 md:p-6 flex-1">
        <Card>
          <CardContent className="p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
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
                              <FormLabel>Product Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Premium Wireless Headphones" {...field} />
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
                              <FormLabel>SKU</FormLabel>
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
                              <FormLabel>Price</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <span className="absolute left-3 top-2.5">$</span>
                                  <Input type="number" step="0.01" min="0" className="pl-6" {...field} />
                                </div>
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
                              <FormLabel>Compare-at Price</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <span className="absolute left-3 top-2.5">$</span>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    className="pl-6"
                                    {...field}
                                    value={field.value || ""}
                                    onChange={(e) => {
                                      const value =
                                        e.target.value === "" ? undefined : Number.parseFloat(e.target.value)
                                      field.onChange(value)
                                    }}
                                  />
                                </div>
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
                                <div className="relative">
                                  <span className="absolute left-3 top-2.5">$</span>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    className="pl-6"
                                    {...field}
                                    value={field.value || ""}
                                    onChange={(e) => {
                                      const value =
                                        e.target.value === "" ? undefined : Number.parseFloat(e.target.value)
                                      field.onChange(value)
                                    }}
                                  />
                                </div>
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
                              <FormLabel>Category</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select a category" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {mockCategories.map((category) => (
                                    <SelectItem key={category.id} value={category.id.toString()}>
                                      {category.name}
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
                          name="vendor"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Vendor</FormLabel>
                              <FormControl>
                                <Input placeholder="Sony" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="details" className="space-y-6">
                    <div className="space-y-6">
                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Product Description</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Describe your product in detail..."
                                className="min-h-[200px]"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Separator />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="quantity"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Inventory Quantity</FormLabel>
                              <FormControl>
                                <Input type="number" min="0" step="1" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="featured"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Featured Product</FormLabel>
                                <FormDescription>
                                  Featured products are displayed prominently on your marketplace.
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="images" className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Product Images</h3>
                      <p className="text-sm text-muted-foreground">
                        Upload high-quality images of your product. The first image will be used as the product
                        thumbnail.
                      </p>
                      <div className="grid w-full max-w-sm items-center gap-1.5">
                        <Label htmlFor="product-images">Upload Images</Label>
                        <div className="flex items-center gap-4">
                          <Label
                            htmlFor="product-images"
                            className="cursor-pointer flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            <span>Choose files</span>
                            <Input
                              id="product-images"
                              type="file"
                              multiple
                              accept="image/*"
                              className="sr-only"
                              onChange={handleFileChange}
                            />
                          </Label>
                        </div>
                        {renderFileList()}
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Publishing Options</h3>
                      <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Product Status</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="draft">Draft - Save for later</SelectItem>
                                <SelectItem value="pending">Pending - Submit for approval</SelectItem>
                                <SelectItem value="active">Active - Publish immediately</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              {field.value === "draft" && "Save as draft to continue editing later."}
                              {field.value === "pending" && "Submit for review by marketplace administrators."}
                              {field.value === "active" &&
                                "Make this product immediately available on your marketplace."}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="flex flex-col-reverse sm:flex-row gap-2 justify-end">
                  {activeTab !== "basic" && (
                    <Button type="button" variant="outline" onClick={prevTab}>
                      Previous
                    </Button>
                  )}

                  {activeTab !== "images" ? (
                    <Button type="button" onClick={nextTab}>
                      Next
                    </Button>
                  ) : (
                    <Button type="submit">Create Product</Button>
                  )}
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
