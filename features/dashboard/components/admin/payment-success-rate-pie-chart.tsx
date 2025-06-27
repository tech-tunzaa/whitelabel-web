"use client";

import { useMemo } from 'react';
import { useDashboardStore } from "@/features/dashboard/store";
import { shallow } from 'zustand/shallow';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

const COLORS = { 'Successful': '#22C55E', 'Failed': '#EF4444' };

export function PaymentSuccessRatePieChart() {
            const paymentSuccessRate = useDashboardStore((state) => state.paymentSuccessRate);
    const isLoading = useDashboardStore((state) => state.loadingPaymentSuccessRate);

    

        const chartData = useMemo(() => {
        if (!paymentSuccessRate) return [];

        const successEntry = paymentSuccessRate.find(p => p.status?.toUpperCase() === 'COMPLETED');
        const failedEntry = paymentSuccessRate.find(p => p.status?.toUpperCase() === 'FAILED');

        return [
            { name: 'Successful', value: successEntry ? Number(successEntry.payment_count) : 0 },
            { name: 'Failed', value: failedEntry ? Number(failedEntry.payment_count) : 0 },
        ].filter(d => d.value > 0);
    }, [paymentSuccessRate]);

    return (
        <Card className="h-full flex flex-col">
            <CardHeader>
                <CardTitle>Payment Success Rate</CardTitle>
                <CardDescription>A breakdown of successful vs. failed payments.</CardDescription>
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
                                    <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS]} />
                                ))}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="text-center text-muted-foreground">
                        No payment data available.
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
