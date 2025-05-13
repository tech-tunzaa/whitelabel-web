"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Search, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { ErrorCard } from "@/components/ui/error-card";

import { useCategoryStore } from "@/features/products/categories/store";
import { Category } from "@/features/products/categories/types";
import { CategoryTable } from "@/features/products/categories/components/category-table";
import { CategoryForm } from "@/features/products/categories/components/category-form";

export default function CategoriesPage() {
  const router = useRouter();
  const { loading, storeError, fetchCategories, createCategory, updateCategory, deleteCategory } = useCategoryStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Define tenant headers
  const tenantHeaders = {
    'X-Tenant-ID': '4c56d0c3-55d9-495b-ae26-0d922d430a42'
  };
  
  const loadCategories = async () => {
    try {
      setError(null);
      const response = await fetchCategories(undefined, tenantHeaders);
      setCategories(response.items || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Failed to load categories. Please try again.');
    }
  };

  useEffect(() => {
    // Use a ref to track if we've loaded data already to prevent infinite loops
    const loadOnce = () => {
      loadCategories();
    };
    
    loadOnce();
    // Empty dependency array ensures this only runs once on mount
  }, []);
  

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;
    try {
      await deleteCategory(categoryToDelete._id, tenantHeaders);
      setIsDeleteDialogOpen(false);
      setCategoryToDelete(null);
      toast.success("Category deleted successfully");
      loadCategories(); // Refresh the list
    } catch (error) {
      toast.error("Failed to delete category");
    }
  };

  const handleAddCategory = async (formData: any) => {
    try {
      await createCategory(formData, tenantHeaders);
      setIsFormDialogOpen(false);
      toast.success("Category added successfully");
      loadCategories(); // Refresh the list
    } catch (error) {
      toast.error("Failed to add category");
    }
  };

  const handleEditCategory = async (formData: any) => {
    if (!categoryToEdit) return;
    try {
      await updateCategory(categoryToEdit._id, formData, tenantHeaders);
      setIsFormDialogOpen(false);
      setCategoryToEdit(null);
      toast.success("Category updated successfully");
      loadCategories(); // Refresh the list
    } catch (error) {
      toast.error("Failed to update category");
    }
  };

  const openDeleteDialog = (category: Category) => {
    setCategoryToDelete(category);
    setIsDeleteDialogOpen(true);
  };

  const openFormDialog = (category?: Category) => {
    setCategoryToEdit(category || null);
    setIsFormDialogOpen(true);
  };
  
  const handleViewDetails = (category: Category) => {
    // Use the correct ID property (_id) for navigation
    router.push(`/dashboard/products/categories/${category._id}`);
  };

  const closeFormDialog = () => {
    setCategoryToEdit(null);
    setIsFormDialogOpen(false);
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
            <h1 className="text-2xl font-bold tracking-tight">Categories</h1>
            <p className="text-muted-foreground">
              Manage your product categories
            </p>
          </div>
          <Button onClick={() => openFormDialog()}>
            <Plus className="h-4 w-4 mr-2" />
            Add Category
          </Button>
        </div>
        <ErrorCard
          title="Error Loading Categories"
          error={{
            message: error,
            status: "error"
          }}
          buttonText="Retry"
          buttonAction={() => loadCategories()}
          buttonIcon={RefreshCw}
        />
      </>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Categories</h1>
          <p className="text-muted-foreground">
            Manage your product categories
          </p>
        </div>
        <Button onClick={() => openFormDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Add Category
        </Button>
      </div>

      <div className="p-4 space-y-4">
        <div className="flex items-center gap-4">
          <div className="relative w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search categories..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Spinner size="lg" />
          </div>
        ) : error ? (
          <ErrorCard
            title="Error Loading Categories"
            error={{
              message: error,
              status: "error"
            }}
            buttonText="Retry"
            buttonAction={() => loadCategories()}
            buttonIcon={RefreshCw}
          />
        ) : (
          <CategoryTable
            categories={filteredCategories}
            onEdit={openFormDialog}
            onDelete={openDeleteDialog}
            onViewDetails={handleViewDetails}
          />
        )}
      </div>

      {/* Add/Edit Category Dialog */}
      <Dialog open={isFormDialogOpen} onOpenChange={(open) => {
        if (!open) {
          closeFormDialog();
        }
      }}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>
              {categoryToEdit ? "Edit Category" : "Add New Category"}
            </DialogTitle>
            <DialogDescription>
              {categoryToEdit
                ? "Update the details for this product category."
                : "Create a new product category for your marketplace."}
            </DialogDescription>
          </DialogHeader>
          <CategoryForm
            initialData={categoryToEdit ? {
              name: categoryToEdit.name,
              description: categoryToEdit.description,
              status: categoryToEdit.is_active ? 'active' : 'inactive',
              parentId: categoryToEdit.parentId,
              category_id: categoryToEdit._id, // Pass the category ID for proper filtering of parent options
              featured: Boolean(categoryToEdit.featured),
              slug: categoryToEdit.slug || ''
            } : undefined}
            onSubmit={categoryToEdit ? handleEditCategory : handleAddCategory}
            onCancel={closeFormDialog}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Category</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the category "
              {categoryToDelete?.name}"? This action cannot be undone.
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