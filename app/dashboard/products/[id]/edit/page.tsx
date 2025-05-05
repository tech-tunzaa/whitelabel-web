"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

import { useProductStore } from "@/features/products/store/product-store";
import { Product, ProductFormData } from "@/features/products/types/product";
import { ProductForm, ProductFormValues } from "@/features/products/components/product-form";

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const { products, loading, error, updateProduct } = useProductStore();
  const [product, setProduct] = useState<Product | null>(null);

  useEffect(() => {
    const productId = params.id as string;
    const foundProduct = products.find((p) => p._id === productId);
    if (foundProduct) {
      setProduct(foundProduct);
    } else {
      toast.error("Product not found");
      router.push("/dashboard/products");
    }
  }, [params.id, products, router]);

  const handleSubmit = async (data: ProductFormValues) => {
    try {
      if (!product) return;
      const updatedProduct: Product = {
        ...product,
        name: data.name,
        description: data.description,
        status: data.status,
        featured: data.featured,
        price: data.price,
        categoryIds: [data.categoryId],
        vendorId: data.vendor,
        inventory: {
          stockLevel: data.quantity,
          stockStatus: data.quantity > 0 ? "in_stock" : "out_of_stock"
        },
        updatedAt: new Date(),
      };
      await updateProduct(updatedProduct);
      toast.success("Product updated successfully");
      router.push("/dashboard/products");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update product"
      );
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="text-destructive">Error: {error}</div>;
  }

  if (!product) {
    return null;
  }

  return (
    <div className="flex flex-col h-full">
      <div className="container mx-auto py-5">
        <ProductForm
          initialData={product}
          onSubmit={handleSubmit}
          onCancel={() => router.push("/dashboard/products")}
          title="Edit Product"
          description="Update the product details below"
        />
      </div>
    </div>
  );
} 