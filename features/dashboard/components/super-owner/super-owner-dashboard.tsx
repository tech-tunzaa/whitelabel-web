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
    totalRevenue: number;
    outstandingInvoices: number;
    totalGMV: number;
    gmvGrowth: number;
    totalUsers: number;
    newUsers: number;
    openTickets: number;
    resolvedTickets: number;
    suspiciousActivities: number;
    kycPassRate: number;
  };
  chartData: {
    tenantGrowth: any[];
    revenue: any[];
    gmv: any[];
    userBase: any[];
    supportLoad: any[];
  };
  tableData: {
    tenants: any[];
    revenue: any[];
    users: any[];
    tickets: any[];
    security: any[];
  };
}

export function SuperOwnerDashboard() {
  const { data: session } = useSession();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState("30d");
  const [selectedTenant, setSelectedTenant] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, [timeRange, selectedTenant]);

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
          totalRevenue: 500000,
          outstandingInvoices: 25000,
          totalGMV: 2500000,
          gmvGrowth: 15.8,
          totalUsers: 50000,
          newUsers: 2500,
          openTickets: 45,
          resolvedTickets: 205,
          suspiciousActivities: 12,
          kycPassRate: 95.5,
        },
        chartData: {
          tenantGrowth: [
            { date: "2024-01", newTenants: 10, churnRate: 2 },
            { date: "2024-02", newTenants: 12, churnRate: 1.5 },
            { date: "2024-03", newTenants: 15, churnRate: 1.8 },
          ],
          revenue: [
            { date: "2024-01", subscription: 150000, usage: 50000 },
            { date: "2024-02", subscription: 160000, usage: 55000 },
            { date: "2024-03", subscription: 170000, usage: 60000 },
          ],
          gmv: [
            { date: "2024-01", value: 2000000 },
            { date: "2024-02", value: 2200000 },
            { date: "2024-03", value: 2500000 },
          ],
          userBase: [
            { date: "2024-01", buyers: 30000, vendors: 15000, delivery: 5000 },
            { date: "2024-02", buyers: 32000, vendors: 16000, delivery: 5500 },
            { date: "2024-03", buyers: 35000, vendors: 17000, delivery: 6000 },
          ],
          supportLoad: [
            { date: "2024-01", open: 50, resolved: 180 },
            { date: "2024-02", open: 45, resolved: 190 },
            { date: "2024-03", open: 45, resolved: 205 },
          ],
        },
        tableData: {
          tenants: [
            {
              id: 1,
              name: "Tenant 1",
              status: "Active",
              revenue: 10000,
              growth: 12,
            },
            {
              id: 2,
              name: "Tenant 2",
              status: "Inactive",
              revenue: 8000,
              growth: -5,
            },
          ],
          revenue: [
            {
              id: 1,
              tenant: "Tenant 1",
              subscription: 5000,
              usage: 2000,
              outstanding: 1000,
            },
            {
              id: 2,
              tenant: "Tenant 2",
              subscription: 4000,
              usage: 1500,
              outstanding: 500,
            },
          ],
          users: [
            { id: 1, type: "Buyer", total: 25000, new: 1500, active: 20000 },
            { id: 2, type: "Vendor", total: 12000, new: 800, active: 10000 },
          ],
          tickets: [
            {
              id: 1,
              tenant: "Tenant 1",
              type: "Technical",
              status: "Open",
              responseTime: 2,
            },
            {
              id: 2,
              tenant: "Tenant 2",
              type: "Billing",
              status: "Resolved",
              responseTime: 1,
            },
          ],
          security: [
            {
              id: 1,
              tenant: "Tenant 1",
              type: "Suspicious Login",
              status: "Investigation",
              risk: "High",
            },
            {
              id: 2,
              tenant: "Tenant 2",
              type: "KYC Pending",
              status: "Review",
              risk: "Medium",
            },
          ],
        },
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
          trendValue: `${data?.stats.tenantGrowth}%`,
        },
        {
          title: "Total Revenue",
          value: `$${data?.stats.totalRevenue.toLocaleString()}` || "$0",
          description: "Subscription & usage fees",
          trend: "up",
          trendValue: "15%",
        },
        {
          title: "Platform GMV",
          value: `$${data?.stats.totalGMV.toLocaleString()}` || "$0",
          description: "Gross merchandise value",
          trend: "up",
          trendValue: `${data?.stats.gmvGrowth}%`,
        },
        {
          title: "Active Users",
          value: data?.stats.totalUsers.toLocaleString() || "0",
          description: "Total platform users",
          trend: "up",
          trendValue: "8%",
        },
      ]}
      chartData={data?.chartData.tenantGrowth || []}
      tableData={data?.tableData.tenants || []}
      loading={loading}
      error={error}
      onRefresh={fetchDashboardData}
      chartTitle="Tenant Growth"
      tableTitle="Tenants Overview"
    />
  );
}
