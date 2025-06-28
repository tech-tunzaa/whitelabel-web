"use client";

import { useEffect, useState, useRef, use } from "react";
import { useRouter } from "next/navigation";

// Re-importing to resolve linter issues
import {
  ArrowLeft,
  Check,
  Edit,
  ExternalLink,
  Store,
  Trash2,
  Upload,
  X,
  Package,
  Eye,
  EyeOff,
  Ban,
} from "lucide-react";
import { format } from "date-fns";
import { useSession } from "next-auth/react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Spinner } from "@/components/ui/spinner";
import { ErrorCard } from "@/components/ui/error-card";
import { FilePreviewModal } from "@/components/ui/file-preview-modal";
import { toast } from "sonner";

import { useProductStore } from "@/features/products/store";
import { Product } from "@/features/products/types";


import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

const InfoCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <Card>
    <CardHeader>
      <CardTitle className="text-lg">{title}</CardTitle>
    </CardHeader>
    <CardContent>{children}</CardContent>
  </Card>
);

const InfoItem = ({ label, value, children }: { label: string; value?: React.ReactNode; children?: React.ReactNode }) => (
  <div className="flex justify-between items-start py-2 border-b border-border/50 last:border-b-0">
    <span className="text-sm text-muted-foreground font-medium">{label}</span>
    {value ? <span className="text-sm text-right">{value}</span> : children}
  </div>
);

