import { create } from "zustand";
import { Product, ProductState, ProductActions } from "../types/product";
import { dummyProducts } from "../data/dummy-products";

const initialState: ProductState = {
  products: dummyProducts,
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
}));
