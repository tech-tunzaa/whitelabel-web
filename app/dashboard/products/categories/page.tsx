"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { useCategoryStore } from "@/features/products/categories/store/category-store";
import { Category, CategoryFormData } from "@/features/products/categories/types/category";
import { CategoryTable } from "@/features/products/categories/components/category-table";
import { CategoryForm } from "@/features/products/categories/components/category-form";

export default function CategoriesPage() {
  const { categories, loading, error, fetchCategories, addCategory, updateCategory, deleteCategory } =
    useCategoryStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;
    try {
      await deleteCategory(categoryToDelete._id);
      setIsDeleteDialogOpen(false);
      setCategoryToDelete(null);
      toast.success("Category deleted successfully");
    } catch (error) {
      toast.error("Failed to delete category");
    }
  };

  const handleAddCategory = async (formData: CategoryFormData) => {
    try {
      await addCategory(formData);
      setIsFormDialogOpen(false);
      toast.success("Category added successfully");
    } catch (error) {
      toast.error("Failed to add category");
    }
  };

  const handleEditCategory = async (formData: CategoryFormData) => {
    if (!categoryToEdit) return;
    try {
      await updateCategory(categoryToEdit._id, formData);
      setIsFormDialogOpen(false);
      setCategoryToEdit(null);
      toast.success("Category updated successfully");
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

  const closeFormDialog = () => {
    setCategoryToEdit(null);
    setIsFormDialogOpen(false);
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-destructive">Error: {error}</p>
      </div>
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

        <CategoryTable
          categories={filteredCategories}
          onEdit={openFormDialog}
          onDelete={openDeleteDialog}
        />
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
              status: categoryToEdit.status,
              parentId: categoryToEdit.parentId,
            } : undefined}
            onSubmit={categoryToEdit ? handleEditCategory : handleAddCategory}
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