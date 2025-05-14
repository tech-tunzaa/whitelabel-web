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
    avgResolutionTime: number;
    slaCompliance: number;
    ticketsByPriority: {
      high: number;
      medium: number;
      low: number;
    };
    ticketsByChannel: {
      email: number;
      chat: number;
      phone: number;
    };
  };
  chartData: {
    volume: any[];
    response: any[];
    resolution: any[];
    sla: any[];
    channels: any[];
  };
  tableData: {
    tickets: any[];
    performance: any[];
    sla: any[];
  };
}

export function SupportDashboard() {
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
          totalTickets: 250,
          openTickets: 45,
          resolvedTickets: 205,
          responseTime: 2.5,
          avgResolutionTime: 4.8,
          slaCompliance: 95.5,
          ticketsByPriority: {
            high: 30,
            medium: 100,
            low: 120,
          },
          ticketsByChannel: {
            email: 150,
            chat: 70,
            phone: 30,
          },
        },
        chartData: {
          volume: [
            { date: "2024-01", received: 180, resolved: 160 },
            { date: "2024-02", received: 200, resolved: 180 },
            { date: "2024-03", received: 250, resolved: 205 },
          ],
          response: [
            { date: "2024-01", avgTime: 3.0, target: 2.0 },
            { date: "2024-02", avgTime: 2.8, target: 2.0 },
            { date: "2024-03", avgTime: 2.5, target: 2.0 },
          ],
          resolution: [
            { date: "2024-01", avgTime: 5.5, target: 4.0 },
            { date: "2024-02", avgTime: 5.2, target: 4.0 },
            { date: "2024-03", avgTime: 4.8, target: 4.0 },
          ],
          sla: [
            { date: "2024-01", compliance: 92, target: 95 },
            { date: "2024-02", compliance: 94, target: 95 },
            { date: "2024-03", compliance: 95.5, target: 95 },
          ],
          channels: [
            { date: "2024-01", email: 120, chat: 40, phone: 20 },
            { date: "2024-02", email: 130, chat: 50, phone: 20 },
            { date: "2024-03", email: 150, chat: 70, phone: 30 },
          ],
        },
        tableData: {
          tickets: [
            {
              id: 1,
              title: "Login Issue",
              status: "Open",
              priority: "High",
              customer: "John Smith",
              createdAt: "2024-03-20",
              category: "Authentication",
              channel: "Email",
              responseTime: "1h",
            },
            {
              id: 2,
              title: "Payment Failed",
              status: "In Progress",
              priority: "High",
              customer: "Jane Doe",
              createdAt: "2024-03-19",
              category: "Billing",
              channel: "Chat",
              responseTime: "30m",
            },
          ],
          performance: [
            {
              agent: "Agent 1",
              tickets: 50,
              avgResponse: "1.5h",
              avgResolution: "4.5h",
              satisfaction: 4.8,
            },
            {
              agent: "Agent 2",
              tickets: 45,
              avgResponse: "1.8h",
              avgResolution: "5.0h",
              satisfaction: 4.6,
            },
          ],
          sla: [
            {
              metric: "First Response",
              target: "2h",
              actual: "1.5h",
              compliance: 98,
            },
            {
              metric: "Resolution",
              target: "4h",
              actual: "4.8h",
              compliance: 95,
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
          title: "Avg Response Time",
          value: `${data?.stats.responseTime}h` || "0h",
          description: "Time to first response",
          trend: "down",
          trendValue: "10%",
        },
        {
          title: "SLA Compliance",
          value: `${data?.stats.slaCompliance}%` || "0%",
          description: "Service level agreement",
          trend: "up",
          trendValue: "2%",
        },
      ]}
      chartData={data?.chartData.volume || []}
      tableData={data?.tableData.tickets || []}
      loading={loading}
      error={error}
      onRefresh={fetchDashboardData}
      chartTitle="Ticket Volume"
      tableTitle="Support Tickets"
    />
  );
}
