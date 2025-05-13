"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Edit, Folder, Pencil, RefreshCw, Tag, Trash } from "lucide-react";
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
import { Category } from "@/features/products/categories/types";
import { Product } from "@/features/products/types";
import { ProductTable } from "@/features/products/components/product-table";

interface CategoryPageProps {
  params: {
    id: string;
  };
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const router = useRouter();
  const { id } = params;
  const [category, setCategory] = useState<Category | null>(null);
  const [parentCategory, setParentCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { fetchCategory, deleteCategory } = useCategoryStore();
  const { fetchProducts } = useProductStore();
  
  // Define tenant headers
  const tenantHeaders = {
    'X-Tenant-ID': '4c56d0c3-55d9-495b-ae26-0d922d430a42'
  };
  
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch category details
        const categoryData = await fetchCategory(id, tenantHeaders);
        setCategory(categoryData);
        
        // If the category has a parent, fetch parent details
        if (categoryData.parentId) {
          try {
            const parentData = await fetchCategory(categoryData.parentId, tenantHeaders);
            setParentCategory(parentData);
          } catch (error) {
            console.error('Error fetching parent category:', error);
            // Don't set global error for this - just log it
          }
        }
        
        // Fetch associated products
        const filter = { categoryId: id };
        const productsResponse = await fetchProducts(filter, tenantHeaders);
        setProducts(productsResponse.items || []);
      } catch (err) {
        console.error('Error fetching category:', err);
        setError('Failed to load category details. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [id, fetchCategory, fetchProducts]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="default">Active</Badge>;
      case "inactive":
        return <Badge variant="secondary">Inactive</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleDeleteCategory = async () => {
    try {
      await deleteCategory(id, tenantHeaders);
      toast.success("Category deleted successfully");
      router.push("/dashboard/products/categories");
    } catch (error) {
      toast.error("Failed to delete category");
      setIsDeleteDialogOpen(false);
    }
  };

  if (loading) {
    return (
      <Spinner />
    );
  }
  
  if (error && !loading || !category) {
    return (
      <ErrorCard
        title="Error Loading Category"
        error={error}
        buttonText="Back to Categories"
        buttonAction={() => router.push("/dashboard/products/categories")}
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
          onClick={() => router.push("/dashboard/products/categories")}
          className="mr-4"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only">Back</span>
        </Button>
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold tracking-tight">
            {category.name}
          </h1>
          <p className="text-sm text-muted-foreground">
            Category ID: {category._id}
          </p>
        </div>
        <div className="ml-auto space-x-2">
          {getStatusBadge(category.status)}
        </div>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Category Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center mb-6">
                  <div className="h-16 w-16 mr-6 flex items-center justify-center rounded-md bg-primary/10">
                    <Folder className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">{category.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      Created: {format(new Date(category.createdAt), "PPP")}
                    </p>
                  </div>
                  <div className="ml-auto space-y-2">
                    <Button variant="outline" size="sm" onClick={() => router.push(`/dashboard/products/categories/${id}/edit`)}>
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
                    <p className="text-sm font-medium">Status</p>
                    <div className="mt-1">{getStatusBadge(category.status)}</div>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Parent Category</p>
                    <p className="text-sm">
                      {parentCategory ? (
                        <Button 
                          variant="link" 
                          className="p-0 h-auto text-sm font-normal" 
                          onClick={() => router.push(`/dashboard/products/categories/${parentCategory._id}`)}
                        >
                          <Tag className="mr-1 h-3 w-3" /> {parentCategory.name}
                        </Button>
                      ) : 'None'}
                    </p>
                  </div>
                </div>
                
                <Separator className="my-4" />
                
                <div>
                  <p className="text-sm font-medium mb-2">Description</p>
                  <p className="text-sm whitespace-pre-wrap">{category.description || 'No description provided.'}</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Products in this Category</CardTitle>
                <CardDescription>
                  {products.length} product{products.length !== 1 ? 's' : ''} in this category
                </CardDescription>
              </CardHeader>
              <CardContent>
                {products.length > 0 ? (
                  <ProductTable
                    products={products}
                    onEdit={(product) => router.push(`/dashboard/products/${product._id}`)}
                    onDelete={(product) => router.push(`/dashboard/products/${product._id}`)}
                  />
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No products found in this category.</p>
                    <Button 
                      variant="outline" 
                      className="mt-4" 
                      onClick={() => router.push('/dashboard/products/add')}
                    >
                      Add a product
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium">Category Status</p>
                    <div className="mt-1">{getStatusBadge(category.status)}</div>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Last Updated</p>
                    <p className="text-sm">{format(new Date(category.updatedAt), "PPP")}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Products Count</p>
                    <p className="text-sm">{products.length}</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-6">
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => router.push(`/dashboard/products/categories/${id}/edit`)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Category
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
            <DialogTitle>Delete Category</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{category.name}"? This action cannot be
              undone and will remove the category from products that use it.
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
              onClick={handleDeleteCategory}
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}