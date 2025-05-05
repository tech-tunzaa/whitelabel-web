import { useCallback } from "react";
import { useCategoryStore } from "../store/category-store";
import { Category, CategoryFormData } from "../types/category";

export const useCategoryOperations = () => {
    const { addCategory, updateCategory, deleteCategory } = useCategoryStore();

    const handleAddCategory = useCallback(
        async (formData: CategoryFormData) => {
            const newCategory: Omit<Category, "_id" | "createdAt" | "updatedAt"> = {
                ...formData,
                status: formData.status || "active",
            };
            await addCategory(newCategory as Category);
        },
        [addCategory]
    );

    const handleUpdateCategory = useCallback(
        async (id: string, formData: CategoryFormData) => {
            const updatedCategory: Omit<Category, "_id" | "createdAt" | "updatedAt"> = {
                ...formData,
                status: formData.status || "active",
            };
            await updateCategory(id, updatedCategory as Category);
        },
        [updateCategory]
    );

    const handleDeleteCategory = useCallback(
        async (id: string) => {
            await deleteCategory(id);
        },
        [deleteCategory]
    );

    return {
        handleAddCategory,
        handleUpdateCategory,
        handleDeleteCategory,
    };
}; 