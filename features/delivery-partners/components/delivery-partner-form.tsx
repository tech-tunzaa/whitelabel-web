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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"

const deliveryPartnerFormSchema = z.object({
  // Common fields
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  phone: z.string().min(10, {
    message: "Please enter a valid phone number.",
  }),
  type: z.enum(['individual', 'business', 'pickup_point'], {
    required_error: "Please select a delivery partner type.",
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
  commissionPercent: z.string({
    required_error: "Please select a commission percentage.",
  }),

  // Individual specific fields
  dateOfBirth: z.string().optional(),
  nationalId: z.string().optional(),
  vehicleType: z.string().optional(),
  vehicleDetails: z.string().optional(),
  licenseNumber: z.string().optional(),
  serviceRadius: z.string().optional(),

  // Business specific fields
  businessName: z.string().optional(),
  taxId: z.string().optional(),
  drivers: z.array(z.object({
    name: z.string(),
    phone: z.string(),
    email: z.string(),
    licenseNumber: z.string(),
    vehicleType: z.string(),
    vehicleDetails: z.string(),
  })).optional(),

  // Pickup point specific fields
  operatingHours: z.string().optional(),
})

type DeliveryPartnerFormValues = z.infer<typeof deliveryPartnerFormSchema>

const defaultValues: Partial<DeliveryPartnerFormValues> = {
  type: 'individual',
  description: "",
  serviceRadius: "5",
  drivers: [{
    name: "",
    phone: "",
    email: "",
    licenseNumber: "",
    vehicleType: "",
    vehicleDetails: "",
  }],
}

const businessTypes = [
  { id: "individual", label: "Individual", description: "Single delivery person", icon: "👤" },
  { id: "business", label: "Business", description: "Delivery company with multiple riders", icon: "🏢" },
  { id: "pickup_point", label: "Pickup Point", description: "Designated location for package pickup", icon: "📍" },
]

const vehicleTypes = [
  { id: "boda", label: "Boda Boda", description: "Motorcycle taxi service", icon: "🏍️" },
  { id: "car", label: "Car", description: "Car delivery service", icon: "🚗" },
  { id: "truck", label: "Truck", description: "Truck delivery service", icon: "🚚" },
  { id: "bicycle", label: "Bicycle", description: "Bicycle delivery service", icon: "🚲" },
]

const commissionPercentages = [
  { value: "5", label: "5%" },
  { value: "10", label: "10%" },
  { value: "15", label: "15%" },
  { value: "20", label: "20%" },
]

interface DeliveryPartnerFormProps {
  onSubmit: (data: DeliveryPartnerFormValues) => void
  onCancel: () => void
}

export function DeliveryPartnerForm({ onSubmit, onCancel }: DeliveryPartnerFormProps) {
  const [activeTab, setActiveTab] = useState("basic")
  const [identityDocs, setIdentityDocs] = useState<File[]>([])
  const [vehicleDocs, setVehicleDocs] = useState<File[]>([])
  const [bankDocs, setBankDocs] = useState<File[]>([])

  const form = useForm<DeliveryPartnerFormValues>({
    resolver: zodResolver(deliveryPartnerFormSchema),
    defaultValues,
  })

  const selectedType = form.watch("type")
  const drivers = form.watch("drivers") || []

  const addDriver = () => {
    const currentDrivers = form.getValues("drivers") || []
    form.setValue("drivers", [
      ...currentDrivers,
      {
        name: "",
        phone: "",
        email: "",
        licenseNumber: "",
        vehicleType: "",
        vehicleDetails: "",
      },
    ])
  }

  const removeDriver = (index: number) => {
    const currentDrivers = form.getValues("drivers") || []
    form.setValue(
      "drivers",
      currentDrivers.filter((_, i) => i !== index)
    )
  }

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
    if (activeTab === "basic") {
      // Validate basic info fields before proceeding
      form
        .trigger([
          "name",
          "email",
          "phone",
          "type",
          "dateOfBirth",
          "nationalId",
          "licenseNumber",
          "vehicleType",
          "vehicleDetails",
          "serviceRadius",
          "operatingHours",
        ])
        .then((isValid) => {
          if (isValid) setActiveTab("documents")
        })
    } else if (activeTab === "documents") {
      // Check if at least one document is uploaded
      if (
        identityDocs.length === 0 &&
        vehicleDocs.length === 0 &&
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
    if (activeTab === "documents") setActiveTab("basic")
    else if (activeTab === "review") setActiveTab("documents")
  }

  return (
    <Card>
      <CardContent className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-8">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
                <TabsTrigger value="review">Review & Submit</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-6">
                <div className="space-y-6">
                  <div className="gap-6">
                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Type</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="grid grid-cols-3 gap-4"
                            >
                              {businessTypes.map((type) => (
                                <div key={type.id}>
                                  <RadioGroupItem
                                    value={type.id}
                                    id={type.id}
                                    className="peer sr-only"
                                  />
                                  <Label
                                    htmlFor={type.id}
                                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                                  >
                                    <span className="text-2xl mb-2">{type.icon}</span>
                                    <span className="font-medium">{type.label}</span>
                                    <span className="text-sm text-muted-foreground">
                                      {type.description}
                                    </span>
                                  </Label>
                                </div>
                              ))}
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Separator />

                  {selectedType === 'individual' && (
                    <div className="space-y-6">
                      <h3 className="text-lg font-medium">Personal Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Full Name</FormLabel>
                              <FormControl>
                                <Input placeholder="John Doe" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="dateOfBirth"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Date of Birth</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="nationalId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>National ID Number</FormLabel>
                              <FormControl>
                                <Input placeholder="ID-123456" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="licenseNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Driver's License Number</FormLabel>
                              <FormControl>
                                <Input placeholder="DL-123456" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <Separator />

                      <div>
                        <h3 className="text-lg font-medium mb-4">Vehicle Information</h3>
                        <div className="space-y-6">
                          <FormField
                            control={form.control}
                            name="vehicleType"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Vehicle Type</FormLabel>
                                <FormControl>
                                  <RadioGroup
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    className="grid grid-cols-2 gap-4"
                                  >
                                    {vehicleTypes.map((type) => (
                                      <div key={type.id}>
                                        <RadioGroupItem
                                          value={type.id}
                                          id={type.id}
                                          className="peer sr-only"
                                        />
                                        <Label
                                          htmlFor={type.id}
                                          className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                                        >
                                          <span className="text-2xl mb-2">{type.icon}</span>
                                          <span className="font-medium">{type.label}</span>
                                          <span className="text-sm text-muted-foreground">
                                            {type.description}
                                          </span>
                                        </Label>
                                      </div>
                                    ))}
                                  </RadioGroup>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="vehicleDetails"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Vehicle Details</FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder="Enter vehicle make, model, year, and any other relevant details..."
                                    className="min-h-[100px]"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>

                      <Separator />

                      <div>
                        <h3 className="text-lg font-medium mb-4">Service Area</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <FormField
                            control={form.control}
                            name="serviceRadius"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Service Radius (km)</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    placeholder="5"
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
                  )}

                  {selectedType === 'business' && (
                    <div className="space-y-6">
                      <h3 className="text-lg font-medium">Business Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="businessName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Business Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Acme Delivery" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="taxId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Tax ID / Business Registration Number</FormLabel>
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
                        <h3 className="text-lg font-medium mb-4">Drivers</h3>
                        {drivers.map((_, index) => (
                          <div key={index} className="space-y-6 mb-6 p-4 border rounded-lg">
                            <div className="flex justify-between items-center">
                              <h4 className="text-md font-medium">Driver {index + 1}</h4>
                              {index > 0 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeDriver(index)}
                                >
                                  Remove Driver
                                </Button>
                              )}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <FormField
                                control={form.control}
                                name={`drivers.${index}.name`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Driver Name</FormLabel>
                                    <FormControl>
                                      <Input placeholder="John Doe" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name={`drivers.${index}.phone`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Driver Phone</FormLabel>
                                    <FormControl>
                                      <Input placeholder="+1 (555) 123-4567" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name={`drivers.${index}.email`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Driver Email</FormLabel>
                                    <FormControl>
                                      <Input placeholder="driver@example.com" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name={`drivers.${index}.licenseNumber`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Driver's License Number</FormLabel>
                                    <FormControl>
                                      <Input placeholder="DL-123456" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name={`drivers.${index}.vehicleType`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Vehicle Type</FormLabel>
                                    <FormControl>
                                      <RadioGroup
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                        className="grid grid-cols-2 gap-4"
                                      >
                                        {vehicleTypes.map((type) => (
                                          <div key={type.id}>
                                            <RadioGroupItem
                                              value={type.id}
                                              id={`${type.id}-${index}`}
                                              className="peer sr-only"
                                            />
                                            <Label
                                              htmlFor={`${type.id}-${index}`}
                                              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                                            >
                                              <span className="text-2xl mb-2">{type.icon}</span>
                                              <span className="font-medium">{type.label}</span>
                                              <span className="text-sm text-muted-foreground">
                                                {type.description}
                                              </span>
                                            </Label>
                                          </div>
                                        ))}
                                      </RadioGroup>
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name={`drivers.${index}.vehicleDetails`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Vehicle Details</FormLabel>
                                    <FormControl>
                                      <Textarea
                                        placeholder="Enter vehicle make, model, year, and any other relevant details..."
                                        className="min-h-[100px]"
                                        {...field}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          </div>
                        ))}
                        <Button type="button" onClick={addDriver}>
                          Add Another Driver
                        </Button>
                      </div>
                    </div>
                  )}

                  {selectedType === 'pickup_point' && (
                    <div className="space-y-6">
                      <h3 className="text-lg font-medium">Location Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Location Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Acme Pickup Point" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="operatingHours"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Operating Hours</FormLabel>
                              <FormControl>
                                <Input placeholder="9:00 AM - 5:00 PM" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  )}

                  <Separator />

                  <div>
                    <h3 className="text-lg font-medium mb-4">Contact Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
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
                            <FormLabel>Phone</FormLabel>
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
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-lg font-medium mb-4">Address</h3>
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

                  <Separator />

                  <div>
                    <h3 className="text-lg font-medium mb-4">Commission</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="commissionPercent"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Commission Percentage</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select commission percentage" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {commissionPercentages.map((option) => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
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
                    Vehicle Documents
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Upload vehicle registration, insurance, and other relevant documents.
                  </p>
                  <div className="grid w-full max-w-sm items-center gap-1.5">
                    <Label htmlFor="vehicle-documents">
                      Upload Vehicle Documents
                    </Label>
                    <div className="flex items-center gap-4">
                      <Label
                        htmlFor="vehicle-documents"
                        className="cursor-pointer flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        <span>Choose files</span>
                        <Input
                          id="vehicle-documents"
                          type="file"
                          multiple
                          className="sr-only"
                          onChange={(e) =>
                            handleFileChange(e, setVehicleDocs)
                          }
                        />
                      </Label>
                    </div>
                    {renderFileList(vehicleDocs, setVehicleDocs)}
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
                          Type
                        </h4>
                        <p className="text-base">
                          {form.watch("type") || "—"}
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
                      Service Area
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">
                          Latitude
                        </h4>
                        <p className="text-base">
                          {form.watch("latitude") || "—"}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">
                          Longitude
                        </h4>
                        <p className="text-base">
                          {form.watch("longitude") || "—"}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">
                          Service Radius
                        </h4>
                        <p className="text-base">
                          {form.watch("serviceRadius") || "—"} km
                        </p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-lg font-medium mb-4">
                      Vehicle Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">
                          Vehicle Type
                        </h4>
                        <p className="text-base">
                          {form.watch("vehicleType") || "—"}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">
                          Vehicle Details
                        </h4>
                        <p className="text-base">
                          {form.watch("vehicleDetails") || "—"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-lg font-medium mb-4">
                      Commission & Rider Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">
                          Commission Percentage
                        </h4>
                        <p className="text-base">
                          {form.watch("commissionPercent") || "—"}%
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">
                          Rider Name
                        </h4>
                        <p className="text-base">
                          {form.watch("riderName") || "—"}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">
                          Rider Phone
                        </h4>
                        <p className="text-base">
                          {form.watch("riderPhone") || "—"}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">
                          Rider Email
                        </h4>
                        <p className="text-base">
                          {form.watch("riderEmail") || "—"}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">
                          Rider License
                        </h4>
                        <p className="text-base">
                          {form.watch("riderLicense") || "—"}
                        </p>
                      </div>
                    </div>
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
                          Vehicle Documents
                        </h4>
                        {vehicleDocs.length > 0 ? (
                          <ul className="list-disc list-inside">
                            {vehicleDocs.map((file) => (
                              <li key={file.name} className="text-sm">
                                {file.name}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            No vehicle documents uploaded.
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
                    delivery partner application will be reviewed by our team, and
                    you will be notified once a decision has been made.
                  </p>
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex flex-col-reverse sm:flex-row gap-2 justify-end">
              {activeTab !== "basic" && (
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