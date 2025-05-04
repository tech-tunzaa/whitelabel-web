"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { DashboardLayout } from "../shared/dashboard-layout";

interface DashboardData {
  stats: {
    totalTasks: number;
    completedTasks: number;
    pendingTasks: number;
    processingRate: number;
  };
  chartData: any[];
  tableData: any[];
}

export function SubAdminDashboard() {
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
          totalTasks: 150,
          completedTasks: 120,
          pendingTasks: 30,
          processingRate: 85,
        },
        chartData: [
          { date: "2024-01", value: 100 },
          { date: "2024-02", value: 120 },
          { date: "2024-03", value: 150 },
        ],
        tableData: [
          { 
            id: 1, 
            title: "Task 1", 
            status: "In Progress", 
            priority: "High",
            assignedTo: "John Doe",
            dueDate: "2024-03-20"
          },
          { 
            id: 2, 
            title: "Task 2", 
            status: "Pending", 
            priority: "Medium",
            assignedTo: "Jane Smith",
            dueDate: "2024-03-25"
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
          title: "Total Tasks",
          value: data?.stats.totalTasks.toString() || "0",
          description: "All tasks",
          trend: "up",
          trendValue: "12%",
        },
        {
          title: "Completed Tasks",
          value: data?.stats.completedTasks.toString() || "0",
          description: "Successfully completed",
          trend: "up",
          trendValue: "8%",
        },
        {
          title: "Pending Tasks",
          value: data?.stats.pendingTasks.toString() || "0",
          description: "Awaiting action",
          trend: "down",
          trendValue: "3%",
        },
        {
          title: "Processing Rate",
          value: `${data?.stats.processingRate}%` || "0%",
          description: "Task completion rate",
          trend: "up",
          trendValue: "5%",
        },
      ]}
      chartData={data?.chartData || []}
      tableData={data?.tableData || []}
      loading={loading}
      error={error}
      onRefresh={fetchDashboardData}
      chartTitle="Task Processing"
      tableTitle="Task Queue"
    />
  );
} 