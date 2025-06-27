"use client";

import { useMemo } from "react";
import { useDashboardStore } from "@/features/dashboard/store";
import { shallow } from "zustand/shallow";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { SEMANTIC_CHART_COLORS } from '@/lib/colors';

export function PaymentSuccessRatePieChart() {
  const paymentSuccessRate = useDashboardStore(
    (state) => state.paymentSuccessRate
  );
    const isLoading = useDashboardStore(
    (state) => state.loadingPaymentSuccessRate
  );

  const chartData = useMemo(() => {
    if (!paymentSuccessRate) return [];

    const successEntry = paymentSuccessRate.find(
      (p) => p.status?.toUpperCase() === "COMPLETED"
    );
    const failedEntry = paymentSuccessRate.find(
      (p) => p.status?.toUpperCase() === "FAILED"
    );

    return [
      {
        name: "Successful",
        value: successEntry ? Number(successEntry.payment_count) : 0,
      },
      {
        name: "Failed",
        value: failedEntry ? Number(failedEntry.payment_count) : 0,
      },
    ].filter((d) => d.value > 0);
  }, [paymentSuccessRate]);

  const chartConfig = useMemo(() => {
    if (!chartData) return {};
    const config: ChartConfig = {};
    chartData.forEach((item) => {
        config[item.name] = {
            label: item.name,
            color: item.name === 'Successful' 
                ? SEMANTIC_CHART_COLORS.success
                : SEMANTIC_CHART_COLORS.danger,
        };
    });
    return config;
  }, [chartData]);

  const totalPayments = useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.value, 0);
  }, [chartData]);

  const successRate = useMemo(() => {
    if (totalPayments === 0) return 0;
    const successfulPayments = chartData.find(d => d.name === 'Successful')?.value || 0;
    return (successfulPayments / totalPayments) * 100;
  }, [chartData, totalPayments]);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Payment Success Rate</CardTitle>
        <CardDescription>
          A breakdown of successful vs. failed payments.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow flex items-center justify-center pb-0">
        {isLoading ? (
          <Skeleton className="w-full h-64 rounded-full" />
        ) : chartData && chartData.length > 0 ? (
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square h-full max-h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Legend
                    iconType="circle"
                    formatter={(value) => (
                        <span className="text-sm text-muted-foreground">
                            {value}
                        </span>
                    )}
                    verticalAlign="bottom"
                    wrapperStyle={{ paddingBottom: '10px' }}
                />
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={60}
                  outerRadius={80}
                  isAnimationActive={true}
                  animationBegin={0}
                  animationDuration={800}
                  labelLine={false}
                  label={false}
                >
                  {chartData.map((entry) => (
                    <Cell
                      key={`cell-${entry.name}`}
                      fill={chartConfig[entry.name]?.color}
                      stroke="none"
                    />
                  ))}
                </Pie>
                <Legend />
                <foreignObject x="50%" y="50%" width="100" height="100" style={{ transform: 'translate(-50%, -50%)' }}>
                    <div className="flex flex-col items-center justify-center text-center">
                        <span className="text-sm text-muted-foreground">Success Rate</span>
                        <span className="text-2xl font-bold">
                            {successRate.toFixed(1)}%
                        </span>
                    </div>
                </foreignObject>
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        ) : (
          <div className="text-center text-muted-foreground">
            No payment data available.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
