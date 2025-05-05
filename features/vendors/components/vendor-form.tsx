"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { ArrowLeft, Upload } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"

const vendorFormSchema = z.object({
  businessName: z.string().min(2, {
    message: "Business name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  phone: z.string().min(10, {
    message: "Please enter a valid phone number.",
  }),
  category: z.string({
    required_error: "Please select a business category.",
  }),
  taxId: z.string().min(1, {
    message: "Tax ID is required.",
  }),
  description: z
    .string()
    .min(10, {
      message: "Description must be at least 10 characters.",
    })
    .max(500, {
      message: "Description must not exceed 500 characters.",
    }),
  street: z.string().min(1, {
    message: "Street address is required.",
  }),
  city: z.string().min(1, {
    message: "City is required.",
  }),
  state: z.string().min(1, {
    message: "State/Province is required.",
  }),
  zip: z.string().min(1, {
    message: "ZIP/Postal code is required.",
  }),
  country: z.string().min(1, {
    message: "Country is required.",
  }),
})

type VendorFormValues = z.infer<typeof vendorFormSchema>

const defaultValues: Partial<VendorFormValues> = {
  description: "",
}

const businessCategories = [
  "Apparel",
  "Electronics",
  "Food & Beverages",
  "Handmade Goods",
  "Health & Beauty",
  "Home & Garden",
  "Jewelry & Accessories",
  "Sports & Outdoors",
  "Toys & Games",
  "Other",
]

interface VendorFormProps {
  onSubmit: (data: VendorFormValues) => void
  onCancel: () => void
}

