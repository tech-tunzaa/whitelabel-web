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
import { PhoneInput } from "@/components/ui/phone-input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { Affiliate, VerificationDocument, CreateAffiliatePayload, documentTypes } from "../types";
import { AffiliateFormValues, affiliateSchema } from "../schema"; // Import schema and form values type
import { useAffiliateStore } from "../store";
import { RequiredField } from "@/components/ui/required-field";
import { DocumentUpload, DocumentWithMeta, DocumentType } from "@/components/ui/document-upload";
import { DynamicMapPicker } from "@/components/ui/dynamic-map-picker";

interface AffiliateFormProps {
  initialData?: Affiliate;
  affiliateId?: string;
  vendorId?: string;
}

export function AffiliateForm({ initialData, affiliateId, vendorId }: AffiliateFormProps) {
  const router = useRouter();
  const {
    affiliate,
    loading,
    error,
    createAffiliate,
    updateAffiliate,
    fetchAffiliate,
    uploadKycDocuments,
    setActiveAction,
    setError,
  } = useAffiliateStore();
  const [activeTab, setActiveTab] = useState("basic"); // Changed default tab
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditMode = !!affiliateId;

  // BasicInfoTab Component Definition
  function BasicInfoTab() {
    return (
      <TabsContent value="basic" className="space-y-6 pt-4">
        <Card>
          <CardHeader>
            <CardTitle>Core Affiliate Details</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Affiliate Name <RequiredField /></FormLabel>
                  <FormControl>
                    <Input placeholder="Affiliate Name" {...field} />
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
                  <FormLabel>Email <RequiredField /></FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="email@example.com" {...field} />
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
                  <FormLabel>Phone <RequiredField /></FormLabel>
                  <FormControl>
                    <PhoneInput placeholder="Enter contact phone" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>

          <CardHeader>
            <Separator className="mb-2" />
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Bio (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Tell us a little bit about this affiliate..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Website (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com" {...field} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>

          <CardHeader>
            <Separator className="mb-2" />
            <CardTitle>Social Media Links (Optional)</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <FormField
              control={form.control}
              name="social_media.instagram"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Instagram</FormLabel>
                  <FormControl>
                    <Input placeholder="Instagram URL or username" {...field} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="social_media.twitter"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Twitter</FormLabel>
                  <FormControl>
                    <Input placeholder="Twitter URL or handle" {...field} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="social_media.facebook"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Facebook</FormLabel>
                  <FormControl>
                    <Input placeholder="Facebook Page URL" {...field} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
      </TabsContent>
    );
  }

  function BankingInfoTab() {
    return (
      <TabsContent value="banking" className="space-y-4 pt-4">
        <Card>
          <CardHeader>
            <CardTitle>Banking Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="bank_account.bank_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bank Name <RequiredField /></FormLabel>
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
                    <FormLabel>Account Number <RequiredField /></FormLabel>
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
                    <FormLabel>Account Name <RequiredField /></FormLabel>
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
    );
  }

  function DocumentsTab() {
    return (
      <TabsContent value="documents" className="space-y-4 pt-4">
        <Card>
          <CardHeader>
            <CardTitle>Verification Documents</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Verification Documents</h3>
              <p className="text-sm text-muted-foreground">
                Upload identity and business verification documents.
              </p>
              
              <DocumentUpload
                id="affiliate-documents"
                label="Upload Verification Documents"
                description="Upload identity documents, business licenses, and bank statements."
                documentTypes={documentTypes}
                existingDocuments={form.getValues("verification_documents")?.map((doc: VerificationDocument) => ({
                  document_id: doc.document_id,
                  document_type: doc.document_type,
                  document_url: doc.document_url || '', // Ensure string value
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
          </CardContent>
        </Card>
      </TabsContent>
    );
  }

  function ReviewTab() {
    return (
      <TabsContent value="review" className="space-y-4 pt-4">
        {/* Content for review tab can be added here */}
        <p>Review the information before submitting.</p>
      </TabsContent>
    );
  }

  useEffect(() => {
    if (affiliateId && !initialData) {
      fetchAffiliate(affiliateId);
    }
  }, [affiliateId, initialData, fetchAffiliate]);

  const defaultValues: Partial<AffiliateFormValues> = {
    name: initialData?.name || "",
    email: initialData?.email || "", // Matched to imported schema
    phone: initialData?.phone || "", // Matched to imported schema
    bio: initialData?.bio || "",
    website: initialData?.website || "",
    social_media: {
      instagram: initialData?.social_media?.instagram || "",
      twitter: initialData?.social_media?.twitter || "",
      facebook: initialData?.social_media?.facebook || "",
    },
    bank_account: {
      bank_name: initialData?.bank_account?.bank_name || "",
      account_number: initialData?.bank_account?.account_number || "",
      account_name: initialData?.bank_account?.account_name || "",
      swift_bic: initialData?.bank_account?.swift_bic || "",
      branch_code: initialData?.bank_account?.branch_code || "",
    },
    verification_documents: initialData?.verification_documents || [],
  };

  const form = useForm<AffiliateFormValues>({
    resolver: zodResolver(affiliateSchema),
    defaultValues,
  });

  // Update form when initialData or affiliate changes
  useEffect(() => {
    if (initialData || (isEditMode && affiliate)) {
      const data = initialData || affiliate;
      if (data) {
        form.reset({
          name: data.name || "",
          email: data.email || "", // Matched to imported schema
          phone: data.phone || "", // Matched to imported schema
          bio: data.bio || "",
          website: data.website || "",
          social_media: {
            instagram: data.social_media?.instagram || "",
            twitter: data.social_media?.twitter || "",
            facebook: data.social_media?.facebook || "",
          },
          bank_account: {
            bank_name: data.bank_account?.bank_name || "",
            account_number: data.bank_account?.account_number || "",
            account_name: data.bank_account?.account_name || "",
            swift_bic: data.bank_account?.swift_bic || "",
            branch_code: data.bank_account?.branch_code || "",
          },
          verification_documents: data.verification_documents || [],
          // Reset only fields present in the AffiliateFormValues (derived from imported affiliateSchema)
        });
      }
    }
  }, [initialData, affiliate, isEditMode, form]);

  const onSubmit = async function onSubmit(values: z.infer<typeof affiliateSchema>) {
    setIsSubmitting(true);
    setActiveAction(isEditMode ? "update" : "create");

    const currentTenantId = values.tenant_id || initialData?.tenant_id || "tnt001"; // Ensure robust tenant_id retrieval
    if (!currentTenantId) {
      toast.error("Tenant ID is missing. Cannot proceed.");
      setIsSubmitting(false);
      setActiveAction(null);
      return;
    }
    const headers = { "X-Tenant-ID": currentTenantId };

    const { verification_documents, ...affiliateData } = values;

    try {
      let newOrUpdatedAffiliate: Affiliate | null = null;
      let currentAffiliateId = affiliateId;

      if (isEditMode && currentAffiliateId) {
        // For updates, vendorId might already be part of affiliateData if it's in the schema and form.
        // If not, and if the update endpoint requires it at the top level, it should be added similarly.
        // Assuming affiliateData for update is already complete as per schema.
        console.log("Updating affiliate with payload:", affiliateData, "Headers:", headers);
        newOrUpdatedAffiliate = await updateAffiliate(currentAffiliateId, affiliateData, headers);
      } else {
      // Create mode
      const payloadForCreation: CreateAffiliatePayload = {
          ...affiliateData,
          user_id: "13c94ad0-1071-431a-9d59-93eeee25ca0a",
        };
        console.log("Creating affiliate with payload:", payloadForCreation, "Headers:", headers);
        const created = await createAffiliate(payloadForCreation, headers);
        if (created) {
          newOrUpdatedAffiliate = created;
          currentAffiliateId = created.id;
        }
      }

      if (newOrUpdatedAffiliate && currentAffiliateId) {
        toast.success(
          isEditMode ? "Affiliate updated successfully!" : "Affiliate created successfully!"
        );

        if (verification_documents && verification_documents.length > 0 && currentAffiliateId) {
          setActiveAction("upload_kyc");
          try {
            const documentsToUpload = verification_documents.map(doc => ({
            ...doc,
            document_url: doc.document_url || '', // Ensure document_url is a string
            expires_at: doc.expires_at instanceof Date ? doc.expires_at.toISOString() : undefined, // Convert Date to ISO string
          }));
          await uploadKycDocuments(currentAffiliateId, documentsToUpload, headers);
            toast.success("Verification documents uploaded successfully!");
          } catch (docError: any) {
            console.error("Failed to upload documents:", docError);
            const storeError = useAffiliateStore.getState().error;
            if (storeError && storeError.action === "upload_kyc") {
              // Error already toasted by store's error handler via useEffect
            } else {
              toast.error(`Failed to upload documents: ${docError.message || "Unknown error"}`);
            }
            // Optionally, you might want to stop and not redirect, or redirect with a warning
          }
        }
        router.push(`/dashboard/vendors/affiliates/${currentAffiliateId}`);
      } else {
        // Error should have been handled and toasted by the store's error handling mechanism
        // (e.g., via a useEffect watching store.error)
        // If not, a generic fallback can be added here, but it's better to rely on centralized error display.
        if (!useAffiliateStore.getState().error) {
            toast.error(isEditMode ? "Failed to update affiliate." : "Failed to create affiliate.");
        }
      }
    } catch (error: any) {
      // This catch is a fallback. Store actions should ideally handle their errors.
      console.error("Failed to save affiliate:", error);
      const storeError = useAffiliateStore.getState().error;
      if (storeError && (storeError.action === "create" || storeError.action === "update")){
        // Error already toasted
      } else {
         toast.error(`Error: ${error.message || (isEditMode ? "Failed to update affiliate." : "Failed to create affiliate.")}`);
      }
      setError({ 
        message: error.message || (isEditMode ? "Failed to update affiliate." : "Failed to create affiliate."), 
        details: error, 
        action: isEditMode ? "update" : "create" 
      });
    } finally {
      setIsSubmitting(false);
      setActiveAction(null);
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

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Tabs defaultValue="basic" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="w-full">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="banking">Banking Info</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="review">Review & Submit</TabsTrigger>
          </TabsList>
          <BasicInfoTab />
          <BankingInfoTab />
          <DocumentsTab />
          <ReviewTab />
        </Tabs>
        <div className="mt-2 flex justify-end">
          <Button type="submit" disabled={isSubmitting || loading} className="w-full md:w-auto">
            {isSubmitting ? "Submitting..." : isEditMode ? "Save Changes" : "Create Affiliate"}
          </Button>

        </div>
      </form>
    </Form>
  </div>
  );
}
