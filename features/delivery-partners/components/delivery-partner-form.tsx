"use client"

import { useState, useEffect } from "react"
import dynamic from 'next/dynamic';
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useFieldArray } from "react-hook-form"
import { z } from "zod"
import { ArrowLeft, Upload } from "lucide-react"

import { DOCUMENT_TYPES, getDocumentTypesByCategory } from "@/features/settings/data/document-types"

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
import { RequiredField } from "@/components/ui/required-field"
import { DocumentUpload, DocumentWithMeta } from "@/components/ui/document-upload"
import { PhoneInput } from "@/components/ui/phone-input"
// import { MapPicker } from "@/components/ui/map-picker" // Original static import
import { cn } from "@/lib/utils"

import { deliveryPartnerFormSchema } from "../schema"
import { useDeliveryPartnerStore } from "../store";
import { useRouter } from "next/navigation";

type DeliveryPartnerFormValues = z.infer<typeof deliveryPartnerFormSchema>

const MapPicker = dynamic(() => 
  import('@/components/ui/map-picker').then(mod => mod.MapPicker),
  { ssr: false, loading: () => <p>Loading map...</p> } 
);

const defaultValues: Partial<DeliveryPartnerFormValues> = {
  type: 'individual',
  description: "",
  // Individual section default values
  plateNumber: "",
  vehicleMake: "",
  vehicleModel: "",
  vehicleYear: "",
  vehicleInsurance: "",
  vehicleRegistration: "",
  cost_per_km: "",
  coordinates: undefined,
  // Document verification
  verification_documents: [],
  // Drivers array default values
  drivers: [{
    name: "",
    phone: "",
    email: "",
    licenseNumber: "",
    vehicleType: "",
    plateNumber: "",
    vehicleMake: "",
    vehicleModel: "",
    vehicleYear: "",
    cost_per_km: "",
  }],
  user: {
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
  }
}

