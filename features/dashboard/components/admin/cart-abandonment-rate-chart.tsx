"use client";

import { useMemo } from 'react';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, ReferenceLine } from 'recharts';
import { useDashboardStore } from '@/features/dashboard/store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Skeleton } from '@/components/ui/skeleton';
import { CHART_COLORS_VARS } from '@/lib/colors';

export function CartAbandonmentRateChart() {
    const cartAbandonmentRate = useDashboardStore((state) => state.cartAbandonmentRate);
    const isLoading = useDashboardStore((state) => state.loadingCartAbandonmentRate);

    const { chartData, averageAbandonmentRate } = useMemo(() => {
        const data = cartAbandonmentRate.map(item => ({
            date: new Date(item.cart_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            abandonmentRate: item.abandonment_rate,
        })).reverse();

        const totalRate = data.reduce((acc, item) => acc + item.abandonmentRate, 0);
        const average = data.length > 0 ? totalRate / data.length : 0;

        return { chartData: data, averageAbandonmentRate: average };
    }, [cartAbandonmentRate]);

    const chartConfig = {
        abandonmentRate: {
            label: 'Abandonment Rate',
            color: CHART_COLORS_VARS[2],
        },
        average: {
            label: 'Average',
            color: "hsl(var(--muted-foreground))",
        }
    } satisfies ChartConfig;

    return (
        <Card className="h-full flex flex-col">
            <CardHeader>
                <CardTitle>Cart Abandonment Rate</CardTitle>
                <CardDescription>The percentage of carts that were abandoned over time.</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow flex items-center justify-center">
                {isLoading ? (
                    <Skeleton className="w-full h-[250px]" />
                ) : chartData && chartData.length > 0 ? (
                    <ChartContainer config={chartConfig} className="w-full h-full max-h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="fillAbandonment" x1="0" y1="0" x2="0" y2="1">
                                        <stop
                                            offset="5%"
                                            stopColor={chartConfig.abandonmentRate.color}
                                            stopOpacity={0.8}
                                        />
                                        <stop
                                            offset="95%"
                                            stopColor={chartConfig.abandonmentRate.color}
                                            stopOpacity={0.1}
                                        />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid vertical={false} />
                                <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
                                <YAxis tickLine={false} axisLine={false} tickMargin={8} unit="%" />
                                <ChartTooltip
                                    cursor={false}
                                    content={<ChartTooltipContent
                                        formatter={(value) => `${Number(value).toFixed(1)}%`}
                                        labelClassName="text-sm"
                                        indicator="dot"
                                    />}
                                />
                                <Area
                                    dataKey="abandonmentRate"
                                    type="monotone"
                                    fill="url(#fillAbandonment)"
                                    stroke={chartConfig.abandonmentRate.color}
                                    strokeWidth={2}
                                    dot={false}
                                    animationDuration={800}
                                />
                                <ReferenceLine y={averageAbandonmentRate} label={{ value: 'Avg', position: 'right', fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} stroke={chartConfig.average.color} strokeDasharray="3 3" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                ) : (
                    <div className="text-center text-muted-foreground">
                        No cart abandonment data available.
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
