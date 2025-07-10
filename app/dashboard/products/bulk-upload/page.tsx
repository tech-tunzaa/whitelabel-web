"use client";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useProductStore } from "@/features/products/store";
import { useVendorStore } from "@/features/vendors/store";
import { BulkUploadDropzone } from "@/features/products/components/bulk-upload-dropzone";
import { BulkUploadStatus } from "@/features/products/components/bulk-upload-status";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Store, HelpCircle, FileDown, History, User, FileUp } from "lucide-react";
import { toast } from "sonner";
import { BulkUploadDocsModal } from "@/features/products/components/bulk-upload-docs-modal";

export default function BulkUploadPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const tenantId = (session?.user as any)?.tenant_id;
  const [selectedVendorId, setSelectedVendorId] = useState<string>("");
  const [storeId, setStoreId] = useState<string>("");
  const [batches, setBatches] = useState<any[]>([]);
  const [loadingBatches, setLoadingBatches] = useState(false);
  const [status, setStatus] = useState<"idle" | "uploading" | "processing" | "error" | "complete">("idle");
  const [errors, setErrors] = useState<string[]>([]);
  const [batchId, setBatchId] = useState<string | undefined>(undefined);
  const [showStatus, setShowStatus] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { bulkUploadProducts, fetchBulkUploadStatus, fetchBulkUploadBatches, uploadBulkProducts, fetchBulkUploadTemplateCSV } = useProductStore();
  const { vendors, fetchVendors, fetchVendor, loading: loadingVendors } = useVendorStore();
  const [selectedVendor, setSelectedVendor] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("upload");
  const [docsOpen, setDocsOpen] = useState(false);
  const [clearFileSignal, setClearFileSignal] = useState(0);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [responseStatusCode, setResponseStatusCode] = useState<number | undefined>(undefined);

  // Fetch vendors on mount
  useEffect(() => {
    if (tenantId) {
      fetchVendors(undefined, { 'X-Tenant-ID': tenantId });
    }
  }, [fetchVendors, tenantId]);

  // When vendor is selected, fetch vendor details and set storeId
  useEffect(() => {
    if (selectedVendorId && tenantId) {
      fetchVendor(selectedVendorId, { 'X-Tenant-ID': tenantId }).then((vendor) => {
        setSelectedVendor(vendor);
        if (vendor.stores && vendor.stores.length > 0) {
          setStoreId(vendor.stores[0].store_id || "");
        } else {
          setStoreId("");
        }
      });
    } else {
      setSelectedVendor(null);
      setStoreId("");
    }
  }, [selectedVendorId, fetchVendor, tenantId]);

  // Fetch batches when vendor or store changes
  useEffect(() => {
    if (selectedVendorId && storeId && tenantId) {
      setLoadingBatches(true);
      fetchBulkUploadBatches(selectedVendorId, storeId, { 'X-Tenant-ID': tenantId }).then((data) => {
        setBatches(data);
        setLoadingBatches(false);
      });
    } else {
      setBatches([]);
    }
  }, [selectedVendorId, storeId, fetchBulkUploadBatches, tenantId]);

  const handleFileUpload = async (file: File) => {
    setStatus("uploading");
    setErrors([]);
    setBatchId(undefined);
    setUploading(true);
    setShowStatus(true);
    setUploadResult(null);
    setResponseStatusCode(undefined);
    try {
      // Use direct upload for file
      const result = await uploadBulkProducts(
        file,
        selectedVendorId,
        storeId,
        tenantId
      );
      // If error response (no batch_id and has detail/error/message)
      if ((!result.batch_id) && (result.detail || result.error || result.message)) {
        setUploadResult(result);
        setResponseStatusCode(400); // or use actual status if available
        setStatus("error");
        setErrors([]); // Don't set errors array to avoid duplicate error display
        return;
      }
      setUploadResult(result);
      setResponseStatusCode(undefined);
      if (result.errors || result.error || result.message || result.detail) {
        setStatus("error");
        // Prefer array of errors, else show error/message/detail as array
        if (Array.isArray(result.errors) && result.errors.length > 0) {
          setErrors(result.errors);
        } else if (result.error) {
          setErrors([result.error]);
        } else if (result.message) {
          setErrors([result.message]);
        } else if (result.detail) {
          setErrors([result.detail]);
        } else {
          setErrors(["Unknown error occurred."]);
        }
      } else if (result.batch_id) {
        setStatus("processing");
        setBatchId(result.batch_id);
        setTimeout(async () => {
          try {
            const batch = await fetchBulkUploadStatus(result.batch_id, { 'X-Tenant-ID': tenantId });
            setUploadResult(batch);
            setResponseStatusCode(undefined);
            if (batch && batch.status === "complete") {
              setStatus("complete");
            } else {
              setStatus("processing");
            }
          } catch {
            setStatus("processing");
          }
        }, 2000);
      } else {
        setStatus("error");
        setErrors(["Unknown error occurred."]);
      }
    } catch (err: any) {
      setStatus("error");
      setErrors([]); // Don't set errors array to avoid duplicate error display
      let backendDetail = "Upload failed";
      if (err?.response?.data?.detail) {
        backendDetail = err.response.data.detail;
      } else if (err?.response?.data?.error) {
        backendDetail = err.response.data.error;
      } else if (err?.message) {
        backendDetail = err.message;
      }
      setUploadResult({ detail: backendDetail });
      setResponseStatusCode(err?.response?.status || 400);
    } finally {
      setUploading(false);
    }
  };

  const handleRetry = () => {
    setStatus("idle");
    setErrors([]);
    setBatchId(undefined);
    setShowStatus(false);
    setUploadResult(null);
    setResponseStatusCode(undefined);
    setClearFileSignal((c) => c + 1); // trigger file clear in dropzone
  };

  const vendorList = Array.isArray(vendors?.items) ? vendors.items : vendors || [];

  // Helper for status badge
  const renderStatusBadge = (status: string) => {
    let variant: any = "secondary";
    if (status === "complete") variant = "success";
    else if (status === "processing" || status === "uploading") variant = "warning";
    else if (status === "error") variant = "destructive";
    return <Badge variant={variant} className="capitalize animate-fade-in">{status}</Badge>;
  };

  // Download sample CSV handler (fetches from API and triggers download)
  const handleDownloadSample = async () => {
    try {
      const csv = await fetchBulkUploadTemplateCSV({ 'X-Tenant-ID': tenantId });
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'bulk-upload-template.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      toast.error('Failed to download template. Please try again.');
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-background to-muted/40 shadow-sm sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/dashboard/products")}
            className="shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Button>
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Bulk Product Upload</h1>
              <p className="text-muted-foreground text-base mt-1">
                Upload and manage product batches for your vendors.
              </p>
            </div>
          </div>
        </div>
      </div>
      {/* Main Content */}
      <div className="p-6 flex-1 overflow-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Section */}
          <div className="space-y-6 order-2 lg:order-1">
            {/* Vendor Selection */}
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Store className="h-5 w-5" /> Select Vendor
                </CardTitle>
                <CardDescription>Choose a vendor to upload products for.</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingVendors ? (
                  <Spinner />
                ) : (
                  <Select
                    value={selectedVendorId}
                    onValueChange={setSelectedVendorId}
                    disabled={loadingVendors}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Choose a vendor..." />
                    </SelectTrigger>
                    <SelectContent>
                      {vendorList.length > 0 ? (
                        vendorList
                          .filter((vendor: any) => vendor.vendor_id && vendor.vendor_id !== "")
                          .map((vendor: any) => (
                            <SelectItem key={vendor.vendor_id} value={vendor.vendor_id!}>
                              {vendor.business_name}
                            </SelectItem>
                          ))
                      ) : (
                        <SelectItem value="no-vendors" disabled>
                          No vendors found
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                )}
              </CardContent>
            </Card>
            {/* Vendor/Store Info */}
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" /> Vendor & Store
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedVendor ? (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Vendor</span>
                      <span className="text-sm font-medium">{selectedVendor.business_name}</span>
                    </div>
                    {selectedVendor.stores && selectedVendor.stores.length > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Store</span>
                        <span className="text-sm font-medium">{selectedVendor.stores[0].store_name}</span>
                      </div>
                    )}
                    {selectedVendor.email && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Email</span>
                        <span className="text-sm font-medium">{selectedVendor.email}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-muted-foreground text-center">Select a vendor to see details.</div>
                )}
              </CardContent>
            </Card>
            {/* Need Help Card */}
            <Card className="shadow-md bg-muted/40">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-primary" /> Need Help?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-2">Check our documentation or contact support for assistance with bulk uploads.</p>
                <Button variant="secondary" className="w-full" onClick={() => setDocsOpen(true)}>
                  View Bulk Upload Guide
                </Button>
              </CardContent>
            </Card>
          </div>
          {/* Main Section */}
          <div className="lg:col-span-3 space-y-8 order-1 lg:order-2">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full">
                <TabsTrigger value="upload" className="flex items-center gap-2">
                  <FileUp className="h-4 w-4" /> Upload
                </TabsTrigger>
                <TabsTrigger value="history" className="flex items-center gap-2">
                  <History className="h-4 w-4" /> History
                </TabsTrigger>
              </TabsList>
              <TabsContent value="upload" className="space-y-6 animate-fade-in">
                <Card className="shadow-lg">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Bulk Upload</CardTitle>
                      <CardDescription>Upload a CSV file to add products in bulk.</CardDescription>
                    </div>
                    <Button variant="outline" size="sm" onClick={handleDownloadSample} className="gap-2">
                      <FileDown className="h-4 w-4" /> Download CSV Template
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <BulkUploadDropzone
                      onUpload={handleFileUpload}
                      uploading={uploading}
                      disabled={
                        !selectedVendorId || (selectedVendor && (!selectedVendor.stores || selectedVendor.stores.length === 0))
                      }
                      disabledReason={
                        !selectedVendorId
                          ? 'Select a vendor to enable upload'
                          : (selectedVendor && (!selectedVendor.stores || selectedVendor.stores.length === 0))
                            ? 'Selected vendor has no store. Please add a store first.'
                            : undefined
                      }
                      clearFileSignal={clearFileSignal}
                    />
                    {showStatus && (
                      <div className="transition-all duration-300 animate-fade-in">
                        <BulkUploadStatus status={status} errors={errors} onRetry={handleRetry} batchId={batchId} result={uploadResult} responseStatusCode={responseStatusCode} />
                      </div>
                    )}
                    {status === "complete" && (
                      <div className="flex justify-end mt-4">
                        <Button onClick={handleRetry} variant="outline">Start New Upload</Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="history" className="space-y-6 animate-fade-in">
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle>Existing Batches</CardTitle>
                    <CardDescription>Review previous bulk uploads for this vendor/store.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loadingBatches ? (
                      <Spinner />
                    ) : batches.length === 0 ? (
                      <div className="text-muted-foreground text-center">No batches found for this vendor/store.</div>
                    ) : (
                      <div className="overflow-x-auto rounded-lg border">
                        <table className="min-w-full text-sm bg-background">
                          <thead className="sticky top-0 z-10 bg-muted/60">
                            <tr>
                              <th className="px-3 py-2 text-left font-semibold">Batch ID</th>
                              <th className="px-3 py-2 text-left font-semibold">Status</th>
                              <th className="px-3 py-2 text-left font-semibold">Created</th>
                              <th className="px-3 py-2 text-left font-semibold">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {batches.map((batch, idx) => (
                              <tr key={batch.batch_id} className={`border-t transition-colors ${idx % 2 === 0 ? 'bg-muted/10' : ''} hover:bg-accent/40`}>
                                <td className="px-3 py-2 font-mono">{batch.batch_id}</td>
                                <td className="px-3 py-2">{renderStatusBadge(batch.status)}</td>
                                <td className="px-3 py-2">{batch.created_at ? new Date(batch.created_at).toLocaleString() : "-"}</td>
                                <td className="px-3 py-2 flex gap-2">
                                  <Button size="sm" variant="outline" className="mr-2" title="View details">View</Button>
                                  {batch.status === "error" && (
                                    <Button size="sm" variant="destructive" title="Download error report">Download Errors</Button>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
      {/* Bulk Upload Documentation Modal */}
      <BulkUploadDocsModal open={docsOpen} onOpenChange={setDocsOpen} onDownloadTemplate={handleDownloadSample} />
    </div>
  );
}
