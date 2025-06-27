"use client";

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useDashboardStore } from '@/features/dashboard/store';
import { shallow } from 'zustand/shallow';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { Separator }  from '@/components/ui/separator';
import { DashboardStatCards } from './dashboard-stat-cards';
import { TopPerformingProductsTable } from './top-performing-products-table';
import { OrderStatusPieChart } from './order-status-pie-chart';
import { PaymentSuccessRatePieChart } from './payment-success-rate-pie-chart';
import { GmvPerformanceChart } from './gmv-performance-chart';

export function AdminDashboard() {
  const { data: session } = useSession();
  const tenantId = session?.user?.tenant_id;

        const fetchAllReports = useDashboardStore((state) => state.fetchAllReports);
  const error = useDashboardStore((state) => state.error);
  const isLoading = useDashboardStore((state) => 
    state.loadingGmvData ||
    state.loadingActiveUsersData ||
    state.loadingOrderStatusDistributionData ||
    state.loadingPaymentSuccessRate ||
    state.loadingTopPerformingProducts ||
    state.loadingDailyGmvPerformance ||
    state.loadingWeeklyGmvPerformance ||
    state.loadingMonthlyGmvPerformance ||
    state.loadingAverageOrderValue
  );
  const hasData = useDashboardStore((state) => state.gmvData.length > 0);

  useEffect(() => {
    if (tenantId) {
      fetchAllReports(tenantId);
    }
  }, [tenantId, fetchAllReports]);

    

  if (error) {
    return (
        <Alert variant="destructive" className="mt-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
                Failed to load dashboard data: {error}
            </AlertDescription>
        </Alert>
    );
  }

      

  return (
    <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-1 p-4 pb-0">
            <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
            <p className="text-muted-foreground">
                An overview of your tenant's performance.
            </p>
        </div>
        <Separator />
        
        <div className="p-4 pt-0 space-y-6">
          <DashboardStatCards />

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
              <div className="lg:col-span-3">
                  <GmvPerformanceChart />
              </div>
              <div className="lg:col-span-2">
                  <TopPerformingProductsTable />
              </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div>
                  <OrderStatusPieChart />
              </div>
              <div>
                  <PaymentSuccessRatePieChart />
              </div>
          </div>
        </div>
    </div>
  );
}


