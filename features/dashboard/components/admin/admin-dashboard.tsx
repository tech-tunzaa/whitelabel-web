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
    pendingApprovals: number;
    processingOrders: number;
    unassignedOrders: number;
    pendingTickets: number;
    restockRequired: number;
    avgProcessingTime: number;
  };
  chartData: {
    sales: any[];
    approvals: any[];
    orders: any[];
    inventory: any[];
    tickets: any[];
  };
  tableData: {
    approvals: any[];
    orders: any[];
    inventory: any[];
    tickets: any[];
  };
}

export function AdminDashboard() {
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
          totalSales: 50000,
          activeVendors: 25,
          newVendors: 5,
          salesGrowth: 8.5,
          pendingApprovals: 15,
          processingOrders: 45,
          unassignedOrders: 12,
          pendingTickets: 20,
          restockRequired: 30,
          avgProcessingTime: 2.5,
        },
        chartData: {
          sales: [
            { date: "2024-01", value: 40000, orders: 200 },
            { date: "2024-02", value: 45000, orders: 225 },
            { date: "2024-03", value: 50000, orders: 250 },
          ],
          approvals: [
            { date: "2024-01", pending: 20, approved: 80, rejected: 10 },
            { date: "2024-02", pending: 15, approved: 85, rejected: 8 },
            { date: "2024-03", pending: 15, approved: 90, rejected: 5 },
          ],
          orders: [
            { date: "2024-01", processing: 50, completed: 150, canceled: 10 },
            { date: "2024-02", processing: 45, completed: 160, canceled: 8 },
            { date: "2024-03", processing: 45, completed: 170, canceled: 5 },
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
          title: "Total Sales",
          value: `$${data?.stats.totalSales.toLocaleString()}` || "$0",
          description: "All time sales",
          trend: "up",
          trendValue: `${data?.stats.salesGrowth}%`,
        },
        {
          title: "Pending Approvals",
          value: data?.stats.pendingApprovals.toString() || "0",
          description: "Products & categories",
          trend: "down",
          trendValue: "5%",
        },
        {
          title: "Processing Orders",
          value: data?.stats.processingOrders.toString() || "0",
          description: "Current orders",
          trend: "up",
          trendValue: "10%",
        },
        {
          title: "Restock Required",
          value: data?.stats.restockRequired.toString() || "0",
          description: "Low inventory items",
          trend: "up",
          trendValue: "8%",
        },
      ]}
      chartData={data?.chartData.sales || []}
      tableData={data?.tableData.orders || []}
      loading={loading}
      error={error}
      onRefresh={fetchDashboardData}
      chartTitle="Sales Performance"
      tableTitle="Order Queue"
    />
  );
}
