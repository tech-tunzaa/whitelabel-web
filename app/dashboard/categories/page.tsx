"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Search, RefreshCw } from "lucide-react";
import { useSession } from "next-auth/react";

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

import { useCategoryStore } from "@/features/categories/store";
import { Category } from "@/features/categories/types";
import { CategoryTable } from "@/features/categories/components/category-table";
import { CategoryForm } from "@/features/categories/components/category-form";

export default function CategoriesPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const {
    loading,
    storeError,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    toggleCategoryStatus,
    activeAction,
  } = useCategoryStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(
    null
  );
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Get tenant ID from session or use default
  const tenantId = session?.user?.tenant_id;
  
  // Define tenant headers
  const tenantHeaders = {
    "X-Tenant-ID": tenantId,
  };

  const loadCategories = async () => {
    try {
      setError(null);
      const response = await fetchCategories(undefined, tenantHeaders);
      setCategories(response.items || []);
    } catch (err) {
      console.error("Error fetching categories:", err);
      setError("Failed to load categories. Please try again.");
    }
  };

  useEffect(() => {
    // Load categories when component mounts or tenant ID changes
    loadCategories();
    // Include tenantId in dependencies to reload if it changes
  }, [tenantId]);

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;
    try {
      await deleteCategory(categoryToDelete.category_id, tenantHeaders);
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
      // Ensure tenant_id is included in the payload
      const categoryData = {
        ...formData,
        tenant_id: tenantId
      };
      await createCategory(categoryData, tenantHeaders);
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
      // Ensure tenant_id and category_id are included in the payload
      const categoryData = {
        ...formData,
        tenant_id: tenantId,
        category_id: categoryToEdit.category_id
      };
      await updateCategory(categoryToEdit.category_id, categoryData, tenantHeaders);
      setIsFormDialogOpen(false);
      setCategoryToEdit(null);
      toast.success("Category updated successfully");
      loadCategories(); // Refresh the list
    } catch (error) {
      toast.error("Failed to update category");
    }
  };
  
  const handleToggleStatus = async (category: Category, isActive: boolean) => {
    try {
      await toggleCategoryStatus(category.category_id, isActive, tenantHeaders);
      toast.success(`Category ${isActive ? 'activated' : 'deactivated'} successfully`);
      loadCategories(); // Refresh the list
    } catch (error) {
      toast.error(`Failed to ${isActive ? 'activate' : 'deactivate'} category`);
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
    router.push(`/dashboard/categories/${category.category_id}`);
  };

  const closeFormDialog = () => {
    setCategoryToEdit(null);
    setIsFormDialogOpen(false);
  };

  if (loading && !activeAction) {
    return <Spinner />;
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
            status: "error",
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
          <Spinner />
        ) : error ? (
          <ErrorCard
            title="Error Loading Categories"
            error={{
              message: error,
              status: "error",
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
            onToggleStatus={handleToggleStatus}
            onViewDetails={handleViewDetails}
          />
        )}
      </div>

      {/* Add/Edit Category Dialog */}
      <Dialog open={isFormDialogOpen} onOpenChange={(open) => {
          if (!open) {
            setCategoryToEdit(null);
          }
          setIsFormDialogOpen(open);
        }}>
        <DialogContent className="sm:max-w-[550px] max-h-[calc(100vh-10rem)] overflow-y-auto">
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
            initialData={
              categoryToEdit
                ? {
                    category_id: categoryToEdit.category_id,
                    name: categoryToEdit.name,
                    slug: categoryToEdit.slug || "",
                    description: categoryToEdit.description || "",
                    parent_id: categoryToEdit.parent_id || "none",
                    image_url: categoryToEdit.image_url || "",
                    is_active: categoryToEdit.is_active,
                    display_order: categoryToEdit.display_order || 0,
                  }
                : undefined
            }
            onSubmit={categoryToEdit ? handleEditCategory : handleAddCategory}
            onCancel={closeFormDialog}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Category</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the category "{categoryToDelete?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-4">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteCategory}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