export function VendorForm({ onSubmit, onCancel }: VendorFormProps) {
  const [activeTab, setActiveTab] = useState("business")
  const [identityDocs, setIdentityDocs] = useState<File[]>([])
  const [businessDocs, setBusinessDocs] = useState<File[]>([])
  const [bankDocs, setBankDocs] = useState<File[]>([])

  const form = useForm<VendorFormValues>({
    resolver: zodResolver(vendorFormSchema),
    defaultValues,
  })

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setFiles: React.Dispatch<React.SetStateAction<File[]>>
  ) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files)
      setFiles((prev) => [...prev, ...filesArray])
    }
  }

  const removeFile = (
    fileName: string,
    files: File[],
    setFiles: React.Dispatch<React.SetStateAction<File[]>>
  ) => {
    setFiles(files.filter((file) => file.name !== fileName))
  }

  const renderFileList = (
    files: File[],
    setFiles: React.Dispatch<React.SetStateAction<File[]>>
  ) => {
    return files.length > 0 ? (
      <div className="mt-2 space-y-2">
        {files.map((file) => (
          <div
            key={file.name}
            className="flex items-center justify-between bg-muted p-2 rounded-md"
          >
            <span className="text-sm truncate max-w-[200px]">{file.name}</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removeFile(file.name, files, setFiles)}
            >
              Remove
            </Button>
          </div>
        ))}
      </div>
    ) : (
      <p className="text-sm text-muted-foreground mt-2">No files uploaded yet.</p>
    )
  }

  const nextTab = () => {
    if (activeTab === "business") {
      // Validate business info fields before proceeding
      form
        .trigger([
          "businessName",
          "email",
          "phone",
          "category",
          "taxId",
          "description",
          "street",
          "city",
          "state",
          "zip",
          "country",
        ])
        .then((isValid) => {
          if (isValid) setActiveTab("documents")
        })
    } else if (activeTab === "documents") {
      // Check if at least one document is uploaded
      if (
        identityDocs.length === 0 &&
        businessDocs.length === 0 &&
        bankDocs.length === 0
      ) {
        toast("Document required", {
          description: "Please upload at least one document before proceeding.",
        })
        return
      }
      setActiveTab("review")
    }
  }

  const prevTab = () => {
    if (activeTab === "documents") setActiveTab("business")
    else if (activeTab === "review") setActiveTab("documents")
  }

  return (
    <Card>
      <CardContent className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-8">
                <TabsTrigger value="business">Business Info</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
                <TabsTrigger value="review">Review & Submit</TabsTrigger>
              </TabsList>

              <TabsContent value="business" className="space-y-6">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="businessName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Business Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Acme Inc." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Business Email</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="contact@example.com"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Business Phone</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="+1 (555) 123-4567"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Business Category</FormLabel>
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
                              {businessCategories.map((category) => (
                                <SelectItem key={category} value={category}>
                                  {category}
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
                      name="taxId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Tax ID / Business Registration Number
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="XX-XXXXXXX" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Separator />

                  <div>
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Business Description</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Describe your business, products, and services..."
                              className="min-h-[120px]"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Provide a brief description of your business and
                            the products or services you offer.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-lg font-medium mb-4">
                      Business Address
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="street"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Street Address</FormLabel>
                            <FormControl>
                              <Input placeholder="123 Main St" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="San Francisco"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="state"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>State / Province</FormLabel>
                            <FormControl>
                              <Input placeholder="California" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="zip"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>ZIP / Postal Code</FormLabel>
                            <FormControl>
                              <Input placeholder="94103" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="country"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Country</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="United States"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="documents" className="space-y-8">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">
                    Identity Documents
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Upload government-issued identification documents (e.g.,
                    passport, driver's license, ID card).
                  </p>
                  <div className="grid w-full max-w-sm items-center gap-1.5">
                    <Label htmlFor="identity-documents">
                      Upload ID Documents
                    </Label>
                    <div className="flex items-center gap-4">
                      <Label
                        htmlFor="identity-documents"
                        className="cursor-pointer flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        <span>Choose files</span>
                        <Input
                          id="identity-documents"
                          type="file"
                          multiple
                          className="sr-only"
                          onChange={(e) =>
                            handleFileChange(e, setIdentityDocs)
                          }
                        />
                      </Label>
                    </div>
                    {renderFileList(identityDocs, setIdentityDocs)}
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">
                    Business Documents
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Upload business registration documents (e.g., business
                    license, certificate of incorporation, tax
                    registration).
                  </p>
                  <div className="grid w-full max-w-sm items-center gap-1.5">
                    <Label htmlFor="business-documents">
                      Upload Business Documents
                    </Label>
                    <div className="flex items-center gap-4">
                      <Label
                        htmlFor="business-documents"
                        className="cursor-pointer flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        <span>Choose files</span>
                        <Input
                          id="business-documents"
                          type="file"
                          multiple
                          className="sr-only"
                          onChange={(e) =>
                            handleFileChange(e, setBusinessDocs)
                          }
                        />
                      </Label>
                    </div>
                    {renderFileList(businessDocs, setBusinessDocs)}
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">
                    Banking Information
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Upload bank account information for payment processing
                    (e.g., void check, bank statement).
                  </p>
                  <div className="grid w-full max-w-sm items-center gap-1.5">
                    <Label htmlFor="bank-documents">
                      Upload Banking Documents
                    </Label>
                    <div className="flex items-center gap-4">
                      <Label
                        htmlFor="bank-documents"
                        className="cursor-pointer flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        <span>Choose files</span>
                        <Input
                          id="bank-documents"
                          type="file"
                          multiple
                          className="sr-only"
                          onChange={(e) => handleFileChange(e, setBankDocs)}
                        />
                      </Label>
                    </div>
                    {renderFileList(bankDocs, setBankDocs)}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="review" className="space-y-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">
                      Business Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">
                          Business Name
                        </h4>
                        <p className="text-base">
                          {form.watch("businessName") || "—"}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">
                          Email
                        </h4>
                        <p className="text-base">
                          {form.watch("email") || "—"}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">
                          Phone
                        </h4>
                        <p className="text-base">
                          {form.watch("phone") || "—"}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">
                          Category
                        </h4>
                        <p className="text-base">
                          {form.watch("category") || "—"}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">
                          Tax ID
                        </h4>
                        <p className="text-base">
                          {form.watch("taxId") || "—"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">
                      Business Description
                    </h4>
                    <p className="text-base">
                      {form.watch("description") || "—"}
                    </p>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-lg font-medium mb-4">
                      Business Address
                    </h3>
                    <p className="text-base">
                      {form.watch("street") || "—"}
                    </p>
                    <p className="text-base">
                      {form.watch("city") || "—"},{" "}
                      {form.watch("state") || "—"}{" "}
                      {form.watch("zip") || "—"}
                    </p>
                    <p className="text-base">
                      {form.watch("country") || "—"}
                    </p>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-lg font-medium mb-4">
                      Uploaded Documents
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">
                          Identity Documents
                        </h4>
                        {identityDocs.length > 0 ? (
                          <ul className="list-disc list-inside">
                            {identityDocs.map((file) => (
                              <li key={file.name} className="text-sm">
                                {file.name}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            No identity documents uploaded.
                          </p>
                        )}
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">
                          Business Documents
                        </h4>
                        {businessDocs.length > 0 ? (
                          <ul className="list-disc list-inside">
                            {businessDocs.map((file) => (
                              <li key={file.name} className="text-sm">
                                {file.name}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            No business documents uploaded.
                          </p>
                        )}
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">
                          Banking Documents
                        </h4>
                        {bankDocs.length > 0 ? (
                          <ul className="list-disc list-inside">
                            {bankDocs.map((file) => (
                              <li key={file.name} className="text-sm">
                                {file.name}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            No banking documents uploaded.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    By submitting this application, you confirm that all
                    information provided is accurate and complete. The
                    vendor application will be reviewed by our team, and
                    you will be notified once a decision has been made.
                  </p>
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex flex-col-reverse sm:flex-row gap-2 justify-end">
              {activeTab !== "business" && (
                <Button type="button" variant="outline" onClick={prevTab}>
                  Previous
                </Button>
              )}

              {activeTab !== "review" ? (
                <Button type="button" onClick={nextTab}>
                  Next
                </Button>
              ) : (
                <Button type="submit">Submit Application</Button>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
} 