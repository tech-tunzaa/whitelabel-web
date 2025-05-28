import React, { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Winga, WingaFormValues } from "../types";
import { useWingaStore } from "../store";
import { DocumentUpload, DocumentWithMeta, DocumentType } from "@/components/ui/document-upload";
import { DynamicMapPicker } from "@/components/ui/dynamic-map-picker";

const wingaFormSchema = z.object({
  tenant_id: z.string().min(1, "Tenant ID is required"),
  vendor_id: z.string().min(1, "Vendor ID is required"),
  affiliate_name: z.string().min(2, "Affiliate name must be at least 2 characters"),
  contact_person: z.string().min(2, "Contact person name must be at least 2 characters"),
  contact_email: z.string().email("Invalid email address"),
  contact_phone: z.string().min(6, "Phone number must be at least 6 characters"),
  website: z.string().optional(),
  address_line1: z.string().min(1, "Address line 1 is required"),
  address_line2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state_province: z.string().min(1, "State/Province is required"),
  postal_code: z.string().min(1, "Postal code is required"),
  country: z.string().min(1, "Country is required"),
  tax_id: z.string().optional(),
  commission_rate: z.string().min(1, "Commission rate is required"),
  bank_account: z.object({
    bank_name: z.string().min(1, "Bank name is required"),
    account_number: z.string().min(1, "Account number is required"),
    account_name: z.string().min(1, "Account name is required"),
    swift_bic: z.string().optional(),
    branch_code: z.string().optional(),
  }),
  verification_documents: z.array(
    z.object({
      id: z.string().optional(),
      document_id: z.string().optional(),
      document_type: z.string(),
      document_url: z.string(),
      file_name: z.string().optional(),
      file_size: z.number().optional(),
      mime_type: z.string().optional(),
      expires_at: z.string().optional(),
      verification_status: z.enum(["pending", "approved", "rejected"]).optional(),
      rejection_reason: z.string().optional(),
      submitted_at: z.string().optional(),
      verified_at: z.string().optional(),
      file_id: z.string().optional(),
    })
  ).optional().default([]),
});

interface WingaFormProps {
  initialData?: Winga | null;
  wingaId?: string;
  vendorId?: string;
}

