"use client";


import Link from 'next/link';
import { useDashboardStore } from '../../store'; 

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

const formatCurrency = (amount: number) => {
    if (typeof amount !== 'number') return 'TZS 0';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'TZS', minimumFractionDigits: 0 }).format(amount);
};

const ProductRowSkeleton = () => (
    <TableRow>
        <TableCell><Skeleton className="h-5 w-full" /></TableCell>
        <TableCell><Skeleton className="h-5 w-full" /></TableCell>
        <TableCell><Skeleton className="h-5 w-full" /></TableCell>
    </TableRow>
);

export function TopPerformingProductsTable() {
    const topPerformingProducts = useDashboardStore((state) => state.topPerformingProducts);
    const isLoading = useDashboardStore((state) => state.loadingTopPerformingProducts);

    return (
        <Card className="h-full flex flex-col">
            <CardHeader>
                <CardTitle>Top Performing Products</CardTitle>
                <CardDescription>Your best-selling products by revenue.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="max-h-[250px] overflow-y-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Product</TableHead>
                            <TableHead className="text-right">Units Sold</TableHead>
                            <TableHead className="text-right">Revenue</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            Array.from({ length: 5 }).map((_, i) => <ProductRowSkeleton key={i} />)
                        ) : topPerformingProducts && topPerformingProducts.length > 0 ? (
                            topPerformingProducts.map((product) => (
                                <TableRow key={product.product_id}>
                                    <TableCell className="font-medium">
                                        <Link href={`/dashboard/products/${product.product_id}`} className="hover:underline">
                                            {product.product_name}
                                        </Link>
                                    </TableCell>
                                    <TableCell className="text-right">{product.order_count}</TableCell>
                                    <TableCell className="text-right">{formatCurrency(product.product_gmv)}</TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={3} className="text-center text-muted-foreground">
                                    No product data available.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
                </div>
            </CardContent>
        </Card>
    );
}
