"use client";

import { useState, useMemo } from 'react';
import { useDashboardStore } from "@/features/dashboard/store";
import { shallow } from 'zustand/shallow';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, CartesianGrid } from 'recharts';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { DailyGmvPerformanceData, WeeklyGmvPerformanceData, MonthlyGmvPerformanceData } from '@/features/dashboard/types';

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

const formatCurrency = (amount: number, compact = false) => {
    if (typeof amount !== 'number') return 'TZS 0';
    const options: Intl.NumberFormatOptions = {
        style: 'currency',
        currency: 'TZS',
        minimumFractionDigits: 0,
    };
    if (compact) {
        options.notation = 'compact';
        options.compactDisplay = 'short';
        options.maximumFractionDigits = 1;
    }
    return new Intl.NumberFormat('en-US', options).format(amount);
};

const formatDate = (dateString: string, range: 'daily' | 'weekly' | 'monthly') => {
    const date = new Date(dateString);
    switch(range) {
        case 'daily': return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        case 'weekly': return `Week of ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
        case 'monthly': return date.toLocaleDateString('en-US', { month: 'long' });
        default: return dateString;
    }
};

export function GmvPerformanceChart() {
    const [timeRange, setTimeRange] = useState<'daily' | 'weekly' | 'monthly'>('daily');
    const dailyGmvPerformance = useDashboardStore((state) => state.dailyGmvPerformance);
    const weeklyGmvPerformance = useDashboardStore((state) => state.weeklyGmvPerformance);
    const monthlyGmvPerformance = useDashboardStore((state) => state.monthlyGmvPerformance);
    const loadingDaily = useDashboardStore((state) => state.loadingDailyGmvPerformance);
    const loadingWeekly = useDashboardStore((state) => state.loadingWeeklyGmvPerformance);
    const loadingMonthly = useDashboardStore((state) => state.loadingMonthlyGmvPerformance);

    const { data, isLoading } = useMemo(() => {
        switch (timeRange) {
            case 'daily':
                return { data: dailyGmvPerformance, isLoading: loadingDaily };
            case 'weekly':
                return { data: weeklyGmvPerformance, isLoading: loadingWeekly };
            case 'monthly':
                return { data: monthlyGmvPerformance, isLoading: loadingMonthly };
            default:
                return { data: [], isLoading: false };
        }
    }, [timeRange, dailyGmvPerformance, weeklyGmvPerformance, monthlyGmvPerformance, loadingDaily, loadingWeekly, loadingMonthly]);

        const chartData = useMemo(() => {
        if (!data) return [];
        const mappedData = data.map(item => {
            let date = '';
            let revenue = 0;

            if ('sales_date' in item) {
                date = (item as DailyGmvPerformanceData).sales_date;
                revenue = (item as DailyGmvPerformanceData).daily_gmv;
            } else if ('week_start' in item) {
                date = (item as WeeklyGmvPerformanceData).week_start;
                revenue = (item as WeeklyGmvPerformanceData).weekly_gmv;
            } else if ('month_start' in item) {
                date = (item as MonthlyGmvPerformanceData).month_start;
                revenue = (item as MonthlyGmvPerformanceData).monthly_gmv;
            }
            return { date, revenue };
        });
        return mappedData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }, [data]);

    return (
        <Card className="@container/card h-full flex flex-col">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle>GMV Performance</CardTitle>
                        <CardDescription>Gross Merchandise Value over time.</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant={timeRange === 'daily' ? 'default' : 'outline'} size="sm" onClick={() => setTimeRange('daily')}>Daily</Button>
                        <Button variant={timeRange === 'weekly' ? 'default' : 'outline'} size="sm" onClick={() => setTimeRange('weekly')}>Weekly</Button>
                        <Button variant={timeRange === 'monthly' ? 'default' : 'outline'} size="sm" onClick={() => setTimeRange('monthly')}>Monthly</Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="flex-grow flex items-center justify-center px-2 pt-4 sm:px-6 sm:pt-6">
                 {isLoading ? (
                    <Skeleton className="w-full h-[250px]" />
                ) : chartData && chartData.length > 0 ? (
                    <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
                        <AreaChart
                            accessibilityLayer
                            data={chartData}
                            margin={{ left: 12, right: 12 }}
                        >
                            <CartesianGrid vertical={false} />
                            <XAxis
                                dataKey="date"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                tickFormatter={(value) => formatDate(value, timeRange)}
                            />
                            <YAxis
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                tickFormatter={(value) => formatCurrency(Number(value), true)}
                            />
                            <ChartTooltip
                                cursor
                                content={<ChartTooltipContent 
                                    indicator="dot"
                                    formatter={(value) => formatCurrency(Number(value))}
                                />}
                            />
                            <defs>
                                <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                                    <stop
                                        offset="5%"
                                        stopColor="hsl(var(--foreground))"
                                        stopOpacity={1}
                                    />
                                    <stop
                                        offset="95%"
                                        stopColor="hsl(var(--foreground))"
                                        stopOpacity={0.3}
                                    />
                                </linearGradient>
                            </defs>
                            <Area
                                dataKey="revenue"
                                type="natural"
                                fill="url(#fillRevenue)"
                                fillOpacity={0.4}
                                stroke="var(--color-revenue)"
                                strokeWidth={2}
                            />
                        </AreaChart>
                    </ChartContainer>
                ) : (
                    <div className="text-center text-muted-foreground">
                        No GMV data available for this range.
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
