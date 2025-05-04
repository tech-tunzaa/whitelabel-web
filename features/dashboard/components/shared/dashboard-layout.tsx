"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { DataTable } from "@/components/data-table";
import { SectionCards } from "@/components/section-cards";
import { Button } from "@/components/ui/button";
import { Download, RefreshCw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardLayoutProps {
  stats: {
    title: string;
    value: string;
    description: string;
    trend: string;
    trendValue: string;
  }[];
  chartData: any[];
  tableData: any[];
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
  chartTitle?: string;
  tableTitle?: string;
}

export function DashboardLayout({
  stats,
  chartData,
  tableData,
  loading,
  error,
  onRefresh,
  chartTitle = "Overview",
  tableTitle = "Overview",
}: DashboardLayoutProps) {
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <p className="text-destructive">{error}</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={onRefresh}
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon">
            <Download className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={onRefresh}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-[140px]" />
          ))}
        </div>
      ) : (
        <SectionCards stats={stats} />
      )}

      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-9">
        <Card className="col-span-9">
          <CardHeader>
            <CardTitle>{chartTitle}</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            {loading ? (
              <Skeleton className="h-[350px]" />
            ) : (
              <ChartAreaInteractive data={chartData || []} />
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{tableTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-[350px]" />
          ) : (
            <DataTable data={tableData || []} />
          )}
        </CardContent>
      </Card>
    </div>
  );
} 