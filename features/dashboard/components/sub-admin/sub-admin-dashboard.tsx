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
    avgApprovalTime: number;
    rejectedListings: number;
    processingOrders: number;
    unassignedOrders: number;
    pendingTickets: number;
    lowInventory: number;
  };
  chartData: {
    tasks: any[];
    approvals: any[];
    orders: any[];
    inventory: any[];
    tickets: any[];
  };
  tableData: {
    tasks: any[];
    approvals: any[];
    orders: any[];
    inventory: any[];
    tickets: any[];
  };
}

export function SubAdminDashboard() {
  const { data: session } = useSession();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState("30d");

  useEffect(() => {
    fetchDashboardData();
  }, [timeRange]);

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
          avgApprovalTime: 2.5,
          rejectedListings: 15,
          processingOrders: 45,
          unassignedOrders: 12,
          pendingTickets: 20,
          lowInventory: 30,
        },
        chartData: {
          tasks: [
            { date: "2024-01", completed: 100, pending: 50 },
            { date: "2024-02", completed: 110, pending: 40 },
            { date: "2024-03", completed: 120, pending: 30 },
          ],
          approvals: [
            { date: "2024-01", approved: 80, rejected: 20, avgTime: 3 },
            { date: "2024-02", approved: 85, rejected: 15, avgTime: 2.8 },
            { date: "2024-03", approved: 90, rejected: 10, avgTime: 2.5 },
          ],
          orders: [
            { date: "2024-01", processing: 50, unassigned: 15, completed: 85 },
            { date: "2024-02", processing: 45, unassigned: 12, completed: 90 },
            { date: "2024-03", processing: 45, unassigned: 10, completed: 95 },
          ],
          inventory: [
            { date: "2024-01", low: 40, out: 10, restocked: 30 },
            { date: "2024-02", low: 35, out: 8, restocked: 35 },
            { date: "2024-03", low: 30, out: 5, restocked: 40 },
          ],
          tickets: [
            { date: "2024-01", open: 25, resolved: 75, avgTime: 3 },
            { date: "2024-02", open: 22, resolved: 78, avgTime: 2.8 },
            { date: "2024-03", open: 20, resolved: 80, avgTime: 2.5 },
          ],
        },
        tableData: {
          tasks: [
            {
              id: 1,
              title: "Product Approval",
              status: "In Progress",
              priority: "High",
              assignedTo: "John Doe",
              dueDate: "2024-03-20",
            },
            {
              id: 2,
              title: "Order Processing",
              status: "Pending",
              priority: "Medium",
              assignedTo: "Jane Smith",
              dueDate: "2024-03-25",
            },
          ],
          approvals: [
            {
              id: 1,
              type: "Product",
              vendor: "Vendor 1",
              status: "Pending",
              submitted: "2024-03-20",
            },
            {
              id: 2,
              type: "Category",
              vendor: "Vendor 2",
              status: "Review",
              submitted: "2024-03-19",
            },
          ],
          orders: [
            {
              id: 1,
              number: "ORD-001",
              status: "Processing",
              vendor: "Vendor 1",
              timeInState: "2h",
            },
            {
              id: 2,
              number: "ORD-002",
              status: "Unassigned",
              vendor: "Vendor 2",
              timeInState: "1h",
            },
          ],
          inventory: [
            {
              id: 1,
              product: "Product 1",
              vendor: "Vendor 1",
              stock: 5,
              threshold: 10,
            },
            {
              id: 2,
              product: "Product 2",
              vendor: "Vendor 2",
              stock: 0,
              threshold: 15,
            },
          ],
          tickets: [
            {
              id: 1,
              type: "Order Issue",
              priority: "High",
              status: "Open",
              assignedTo: "Admin 1",
            },
            {
              id: 2,
              type: "Vendor Support",
              priority: "Medium",
              status: "In Progress",
              assignedTo: "Admin 2",
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
          title: "Total Tasks",
          value: data?.stats.totalTasks.toString() || "0",
          description: "All tasks",
          trend: "up",
          trendValue: "12%",
        },
        {
          title: "Processing Orders",
          value: data?.stats.processingOrders.toString() || "0",
          description: "Current orders",
          trend: "up",
          trendValue: "10%",
        },
        {
          title: "Pending Approvals",
          value: data?.stats.rejectedListings.toString() || "0",
          description: "Products & categories",
          trend: "down",
          trendValue: "5%",
        },
        {
          title: "Low Inventory",
          value: data?.stats.lowInventory.toString() || "0",
          description: "Items needing restock",
          trend: "up",
          trendValue: "8%",
        },
      ]}
      chartData={data?.chartData.tasks || []}
      tableData={data?.tableData.tasks || []}
      loading={loading}
      error={error}
      onRefresh={fetchDashboardData}
      chartTitle="Task Processing"
      tableTitle="Task Queue"
    />
  );
}
