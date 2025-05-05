"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { ProductForm } from "@/features/products/components/product-form";
import { useProductStore } from "@/features/products/store/product-store";

export default function AddProductPage() {
  const router = useRouter();
  const { createProduct } = useProductStore();

  const handleSubmit = async (data: any) => {
    try {
      await createProduct(data);
      toast.success("Product created successfully");
      router.push("/dashboard/products");
    } catch (error) {
      toast.error("Failed to create product");
      console.error("Error creating product:", error);
    }
  };

  const handleCancel = () => {
    router.push("/dashboard/products");
  };

  return (
    <div className="flex flex-col h-full">
      {/* <div className="flex items-center p-4 border-b">
        <div className="ml-4">
          <h1 className="text-2xl font-bold tracking-tight">Add New Product</h1>
          <p className="text-muted-foreground">
            Create a new product for your marketplace
          </p>
        </div>
      </div> */}

      <div className="container mx-auto py-5">
        <ProductForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
}