export function WingaForm({ initialData, wingaId, vendorId }: WingaFormProps) {
  const router = useRouter();
  const { winga, loading, createWinga, updateWinga, fetchWinga } = useWingaStore();
  const [activeTab, setActiveTab] = useState("general");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditMode = !!wingaId;

  useEffect(() => {
    if (wingaId && !initialData) {
      fetchWinga(wingaId);
    }
  }, [wingaId, initialData, fetchWinga]);

  const defaultValues: Partial<WingaFormValues> = {
    tenant_id: initialData?.tenant_id || "tnt001", // Default tenant ID
    vendor_id: initialData?.vendor_id || vendorId || "",
    affiliate_name: initialData?.affiliate_name || "",
    contact_person: initialData?.contact_person || "",
    contact_email: initialData?.contact_email || "",
    contact_phone: initialData?.contact_phone || "",
    website: initialData?.website || "",
    address_line1: initialData?.address_line1 || "",
    address_line2: initialData?.address_line2 || "",
    city: initialData?.city || "",
    state_province: initialData?.state_province || "",
    postal_code: initialData?.postal_code || "",
    country: initialData?.country || "",
    tax_id: initialData?.tax_id || "",
    commission_rate: initialData?.commission_rate?.toString() || "",
    bank_account: {
      bank_name: initialData?.bank_account?.bank_name || "",
      account_number: initialData?.bank_account?.account_number || "",
      account_name: initialData?.bank_account?.account_name || "",
      swift_bic: initialData?.bank_account?.swift_bic || "",
      branch_code: initialData?.bank_account?.branch_code || "",
    },
    verification_documents: initialData?.verification_documents || [],
  };

  const form = useForm<WingaFormValues>({
    resolver: zodResolver(wingaFormSchema),
    defaultValues,
  });

  // Update form when initialData or winga changes
  useEffect(() => {
    if (initialData || (isEditMode && winga)) {
      const data = initialData || winga;
      if (data) {
        form.reset({
          tenant_id: data.tenant_id,
          vendor_id: data.vendor_id,
          affiliate_name: data.affiliate_name,
          contact_person: data.contact_person,
          contact_email: data.contact_email,
          contact_phone: data.contact_phone,
          website: data.website || "",
          address_line1: data.address_line1,
          address_line2: data.address_line2 || "",
          city: data.city,
          state_province: data.state_province,
          postal_code: data.postal_code,
          country: data.country,
          tax_id: data.tax_id || "",
          commission_rate: data.commission_rate?.toString() || "",
          bank_account: {
            bank_name: data.bank_account?.bank_name || "",
            account_number: data.bank_account?.account_number || "",
            account_name: data.bank_account?.account_name || "",
            swift_bic: data.bank_account?.swift_bic || "",
            branch_code: data.bank_account?.branch_code || "",
          },
          verification_documents: data.verification_documents || [],
        });
      }
    }
  }, [initialData, winga, isEditMode, form]);

  const onSubmit = async (values: WingaFormValues) => {
    try {
      setIsSubmitting(true);
      
      if (isEditMode && wingaId) {
        await updateWinga(wingaId, values);
        toast.success("Winga affiliate updated successfully!");
      } else {
        await createWinga(values);
        toast.success("Winga affiliate created successfully!");
      }
      
      router.push("/dashboard/vendors/winga");
    } catch (error: any) {
      console.error("Error submitting form:", error);
      toast.error(error.message || "An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Define document types for the document uploader
  const documentTypes: DocumentType[] = [
    { id: "id_document", name: "Identity Document" },
    { id: "business_license", name: "Business License" },
    { id: "bank_statement", name: "Bank Statement" }
  ];

  // Handler for document changes
  const handleDocumentsChange = (documents: DocumentWithMeta[]) => {
    // Convert DocumentWithMeta to VerificationDocument
    const verificationDocuments = documents.map(doc => ({
      document_id: doc.document_id,
      document_type: doc.document_type,
      document_url: doc.document_url || "",
      file_name: doc.file_name,
      verification_status: doc.verification_status as "pending" | "approved" | "rejected" | undefined,
      rejection_reason: doc.rejection_reason,
      submitted_at: doc.submitted_at,
      // Don't include verified_at as it's not in the DocumentWithMeta type
      expires_at: doc.expires_at,
    }));
    
    form.setValue("verification_documents", verificationDocuments);
  };

  // Handler for address found from map
  const handleAddressFound = (address: {
    address_line1?: string;
    city?: string;
    state_province?: string;
    postal_code?: string;
    country?: string;
  }) => {
    if (address.address_line1) form.setValue("address_line1", address.address_line1);
    if (address.city) form.setValue("city", address.city);
    if (address.state_province) form.setValue("state_province", address.state_province);
    if (address.postal_code) form.setValue("postal_code", address.postal_code);
    if (address.country) form.setValue("country", address.country);
  };
  

  if (loading && isEditMode && !initialData) {
    return <div className="flex justify-center p-8">Loading winga data...</div>;
  }

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="general">General Information</TabsTrigger>
              <TabsTrigger value="address">Address</TabsTrigger>
              <TabsTrigger value="banking">Banking Details</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-4 pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>General Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="vendor_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Vendor ID</FormLabel>
                          <FormControl>
                            <Input placeholder="Vendor ID" {...field} disabled={!!vendorId} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="affiliate_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Affiliate Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Affiliate Name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="contact_person"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contact Person</FormLabel>
                          <FormControl>
                            <Input placeholder="Contact Person" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="contact_email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contact Email</FormLabel>
                          <FormControl>
                            <Input placeholder="Email" type="email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="contact_phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contact Phone</FormLabel>
                          <FormControl>
                            <Input placeholder="Phone" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="website"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Website (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Website" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="commission_rate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Commission Rate (%)</FormLabel>
                          <FormControl>
                            <Input placeholder="5.0" type="number" step="0.1" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="tax_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tax ID (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Tax ID" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="address" className="space-y-4 pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Address Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="address_line1"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address Line 1</FormLabel>
                          <FormControl>
                            <Input placeholder="Address Line 1" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="address_line2"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address Line 2 (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Address Line 2" {...field} />
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
                            <Input placeholder="City" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="state_province"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>State/Province</FormLabel>
                          <FormControl>
                            <Input placeholder="State/Province" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="postal_code"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Postal Code</FormLabel>
                          <FormControl>
                            <Input placeholder="Postal Code" {...field} />
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
                            <Input placeholder="Country" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* MapPicker for coordinates */}
                    <div className="col-span-2 mt-6">
                      <FormField
                        control={form.control}
                        name="coordinates"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Location Coordinates</FormLabel>
                            <FormControl>
                              <DynamicMapPicker
                                value={field.value as [number, number] | null}
                                onChange={field.onChange}
                                onAddressFound={handleAddressFound}
                                height="350px"
                              />
                            </FormControl>
                            <FormDescription className="text-sm text-muted-foreground mt-2">
                              Click on the map to set location or use the "Use Current Location" button.
                              This will automatically fill the address fields.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="banking" className="space-y-4 pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Banking Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="bank_account.bank_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bank Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Bank Name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="bank_account.account_number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Account Number</FormLabel>
                          <FormControl>
                            <Input placeholder="Account Number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="bank_account.account_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Account Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Account Name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="bank_account.swift_bic"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SWIFT/BIC (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="SWIFT/BIC" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="bank_account.branch_code"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Branch Code (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Branch Code" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="documents" className="space-y-4 pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Verification Documents</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Document uploader for all document types */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Verification Documents</h3>
                    <p className="text-sm text-muted-foreground">
                      Upload identity and business verification documents.
                    </p>
                    
                    <DocumentUpload
                      id="winga-documents"
                      label="Upload Verification Documents"
                      description="Upload identity documents, business licenses, and bank statements."
                      documentTypes={documentTypes}
                      existingDocuments={form.getValues("verification_documents")?.map(doc => ({
                        document_id: doc.document_id,
                        document_type: doc.document_type,
                        document_url: doc.document_url,
                        file_name: doc.file_name,
                        expires_at: doc.expires_at,
                        verification_status: doc.verification_status,
                        rejection_reason: doc.rejection_reason,
                        submitted_at: doc.submitted_at
                      })) || []}
                      onDocumentsChange={handleDocumentsChange}
                    />
                  </div>
                  
                  <Separator />

                  {/* Note: Documents are now managed by the DocumentUpload component */}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/dashboard/vendors/winga")}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "Saving..."
                : isEditMode
                ? "Update Winga"
                : "Create Winga"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