const partnerTypes = [
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


interface DeliveryPartnerFormProps {
  onSubmit: (data: DeliveryPartnerFormValues) => void
  onCancel?: () => void
  initialData?: Partial<DeliveryPartnerFormValues> & { _id?: string }
  disableTypeChange?: boolean
}

export function DeliveryPartnerForm({ onSubmit, onCancel, initialData, disableTypeChange = false }: DeliveryPartnerFormProps) {
  const [activeTab, setActiveTab] = useState("basic")
  const [identityDocs, setIdentityDocs] = useState<File[]>([])
  const [vehicleDocs, setVehicleDocs] = useState<File[]>([])
  const [bankDocs, setBankDocs] = useState<File[]>([])
  const [isVerifying, setIsVerifying] = useState(false)
  const [verificationSuccess, setVerificationSuccess] = useState(false)
  const [internalIsSubmitting, setInternalIsSubmitting] = useState(false);

  const form = useForm<DeliveryPartnerFormValues>({
    resolver: zodResolver(deliveryPartnerFormSchema),
    defaultValues: initialData ? { ...defaultValues, ...initialData } : defaultValues,
    mode: "onChange",
  })

  // Manage drivers array using useFieldArray instead of form.watch
  const { fields: drivers, append: appendDriver, remove: removeDriverField } = useFieldArray({
    control: form.control,
    name: "drivers",
  })

  // Reset verification states and set active tab to basic when form type changes
  useEffect(() => {
    setVerificationSuccess(false)
    setVerifiedDrivers([])
    setActiveTab("basic")
  }, [form.watch("type")])

  const selectedType = form.watch("type")

  const addDriver = () => {
    appendDriver({
      name: "",
      phone: "",
      email: "",
      licenseNumber: "",
      vehicleType: "",
      plateNumber: "",
      vehicleMake: "",
      vehicleModel: "",
      vehicleYear: "",
    })
  }

  const removeDriver = (index: number) => {
    removeDriverField(index)
    // Update verifiedDrivers to remove the deleted driver and reindex
    setVerifiedDrivers(prev => {
      const filtered = prev.filter(i => i !== index)
      return filtered.map(i => (i > index ? i - 1 : i))
    })
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

  // State to track verification status for drivers
  const [verifiedDrivers, setVerifiedDrivers] = useState<number[]>([])
  
  const verifyVehicle = async (plateNumber: string, isDriver = false, driverIndex?: number) => {
    if (!plateNumber) {
      toast.error("Please enter a plate number")
      return
    }
    
    setIsVerifying(true)
    
    // Simulate API call with timeout
    try {
      // This simulates an API call to fetch vehicle details
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Demo data - in real implementation, this would come from the API
      const vehicleDetails = {
        make: "Toyota",
        model: "Corolla",
        year: "2020"
      }
      
      // Update form values with the retrieved data
      if (isDriver && typeof driverIndex === 'number') {
        form.setValue(`drivers.${driverIndex}.vehicleMake`, vehicleDetails.make)
        form.setValue(`drivers.${driverIndex}.vehicleModel`, vehicleDetails.model)
        form.setValue(`drivers.${driverIndex}.vehicleYear`, vehicleDetails.year)
        
        // Add this driver to the verified list
        setVerifiedDrivers(prev => {
          if (!prev.includes(driverIndex)) {
            return [...prev, driverIndex]
          }
          return prev
        })
      } else {
        form.setValue("vehicleMake", vehicleDetails.make)
        form.setValue("vehicleModel", vehicleDetails.model)
        form.setValue("vehicleYear", vehicleDetails.year)
        setVerificationSuccess(true)
      }
      
      toast.success("Vehicle details verified successfully")
    } catch (error) {
      toast.error("Failed to verify vehicle details")
      console.error("Error verifying vehicle:", error)
    } finally {
      setIsVerifying(false)
    }
  }

  // Define tab navigation order based on partner type
  const getTabOrder = () => {
    if (selectedType === 'individual') {
      return ["basic", "vehicle", "address", "documents", "review"]
    } else if (selectedType === 'business') {
      return ["basic", "drivers", "address", "documents", "review"]
    } else if (selectedType === 'pickup_point'){
      return ["basic", "address", "documents", "review"]
    }
  }

  const nextTab = () => {
    // If we're on the documents tab, validate that at least one document is uploaded
    if (activeTab === "documents") {
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
    }

    const tabOrder = getTabOrder()
    const currentIndex = tabOrder.indexOf(activeTab)
    if (currentIndex < tabOrder.length - 1) {
      setActiveTab(tabOrder[currentIndex + 1])
    }
  }

  const prevTab = () => {
    const tabOrder = getTabOrder()
    const currentIndex = tabOrder.indexOf(activeTab)
    if (currentIndex > 0) {
      setActiveTab(tabOrder[currentIndex - 1])
    }
  }

  const handleSubmit = (data: DeliveryPartnerFormValues) => {
    try {
      setInternalIsSubmitting(true);
      // Package data for submission
      const packagedData = {
        ...data,
        name: data.type === 'individual' ? `${data.user.first_name} ${data.user.last_name}` : data.name,
        commission_percent: "10",
        // drivers: Array.isArray(data.drivers) ? data.drivers : [],
        drivers: [],
      };
      console.log(packagedData);
      // Pass packaged data to parent onSubmit
      onSubmit(packagedData);
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error("Failed to package the form data. Please try again.");
    } finally {
      setInternalIsSubmitting(false);
    }
  };

  const handleFormError = (error: any) => {
    console.error("Form error:", error);
    toast.error("Form validation failed. Please check the form fields.");
  };

  return (
    <Card>
      <CardContent className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit, handleFormError)} className="space-y-6">
            <div className="gap-6">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type <RequiredField /></FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="grid grid-cols-3 gap-4"
                        disabled={disableTypeChange}
                      >
                        {partnerTypes.map((type) => (
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
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full mb-8">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                {selectedType === 'individual' && (
                  <TabsTrigger value="vehicle">Vehicle Info</TabsTrigger>
                )}
                {selectedType === 'business' && (
                  <TabsTrigger value="drivers">Drivers</TabsTrigger>
                )}
                <TabsTrigger value="address">Address</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
                <TabsTrigger value="review">Review & Submit</TabsTrigger>
              </TabsList>

              <BasicInfoTab />
              
              {selectedType === 'individual' && <VehicleInfoTab />}
              
              {selectedType === 'business' && <DriversTab />}
              
              <AddressTab />
              
              <DocumentsTab />
              
              <ReviewTab />

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
                <Button type="submit" disabled={internalIsSubmitting}>
                  {internalIsSubmitting ? "Submitting..." : "Submit Application"}
                </Button>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )

  function BasicInfoTab() {
    return (
      <TabsContent value="basic" className="space-y-6">
        <div className="space-y-6">
          {selectedType === 'individual' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="user.first_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name <RequiredField /></FormLabel>
                      <FormControl>
                        <Input placeholder="John" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="user.last_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name <RequiredField /></FormLabel>
                      <FormControl>
                        <Input placeholder="Doe" {...field} />
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
            </div>
          )}

          {selectedType === 'business' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium">Business Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business Name <RequiredField /></FormLabel>
                      <FormControl>
                        <Input placeholder="Business Name" {...field} />
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
                      <FormLabel>Tax ID</FormLabel>
                      <FormControl>
                        <Input placeholder="Tax ID" {...field} />
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
                    <FormLabel>Business Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tell us about your business..."
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
                      <FormLabel>Location Name <RequiredField /></FormLabel>
                      <FormControl>
                        <Input placeholder="Acme Pickup Point" {...field} />
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
              {(selectedType === 'business' || selectedType ==='pickup_point') && (
                <>
                  <FormField
                    control={form.control}
                    name="user.first_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name <RequiredField /></FormLabel>
                        <FormControl>
                          <Input placeholder="John" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="user.last_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name <RequiredField /></FormLabel>
                        <FormControl>
                          <Input placeholder="Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              <FormField
                control={form.control}
                name="user.email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email <RequiredField /></FormLabel>
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
                name="user.phone_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone <RequiredField /></FormLabel>
                    <FormControl>
                      <PhoneInput
                        onChange={(value) => {
                          if (typeof value === 'object' && value !== null) {
                            // Handle object type return value
                            field.onChange(value.phoneNumber || '');
                          } else {
                            // Handle string return value
                            field.onChange(value);
                          }
                        }}
                        value={field.value}
                        onBlur={field.onBlur}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Show cost_per_km for individual and business partners */}
          {(selectedType === 'individual') && (
            <div>
              <h3 className="text-lg font-medium mb-4">Delivery Pricing</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="cost_per_km"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cost per Kilometer <RequiredField /></FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type="number"
                            min="0"
                            step="10"
                            placeholder="100"
                            {...field}
                          />
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-sm text-muted-foreground">
                            TZS/km
                          </div>
                        </div>
                      </FormControl>
                      <FormDescription>
                        The amount charged per kilometer for delivery.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          )}
          
          {/* Show commission for pickup points only */}
          {selectedType === 'pickup_point' && (
            <div>
              <h3 className="text-lg font-medium mb-4">Commission</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="flat_fee"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Flat Fee <RequiredField /></FormLabel>
                      <FormControl>
                        <Input type="number" step="10" placeholder="1000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          )}
        </div>
      </TabsContent>
    )
  }

  function AddressTab() {
    return (
      <TabsContent value="address" className="space-y-6">
        <div className="space-y-6">
          <h3 className="text-lg font-medium">Address Information</h3>
          
          {/* Map Picker Component */}
          <div className="mb-6">
            <FormField
              control={form.control}
              name="coordinates"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location <RequiredField /></FormLabel>
                  <FormControl>
                    <MapPicker
                      value={field.value}
                      onChange={field.onChange}
                      useCurrentLocation={false}
                      height="300px"
                    />
                  </FormControl>
                  <FormDescription>
                    Select a location on the map or search for an address. Drag the marker to adjust the location.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      </TabsContent>
    )
  }
  
  function VehicleInfoTab() {
    return (
      <TabsContent value="vehicle" className="space-y-6">
        <div className="space-y-6">
          <h3 className="text-lg font-medium">Vehicle Information</h3>
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
                            id={`vehicle-type-${type.id}`}
                            className="peer sr-only"
                          />
                          <Label
                            htmlFor={`vehicle-type-${type.id}`}
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
              name="plateNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vehicle Plate Number</FormLabel>
                  <div className="flex space-x-2">
                    <FormControl>
                      <Input
                        placeholder="Enter vehicle plate number..."
                        {...field}
                      />
                    </FormControl>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => verifyVehicle(field.value)}
                      disabled={isVerifying || !field.value}
                    >
                      {isVerifying ? "Verifying..." : "Verify"}
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Vehicle information fields (editable) - shown after verification or can be manually entered */}
            <div className={cn(
              "grid gap-4 mt-4 p-4 rounded-md",
              verificationSuccess 
                ? "border border-green-200 bg-green-50" 
                : "border border-muted"
            )}>
              <div className="flex items-center justify-between">
                <h4 className={cn(
                  "text-sm font-medium",
                  verificationSuccess ? "text-green-700" : "text-foreground"
                )}>
                  {verificationSuccess ? "Vehicle Details (Verified)" : "Vehicle Details"}
                </h4>
              </div>
              
              <FormField
                control={form.control}
                name="vehicleMake"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Make</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter vehicle make..." />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="vehicleModel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Model</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter vehicle model..." />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="vehicleYear"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Year</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter year..." />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>
        </div>
      </TabsContent>
    )
  }

  function DriversTab() {
    return (
      <TabsContent value="drivers" className="space-y-6">
        <div className="space-y-6">
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
                      <FormLabel>Driver Name <RequiredField /></FormLabel>
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
                      <FormLabel>Driver Phone <RequiredField /></FormLabel>
                      <FormControl>
                        <PhoneInput
                          onChange={(value) => {
                            if (typeof value === 'object' && value !== null) {
                              // Handle object type return value
                              field.onChange(value.phoneNumber || '');
                            } else {
                              // Handle string return value
                              field.onChange(value);
                            }
                          }}
                          value={field.value}
                          onBlur={field.onBlur}
                        />
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
                      <FormLabel>Driver Email <RequiredField /></FormLabel>
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
                      <FormLabel>Driver's License Number <RequiredField /></FormLabel>
                      <FormControl>
                        <Input placeholder="DL-123456" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name={`drivers.${index}.vehicleType`}
                    render={({ field }) => (
                      <FormItem className="flex flex-col gap-2">
                        <FormLabel>Vehicle Type <RequiredField /></FormLabel>
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
                    name={`drivers.${index}.cost_per_km`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cost per Kilometer <RequiredField /></FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type="number"
                              min="0"
                              step="10"
                              placeholder="100"
                              {...field}
                            />
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-sm text-muted-foreground">
                              TZS/km
                            </div>
                          </div>
                        </FormControl>
                        <FormDescription>
                          The amount charged per kilometer for delivery.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name={`drivers.${index}.plateNumber`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vehicle Plate Number <RequiredField /></FormLabel>
                        <div className="flex space-x-2">
                          <FormControl>
                            <Input
                              placeholder="Enter vehicle plate number..."
                              {...field}
                            />
                          </FormControl>
                          <Button
                            type="button"
                            variant="secondary"
                            onClick={() => verifyVehicle(field.value, true, index)}
                            disabled={isVerifying || !field.value}
                          >
                            {isVerifying ? "Verifying..." : "Verify"}
                          </Button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Vehicle information fields (editable) - shown after verification or can be manually entered */}
                  <div className={cn(
                    "grid gap-4 mt-4 p-4 rounded-md",
                    verifiedDrivers.includes(index) 
                      ? "border border-green-200 bg-green-50" 
                      : "border border-muted"
                  )}>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className={cn(
                        "text-sm font-medium",
                        verifiedDrivers.includes(index) ? "text-green-700" : "text-foreground"
                      )}>
                        {verifiedDrivers.includes(index) ? "Vehicle Details (Verified)" : "Vehicle Details"}
                      </h4>
                    </div>
                    
                    <div className="grid gap-4">
                      <FormField
                        control={form.control}
                        name={`drivers.${index}.vehicleMake`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Make</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Enter vehicle make..." />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name={`drivers.${index}.vehicleModel`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Model</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Enter vehicle model..." />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name={`drivers.${index}.vehicleYear`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Year</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Enter year..." />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
          <Button type="button" onClick={addDriver} className="w-full">
            Add Driver
          </Button>
        </div>
      </TabsContent>
    )
  }

  function DocumentsTab() {
    // Generate a unique upload ID to ensure component uniqueness
    const uploadId = `delivery-docs-${Date.now()}`;
    
    // Map document types directly from the imported data
    const documentTypeOptions = DOCUMENT_TYPES.map(docType => ({
      id: docType.id,
      name: docType.label
    }));
    
    // Simply handle the documents - keep it clean and simple
    const handleDocumentsChange = (docs: DocumentWithMeta[]) => {
      // Set the documents in the form
      form.setValue("verification_documents", docs, {
        shouldValidate: false,
        shouldDirty: true
      });
      
      // Update our state to track that documents have been uploaded
      if (docs.length > 0) {
        setIdentityDocs(docs
          .filter(d => d.file)
          .map(d => d.file!)
        );
      }
    };
    
    // Get current documents without using watch
    const existingDocuments = form.getValues("verification_documents") || [];
    
    return (
      <TabsContent value="documents" className="space-y-6">
        <div className="space-y-6">
          <h3 className="text-lg font-medium">KYC Documents</h3>
          
          <DocumentUpload
            id={uploadId}
            label="Upload Identity Documents"
            description="Upload clear images of your identity documents such as National ID, Passport, Driver's License, Vehicle Registration, etc."
            documentTypes={documentTypeOptions}
            existingDocuments={existingDocuments}
            onDocumentsChange={handleDocumentsChange}
            className="w-full"
          />
        </div>
      </TabsContent>
    );
  }

  function ReviewTab() {
    // Use a snapshot of values instead of form.watch
    const [reviewValues, setReviewValues] = useState(() => form.getValues());
    
    // Update values when tab becomes active
    useEffect(() => {
      if (activeTab === 'review') {
        setReviewValues(form.getValues());
      }
    }, [activeTab]);
    
    return (
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
                  {reviewValues?.name || "—"}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">
                  Email
                </h4>
                <p className="text-base">
                  {reviewValues?.user?.email || "—"}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">
                  Phone
                </h4>
                <p className="text-base">
                  {reviewValues?.user?.phone_number || "—"}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">
                  Type
                </h4>
                <p className="text-base">
                  {reviewValues?.type || "—"}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">
                  Tax ID
                </h4>
                <p className="text-base">
                  {reviewValues?.taxId || "—"}
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
              {reviewValues?.description || "—"}
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
                  Coordinates
                </h4>
                <p className="text-base">
                  {reviewValues?.coordinates ? `${reviewValues.coordinates[0]}, ${reviewValues.coordinates[1]}` : "—"}
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
                  {reviewValues?.vehicleType || "—"}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">
                  Vehicle Plate Number
                </h4>
                <p className="text-base">
                  {reviewValues?.plateNumber || "—"}
                </p>
              </div>
              {verificationSuccess && (
                <div className="mt-2 border-t pt-2">
                  <h4 className="text-sm font-medium text-green-700">
                    Verified Vehicle Details
                  </h4>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-1">
                    <div>
                      <span className="text-xs text-muted-foreground">Make:</span>
                      <p className="text-sm">{reviewValues?.vehicleMake || "—"}</p>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">Model:</span>
                      <p className="text-sm">{reviewValues?.vehicleModel || "—"}</p>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">Year:</span>
                      <p className="text-sm">{reviewValues?.vehicleYear || "—"}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-medium mb-4">
              Commission Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">
                  Cost Per KM
                </h4>
                <p className="text-base">
                  {reviewValues?.cost_per_km || "—"}
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
                  KYC Documents
                </h4>
                {reviewValues?.verification_documents?.length > 0 ? (
                  <ul className="list-disc list-inside">
                    {reviewValues.verification_documents.map((doc, index) => (
                      <li key={index} className="text-sm">
                        {DOCUMENT_TYPES.find(t => t.id === doc.document_type)?.label || doc.document_type}
                        {doc.verification_status && ` (${doc.verification_status})`}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No documents uploaded.
                  </p>
                )}
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              By submitting this application, you confirm that all information provided is accurate and complete.
            </p>
          </div>
        </div>
      </TabsContent>
    );
  }
} 