export default function ProductPage({ params }: ProductPageProps) {
  const router = useRouter();
  const { id } = use(params);
  const { data: session } = useSession();
  const tenantId = (session?.user as any)?.tenant_id || "";

  // Stores
  const {
    product,
    loading: productLoading,
    error: productError,
    fetchProduct,
    updateProduct,
    deleteProduct,
  } = useProductStore();

  // UI States
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionType, setRejectionType] = useState("product_quality");
  const [customReason, setCustomReason] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  // File Preview States
  const [previewFile, setPreviewFile] = useState<string | null>(null);

  // Define tenant headers
  const tenantHeaders = {
    "X-Tenant-ID": tenantId,
  };

  useEffect(() => {
    if (id && tenantId) {
      fetchProduct(id, tenantHeaders);
    }
  }, [id, tenantId, fetchProduct]);

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "approved":
      case "active":
        return "success";
      case "pending":
        return "warning";
      case "rejected":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const getBadgeStyles = (status: string) => {
    switch (status) {
      case "approved":
      case "active":
        return "bg-green-500 hover:bg-green-600 text-white";
      case "pending":
        return "bg-amber-500 hover:bg-amber-600 text-white";
      case "rejected":
        return "bg-red-500 hover:bg-red-600 text-white";
      default:
        return "";
    }
  };

  // Helper to safely access product properties with appropriate fallbacks
  const productStatus =
    product?.verification_status || (product?.is_active ? "active" : "pending");

  
  
  const store = product?.store;
  const productImageUrl =
    product?.images?.[0]?.url || "/placeholder-product.svg";

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "Not specified";
    try {
      return format(new Date(dateString), "MMMM d, yyyy");
    } catch (e) {
      return "Invalid date";
    }
  };

  // Handle image preview
  const handlePreviewImage = (url: string) => {
    setPreviewFile(url);
  };

  // Handle product updates
  const handleUpdate = (updates: Partial<Product>) => {
    if (!product?.product_id) {
      toast.error("Product information is not available.");
      return;
    }

    const updateAction = async () => {
      try {
        await updateProduct(product.product_id, updates, tenantHeaders);
        // Refetch product data to ensure UI is up-to-date
        await fetchProduct(id, tenantHeaders);
      } catch (err) {
        // The error will be handled by toast.promise
        console.error("Update failed:", err);
        throw err;
      }
    };

    toast.promise(updateAction(), {
      loading: "Applying updates...",
      success: "Product has been updated successfully!",
      error: "Could not apply updates.",
    });
  };

  // Handle rejection confirmation
  const handleRejectConfirm = () => {
    if (rejectionType === "other" && !customReason.trim()) {
      toast.error("Please provide a reason for rejection.");
      return;
    }

    const reason =
      rejectionType === "other"
        ? customReason
        : getRejectionReasonText(rejectionType);

    setShowRejectDialog(false);
    handleUpdate({ verification_status: "rejected", rejection_reason: reason });
    setCustomReason("");
  };

  // Helper to get rejection reason text based on type
  const getRejectionReasonText = (type: string) => {
    switch (type) {
      case "product_quality":
        return "Product quality does not meet our standards";
      case "inadequate_information":
        return "Product information is incomplete or incorrect";
      case "pricing_issues":
        return "Product pricing issues need to be resolved";
      case "policy_violation":
        return "Product violates our marketplace policies";
      default:
        return customReason;
    }
  };

  // Handle product delete
  const handleDeleteProduct = async () => {
    if (!product?.product_id) return;

    try {
      setIsDeleting(true);
      await deleteProduct(product.product_id, tenantHeaders);
      toast.success(`Product "${product.name}" has been deleted.`);
      router.push("/dashboard/products");
    } catch (err) {
      toast.error("Failed to delete the product.");
      console.error("Deletion failed:", err);
    } finally {
      setIsDeleting(false);
      setConfirmDelete(false);
    }
  };

  const formatPrice = (price: number | undefined) => {
    if (price === undefined || price === null) return "N/A";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "TZS",
    }).format(price);
  };

  const getStockStatus = (product: Product | null | undefined) => {
    if (!product || !product.inventory_tracking) {
      return { text: "Not Tracked", variant: "secondary" as const };
    }

    const { inventory_quantity: quantity, low_stock_threshold: threshold } = product;

    if (typeof quantity !== "number") {
      return { text: "N/A", variant: "secondary" as const };
    }

    if (quantity <= 0) {
      return { text: "Out of Stock", variant: "destructive" as const };
    }

    if (typeof threshold === "number" && quantity <= threshold) {
      return { text: "Low Stock", variant: "warning" as const };
    }

    return { text: "In Stock", variant: "success" as const };
  };

  if (productLoading) {
    return <Spinner />;
  }

  if (!product) {
    return (
      <ErrorCard
        title="Failed to load product"
        error={productError || { message: "Product not found", status: "404" }}
        buttonText="Back to Products"
        buttonAction={() => router.push("/dashboard/products")}
        buttonIcon={ArrowLeft}
      />
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
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
            <Avatar className="h-10 w-10">
              <AvatarImage src={productImageUrl} alt={product.name} />
              <AvatarFallback>
                <Package className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>

            <div>
              <div className="flex items-center gap-4 mb-1">
                <h1 className="text-2xl font-bold tracking-tight">{product.name}</h1>
                <div className="flex items-center gap-2">
                  <Badge variant={getStatusVariant(product.verification_status)}>
                    {product.verification_status}
                  </Badge>
                  <Badge variant={product.is_active ? "success" : "secondary"}>
                    {product.is_active ? "Published" : "Draft"}
                  </Badge>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Product ID: {product.product_id}
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/dashboard/products/${id}/edit`)}
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 overflow-auto space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {/* Main details */}
          <div className="md:col-span-2 lg:col-span-3 space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="shipping">Shipping & Variants</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6 mt-6">
                <InfoCard title="Product Details">
                  {product.short_description && (
                    <div className="mb-4 pb-4 border-b">
                      <h4 className="font-semibold text-sm mb-2">Short Description</h4>
                      <p className="text-sm text-muted-foreground">{product.short_description}</p>
                    </div>
                  )}
                  <div
                    className="prose prose-sm dark:prose-invert max-w-none mb-10"
                    dangerouslySetInnerHTML={{ __html: product.description || "<p>No description provided.</p>" }}
                  ></div>

                  <InfoItem label="Categories">
                    <div className="flex flex-wrap gap-2 justify-end max-w-xs">
                      {product.categories?.map((cat: any) => (
                        <Badge
                          key={cat.category_id}
                          variant="secondary"
                          className="cursor-pointer hover:bg-muted"
                          onClick={() => router.push(`/dashboard/categories/${cat.category_id}`)}
                        >
                          {cat.name}
                        </Badge>
                      ))}
                    </div>
                  </InfoItem>
                  <InfoItem label="Tags">
                    <div className="flex flex-wrap gap-2 justify-end max-w-xs">
                      {product.tags?.map((tag: string, index: number) => (
                        <Badge key={index} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </InfoItem>
                </InfoCard>

                <div className="grid grid-cols-2 gap-4">
                  <InfoCard title="Pricing">
                    <InfoItem label="Base Price" value={formatPrice(product.pricing.base_price)}/>
                    <InfoItem label="Sale Price" value={formatPrice(product.pricing.sale_price)}/>
                    <InfoItem label="Cost Price" value={formatPrice(product.cost_price)}/>
                    <InfoItem label="Effective Price" value={formatPrice(product.pricing.effective_price)} />
                    {product.pricing.has_discount && (
                      <InfoItem label="Discount">
                          <Badge variant="success">
                            {product.pricing.discount_percentage}%
                          </Badge>
                      </InfoItem>
                    )}
                  </InfoCard>

                  <InfoCard title="Inventory">
                    <InfoItem label="SKU" value={product.sku || 'N/A'} />
                    <InfoItem label="Barcode" value={product.barcode || 'N/A'} />
                    <InfoItem label="Quantity" value={product.inventory_quantity} />
                    {product.inventory_tracking && (
                        <InfoItem label="Low Stock Threshold" value={product.low_stock_threshold} />
                    )}
                  </InfoCard>
                </div>

                <InfoCard title="Product Images">
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
                    {product.images?.map((image: any, index: number) => (
                      <div
                        key={index}
                        className="relative aspect-square rounded-lg overflow-hidden cursor-pointer group"
                        onClick={() => handlePreviewImage(image.url)}
                      >
                        <img
                          src={image.url}
                          alt={image.alt || `Product image ${index + 1}`}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                        {image.is_primary && (
                          <div className="absolute top-1 right-1 bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded-full">
                            Primary
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </InfoCard>
              </TabsContent>

              <TabsContent value="shipping" className="space-y-6 mt-6">
                 <InfoCard title="Shipping">
                    <InfoItem label="Requires Shipping" value={product.requires_shipping ? 'Yes' : 'No'} />
                    <InfoItem label="Weight" value={`${product.weight || 0} kg`} />
                    <InfoItem label="Dimensions (L x W x H)">
                      {product.dimensions ? 
                        `${product.dimensions.length} x ${product.dimensions.width} x ${product.dimensions.height} cm`
                        : 'N/A'}
                    </InfoItem>
                 </InfoCard>

                 <InfoCard title="Variants">
                    <InfoItem label="Has Variants" value={product.has_variants ? 'Yes' : 'No'} />
                    {product.has_variants && product.variants?.length > 0 && (
                      <div className="mt-4">
                        {product.variants.map((variant: any, index: number) => (
                          <div key={index} className="p-3 border rounded-md mb-2">
                            <p className="font-semibold">{variant.name}: {variant.value}</p>
                            <p className="text-sm text-muted-foreground">Price: {formatPrice(variant.price)}</p>
                            <p className="text-sm text-muted-foreground">SKU: {variant.sku || 'N/A'}</p>
                          </div>
                        ))}
                      </div>
                    )}
                 </InfoCard>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Product Status Card */}
            <Card>
              <CardHeader>
                <CardTitle>Product Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Approval Status
                    </span>
                    <Badge variant={getStatusVariant(product.verification_status)}>
                      {product.verification_status}
                    </Badge>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Visibility
                    </span>
                    <Badge variant={product.is_active ? "success" : "secondary"}>
                      {product.is_active ? "Published" : "Draft"}
                    </Badge>
                  </div>
                  
                  {product.inventory_tracking ? (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        Stock Status
                      </span>
                      <Badge variant={getStockStatus(product).variant}>
                        {getStockStatus(product).text}
                      </Badge>
                    </div>
                  ) : null}

                  <Separator />

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Created On
                    </span>
                    <span className="text-sm font-medium">
                      {formatDate(product.created_at)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Last Updated
                    </span>
                    <span className="text-sm font-medium">
                      {formatDate(product.updated_at)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Vendor & Store Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Store className="h-5 w-5 mr-2" />
                  Vendor & Store
                </CardTitle>
              </CardHeader>
              <CardContent>
                {store && (
                  <>
                    <InfoItem
                      label="Store Name"
                      value={store.store_name}
                    />
                    {store.general_policy && (
                        <InfoItem label="General Policy">
                            <Button variant="link" className="p-0 h-auto justify-end" onClick={() => store.general_policy && setPreviewFile(store.general_policy)}>
                                View Policy
                            </Button>
                        </InfoItem>
                    )}
                    {store.return_policy && (
                        <InfoItem label="Return Policy">
                            <Button variant="link" className="p-0 h-auto justify-end" onClick={() => store.return_policy && setPreviewFile(store.return_policy)}>
                                View Policy
                            </Button>
                        </InfoItem>
                    )}
                    {store.shipping_policy && (
                        <InfoItem label="Shipping Policy">
                            <Button variant="link" className="p-0 h-auto justify-end" onClick={() => store.shipping_policy && setPreviewFile(store.shipping_policy)}>
                                View Policy
                            </Button>
                        </InfoItem>
                    )}
                  </>
                )}
              </CardContent>
              {product?.vendor_id && (
                <CardFooter>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => router.push(`/dashboard/vendors/${product.vendor_id}`)}
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View Vendor Details
                  </Button>
                </CardFooter>
              )}
            </Card>

            {/* Actions Card */}
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
                <CardDescription>
                  Manage product status and visibility.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {product.verification_status === "pending" && (
                  <>
                    <Button
                      className="w-full"
                      onClick={() =>
                        handleUpdate({ verification_status: "approved" })
                      }
                      disabled={productLoading}
                    >
                      {productLoading ? (
                        <Spinner className="mr-2 h-4 w-4" />
                      ) : (
                        <Check className="mr-2 h-4 w-4" />
                      )}
                      Approve
                    </Button>
                    <Button
                      className="w-full"
                      variant="destructive"
                      onClick={() => setShowRejectDialog(true)}
                      disabled={productLoading}
                    >
                      <X className="mr-2 h-4 w-4" /> Reject
                    </Button>
                  </>
                )}

                {product.verification_status === "approved" && (
                  <>
                    <Button
                      className="w-full"
                      variant="outline"
                      onClick={() =>
                        handleUpdate({ is_active: !product.is_active })
                      }
                      disabled={productLoading}
                    >
                      {productLoading ? (
                        <Spinner className="mr-2 h-4 w-4" />
                      ) : product.is_active ? (
                        <EyeOff className="mr-2 h-4 w-4" />
                      ) : (
                        <Eye className="mr-2 h-4 w-4" />
                      )}
                      {product.is_active ? "Unpublish" : "Publish"}
                    </Button>
                    <Button
                      className="w-full"
                      variant="outline"
                      onClick={() =>
                        handleUpdate({ verification_status: "suspended" })
                      }
                      disabled={productLoading}
                    >
                      {productLoading ? (
                        <Spinner className="mr-2 h-4 w-4" />
                      ) : (
                        <Ban className="mr-2 h-4 w-4" />
                      )}
                      Suspend
                    </Button>
                  </>
                )}

                {(product.verification_status === "rejected" || product.verification_status === "suspended") && (
                  <Button
                    className="w-full"
                    onClick={() =>
                      handleUpdate({ verification_status: "approved" })
                    }
                    disabled={productLoading}
                  >
                    {productLoading ? (
                      <Spinner className="mr-2 h-4 w-4" />
                    ) : (
                      <Check className="mr-2 h-4 w-4" />
                    )}
                    Re-approve
                  </Button>
                )}

                <Separator className="my-3" />

                <div className="space-y-2">
                  {!confirmDelete ? (
                    <Button
                      variant="outline"
                      className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => setConfirmDelete(true)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Product
                    </Button>
                  ) : (
                    <div className="p-3 border border-red-200 rounded-md bg-red-50">
                      <p className="text-sm text-red-800 mb-3">
                        Are you sure? This action cannot be undone.
                      </p>
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setConfirmDelete(false)}
                          disabled={isDeleting}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={handleDeleteProduct}
                          disabled={isDeleting}
                        >
                          {isDeleting && <Spinner className="mr-2 h-3 w-3" />}
                          Confirm Delete
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Image Preview Modal */}
      <FilePreviewModal
        src={previewFile || ""}
        alt="File Preview"
        isOpen={!!previewFile}
        onClose={() => setPreviewFile(null)}
      />

      {/* Rejection Dialog */}
      <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Product</AlertDialogTitle>
            <AlertDialogDescription>
              Please provide a reason for rejecting this product. This will be
              visible to the vendor.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="py-4">
            <RadioGroup value={rejectionType} onValueChange={setRejectionType}>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem
                    value="product_quality"
                    id="product_quality"
                  />
                  <Label htmlFor="product_quality">
                    Product quality issues
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem
                    value="inadequate_information"
                    id="inadequate_information"
                  />
                  <Label htmlFor="inadequate_information">
                    Inadequate product information
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="pricing_issues" id="pricing_issues" />
                  <Label htmlFor="pricing_issues">Pricing issues</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem
                    value="policy_violation"
                    id="policy_violation"
                  />
                  <Label htmlFor="policy_violation">Policy violation</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="other" id="other" />
                  <Label htmlFor="other">Other (specify below)</Label>
                </div>

                {rejectionType === "other" && (
                  <Textarea
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    placeholder="Please provide specific reason for rejection..."
                    className="mt-2"
                  />
                )}
              </div>
            </RadioGroup>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleRejectConfirm();
              }}
              disabled={rejectionType === "other" && !customReason.trim()}
            >
              {productLoading ? <Spinner className="mr-2 h-4 w-4" /> : null}
              Reject Product
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
