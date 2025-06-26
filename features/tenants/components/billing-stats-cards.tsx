"use client";

import { useEffect } from "react";
import { useTenantStore } from "@/features/tenants/store";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Users, 
  FileText, 
  AlertTriangle, 
  CircleDollarSign, 
  Banknote, 
  Clock, 
  FileCog
} from "lucide-react";

const formatCurrency = (amount: number | undefined, currency: string | undefined) => {
  if (amount === undefined || currency === undefined) return "N/A";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const StatCard = ({ title, value, description, icon: Icon, colorClass = "" }) => (
  <Card className="dark:bg-card/60 bg-gradient-to-t from-primary/5 to-card shadow-xs">
    <CardHeader>
      <CardDescription>{title}</CardDescription>
      <CardTitle className={`text-3xl font-semibold tabular-nums ${colorClass}`}>
        {value}
      </CardTitle>
    </CardHeader>
    <CardFooter className="flex-col items-start gap-1.5 text-sm">
      <div className="flex items-center gap-2 font-medium text-muted-foreground">
        <Icon className={`h-4 w-4 ${colorClass}`} />
        <span>{description}</span>
      </div>
    </CardFooter>
  </Card>
);

export const BillingStatsCards = () => {
  const {
    billingDashboardMetrics: metrics,
    loading,
    storeError,
    fetchBillingDashboardMetrics,
  } = useTenantStore();

  useEffect(() => {
    if (!metrics) {
      fetchBillingDashboardMetrics();
    }
  }, [fetchBillingDashboardMetrics, metrics]);

  if (loading && !metrics) {
    return (
      <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="dark:bg-card/60 bg-gradient-to-t from-primary/5 to-card shadow-xs">
            <CardHeader>
              <div className="h-4 bg-gray-300 dark:bg-gray-200/80 rounded w-2/3 animate-pulse"></div>
              <div className="h-8 bg-gray-300 dark:bg-gray-200/80 rounded w-1/2 animate-pulse mt-1"></div>
            </CardHeader>
            <CardFooter>
              <div className="h-4 bg-gray-300 dark:bg-gray-200/80 rounded w-full animate-pulse"></div>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  if (storeError && !metrics) {
    return (
      <div className="p-4">
        <Card className="bg-destructive/10 border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Error Loading Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-destructive-foreground">
              {storeError.message}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!metrics) return null;

  const currency = metrics.currency || "TZS";

  return (
    <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="This Month's Revenue"
        value={formatCurrency(metrics.monthly_revenue, currency)}
        description="Total revenue collected this month"
        icon={Banknote}
      />
      <StatCard
        title="Total Overdue"
        value={formatCurrency(metrics.total_overdue_amount, currency)}
        description={`${metrics.overdue_invoices} invoices are overdue`}
        icon={AlertTriangle}
        colorClass="text-destructive"
      />
      <StatCard
        title="Total Pending"
        value={formatCurrency(metrics.total_pending_amount, currency)}
        description={`${metrics.pending_invoices} invoices awaiting payment`}
        icon={Clock}
      />
      <StatCard
        title="Active Tenants"
        value={`${metrics.active_billing_configs} / ${metrics.total_tenants}`}
        description="Tenants with active billing configs"
        icon={Users}
      />
    </div>
  );
};
