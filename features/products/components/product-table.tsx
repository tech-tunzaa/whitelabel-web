"use client";

import { useState } from "react";
import { Eye, MoreHorizontal, Pencil, Trash } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Product } from "../types/product";
import { useRouter } from "next/navigation";

interface ProductTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

const statusColors = {
  active: "bg-green-100 text-green-800",
  draft: "bg-gray-100 text-gray-800",
};

export function ProductTable({
  products,
  onDelete,
}: ProductTableProps) {
  const router = useRouter();
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Stock</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product._id.toString()}>
              <TableCell className="font-medium">
                <div className="flex flex-col">
                  <span>{product.name}</span>
                  <span className="text-sm text-muted-foreground">
                    {product.variants?.length
                      ? `${product.variants.length} variants`
                      : "No variants"}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                {product.variants?.length
                  ? `${product.variants.length} price points`
                  : new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "TZS",
                    }).format(product.price || 0)}
              </TableCell>
              <TableCell>
                {product.variants?.length
                  ? product.variants.reduce(
                      (total, variant) =>
                        total + (variant.inventory.stockLevel || 0),
                      0
                    )
                  : product.inventory?.stockLevel || 0}
              </TableCell>
              <TableCell>
                <Badge
                  variant="secondary"
                  className={statusColors[product.status]}
                >
                  {product.status}
                </Badge>
              </TableCell>
              <TableCell>
                {product.createdAt ? formatDistanceToNow(new Date(product.createdAt), {
                  addSuffix: true,
                  locale: require('date-fns/locale/en-US')
                }) : 'N/A'}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => router.push(`/dashboard/products/${product.product_id}`)}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      View
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEdit(product)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onDelete(product)}>
                      <Trash className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
