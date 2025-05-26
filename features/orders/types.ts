export type OrderStatus =
  | "pending"
  | "processing"
  | "confirmed"
  | "shipped"
  | "delivered"
  | "completed"
  | "cancelled"
  | "refunded"
  | "partially_refunded";

export type RefundStatus = "pending" | "approved" | "rejected" | "partial";

export type PaymentMethod =
  | "credit_card"
  | "paypal"
  | "bank_transfer"
  | "cash_on_delivery"
  | "mobile_money";

export type PaymentStatus =
  | "pending"
  | "authorized"
  | "paid"
  | "failed"
  | "refunded"
  | "partially_refunded";

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
  type:
    | "fetchList"
    | "fetchOne"
    | "fetchByUser"
    | "fetchByVendor"
    | "create"
    | "update"
    | "updateStatus"
    | "updatePayment"
    | "refund"
    | "delete";
  status: "idle" | "loading" | "success" | "error";
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
  notes?: string;
}

export interface DeliveryDetails {
  partner_id: string;
  cost: number;
  status?: string;
  tracking_number?: string;
  estimated_delivery?: string;
  actual_delivery?: string;
  notes?: string;
}

export interface OrderItem {
  item_id: string;
  product_id: string;
  variant_id: string | null;
  vendor_id: string;
  store_id: string;
  name: string;
  sku: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  commission_rate: string;
  refunded_quantity: number;
  refunded_amount: number;
}

export interface OrderTotals {
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
}

export interface Refund {
  refund_id: string;
  amount: number;
  reason: string;
  status: RefundStatus;
  items: any[]; // Define specific type if needed
  issued_by: string;
  created_at: string;
}

export interface Order {
  _id: string;
  order_id: string;
  order_number: string;
  tenant_id: string;
  user_id: string;
  items: OrderItem[];
  shipping_address: Address;
  totals: OrderTotals;
  currency: string;
  discount_code: string | null;
  status: OrderStatus;
  payment_status: PaymentStatus;
  payment_details: PaymentDetails;
  delivery_details?: DeliveryDetails;
  refunds: Refund[];
  created_at: string;
  updated_at: string;
  notes?: string;
  cancelled_at?: string;
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
  data?: Order | Order[] | OrderListResponse;
  items?: Order[];
  total?: number;
  skip?: number;
  limit?: number;
};

export type CartApiResponse = {
  data: Cart | CartTotals;
};
