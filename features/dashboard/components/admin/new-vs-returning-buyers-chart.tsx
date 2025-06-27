"use client";

import { useMemo } from 'react';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Legend } from 'recharts';
import { useDashboardStore } from '@/features/dashboard/store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartTooltip } from '@/components/ui/chart';
import { Skeleton } from '@/components/ui/skeleton';
import { CHART_COLORS_VARS } from '@/lib/colors';

export function NewVsReturningBuyersChart() {
    const newVsReturningBuyers = useDashboardStore((state) => state.newVsReturningBuyers);
    const isLoading = useDashboardStore((state) => state.loadingNewVsReturningBuyers);

    const chartData = useMemo(() => {
        return newVsReturningBuyers.map(item => ({
            date: new Date(item.order_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            newBuyers: item.new_buyers,
            returningBuyers: item.returning_buyers,
        })).reverse(); // Reverse to show oldest date first
    }, [newVsReturningBuyers]);

    const chartConfig = {
        newBuyers: {
            label: 'New Buyers',
            color: CHART_COLORS_VARS[0],
        },
        returningBuyers: {
            label: 'Returning Buyers',
            color: CHART_COLORS_VARS[1],
        },
    } satisfies ChartConfig;

    return (
        <Card className="h-full flex flex-col">
            <CardHeader>
                <CardTitle>New vs. Returning Buyers</CardTitle>
                <CardDescription>A daily breakdown of new and returning buyers.</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow flex items-center justify-center">
                {isLoading ? (
                    <Skeleton className="w-full h-[250px]" />
                ) : chartData && chartData.length > 0 ? (
                    <ChartContainer config={chartConfig} className="w-full h-full max-h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="fillNewBuyers" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={chartConfig.newBuyers.color} stopOpacity={0.8} />
                                        <stop offset="95%" stopColor={chartConfig.newBuyers.color} stopOpacity={0.1} />
                                    </linearGradient>
                                    <linearGradient id="fillReturningBuyers" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={chartConfig.returningBuyers.color} stopOpacity={0.8} />
                                        <stop offset="95%" stopColor={chartConfig.returningBuyers.color} stopOpacity={0.1} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid vertical={false} />
                                <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
                                <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                                <ChartTooltip
                                    cursor={false}
                                    content={({ active, payload, label }) => {
                                        if (active && payload && payload.length) {
                                            const data = payload[0].payload;
                                            const newBuyers = data.newBuyers || 0;
                                            const returningBuyers = data.returningBuyers || 0;
                                            const total = newBuyers + returningBuyers;

                                            return (
                                                <div className="rounded-lg border bg-background p-2 shadow-sm text-sm">
                                                    <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                                                        <span className="font-bold col-span-2 text-center mb-1">{label}</span>
                                                        
                                                        <span className="flex items-center text-muted-foreground">
                                                            <span className="w-2.5 h-2.5 rounded-[2px] mr-2" style={{ backgroundColor: chartConfig.newBuyers.color }} />
                                                            New Buyers
                                                        </span>
                                                        <span className="font-semibold text-right">{newBuyers} ({total > 0 ? (newBuyers/total*100).toFixed(0) : 0}%)</span>

                                                        <span className="flex items-center text-muted-foreground">
                                                            <span className="w-2.5 h-2.5 rounded-[2px] mr-2" style={{ backgroundColor: chartConfig.returningBuyers.color }} />
                                                            Returning
                                                        </span>
                                                        <span className="font-semibold text-right">{returningBuyers} ({total > 0 ? (returningBuyers/total*100).toFixed(0) : 0}%)</span>
                                                    </div>
                                                    <div className="border-t my-2" />
                                                    <div className="flex justify-between font-bold">
                                                        <span>Total</span>
                                                        <span>{total}</span>
                                                    </div>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                <Legend />
                                <Area type="monotone" dataKey="newBuyers" stackId="a" stroke={chartConfig.newBuyers.color} fill="url(#fillNewBuyers)" animationDuration={800} />
                                <Area type="monotone" dataKey="returningBuyers" stackId="a" stroke={chartConfig.returningBuyers.color} fill="url(#fillReturningBuyers)" animationDuration={800} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                ) : (
                    <div className="text-center text-muted-foreground">
                        No buyer data available.
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
