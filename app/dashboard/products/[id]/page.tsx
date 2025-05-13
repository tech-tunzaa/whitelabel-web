"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Edit, Package, Pencil, RefreshCw, ShoppingBag, Tag, Trash } from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { ErrorCard } from "@/components/ui/error-card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

import { useProductStore } from "@/features/products/store";
import { useCategoryStore } from "@/features/products/categories/store";
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
    'X-Tenant-ID': '4c56d0c3-55d9-495b-ae26-0d922d430a42'
  };
  
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch product details
        const productData = await fetchProduct(id, tenantHeaders);
        setProduct(productData);
        
        // Fetch only the category associated with this product, if it exists
        if (productData && productData.category_id) {
          try {
            const categoryData = await fetchCategory(productData.category_id, tenantHeaders);
            if (categoryData) {
              // Add just this category to the list
              setCategories([categoryData]);
            }
          } catch (categoryErr) {
            console.error('Error fetching category:', categoryErr);
            // Don't fail the whole page if just the category fetch fails
          }
        }
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Failed to load product details. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [id, fetchProduct, fetchCategory]);

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(cat => cat._id === categoryId);
    return category?.name || 'Unknown Category';
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
    return (
      <Spinner />
    );
  }
  
  if (error && !loading || !product) {
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
          <h1 className="text-2xl font-bold tracking-tight">
            {product.name}
          </h1>
          <p className="text-sm text-muted-foreground">
            SKU: {product?.variants?.[0]?.sku || 'N/A'} • ID: {product._id}
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
                  {product.featured ? 'Featured Product' : ''}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center mb-6">
                  <div className="h-24 w-24 mr-6 overflow-hidden rounded-md">
                    {product.images && product.images.length > 0 ? (
                      <img 
                        src={product.images[0].url} 
                        alt={product.images[0].alt} 
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
                      {getStockStatusBadge((product.inventory?.stockStatus || product.variants?.[0]?.inventory?.stockStatus || 'N/A'))}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Created: {format(new Date(product.createdAt), "PPP")}
                    </p>
                  </div>
                  <div className="ml-auto space-y-2">
                    <Button variant="outline" size="sm" onClick={() => router.push(`/dashboard/products/${id}/edit`)}>
                      <Pencil className="h-4 w-4 mr-2" /> Edit
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => setIsDeleteDialogOpen(true)}>
                      <Trash className="h-4 w-4 mr-2" /> Delete
                    </Button>
                  </div>
                </div>
                
                <Separator className="my-4" />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium">Price</p>
                    <p className="text-lg font-bold">
                      {product.price ? `$${product.price.toFixed(2)}` : 
                       (product.variants && product.variants.length > 0) ? 
                       `$${product.variants[0].price.toFixed(2)}` : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Stock Level</p>
                    <p className="text-lg">
                      {product.inventory?.stockLevel || 
                       (product.variants && product.variants.length > 0 ? 
                        product.variants[0].inventory.stockLevel : 'N/A')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Vendor ID</p>
                    <p className="text-sm">{product.vendorId}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Non-Deliverable</p>
                    <p className="text-sm">{product.nonDeliverable ? 'Yes' : 'No'}</p>
                  </div>
                </div>
                
                <Separator className="my-4" />
                
                <div>
                  <p className="text-sm font-medium mb-2">Description</p>
                  <p className="text-sm whitespace-pre-wrap">{product.description}</p>
                </div>
                
                <Separator className="my-4" />
                
                <div>
                  <p className="text-sm font-medium mb-2">Categories</p>
                  <div className="flex flex-wrap gap-2">
                    {product.categoryIds.map((categoryId, index) => (
                      <Badge key={index} variant="outline" className="cursor-pointer" onClick={() => router.push(`/dashboard/products/categories/${categoryId}`)}>
                        <Tag className="mr-1 h-3 w-3" />
                        {getCategoryName(categoryId)}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {product.variants && product.variants.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Product Variants</CardTitle>
                  <CardDescription>
                    {product.variants.length} variant{product.variants.length !== 1 ? 's' : ''} available
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 divide-y">
                    {product.variants.map((variant: ProductVariant, index: number) => (
                      <div key={variant._id} className="py-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">
                              {variant.attributes.map(attr => `${attr.name}: ${attr.value}`).join(', ')}
                            </p>
                            <p className="text-sm text-muted-foreground">SKU: {variant.sku}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">${variant.price.toFixed(2)}</p>
                            <div className="flex items-center gap-2">
                              <p className="text-sm">
                                Stock: {variant.inventory.stockLevel}
                              </p>
                              {getStockStatusBadge(variant.inventory.stockStatus)}
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
                      <div key={index} className="relative aspect-square rounded-md overflow-hidden">
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
                      {getStockStatusBadge(product.inventory?.stockStatus || 
                        (product.variants && product.variants.length > 0 ? 
                         product.variants[0].inventory.stockStatus : 'N/A'))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Featured Product</p>
                    <p>{product.featured ? 'Yes' : 'No'}</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-6">
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => router.push(`/dashboard/products/${id}/edit`)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Product
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{product.name}"? This action cannot be
              undone and will remove all associated data.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-4">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteProduct}
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}