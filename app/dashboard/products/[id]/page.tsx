"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Check,
  X,
  Edit,
  Store,
  Package,
  Tag,
  AlertCircle,
  Boxes,
  ShoppingCart,
  BarChart,
  FileText,
  CreditCard,
  Settings,
  Truck,
  RefreshCw,
  Trash2,
  ImageIcon
} from "lucide-react";
import { format } from "date-fns";
import { useSession } from "next-auth/react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
  CardDescription
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Spinner } from "@/components/ui/spinner";
import { ErrorCard } from "@/components/ui/error-card";
import { FilePreviewModal } from "@/components/ui/file-preview-modal";
import { toast } from "sonner";

import { useProductStore } from "@/features/products/store";
import { useCategoryStore } from "@/features/categories/store";
import { useVendorStore } from "@/features/vendors/store";

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
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ProductPageProps {
  params: {
    id: string;
  };
}

export default function ProductPage({ params }: ProductPageProps) {
  const router = useRouter();
  const { id } = params;
  const { data: session } = useSession();
  const tenantId = (session?.user as any)?.tenant_id || "";
  
  // Stores
  const { fetchProduct, updateProductStatus, deleteProduct } = useProductStore();
  const { categories, fetchCategories } = useCategoryStore();
  const { vendors, fetchVendors } = useVendorStore();
  
  // State
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  
  // UI States
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionType, setRejectionType] = useState("product_quality");
  const [customReason, setCustomReason] = useState("");
  
  // Image Preview States
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Define tenant headers
  const tenantHeaders = {
    "X-Tenant-ID": tenantId || "4c56d0c3-55d9-495b-ae26-0d922d430a42",
  };

  // Use ref to prevent duplicate API calls
  const fetchRequestRef = useRef(false);

  useEffect(() => {
    // Only fetch if not already fetched
    if (!fetchRequestRef.current) {
      fetchRequestRef.current = true;
      loadData();
    }
  }, [id]);
  
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch product
      const productData = await fetchProduct(id, tenantHeaders);
      setProduct(productData);
      
      // Fetch related data
      fetchCategories(undefined, tenantHeaders);
      fetchVendors(undefined, tenantHeaders);
    } catch (err) {
      console.error("Error fetching product:", err);
      setError("Failed to load product details");
    } finally {
      setLoading(false);
    }
  };

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
  const productStatus = product?.verification_status || (product?.is_active ? "active" : "pending");
  const productVendor = vendors.find(v => v.vendor_id === product?.vendor_id);
  const productImageUrl = product?.images?.[0]?.url || "/placeholder-product.svg";

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
    setPreviewImage(url);
  };

  // Handle status change
  const handleStatusChange = async (status: string) => {
    try {
      setIsUpdating(true);
      await updateProductStatus(id, status, tenantHeaders);
      toast.success(`Product status updated to ${status} successfully`);
      // Refresh the product data
      loadData();
    } catch (error) {
      toast.error("Failed to update product status");
      console.error(error);
    } finally {
      setIsUpdating(false);
    }
  };
  
  // Handle rejection confirmation
  const handleRejectConfirm = async () => {
    try {
      setIsUpdating(true);
      
      // Prepare rejection reason
      let finalReason = rejectionType === "other" 
        ? customReason 
        : getRejectionReasonText(rejectionType);
      
      await updateProductStatus(id, "rejected", tenantHeaders, finalReason);
      toast.success("Product rejected successfully");
      setShowRejectDialog(false);
      
      // Refresh the product data
      loadData();
    } catch (error) {
      toast.error("Failed to reject product");
      console.error(error);
    } finally {
      setIsUpdating(false);
    }
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
    try {
      setIsDeleting(true);
      await deleteProduct(id, tenantHeaders);
      toast.success("Product deleted successfully");
      
      // Redirect back to products list
      router.push("/dashboard/products");
    } catch (error) {
      toast.error("Failed to delete product");
      console.error(error);
    } finally {
      setIsDeleting(false);
      setConfirmDelete(false);
    }
  };

  const getCategoryNames = (categoryIds: string[]) => {
    if (!categories || !categoryIds || !categoryIds.length) return "None";
    
    return (
      <div className="flex flex-wrap gap-2">
        {categoryIds.map(id => {
          const category = categories.find(c => (c._id === id || c.category_id === id));
          if (!category) return null;
          
          return (
            <Badge 
              key={id}
              variant="secondary"
              className="hover:bg-secondary/80 cursor-pointer"
              onClick={() => router.push(`/dashboard/categories/${category.category_id || category._id}`)}
            >
              {category.name || "Unknown"}
            </Badge>
          );
        })}
      </div>
    );
  };
  
  const formatPrice = (price: number | undefined) => {
    if (price === undefined || price === null) return "N/A";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "TZS"
    }).format(price);
  };

  if (loading) {
    return (
      <Spinner />
    );
  }

  if (!product) {
    return (
      <ErrorCard
        title="Failed to load product"
        error={error || { message: "Product not found", status: "404" }}
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
              <AvatarImage 
                src={productImageUrl} 
                alt={product.name}
              />
              <AvatarFallback>
                <Package className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
            
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{product.name}</h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Badge variant={getStatusVariant(productStatus)} className={getBadgeStyles(productStatus)}>
                  {productStatus.charAt(0).toUpperCase() + productStatus.slice(1)}
                </Badge>
                <span>SKU: {product.sku}</span>
              </div>
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
          {product.verification_status === "approved" ? (
            <>
              {product.is_active ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleStatusChange("inactive")}
                  disabled={isUpdating}
                  className="text-red-600 border-red-600"
                >
                  {isUpdating ? (
                    <Spinner className="mr-2 h-4 w-4" />
                  ) : (
                    <X className="mr-2 h-4 w-4" />
                  )}
                  Deactivate
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleStatusChange("active")}
                  disabled={isUpdating}
                  className="text-green-600 border-green-600"
                >
                  {isUpdating ? (
                    <Spinner className="mr-2 h-4 w-4" />
                  ) : (
                    <Check className="mr-2 h-4 w-4" />
                  )}
                  Activate
                </Button>
              )}
            </>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleStatusChange("pending")}
                className="text-green-600 border-green-600"
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <Spinner className="mr-2 h-4 w-4" />
                ) : (
                  <Check className="mr-2 h-4 w-4" />
                )}
                Approve
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowRejectDialog(true)}
                disabled={isUpdating}
                className="text-red-600 border-red-600"
              >
                {isUpdating ? (
                  <Spinner className="mr-2 h-4 w-4" />
                ) : (
                  <X className="mr-2 h-4 w-4" />
                )}
                Reject
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 overflow-auto space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main details */}
          <div className="md:col-span-2 space-y-6">
            {/* Basic Information Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="h-5 w-5 mr-2" />
                  Product Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Name</p>
                    <p>{product.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">SKU</p>
                    <p>{product.sku || "Not provided"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Categories</p>
                    {getCategoryNames(product.category_ids)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Vendor</p>
                    <p>{productVendor?.business_name || "Unknown Vendor"}</p>
                  </div>
                </div>

                <Separator />

                {/* Description */}
                <div>
                  <h3 className="text-sm font-medium mb-3">Description</h3>
                  <p className="text-sm">{product.description}</p>
                  
                  {product.short_description && (
                    <div className="mt-4">
                      <h3 className="text-sm font-medium mb-1">Short Description</h3>
                      <p className="text-sm">{product.short_description}</p>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Pricing Information */}
                <div>
                  <h3 className="text-sm font-medium mb-3">Pricing</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Base Price</p>
                      <p className="text-lg font-medium">{formatPrice(product.base_price)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Sale Price</p>
                      <p className="text-lg font-medium">{formatPrice(product.sale_price)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Cost Price</p>
                      <p className="text-lg font-medium">{formatPrice(product.cost_price)}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Inventory and Shipping */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Boxes className="h-5 w-5 mr-2" />
                  Inventory & Shipping
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Inventory Quantity</p>
                    <p>{product.inventory_quantity}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Inventory Tracking</p>
                    <Badge variant={product.inventory_tracking ? "default" : "outline"}>
                      {product.inventory_tracking ? "Enabled" : "Disabled"}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Low Stock Threshold</p>
                    <p>{product.low_stock_threshold}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Requires Shipping</p>
                    <Badge variant={product.requires_shipping ? "default" : "outline"}>
                      {product.requires_shipping ? "Yes" : "No"}
                    </Badge>
                  </div>
                </div>

                <Separator />

                {/* Dimensions & Weight */}
                <div>
                  <h3 className="text-sm font-medium mb-3">Dimensions & Weight</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Weight</p>
                      <p>{product.weight} g</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Length</p>
                      <p>{product.dimensions?.length} cm</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Width</p>
                      <p>{product.dimensions?.width} cm</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Height</p>
                      <p>{product.dimensions?.height} cm</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Variants */}
            {product.has_variants && product.variants && product.variants.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Tag className="h-5 w-5 mr-2" />
                    Product Variants
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {product.variants.map((variant: any, index: number) => (
                      <div key={variant._id || index} className="border rounded-md p-4">
                        <div className="flex justify-between items-center mb-2">
                          <div className="font-medium">{variant.name}</div>
                          <Badge>{variant.sku}</Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Attributes</p>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {Object.entries(variant.attributes || {}).map(([key, value]) => (
                                value ? (
                                  <Badge key={key} variant="outline" className="capitalize">
                                    {key}: {value as string}
                                  </Badge>
                                ) : null
                              ))}
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Price Adjustment</p>
                            <p>{formatPrice(variant.price + product.sale_price)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Product Image Card */}
            <Card>
              <CardHeader>
                <CardTitle>Product Images</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {product.images && product.images.length > 0 ? (
                    product.images.map((image: any, index: number) => (
                      <div 
                        key={index} 
                        className="aspect-square rounded-md overflow-hidden border cursor-pointer"
                        onClick={() => handlePreviewImage(image.url)}
                      >
                        <img 
                          src={image.url}
                          alt={image.alt || `Product image ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))
                  ) : (
                    <div className="col-span-2 aspect-square flex items-center justify-center border rounded-md bg-muted">
                      <Package className="h-16 w-16 text-muted-foreground opacity-50" />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* Product Details Card */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="w-full flex justify-between text-sm">
                    <span className="text-muted-foreground">Status:</span>
                    <Badge variant={getStatusVariant(productStatus)} className={getBadgeStyles(productStatus)}>
                      {productStatus.charAt(0).toUpperCase() + productStatus.slice(1)}
                    </Badge>
                  </div>
                  <div className="w-full flex justify-between text-sm">
                    <span className="text-muted-foreground">Created:</span>
                    <span className="font-medium">{formatDate(product.createdAt || product.created_at)}</span>
                  </div>
                  <div className="w-full flex justify-between text-sm">
                    <span className="text-muted-foreground">Last Updated:</span>
                    <span className="font-medium">{formatDate(product.updatedAt || product.updated_at)}</span>
                  </div>
                  
                  {product.approved_at && (
                    <div className="w-full flex justify-between text-sm">
                      <span className="text-muted-foreground">Approved:</span>
                      <span className="font-medium">{formatDate(product.approved_at)}</span>
                    </div>
                  )}

                  {product.is_featured && (
                    <div className="w-full flex justify-between text-sm">
                      <span className="text-muted-foreground">Featured:</span>
                      <Badge variant="success" className="bg-amber-500 text-white">Featured Product</Badge>
                    </div>
                  )}
                </div>
                
                {/* Rejection reason if applicable */}
                {product.rejection_reason && (
                  <div className="mt-4 p-3 border border-red-200 rounded-md bg-red-50">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-red-800">Rejection Reason:</p>
                        <p className="text-sm text-red-700 mt-1">{product.rejection_reason}</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Actions Card */}
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {product.verification_status === "pending" ? (
                  <>
                    <Button
                      variant="success"
                      className="w-full bg-green-600 hover:bg-green-700 text-white"
                      disabled={isUpdating}
                      onClick={() => handleStatusChange("approved")}
                    >
                      {isUpdating ? (
                        <Spinner className="h-4 w-4 mr-2" />
                      ) : (
                        <Check className="h-4 w-4 mr-2" />
                      )}
                      Approve Product
                    </Button>
                    <Button
                      variant="destructive"
                      className="w-full"
                      disabled={isUpdating}
                      onClick={() => setShowRejectDialog(true)}
                    >
                      {isUpdating ? (
                        <Spinner className="h-4 w-4 mr-2" />
                      ) : (
                        <X className="h-4 w-4 mr-2" />
                      )}
                      Reject Product
                    </Button>
                  </>
                ) : product.verification_status === "approved" ? (
                  <Button
                    variant={product.is_active ? "destructive" : "success"}
                    className={`w-full ${!product.is_active ? "bg-green-600 hover:bg-green-700" : ""}`}
                    disabled={isUpdating}
                    onClick={() => handleStatusChange(product.is_active ? "draft" : "active")}
                  >
                    {isUpdating ? (
                      <Spinner className="h-4 w-4 mr-2" />
                    ) : product.is_active ? (
                      <>
                        <X className="h-4 w-4 mr-2" />
                        Unpublish (Draft)
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Publish Product
                      </>
                    )}
                  </Button>
                ) : null}
                
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push(`/dashboard/products/${id}/edit`)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Product
                </Button>
                <Button
                  variant="outline"
                  className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => setConfirmDelete(true)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Product
                </Button>
                
                {/* Inline delete confirmation */}
                {confirmDelete && (
                  <div className="mt-4 p-3 border border-red-200 rounded-md bg-red-50">
                    <p className="text-sm text-red-800 mb-2">
                      Are you sure you want to delete this product? This action cannot be undone.
                    </p>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline" 
                        size="sm"
                        onClick={() => setConfirmDelete(false)}
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
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      {/* Image Preview Modal */}
      <FilePreviewModal
        src={previewImage || ""}
        alt="Product Image"
        isOpen={!!previewImage}
        onClose={() => setPreviewImage(null)}
      />
      
      {/* Rejection Dialog */}
      <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Product</AlertDialogTitle>
            <AlertDialogDescription>
              Please provide a reason for rejecting this product. This will be visible to the vendor.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="py-4">
            <RadioGroup 
              value={rejectionType}
              onValueChange={setRejectionType}
            >
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="product_quality" id="product_quality" />
                  <Label htmlFor="product_quality">Product quality issues</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="inadequate_information" id="inadequate_information" />
                  <Label htmlFor="inadequate_information">Inadequate product information</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="pricing_issues" id="pricing_issues" />
                  <Label htmlFor="pricing_issues">Pricing issues</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="policy_violation" id="policy_violation" />
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
              {isUpdating ? (
                <Spinner className="mr-2 h-4 w-4" />
              ) : null}
              Reject Product
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
