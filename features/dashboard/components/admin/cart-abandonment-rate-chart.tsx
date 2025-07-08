"use client";

import { useState, useMemo } from 'react';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { useDashboardStore } from '@/features/dashboard/store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Skeleton } from '@/components/ui/skeleton';
import { CardAction } from '@/components/ui/card';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function CartAbandonmentRateChart() {
    const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
    const cartAbandonmentRate = useDashboardStore((state) => state.cartAbandonmentRate);
    const isLoading = useDashboardStore((state) => state.loadingCartAbandonmentRate);

    const { chartData, averageAbandonmentRate } = useMemo(() => {
        const data = cartAbandonmentRate.map(item => ({
            date: item.cart_date,
            abandonmentRate: item.abandonment_rate,
        }));

        const totalRate = data.reduce((acc, item) => acc + item.abandonmentRate, 0);
        const average = data.length > 0 ? totalRate / data.length : 0;

        return { chartData: data, averageAbandonmentRate: average };
    }, [cartAbandonmentRate]);

    const filteredData = useMemo(() => {
        const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
        return chartData.slice(-days);
    }, [chartData, timeRange]);

    const chartConfig = {
        abandonmentRate: {
            label: 'Abandonment Rate',
            color: 'var(--color-desktop)',
        },
        average: {
            label: 'Average',
            color: 'var(--color-mobile)',
        }
    } satisfies ChartConfig;

    return (
        <Card className="@container/card">
            <CardHeader>
                <CardTitle>Cart Abandonment Rate</CardTitle>
                <CardDescription>The percentage of carts that were abandoned over time.</CardDescription>
            </CardHeader>
            <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
                {isLoading ? (
                    <Skeleton className="w-full h-[250px]" />
                ) : filteredData && filteredData.length > 0 ? (
                    <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
                        <AreaChart data={filteredData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                            <defs>
                                <linearGradient id="fillAbandonment" x1="0" y1="0" x2="0" y2="1">
                                    <stop
                                        offset="5%"
                                        stopColor={chartConfig.abandonmentRate.color}
                                        stopOpacity={1.0}
                                    />
                                    <stop
                                        offset="95%"
                                        stopColor={chartConfig.abandonmentRate.color}
                                        stopOpacity={0.1}
                                    />
                                </linearGradient>
                            </defs>
                            <CartesianGrid 
                                vertical={false} 
                                strokeDasharray="3 3" 
                                stroke="hsl(var(--border))"
                                horizontal={true}
                            />
                            <XAxis
                                dataKey="date"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                minTickGap={32}
                                tickFormatter={(value) => {
                                    const date = new Date(value);
                                    return date.toLocaleDateString("en-US", {
                                        month: "short",
                                        day: "numeric",
                                    });
                                }}
                            />
                            <YAxis
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                tickFormatter={(value) => `${value}%`}
                                domain={[0, 125]}
                                tickCount={6}
                                allowDataOverflow={true}
                                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                                stroke="hsl(var(--border))"
                                tickLine={{ stroke: 'hsl(var(--border))' }}
                            />
                            <ChartTooltip
                                cursor={false}
                                content={
                                    <ChartTooltipContent
                                        formatter={(value) => `${Number(value).toFixed(1)}%`}
                                        indicator="dot"
                                    />
                                }
                            />
                            <Area
                                dataKey="abandonmentRate"
                                type="natural"
                                fill="url(#fillAbandonment)"
                                stroke={chartConfig.abandonmentRate.color}
                                strokeWidth={2}
                                dot={false}
                            />
                        </AreaChart>
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
