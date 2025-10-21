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
  details?: Record<string, any>;
}

export interface SupportTicket {
  ticket_id: string;
  chatwoot_conversation_id: string;
  subject: string;
  category: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "open" | "resolved";
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
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
  has_ticket?: boolean;
  include_tickets: boolean;
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
  payment_id: string;
  method: PaymentMethod | string;
  status: PaymentStatus;
  amount: number;
  currency: string;
  transaction_id?: string;
  payment_gateway?: string;
  paid_at: string | null;
  notes?: string;
  metadata?: Record<string, any> | null;
}

export interface PickupPoint {
  partner_id: string;
  timestamp: string;
}

export interface DeliveryStage {
  partner_id: string;
  stage: "delivered" | "failed" | "assigned" | "in_transit" | "pending" | "processing" | "out_for_delivery";
  timestamp: string;
  notes: string;
}

export interface DeliveryDetails {
  current_stage: string;
  stages: DeliveryStage[];
}

export interface Order {
  order_id: string;
  items: OrderItem[];
  status: OrderStatus;
  payment_details: PaymentDetails;
  shipping_address: Address;
  delivery_details?: DeliveryDetails | null;
  vendor_responses?: Record<string, VendorResponse>;
  plan?: any;
  refunds?: any[];
}

export interface OrderItem {
  item_id: string;
  product_id: string;
  vendor_id: string;
  name: string;
  sku: string;
  quantity: number;
  unit_price: number;
  total: number;
}

export interface VendorResponse {
  status: string;
  notes?: string;
  responded_at?: string;
}

export interface DeliveryDetails {
  id: string;
  order_id: string;
  pickup_points: PickupPoint[];
  stages: DeliveryStage[];
  current_stage: string;
  created_at: string;
  updated_at: string;
  tenant_id: string;
}

export interface Store {
  store_id: string;
  tenant_id: string;
  vendor_id: string;
  store_name: string;
  store_slug: string;
  description: string;
}

export interface Category {
  category_id: string;
  tenant_id: string;
  name: string;
  slug: string;
  description: string;
  parent_id: string | null;
  image_url: string;
  is_active: boolean;
  is_featured: boolean;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  item_id: string;
  product_id: string;
  variant_id?: string | null;
  vendor_id: string;
  store_id: string;
  store?: Store;
  name: string;
  sku: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  commission_rate?: string;
  refunded_quantity?: number;
  refunded_amount?: number;
  categories?: Category[];
  metadata?: Record<string, any> | null;
}

export interface OrderTotals {
  subtotal: number;
  discount: number;
  tax: number;
  shipping: number;
  total: number;
}

export interface RefundItem {
  item_id: string;
  product_id: string;
  variant_id: string | null;
  quantity: number;
  amount: number;
}

export interface Refund {
  refund_id: string;
  amount: number;
  reason: string;
  status: RefundStatus;
  items: RefundItem[];
  issued_by: string;
  transaction_id: string | null;
  created_at: string;
  processed_at: string | null;
  notes: string | null;
}

export interface VendorResponse {
  status: 'pending' | 'accepted' | 'rejected';
  responded_at: string | null;
  notes: string | null;
}

export interface CustomerData {
  customer_id: number;
  first_name: string;
  last_name: string;
  phone: string;
  address: string;
  created_at: string;
  updated_at: string;
}

export interface Installment {
  installment_id: number;
  installment_number: number;
  amount: number;
  due_date: string;
  status: 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED';
  created_at: string;
  updated_at: string;
}

export interface Plan {
  plan_id: string;
  tenant_id: string;
  order_id: string;
  customer_data: CustomerData;
  name: string;
  description: string;
  total_amount: number;
  paid_amount: number;
  remaining_balance: number;
  payment_frequency: 'daily' | 'weekly' | 'monthly' | 'custom';
  start_date: string;
  end_date: string;
  custom_interval?: number;
  status: 'pending' | 'active' | 'completed' | 'cancelled' | 'defaulted';
  installments: Installment[];
  created_at: string;
  updated_at: string;
  metadata: Record<string, any>;
}

export interface Order {
  order_id: string;
  order_number: string;
  tenant_id: string;
  user_id: string;
  items: OrderItem[];
  shipping_address: Address;
  totals: OrderTotals;
  currency: string;
  discount_code: string | null;
  vendor_responses: Record<string, VendorResponse>;
  status: OrderStatus;
  payment_status: PaymentStatus;
  payment_details: PaymentDetails;
  refunds: Refund[];
  created_at: string;
  updated_at: string;
  paid_at: string | null;
  fulfilled_at: string | null;
  cancelled_at: string | null;
  plan?: Plan;
  notes: string;
  metadata: Record<string, any>;
  delivery_details?: DeliveryDetails;
  support_ticket?: SupportTicket;
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

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
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

export interface DeliveryStage {
  partner_id: string;
  stage: 'assigned' | 'in_transit' | 'delivered' | 'failed';
  timestamp: string;
  location?: {
    lat: number;
    lng: number;
  };
}

export interface Transaction {
  id: string;
  tenant_id: string;
  user_id: string;
  transaction_id: string;
  reference: string;
  amount: number;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  payment_date: string;
  raw_request: Record<string, any>;
  raw_response: Record<string, any>;
  type: 'payment' | 'refund' | 'payout';
  created_at: string;
  updated_at: string;
}

export interface PickupPoint {
  partner_id: string;
  timestamp: string;
}

export interface AssignDeliveryPayload {
  order_id: string;
  pickup_points?: PickupPoint[];
  stages: DeliveryStage[];
  current_stage: 'assigned' | 'in_transit' | 'delivered' | 'failed';
  estimated_delivery_time?: string;
}

// Payload used when adding a new delivery stage to an existing delivery (e.g., reassigning a delivery partner)
export interface AddDeliveryStagePayload {
  partner_id: string;
  stage: 'assigned' | 'in_transit' | 'delivered' | 'failed';
}

export interface Delivery {
  _id: string;
  order_id: string;
  partner_id: string;
  pickup_points: PickupPoint[];
  stages: DeliveryStage[];
  current_stage: string;
  status: 'active' | 'completed' | 'cancelled';
  estimated_delivery_time?: string;
  actual_delivery_time?: string;
  delivery_proof?: string;
  created_at: string;
  updated_at: string;
}
