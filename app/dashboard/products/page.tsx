"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Check,
  Edit,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import data from "./data.json";

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState(data.products);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.vendor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      selectedStatus === "all" || product.status === selectedStatus;
    const matchesCategory =
      selectedCategory === "all" ||
      product.categoryId === Number.parseInt(selectedCategory);

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const pendingProducts = filteredProducts.filter(
    (product) => product.status === "pending"
  );
  const activeProducts = filteredProducts.filter(
    (product) => product.status === "active"
  );
  const draftProducts = filteredProducts.filter(
    (product) => product.status === "draft"
  );

  const handleApproveProduct = (productId) => {
    setProducts(
      products.map((product) =>
        product.id === productId ? { ...product, status: "active" } : product
      )
    );
    toast.success("Product approved successfully");
  };

  const handleRejectProduct = (productId) => {
    setProducts(
      products.map((product) =>
        product.id === productId ? { ...product, status: "rejected" } : product
      )
    );
    toast.success("Product rejected");
  };

  const handleDeleteProduct = () => {
    setProducts(
      products.filter((product) => product.id !== productToDelete.id)
    );
    setIsDeleteDialogOpen(false);
    setProductToDelete(null);
    toast.success("Product deleted successfully");
  };

  const openDeleteDialog = (product) => {
    setProductToDelete(product);
    setIsDeleteDialogOpen(true);
  };

  const getCategoryNameById = (id) => {
    const category = data.categories.find((cat) => cat.id === id);
    return category ? category.name : "Uncategorized";
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground">
            Manage your marketplace products
          </p>
        </div>
        <Button onClick={() => router.push("/admin/products/add")}>
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
                {data.categories.map((category) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="sm"
              className="h-10"
              onClick={() => router.push("/admin/products/categories")}
            >
              Manage Categories
            </Button>
          </div>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-4">
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
            <TabsTrigger value="pending">
              Pending
              <Badge variant="secondary" className="ml-2">
                {pendingProducts.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="draft">
              Draft
              <Badge variant="secondary" className="ml-2">
                {draftProducts.length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead className="hidden md:table-cell">
                        SKU
                      </TableHead>
                      <TableHead className="hidden md:table-cell">
                        Category
                      </TableHead>
                      <TableHead className="hidden md:table-cell">
                        Vendor
                      </TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="hidden md:table-cell">
                        Price
                      </TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8 rounded-sm">
                              <AvatarImage
                                src={product.image || "/placeholder.svg"}
                                alt={product.name}
                              />
                              <AvatarFallback className="rounded-sm">
                                {product.name.substring(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div>{product.name}</div>
                              <div className="text-xs text-muted-foreground md:hidden">
                                {product.sku} •{" "}
                                {getCategoryNameById(product.categoryId)}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {product.sku}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {getCategoryNameById(product.categoryId)}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {product.vendor}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              product.status === "active"
                                ? "success"
                                : product.status === "pending"
                                ? "warning"
                                : product.status === "draft"
                                ? "secondary"
                                : "destructive"
                            }
                          >
                            {product.status.charAt(0).toUpperCase() +
                              product.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          ${product.price.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Open menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem
                                onClick={() =>
                                  router.push(
                                    `/admin/products/edit/${product.id}`
                                  )
                                }
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              {product.status === "pending" && (
                                <>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleApproveProduct(product.id)
                                    }
                                  >
                                    <Check className="h-4 w-4 mr-2" />
                                    Approve
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleRejectProduct(product.id)
                                    }
                                  >
                                    <X className="h-4 w-4 mr-2" />
                                    Reject
                                  </DropdownMenuItem>
                                </>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => openDeleteDialog(product)}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredProducts.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          className="text-center py-8 text-muted-foreground"
                        >
                          No products found. Add your first product to get
                          started.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="active" className="space-y-4">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead className="hidden md:table-cell">
                        SKU
                      </TableHead>
                      <TableHead className="hidden md:table-cell">
                        Category
                      </TableHead>
                      <TableHead className="hidden md:table-cell">
                        Vendor
                      </TableHead>
                      <TableHead className="hidden md:table-cell">
                        Price
                      </TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activeProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8 rounded-sm">
                              <AvatarImage
                                src={product.image || "/placeholder.svg"}
                                alt={product.name}
                              />
                              <AvatarFallback className="rounded-sm">
                                {product.name.substring(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div>{product.name}</div>
                              <div className="text-xs text-muted-foreground md:hidden">
                                {product.sku} •{" "}
                                {getCategoryNameById(product.categoryId)}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {product.sku}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {getCategoryNameById(product.categoryId)}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {product.vendor}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          ${product.price.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              router.push(`/admin/products/edit/${product.id}`)
                            }
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {activeProducts.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="text-center py-8 text-muted-foreground"
                        >
                          No active products found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pending" className="space-y-4">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead className="hidden md:table-cell">
                        SKU
                      </TableHead>
                      <TableHead className="hidden md:table-cell">
                        Category
                      </TableHead>
                      <TableHead className="hidden md:table-cell">
                        Vendor
                      </TableHead>
                      <TableHead className="hidden md:table-cell">
                        Price
                      </TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8 rounded-sm">
                              <AvatarImage
                                src={product.image || "/placeholder.svg"}
                                alt={product.name}
                              />
                              <AvatarFallback className="rounded-sm">
                                {product.name.substring(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div>{product.name}</div>
                              <div className="text-xs text-muted-foreground md:hidden">
                                {product.sku} •{" "}
                                {getCategoryNameById(product.categoryId)}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {product.sku}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {getCategoryNameById(product.categoryId)}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {product.vendor}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          ${product.price.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRejectProduct(product.id)}
                            >
                              <X className="h-4 w-4 mr-1" /> Reject
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleApproveProduct(product.id)}
                            >
                              <Check className="h-4 w-4 mr-1" /> Approve
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {pendingProducts.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="text-center py-8 text-muted-foreground"
                        >
                          No pending products found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="draft" className="space-y-4">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead className="hidden md:table-cell">
                        SKU
                      </TableHead>
                      <TableHead className="hidden md:table-cell">
                        Category
                      </TableHead>
                      <TableHead className="hidden md:table-cell">
                        Vendor
                      </TableHead>
                      <TableHead className="hidden md:table-cell">
                        Price
                      </TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {draftProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8 rounded-sm">
                              <AvatarImage
                                src={product.image || "/placeholder.svg"}
                                alt={product.name}
                              />
                              <AvatarFallback className="rounded-sm">
                                {product.name.substring(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div>{product.name}</div>
                              <div className="text-xs text-muted-foreground md:hidden">
                                {product.sku} •{" "}
                                {getCategoryNameById(product.categoryId)}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {product.sku}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {getCategoryNameById(product.categoryId)}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {product.vendor}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          ${product.price.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              router.push(`/admin/products/edit/${product.id}`)
                            }
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {draftProducts.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="text-center py-8 text-muted-foreground"
                        >
                          No draft products found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the product "
              {productToDelete?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
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
