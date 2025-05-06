"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { ArrowLeft } from "lucide-react"

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
import { DocumentUpload } from "@/components/ui/document-upload"
import { PhoneInput } from "@/components/ui/phone-input"
import { RequiredField } from "@/components/ui/required-field"

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
  countryCode: z.string().optional(),
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
  countryCode: "+255",
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
  
  // Add state for document expiry dates
  const [identityDocsExpiry, setIdentityDocsExpiry] = useState<Record<string, string>>({})
  const [businessDocsExpiry, setBusinessDocsExpiry] = useState<Record<string, string>>({})
  const [bankDocsExpiry, setBankDocsExpiry] = useState<Record<string, string>>({})

  const form = useForm<VendorFormValues>({
    resolver: zodResolver(vendorFormSchema),
    defaultValues,
  })

  const nextTab = () => {
    if (activeTab === "business") {
      const businessFields = [
        "businessName",
        "email",
        "phone",
        "category",
        "taxId",
        "description",
      ]

      const result = businessFields.every((field) =>
        form.trigger(field as keyof VendorFormValues)
      )

      if (result) {
        setActiveTab("address")
      } else {
        toast.error("Please complete all required fields.")
      }
    } else if (activeTab === "address") {
      const addressFields = ["street", "city", "state", "zip", "country"]

      const result = addressFields.every((field) =>
        form.trigger(field as keyof VendorFormValues)
      )

      if (result) {
        setActiveTab("documents")
      } else {
        toast.error("Please complete all required fields.")
      }
    } else if (activeTab === "documents") {
      setActiveTab("review")
    }
  }

  const prevTab = () => {
    if (activeTab === "address") setActiveTab("business")
    else if (activeTab === "documents") setActiveTab("address")
    else if (activeTab === "review") setActiveTab("documents")
  }

  const handleSubmit = form.handleSubmit((data) => {
    const formData = {
      ...data,
      documents: {
        identity: identityDocs,
        identityExpiryDates: identityDocsExpiry,
        business: businessDocs,
        businessExpiryDates: businessDocsExpiry,
        bank: bankDocs,
        bankExpiryDates: bankDocsExpiry,
      },
    }
    onSubmit(formData as VendorFormValues)
  })

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <Form {...form}>
          <form onSubmit={handleSubmit}>
            <Tabs value={activeTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger
                  value="business"
                  onClick={() => setActiveTab("business")}
                  disabled={activeTab === "business"}
                >
                  Business
                </TabsTrigger>
                <TabsTrigger
                  value="address"
                  onClick={() => setActiveTab("address")}
                  disabled={activeTab === "address"}
                >
                  Address
                </TabsTrigger>
                <TabsTrigger
                  value="documents"
                  onClick={() => setActiveTab("documents")}
                  disabled={activeTab === "documents"}
                >
                  Documents
                </TabsTrigger>
                <TabsTrigger
                  value="review"
                  onClick={() => setActiveTab("review")}
                  disabled={activeTab === "review"}
                >
                  Review
                </TabsTrigger>
              </TabsList>

              <TabsContent value="business" className="space-y-6 pt-4">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Business Information</h3>
                  <p className="text-sm text-muted-foreground">
                    Provide your business details to get started.
                  </p>
                </div>
                <FormField
                  control={form.control}
                  name="businessName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business Name <RequiredField /></FormLabel>
                      <FormControl>
                        <Input placeholder="Your business name" {...field} />
                      </FormControl>
                      <FormDescription>
                        The official name of your business.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email <RequiredField /></FormLabel>
                        <FormControl>
                          <Input placeholder="Email address" {...field} />
                        </FormControl>
                        <FormDescription>
                          Your business email address.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone <RequiredField /></FormLabel>
                        <FormControl>
                          <PhoneInput
                            countryCode={form.getValues("countryCode") || "+255"}
                            onChange={(value) => {
                              form.setValue("countryCode", value.countryCode);
                              field.onChange(value.phoneNumber);
                            }}
                            value={field.value}
                            onBlur={field.onBlur}
                          />
                        </FormControl>
                        <FormDescription>
                          Your business phone number.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Business Category <RequiredField /></FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
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
                        <FormDescription>
                          The category that best describes your business.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="taxId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tax ID <RequiredField /></FormLabel>
                        <FormControl>
                          <Input placeholder="Tax ID" {...field} />
                        </FormControl>
                        <FormDescription>
                          Your business tax identification number.
                        </FormDescription>
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
                      <FormLabel>Business Description <RequiredField /></FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Tell us about your business..."
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Briefly describe what your business offers.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
              
              <TabsContent value="address" className="space-y-6 pt-4">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Business Address</h3>
                  <p className="text-sm text-muted-foreground">
                    Provide your business location information.
                  </p>
                </div>
                <FormField
                  control={form.control}
                  name="street"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Street Address <RequiredField /></FormLabel>
                      <FormControl>
                        <Input placeholder="123 Main St" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City <RequiredField /></FormLabel>
                        <FormControl>
                          <Input placeholder="City" {...field} />
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
                        <FormLabel>State/Province <RequiredField /></FormLabel>
                        <FormControl>
                          <Input placeholder="State or Province" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="zip"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ZIP/Postal Code <RequiredField /></FormLabel>
                        <FormControl>
                          <Input placeholder="ZIP or Postal code" {...field} />
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
                        <FormLabel>Country <RequiredField /></FormLabel>
                        <FormControl>
                          <Input placeholder="Country" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>

              <TabsContent value="documents" className="space-y-6 pt-4">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Identity Documents</h3>
                  <DocumentUpload
                    label="National ID, Passport, Driver's License, etc."
                    description="Upload clear images of relevant identity documents. You may add an expiry date for any document that requires renewal."
                    files={identityDocs}
                    setFiles={setIdentityDocs}
                    expiryDates={identityDocsExpiry}
                    setExpiryDates={setIdentityDocsExpiry}
                  />
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Business Documents</h3>
                  <DocumentUpload
                    label="Business Registration, License, Certificates, etc."
                    description="Upload clear images of all required business documents. Set expiry dates for any licenses or certificates that require renewal."
                    files={businessDocs}
                    setFiles={setBusinessDocs}
                    expiryDates={businessDocsExpiry}
                    setExpiryDates={setBusinessDocsExpiry}
                  />
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Banking Information</h3>
                  <DocumentUpload
                    label="Bank Statements, Financial Records, etc."
                    description="Upload bank account information and financial records. You may set expiry dates for documents like statements that need to be renewed."
                    files={bankDocs}
                    setFiles={setBankDocs}
                    expiryDates={bankDocsExpiry}
                    setExpiryDates={setBankDocsExpiry}
                  />
                </div>
              </TabsContent>

              <TabsContent value="review" className="space-y-6 pt-4">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Review Your Information</h3>
                  <p className="text-sm text-muted-foreground">
                    Review your information before submitting.
                  </p>
                </div>

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
                      {form.watch("city") || "—"},{
                        form.watch("state") || "—"}{" "}
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
                                {identityDocsExpiry[file.name] && (
                                  <span className="text-muted-foreground"> - Expires: {identityDocsExpiry[file.name]}</span>
                                )}
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
                                {businessDocsExpiry[file.name] && (
                                  <span className="text-muted-foreground"> - Expires: {businessDocsExpiry[file.name]}</span>
                                )}
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
                                {bankDocsExpiry[file.name] && (
                                  <span className="text-muted-foreground"> - Expires: {bankDocsExpiry[file.name]}</span>
                                )}
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

            <div className="flex flex-col-reverse sm:flex-row gap-2 justify-end mt-6">
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
