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
import { SEMANTIC_CHART_COLORS, CHART_COLORS } from "@/lib/colors";

export function OrderStatusPieChart() {
  const orderStatusDistributionData = useDashboardStore(
    (state) => state.orderStatusDistributionData
  );
  const isLoading = useDashboardStore(
    (state) => state.loadingOrderStatusDistributionData
  );

  const chartData = useMemo(() => {
    if (!orderStatusDistributionData) return [];
    return orderStatusDistributionData.map((item) => {
      const status = item.status;
      const name = status
        ? status.charAt(0).toUpperCase() + status.slice(1)
        : "Unknown";
      return {
        name,
        value: Number(item.order_count) || 0,
      };
    });
  }, [orderStatusDistributionData]);

  const chartConfig = useMemo(() => {
    if (!chartData) return {};
    const config: ChartConfig = {};

    // Map each status to a unique color from CHART_COLORS
    const statusColors: Record<string, string> = {
      PENDING: CHART_COLORS[3], // yellow-400
      PROCESSING: CHART_COLORS[0], // blue-400
      CONFIRMED: CHART_COLORS[8], // indigo-400
      REJECTED: CHART_COLORS[1], // red-400
      SHIPPED: CHART_COLORS[10], // sky-400
      DELIVERED: CHART_COLORS[2], // green-400
      COMPLETED: CHART_COLORS[6], // emerald-400
      CANCELLED: CHART_COLORS[11], // rose-400
      REFUND_REQUESTED: CHART_COLORS[4], // orange-400
      REFUNDED: CHART_COLORS[12], // purple-400
      PARTIALLY_REFUNDED: CHART_COLORS[7], // pink-400
    };

    chartData.forEach((item) => {
      const status = item.name.toUpperCase();
      const color = statusColors[status] || SEMANTIC_CHART_COLORS.default;

      config[item.name] = {
        label: item.name
          .split("_")
          .map(
            (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
          )
          .join(" "),
        color: color,
      };
    });

    return config;
  }, [chartData]);

  const totalOrders = useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.value, 0);
  }, [chartData]);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Order Status Distribution</CardTitle>
        <CardDescription>
          A breakdown of orders by their current status.
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
                  content={<ChartTooltipContent hideLabel />}
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
                  animationEasing="ease-out"
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
                <foreignObject
                  x="50%"
                  y="50%"
                  width="100"
                  height="100"
                  style={{ transform: "translate(-50%, -50%)" }}
                >
                  <div className="flex flex-col items-center justify-center text-center">
                    <span className="text-sm text-muted-foreground">
                      Total Orders
                    </span>
                    <span className="text-2xl font-bold">
                      {totalOrders.toLocaleString()}
                    </span>
                  </div>
                </foreignObject>
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        ) : (
          <div className="text-center text-muted-foreground">
            No order status data available.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
