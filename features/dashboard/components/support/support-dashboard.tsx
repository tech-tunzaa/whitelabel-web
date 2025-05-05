"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { DashboardLayout } from "../shared/dashboard-layout";

interface DashboardData {
  stats: {
    totalTickets: number;
    openTickets: number;
    resolvedTickets: number;
    responseTime: number;
  };
  chartData: any[];
  tableData: any[];
}

export function SupportDashboard() {
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
          totalTickets: 250,
          openTickets: 45,
          resolvedTickets: 205,
          responseTime: 2.5,
        },
        chartData: [
          { date: "2024-01", value: 180 },
          { date: "2024-02", value: 220 },
          { date: "2024-03", value: 250 },
        ],
        tableData: [
          { 
            id: 1, 
            title: "Login Issue", 
            status: "Open", 
            priority: "High",
            customer: "John Smith",
            createdAt: "2024-03-20",
            category: "Authentication"
          },
          { 
            id: 2, 
            title: "Payment Failed", 
            status: "In Progress", 
            priority: "High",
            customer: "Jane Doe",
            createdAt: "2024-03-19",
            category: "Billing"
          },
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
          title: "Total Tickets",
          value: data?.stats.totalTickets.toString() || "0",
          description: "All tickets",
          trend: "up",
          trendValue: "15%",
        },
        {
          title: "Open Tickets",
          value: data?.stats.openTickets.toString() || "0",
          description: "Needs attention",
          trend: "down",
          trendValue: "8%",
        },
        {
          title: "Resolved Tickets",
          value: data?.stats.resolvedTickets.toString() || "0",
          description: "Successfully closed",
          trend: "up",
          trendValue: "12%",
        },
        {
          title: "Avg. Response Time",
          value: `${data?.stats.responseTime}h` || "0h",
          description: "Time to first response",
          trend: "down",
          trendValue: "10%",
        },
      ]}
      chartData={data?.chartData || []}
      tableData={data?.tableData || []}
      loading={loading}
      error={error}
      onRefresh={fetchDashboardData}
      chartTitle="Ticket Volume"
      tableTitle="Support Tickets"
    />
  );
} 