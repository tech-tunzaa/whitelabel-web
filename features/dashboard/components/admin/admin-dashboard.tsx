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
import { NewVsReturningBuyersChart } from './new-vs-returning-buyers-chart';
import { CartAbandonmentRateChart } from './cart-abandonment-rate-chart';

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
    state.loadingAverageOrderValue ||
    state.loadingNewVsReturningBuyers ||
    state.loadingCartAbandonmentRate
  );
  const hasData = useDashboardStore((state) => !!state.gmvData);

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

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-7">
              <div className="lg:col-span-5">
                  <GmvPerformanceChart />
              </div>
              <div className="lg:col-span-2 flex flex-col">
                  <OrderStatusPieChart />
              </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
              <div className="lg:col-span-2">
                  <TopPerformingProductsTable />
              </div>
              <div className="lg:col-span-3">
                  <NewVsReturningBuyersChart />
              </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-7">
              <div className="lg:col-span-5">
                  <CartAbandonmentRateChart />
              </div>
              <div className="lg:col-span-2">
                  <PaymentSuccessRatePieChart />
              </div>
          </div>
        </div>
    </div>
  );
}


