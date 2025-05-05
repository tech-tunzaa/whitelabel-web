import { create } from "zustand";
import { Product, ProductState, ProductActions, ProductFormData } from "../types/product";
import { dummyProducts } from "../data/dummy-products";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

const initialState: ProductState = {
  products: [],
  loading: false,
  error: null,
  selectedProduct: null,
};

export const useProductStore = create<ProductState & ProductActions>((set) => ({
  ...initialState,

  setProducts: (products) => set({ products }),

  addProduct: (product) =>
    set((state) => ({
      products: [...state.products, product],
    })),

  updateProduct: (updatedProduct) =>
    set((state) => ({
      products: state.products.map((product) =>
        product._id === updatedProduct._id ? updatedProduct : product
      ),
    })),

  deleteProduct: (productId: string) =>
    set((state) => ({
      products: state.products.filter((product) => product._id !== productId),
    })),

  setSelectedProduct: (product) => set({ selectedProduct: product }),

  setLoading: (loading) => set({ loading }),

  setError: (error) => set({ error }),

  // API Integration
  fetchProducts: async () => {
    try {
      set({ loading: true, error: null });
      const response = await fetch(`${API_URL}/products`);
      if (!response.ok) throw new Error("Failed to fetch products");
      const data = await response.json();
      set({ products: data });
    } catch (error) {
      console.error("API Error:", error);
      // Fallback to dummy data
      set({ products: dummyProducts });
    } finally {
      set({ loading: false });
    }
  },

  createProduct: async (productData: ProductFormData) => {
    try {
      set({ loading: true, error: null });
      const response = await fetch(`${API_URL}/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
      });
      if (!response.ok) throw new Error("Failed to create product");
      const newProduct = await response.json();
      set((state) => ({ products: [...state.products, newProduct] }));
      return newProduct;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "Failed to create product" });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  updateProductApi: async (productId: string, productData: ProductFormData) => {
    try {
      set({ loading: true, error: null });
      const response = await fetch(`${API_URL}/products/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
      });
      if (!response.ok) throw new Error("Failed to update product");
      const updatedProduct = await response.json();
      set((state) => ({
        products: state.products.map((p) =>
          p._id === productId ? updatedProduct : p
        ),
      }));
      return updatedProduct;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "Failed to update product" });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  deleteProductApi: async (productId: string) => {
    try {
      set({ loading: true, error: null });
      const response = await fetch(`${API_URL}/products/${productId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete product");
      set((state) => ({
        products: state.products.filter((p) => p._id !== productId),
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "Failed to delete product" });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
}));
