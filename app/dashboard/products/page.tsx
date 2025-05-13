"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Plus,
  Search,
  RefreshCw
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { ErrorCard } from "@/components/ui/error-card";

import { useProductStore } from "@/features/products/store";
import { useCategoryStore } from "@/features/products/categories/store";
import { Product } from "@/features/products/types";
import { ProductTable } from "@/features/products/components/product-table";

export default function ProductsPage() {
  const router = useRouter();
  const { loading, storeError, fetchProducts, deleteProduct } = useProductStore();
  const { fetchCategories } = useCategoryStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Define tenant headers
  const tenantHeaders = {
    'X-Tenant-ID': '4c56d0c3-55d9-495b-ae26-0d922d430a42'
  };

  const loadProducts = async () => {
    try {
      setError(null);
      const response = await fetchProducts(undefined, tenantHeaders);
      setProducts(response.items || []);
      
      const categoryResponse = await fetchCategories(undefined, tenantHeaders);
      setCategories(categoryResponse.items || []);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products. Please try again.');
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.vendorId
        .toString()
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

    const matchesStatus =
      selectedStatus === "all" || product.status === selectedStatus;
    const matchesCategory =
      selectedCategory === "all" ||
      (product.categoryIds && product.categoryIds.some((id) => id.toString() === selectedCategory)) ||
      (product.categoryIds && product.categoryIds.some((id) => id.toString() === selectedCategory));

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const pendingProducts = filteredProducts.filter(
    (product) => product.status === "draft"
  );
  const activeProducts = filteredProducts.filter(
    (product) => product.status === "active"
  );

  const handleDeleteProduct = async () => {
    if (!productToDelete) return;
    try {
      await deleteProduct(productToDelete._id, tenantHeaders);
      setIsDeleteDialogOpen(false);
      setProductToDelete(null);
      toast.success("Product deleted successfully");
      loadProducts(); // Refresh the list
    } catch (error) {
      toast.error("Failed to delete product");
    }
  };

  const openDeleteDialog = (product: Product) => {
    setProductToDelete(product);
    setIsDeleteDialogOpen(true);
  };

  if (loading) {
    return (
      <Spinner />
    );
  }

  if (error) {
    return (
      <>
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Products</h1>
            <p className="text-muted-foreground">
              Manage your marketplace products
            </p>
          </div>
          <Button onClick={() => router.push("/dashboard/products/add")}>
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>
        <ErrorCard
          title="Error Loading Products"
          error={{
            message: error,
            status: "error"
          }}
          buttonText="Retry"
          buttonAction={() => loadProducts()}
          buttonIcon={RefreshCw}
        />
      </>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground">
            Manage your marketplace products
          </p>
        </div>
        <Button onClick={() => router.push("/dashboard/products/add")}>
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>

      <div className="p-4 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search products..."
              className="pl-8 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category._id} value={category._id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="all">
              All Products
              <Badge variant="secondary" className="ml-2">
                {filteredProducts.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="active">
              Active
              <Badge variant="secondary" className="ml-2">
                {activeProducts.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="draft">
              Draft
              <Badge variant="secondary" className="ml-2">
                {pendingProducts.length}
              </Badge>
            </TabsTrigger>
          </TabsList>
            <TabsContent value="all">
              <ProductTable
                products={filteredProducts}
                onEdit={(product) =>
                  router.push(`/dashboard/products/${product._id}`)
                }
                onDelete={openDeleteDialog}
              />
            </TabsContent>
            <TabsContent value="active">
              <ProductTable
                products={activeProducts}
                onEdit={(product) =>
                  router.push(`/dashboard/products/${product._id}`)
                }
                onDelete={openDeleteDialog}
              />
            </TabsContent>
            <TabsContent value="draft">
              <ProductTable
                products={pendingProducts}
                onDelete={openDeleteDialog}
              />
            </TabsContent>
        </Tabs>
      </div>

      <Dialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this product? This action cannot be
              undone.
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
