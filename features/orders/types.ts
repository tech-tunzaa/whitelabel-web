export type OrderStatus = "pending" | "processing" | "cancelled" | "shipped" | "delivered" | "returned" | "completed" | "refunded";

export type RefundStatus = "pending" | "approved" | "rejected" | "partial";

export type PaymentMethod = "credit_card" | "paypal" | "bank_transfer" | "cash_on_delivery" | "mobile_money";

export type PaymentStatus = "paid" | "pending" | "failed" | "refunded" | "partially_refunded" | "authorized" | "captured" | "cancelled";

export type ShippingMethod = "standard" | "express" | "free";

export interface OrderError {
  message: string;
  status?: number;
}

export interface OrderFilter {
  skip?: number;
  limit?: number;
  search?: string;
  status?: OrderStatus;
  userId?: string;
  vendorId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface OrderAction {
  type: 'fetchList' | 'fetchOne' | 'fetchByUser' | 'fetchByVendor' | 'create' | 'update' | 'updateStatus' | 'updatePayment' | 'refund' | 'delete';
  status: 'idle' | 'loading' | 'success' | 'error';
  error?: string;
}

export interface Address {
  first_name: string;
  last_name: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state_province: string;
  postal_code: string;
  country: string;
  phone: string;
  email: string;
  is_default: boolean;
}

export interface PaymentDetails {
  method: PaymentMethod;
  amount: number;
  currency: string;
  payment_gateway?: string;
  transaction_id?: string;
  status: PaymentStatus;
  notes?: string;
}

export interface OrderItem {
  id: string;
  product_id: string;
  product_name: string;
  variant_id?: string;
  variant_name?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  currency: string;
  image_url?: string;
  sku?: string;
}

export interface Refund {
  id: string;
  amount: number;
  currency: string;
  status: RefundStatus;
  reason?: string;
  issued_by: string;
  issued_at: string;
  transaction_id?: string;
}

export interface Order {
  id: string;
  order_number: string;
  user_id: string;
  cart_id: string;
  tenant_id: string;
  customer: {
    user_id: string;
    name: string;
    email: string;
    phone?: string;
  };
  items: OrderItem[];
  shipping_address: Address;
  payment_details: PaymentDetails;
  status: OrderStatus;
  subtotal: number;
  shipping_cost: number;
  tax: number;
  discount: number;
  total: number;
  currency: string;
  notes?: string;
  refunds?: Refund[];
  created_at: string;
  updated_at: string;
  flagged?: boolean;
}

export interface OrderListResponse {
  items: Order[];
  total: number;
  skip: number;
  limit: number;
}

export interface CartItem {
  id: string;
  product_id: string;
  variant_id?: string;
  quantity: number;
  unit_price: number;
  currency: string;
  added_at: string;
}

export interface Cart {
  id: string;
  user_id?: string;
  session_id?: string;
  items: CartItem[];
  created_at: string;
  updated_at: string;
  expires_at?: string;
}

export interface CartTotals {
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  currency: string;
}

export type OrderApiResponse = {
  data: Order | Order[] | OrderListResponse;
};

export type CartApiResponse = {
  data: Cart | CartTotals;
};