"use client";

import { useState, useMemo } from 'react';
import { useDashboardStore } from "@/features/dashboard/store";
import { shallow } from 'zustand/shallow';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { DailyGmvPerformanceData, WeeklyGmvPerformanceData, MonthlyGmvPerformanceData } from '@/features/dashboard/types';

const formatCurrency = (amount: number) => {
    if (typeof amount !== 'number') return 'TZS 0';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'TZS', minimumFractionDigits: 0 }).format(amount);
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
            let name = '';
            let revenue = 0;

            if ('sales_date' in item) { // Daily
                name = formatDate((item as DailyGmvPerformanceData).sales_date, 'daily');
                revenue = (item as DailyGmvPerformanceData).daily_gmv;
            } else if ('week_start' in item) { // Weekly
                name = formatDate((item as WeeklyGmvPerformanceData).week_start, 'weekly');
                revenue = (item as WeeklyGmvPerformanceData).weekly_gmv;
            } else if ('month_start' in item) { // Monthly
                name = formatDate((item as MonthlyGmvPerformanceData).month_start, 'monthly');
                revenue = (item as MonthlyGmvPerformanceData).monthly_gmv;
            }
            return { name, revenue };
        });

        return mappedData.reverse(); // Reverse to show oldest first
    }, [data, timeRange]);

    return (
        <Card className="dark:bg-card/60 bg-gradient-to-t from-primary/5 to-card shadow-xs h-full flex flex-col">
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
            <CardContent className="flex-grow flex items-center justify-center">
                 {isLoading ? (
                    <Skeleton className="w-full h-full" />
                ) : chartData && chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" />
                            <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `TZS ${Number(value) / 1000}k`} />
                            <Tooltip 
                                cursor={{ fill: 'hsl(var(--muted))' }}
                                contentStyle={{ 
                                    background: 'hsl(var(--background))', 
                                    borderColor: 'hsl(var(--border))' 
                                }}
                                formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                            />
                            <Legend />
                            <Line type="monotone" dataKey="revenue" stroke="#000000" strokeWidth={2} dot={{ r: 4, fill: "#000000" }} activeDot={{ r: 8, fill: "#000000" }} connectNulls />
                        </LineChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="text-center text-muted-foreground">
                        No GMV data available for this range.
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
