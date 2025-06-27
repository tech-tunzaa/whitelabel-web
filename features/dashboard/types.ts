// Generic API Response Wrapper
export interface ApiResponse<T> {
    data: T;
    message?: string;
    status?: string;
}

// Main Dashboard Stats & Reports

export interface GmvData {
    tenant_id: string;
    tenant_name: string;
    order_count: number;
    total_revenue: number;
    avg_order_value: number;
    gmv_contribution_percent: number;
}

export interface ActiveUsersData {
    total_active_users: number;
    active_last_7_days: number;
    active_last_30_days: number;
    new_users_last_30_days: number;
}

export interface OrderStatusDistributionData {
    status: string;
    order_count: number;
    total_value: number;
    percentage: number;
}

export interface PaymentSuccessRateData {
    status: 'COMPLETED' | 'FAILED' | 'PENDING';
    payment_count: number;
    total_amount: number;
    success_rate_percent: number;
}

export interface TopPerformingProductData {
    product_id: string;
    product_name: string;
    order_count: number;
    product_gmv: number;
    vendor_id: string;
    vendor_name: string;
}

// GMV Performance Over Time

export interface DailyGmvPerformanceData {
    sales_date: string;
    daily_orders: number;
    daily_gmv: number;
    daily_aov: number;
    daily_subtotal: number;
    daily_tax: number;
    daily_shipping: number | null;
    prev_day_gmv: number | null;
    daily_gmv_growth_percent: number | null;
    cumulative_gmv: number;
}

export interface WeeklyGmvPerformanceData {
    week_start: string;
    weekly_orders: number;
    weekly_gmv: number;
    weekly_aov: number;
    prev_week_gmv: number | null;
    weekly_gmv_growth_percent: number | null;
}

export interface MonthlyGmvPerformanceData {
    month_start: string;
    monthly_orders: number;
    monthly_gmv: number;
    monthly_aov: number;
    prev_month_gmv: number | null;
    monthly_gmv_growth_percent: number | null;
}

// Average Order Value

export interface AverageOrderValueData {
    date: string;
    daily_aov: number;
    median_order_value: number;
    min_order: number;
    max_order: number;
    order_count: number;
    prev_day_aov: number | null;
    aov_growth_percent: number | null;
}

// New vs Returning Buyers
export interface NewVsReturningBuyersData {
    order_date: string;
    new_buyers: number;
    returning_buyers: number;
    total_buyers: number;
    new_buyer_revenue: number;
    returning_buyer_revenue: number;
    new_buyer_ratio: number;
    returning_buyer_ratio: number;
}

// Cart Abandonment Rate
export interface CartAbandonmentRateData {
    cart_date: string;
    total_carts: number;
    carts_with_items: number;
    converted_carts: number;
    abandoned_carts: number;
    conversion_rate: number;
    abandonment_rate: number;
    avg_cart_session_hours: number;
}
