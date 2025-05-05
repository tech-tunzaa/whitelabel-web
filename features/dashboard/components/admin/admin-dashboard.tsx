"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { DashboardLayout } from "../shared/dashboard-layout";

interface DashboardData {
  stats: {
    totalSales: number;
    activeVendors: number;
    newVendors: number;
    salesGrowth: number;
  };
  chartData: any[];
  tableData: any[];
}

export function AdminDashboard() {
  const { data: session } = useSession();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      const mockData: DashboardData = {
        stats: {
          totalSales: 50000,
          activeVendors: 25,
          newVendors: 5,
          salesGrowth: 8.5,
        },
        chartData: [
          { date: "2024-01", value: 40000 },
          { date: "2024-02", value: 45000 },
          { date: "2024-03", value: 50000 },
        ],
        tableData: [
          { id: 1, name: "Vendor 1", status: "Active", sales: 10000 },
          { id: 2, name: "Vendor 2", status: "Inactive", sales: 8000 },
        ],
      };
      setData(mockData);
    } catch (err) {
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout
      stats={[
        {
          title: "Total Sales",
          value: `$${data?.stats.totalSales.toLocaleString()}` || "$0",
          description: "All time sales",
          trend: "up",
          trendValue: "12%",
        },
        {
          title: "Active Vendors",
          value: data?.stats.activeVendors.toString() || "0",
          description: "Currently active",
          trend: "up",
          trendValue: "8%",
        },
        {
          title: "New Vendors",
          value: data?.stats.newVendors.toString() || "0",
          description: "This month",
          trend: "up",
          trendValue: "15%",
        },
        {
          title: "Sales Growth",
          value: `${data?.stats.salesGrowth}%` || "0%",
          description: "Monthly growth",
          trend: "up",
          trendValue: "5%",
        },
      ]}
      chartData={data?.chartData || []}
      tableData={data?.tableData || []}
      loading={loading}
      error={error}
      onRefresh={fetchDashboardData}
      chartTitle="Sales Volume"
      tableTitle="Vendors Overview"
    />
  );
} 