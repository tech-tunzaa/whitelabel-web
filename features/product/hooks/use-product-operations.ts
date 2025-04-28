import { useCallback } from "react";
import { useProductStore } from "../store/product-store";
import { Product } from "../types/product";
import { dummyProducts } from "../data/dummy-products";

export const useProductOperations = () => {
  const {
    setProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    setLoading,
    setError,
  } = useProductStore();

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      // TODO: Implement API call to fetch products
      // const response = await fetch("/api/products");
      // const data = await response.json();
      // setProducts(data);
      setProducts(dummyProducts);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to fetch products"
      );
    } finally {
      setLoading(false);
    }
  }, [setProducts, setLoading, setError]);

  const createProduct = useCallback(
    async (product: Omit<Product, "_id" | "createdAt" | "updatedAt">) => {
      try {
        setLoading(true);
        // TODO: Implement API call to create product
        // const response = await fetch("/api/products", {
        //   method: "POST",
        //   headers: {
        //     "Content-Type": "application/json",
        //   },
        //   body: JSON.stringify(product),
        // });
        // const newProduct = await response.json();
        const newProduct: Product = {
          ...product,
          _id: Math.random().toString(36).substr(2, 9),
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        addProduct(newProduct);
        return newProduct;
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "Failed to create product"
        );
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [addProduct, setLoading, setError]
  );

  const editProduct = useCallback(
    async (product: Product) => {
      try {
        setLoading(true);
        // TODO: Implement API call to update product
        // const response = await fetch(`/api/products/${product._id}`, {
        //   method: "PUT",
        //   headers: {
        //     "Content-Type": "application/json",
        //   },
        //   body: JSON.stringify(product),
        // });
        // const updatedProduct = await response.json();
        const updatedProduct: Product = {
          ...product,
          updatedAt: new Date(),
        };
        updateProduct(updatedProduct);
        return updatedProduct;
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "Failed to update product"
        );
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [updateProduct, setLoading, setError]
  );

  const removeProduct = useCallback(
    async (productId: string) => {
      try {
        setLoading(true);
        // TODO: Implement API call to delete product
        // await fetch(`/api/products/${productId}`, {
        //   method: "DELETE",
        // });
        deleteProduct(productId);
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "Failed to delete product"
        );
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [deleteProduct, setLoading, setError]
  );

  return {
    fetchProducts,
    createProduct,
    editProduct,
    removeProduct,
  };
};
