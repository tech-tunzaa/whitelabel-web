"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { DashboardLayout } from "../shared/dashboard-layout";

interface DashboardData {
  stats: {
    totalTenants: number;
    activeTenants: number;
    newTenants: number;
    tenantGrowth: number;
  };
  chartData: any[];
  tableData: any[];
}

export function SuperOwnerDashboard() {
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
          totalTenants: 150,
          activeTenants: 120,
          newTenants: 15,
          tenantGrowth: 12.5,
        },
        chartData: [
          { date: "2024-01", value: 100 },
          { date: "2024-02", value: 120 },
          { date: "2024-03", value: 150 },
        ],
        tableData: [
          { id: 1, name: "Tenant 1", status: "Active", revenue: 1000 },
          { id: 2, name: "Tenant 2", status: "Inactive", revenue: 2000 },
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
          title: "Total Tenants",
          value: data?.stats.totalTenants.toString() || "0",
          description: "All registered tenants",
          trend: "up",
          trendValue: "12%",
        },
        {
          title: "Active Tenants",
          value: data?.stats.activeTenants.toString() || "0",
          description: "Currently active tenants",
          trend: "up",
          trendValue: "8%",
        },
        {
          title: "New Tenants",
          value: data?.stats.newTenants.toString() || "0",
          description: "This month",
          trend: "up",
          trendValue: "15%",
        },
        {
          title: "Growth Rate",
          value: `${data?.stats.tenantGrowth}%` || "0%",
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
      chartTitle="Tenants Growth"
      tableTitle="Tenants Overview"
    />
  );
} 