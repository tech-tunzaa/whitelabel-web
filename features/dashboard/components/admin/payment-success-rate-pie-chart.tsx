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
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { CHART_COLORS } from "@/lib/colors";

export function PaymentSuccessRatePieChart() {
  const paymentSuccessRate = useDashboardStore(
    (state) => state.paymentSuccessRate
  );
  const isLoading = useDashboardStore(
    (state) => state.loadingPaymentSuccessRate
  );

  // Status to color mapping with more statuses
  const statusColors: Record<string, string> = {
    COMPLETED: CHART_COLORS[2], // green-400
    SUCCESSFUL: CHART_COLORS[2], // green-400 (alias)
    FAILED: CHART_COLORS[1], // red-400
    PENDING: CHART_COLORS[3], // yellow-400
    INITIATED: CHART_COLORS[0], // blue-400
    PROCESSING: CHART_COLORS[8], // indigo-400
    CANCELLED: CHART_COLORS[11], // rose-400
    REFUNDED: CHART_COLORS[12], // purple-400
    DECLINED: CHART_COLORS[13], // teal-400
    EXPIRED: CHART_COLORS[4], // orange-400
    AUTHORIZED: CHART_COLORS[10], // sky-400
    SETTLED: CHART_COLORS[6], // emerald-400
  };

  const chartData = useMemo(() => {
    if (!paymentSuccessRate || paymentSuccessRate.length === 0) return [];

    return paymentSuccessRate
      .filter((entry) => entry.status && entry.payment_count > 0)
      .map((entry) => ({
        name: entry.status.toUpperCase(),
        value: Number(entry.payment_count),
        amount: Number(entry.total_amount) || 0,
        successRate: Number(entry.success_rate_percent) || 0,
      }))
      .sort((a, b) => b.value - a.value); // Sort by count descending
  }, [paymentSuccessRate]);

  const chartConfig = useMemo(() => {
    if (!chartData) return {};
    const config: ChartConfig = {};

    chartData.forEach((item, index) => {
      // Use predefined color or fallback to CHART_COLORS with modulo to prevent out of bounds
      const color =
        statusColors[item.name] || CHART_COLORS[index % CHART_COLORS.length];

      config[item.name] = {
        label: item.name.charAt(0) + item.name.slice(1).toLowerCase(),
        color: color,
      };
    });

    return config;
  }, [chartData]);

  const totalPayments = useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.value, 0);
  }, [chartData]);

  const successRate = useMemo(() => {
    if (totalPayments === 0) return 0;
    const successfulPayments = chartData
      .filter((d) => ["COMPLETED", "SUCCESSFUL", "SETTLED"].includes(d.name))
      .reduce((sum, curr) => sum + curr.value, 0);
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
          <Skeleton className="w-full h-64 rounded-lg" />
        ) : chartData && chartData.length > 0 ? (
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square h-full max-h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={({ active, payload }) => {
                    if (!active || !payload || !payload.length) return null;
                    const data = payload[0].payload;
                    return (
                      <div className="bg-background border rounded-lg p-3 text-sm">
                        <p className="font-medium">{data.name}</p>
                        <p>Count: {data.value.toLocaleString()}</p>
                        {!isNaN(data.amount) && (
                          <p>
                            Amount: $
                            {data.amount.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                            })}
                          </p>
                        )}
                        {!isNaN(data.successRate) && data.successRate > 0 && (
                          <p>Rate: {data.successRate.toFixed(1)}%</p>
                        )}
                      </div>
                    );
                  }}
                />
                <Legend
                  iconType="circle"
                  formatter={(value) => (
                    <span className="text-sm text-muted-foreground">
                      {value}
                    </span>
                  )}
                  verticalAlign="bottom"
                  wrapperStyle={{ paddingBottom: "10px" }}
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
                <foreignObject
                  x="50%"
                  y="50%"
                  width="100"
                  height="100"
                  style={{ transform: "translate(-50%, -50%)" }}
                >
                  <div className="flex flex-col items-center justify-center text-center">
                    <span className="text-sm text-muted-foreground">
                      Success Rate
                    </span>
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
