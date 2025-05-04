import { create } from "zustand";
import { Category } from "../types/category";
import { mockCategories } from "../data/mock-categories";

interface CategoryStore {
    categories: Category[];
    loading: boolean;
    error: string | null;
    fetchCategories: () => Promise<void>;
    addCategory: (category: Omit<Category, "_id" | "createdAt" | "updatedAt">) => Promise<void>;
    updateCategory: (id: string, category: Omit<Category, "_id" | "createdAt" | "updatedAt">) => Promise<void>;
    deleteCategory: (id: string) => Promise<void>;
}

export const useCategoryStore = create<CategoryStore>((set, get) => ({
    categories: [],
    loading: false,
    error: null,
    fetchCategories: async () => {
        set({ loading: true, error: null });
        try {
            // TODO: Replace with actual API call
            // Simulate API delay
            await new Promise((resolve) => setTimeout(resolve, 500));
            set({ categories: mockCategories, loading: false });
        } catch (error) {
            set({ error: "Failed to fetch categories", loading: false });
        }
    },
    addCategory: async (category) => {
        set({ loading: true, error: null });
        try {
            // TODO: Replace with actual API call
            // Simulate API delay
            await new Promise((resolve) => setTimeout(resolve, 500));
            
            const newCategory: Category = {
                ...category,
                _id: Math.random().toString(36).substr(2, 9),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };

            set((state) => ({
                categories: [...state.categories, newCategory],
                loading: false,
            }));
        } catch (error) {
            set({ error: "Failed to add category", loading: false });
        }
    },
    updateCategory: async (id, category) => {
        set({ loading: true, error: null });
        try {
            // TODO: Replace with actual API call
            // Simulate API delay
            await new Promise((resolve) => setTimeout(resolve, 500));

            set((state) => ({
                categories: state.categories.map((c) =>
                    c._id === id
                        ? {
                            ...c,
                            ...category,
                            updatedAt: new Date().toISOString(),
                        }
                        : c
                ),
                loading: false,
            }));
        } catch (error) {
            set({ error: "Failed to update category", loading: false });
        }
    },
    deleteCategory: async (id) => {
        set({ loading: true, error: null });
        try {
            // TODO: Replace with actual API call
            // Simulate API delay
            await new Promise((resolve) => setTimeout(resolve, 500));

            set((state) => ({
                categories: state.categories.filter((c) => c._id !== id),
                loading: false,
            }));
        } catch (error) {
            set({ error: "Failed to delete category", loading: false });
        }
    },
})); 