"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Edit,
  Package,
  Pencil,
  RefreshCw,
  ShoppingBag,
  Tag,
  Trash,
} from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { ErrorCard } from "@/components/ui/error-card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

import { useProductStore } from "@/features/products/store";
import { useCategoryStore } from "@/features/categories/store";
import { Product, ProductVariant } from "@/features/products/types";

interface ProductPageProps {
  params: {
    id: string;
  };
}

export default function ProductPage({ params }: ProductPageProps) {
  const router = useRouter();
  const { id } = params;
  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { fetchProduct, deleteProduct } = useProductStore();
  const { fetchCategories, fetchCategory } = useCategoryStore();

  // Define tenant headers
  const tenantHeaders = {
    "X-Tenant-ID": "4c56d0c3-55d9-495b-ae26-0d922d430a42",
  };

  useEffect(() => {
    // Prevent multiple API calls with a reference
    let isActive = true;

    const loadData = async () => {
      if (!isActive) return;

      try {
        setLoading(true);
        setError(null);

        // Fetch product details
        const productData = await fetchProduct(id, tenantHeaders);
        if (!isActive) return;
        setProduct(productData);

        // Fetch all categories
        try {
          const categoriesData = await fetchCategories(
            undefined,
            tenantHeaders
          );
          if (!isActive) return;
          if (categoriesData && categoriesData.items) {
            setCategories(categoriesData.items || []);
          }
        } catch (categoryErr) {
          console.error("Error fetching categories:", categoryErr);
          // Don't fail the whole page if just the categories fetch fails
        }
      } catch (err) {
        if (!isActive) return;
        console.error("Error fetching product:", err);
        setError("Failed to load product details. Please try again.");
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    loadData();

    // Cleanup function to prevent state updates if component unmounts
    return () => {
      isActive = false;
    };
  }, [id, fetchProduct, fetchCategories]);

  const getCategoryName = (categoryId: string) => {
    if (!categories || !categories.length) return "Unknown Category";
    const category = categories.find((cat) => cat._id === categoryId);
    return category?.name || "Unknown Category";
  };

  const getStockStatusBadge = (status: string) => {
    switch (status) {
      case "in_stock":
        return <Badge variant="default">In Stock</Badge>;
      case "out_of_stock":
        return <Badge variant="destructive">Out of Stock</Badge>;
      case "low_stock":
        return <Badge variant="secondary">Low Stock</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="default">Active</Badge>;
      case "pending":
      case "draft":
        return <Badge variant="secondary">Draft</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleDeleteProduct = async () => {
    try {
      await deleteProduct(id, tenantHeaders);
      toast.success("Product deleted successfully");
      router.push("/dashboard/products");
    } catch (error) {
      toast.error("Failed to delete product");
      setIsDeleteDialogOpen(false);
    }
  };

  if (loading) {
    return <Spinner />;
  }

  if ((error && !loading) || !product) {
    return (
      <ErrorCard
        title="Error Loading Product"
        error={error}
        buttonText="Back to Products"
        buttonAction={() => router.push("/dashboard/products")}
        buttonIcon={ArrowLeft}
      />
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center p-4 border-b">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/dashboard/products")}
          className="mr-4"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only">Back</span>
        </Button>
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold tracking-tight">{product.name}</h1>
          <p className="text-sm text-muted-foreground">
            {product.sku || "N/A"} • ID: {product.product_id}
          </p>
        </div>
        <div className="ml-auto space-x-2">
          {getStatusBadge(product.status)}
        </div>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Product Details</CardTitle>
                <CardDescription>
                  {product.featured ? "Featured Product" : ""}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center mb-6">
                  <div className="h-24 w-24 mr-6 overflow-hidden rounded-md">
                    {product.images && product.images.length > 0 ? (
                      <img
                        src={product.images[0].url}
                        alt={product.images[0].alt || "Product image"}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full bg-muted flex items-center justify-center">
                        <Package className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">{product.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {getStockStatusBadge(
                        product.inventory_quantity > 0
                          ? "in_stock"
                          : "out_of_stock"
                      )}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Created:{" "}
                      {product.created_at
                        ? format(new Date(product.created_at), "PPP")
                        : "N/A"}
                    </p>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium">Base Price</p>
                    <p className="text-lg font-bold">
                      $
                      {product.base_price
                        ? parseFloat(product.base_price.toString()).toFixed(2)
                        : "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Stock Level</p>
                    <p className="text-lg">
                      {product.inventory_quantity !== undefined
                        ? product.inventory_quantity
                        : "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Vendor ID</p>
                    <p className="text-sm">{product.vendor_id}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Requires Shipping</p>
                    <p className="text-sm">
                      {product.requires_shipping ? "Yes" : "No"}
                    </p>
                  </div>
                </div>

                <Separator className="my-4" />

                <div>
                  <p className="text-sm font-medium mb-2">Description</p>
                  <p className="text-sm whitespace-pre-wrap">
                    {product.description}
                  </p>
                </div>

                <Separator className="my-4" />

                <div>
                  <p className="text-sm font-medium mb-2">Categories</p>
                  <div className="flex flex-wrap gap-2">
                    {product.category_ids && product.category_ids.length > 0 ? (
                      product.category_ids.map((categoryId, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="cursor-pointer"
                          onClick={() =>
                            router.push(
                              `/dashboard/products/categories/${categoryId}`
                            )
                          }
                        >
                          <Tag className="mr-1 h-3 w-3" />
                          {getCategoryName(categoryId)}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        No categories assigned
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {product.variants && product.variants.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Product Variants</CardTitle>
                  <CardDescription>
                    {product.variants.length} variant
                    {product.variants.length !== 1 ? "s" : ""} available
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 divide-y">
                    {product.variants.map((variant: any, index: number) => (
                      <div key={index} className="py-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">
                              {variant.name || `Variant ${index + 1}`}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              SKU: {variant.sku || "N/A"}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">
                              $
                              {variant.price
                                ? parseFloat(variant.price.toString()).toFixed(
                                    2
                                  )
                                : "N/A"}
                            </p>
                            <div className="flex items-center gap-2">
                              <p className="text-sm">
                                Stock: {variant.inventory_quantity || "N/A"}
                              </p>
                              {getStockStatusBadge(
                                variant.inventory_quantity > 0
                                  ? "in_stock"
                                  : "out_of_stock"
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {product.images && product.images.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Product Images</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {product.images.map((image, index) => (
                      <div
                        key={index}
                        className="relative aspect-square rounded-md overflow-hidden"
                      >
                        <img
                          src={image.url}
                          alt={image.alt || `Product image ${index + 1}`}
                          className="h-full w-full object-cover"
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1">
                          Position: {image.pos + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium">Product Status</p>
                    <div className="mt-1">{getStatusBadge(product.status)}</div>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Stock Status</p>
                    <div className="mt-1">
                      {getStockStatusBadge(
                        product.inventory?.stockStatus ||
                          (product.variants && product.variants.length > 0
                            ? product.variants[0].inventory.stockStatus
                            : "N/A")
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Featured Product</p>
                    <p>{product.is_featured ? "Yes" : "No"}</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-6 flex flex-col">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push(`/dashboard/products/${id}/edit`)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Product
                </Button>
                <Button
                  variant="default"
                  className="w-full mt-4"
                  onClick={() => setIsDeleteDialogOpen(true)}
                >
                  <Trash className="h-4 w-4 mr-2" />
                  Delete Product
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{product.name}"? This action
              cannot be undone and will remove all associated data.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-4">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteProduct}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
