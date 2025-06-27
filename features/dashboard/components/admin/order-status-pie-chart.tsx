"use client";

import { useMemo } from 'react';
import { useDashboardStore } from "@/features/dashboard/store";
import { shallow } from 'zustand/shallow';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

const COLORS: Record<string, string> = {
    pending: '#FBBF24', // amber-400
    confirmed: '#3B82F6', // blue-500
    shipped: '#F97316', // orange-500
    delivered: '#22C55E', // green-500
    cancelled: '#EF4444', // red-500
    failed: '#DC2626', // red-600
    default: '#6B7280', // gray-500
};

const getStatusColor = (status: string) => {
    return COLORS[status.toLowerCase()] || COLORS.default;
}

export function OrderStatusPieChart() {
            const orderStatusDistributionData = useDashboardStore((state) => state.orderStatusDistributionData);
    const isLoading = useDashboardStore((state) => state.loadingOrderStatusDistributionData);

    

            const chartData = useMemo(() => {
        if (!orderStatusDistributionData) return [];
        return orderStatusDistributionData.map(item => {
            const status = item.status;
            const name = status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown';
            return {
                name,
                value: Number(item.order_count) || 0,
            };
        });
    }, [orderStatusDistributionData]);

    return (
        <Card className="h-full flex flex-col">
            <CardHeader>
                <CardTitle>Order Status Distribution</CardTitle>
                <CardDescription>A breakdown of orders by their current status.</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow flex items-center justify-center">
                {isLoading ? (
                    <Skeleton className="w-full h-64 rounded-full" />
                ) : chartData && chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Tooltip 
                                contentStyle={{ 
                                    background: 'hsl(var(--background))', 
                                    borderColor: 'hsl(var(--border))' 
                                }}
                            />
                            <Legend />
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                innerRadius={60} outerRadius={100}
                                fill="#8884d8"
                                dataKey="value"
                                nameKey="name"
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={getStatusColor(entry.name)} />
                                ))}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="text-center text-muted-foreground">
                        No order status data available.
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
