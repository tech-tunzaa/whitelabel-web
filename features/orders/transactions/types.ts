// Transaction types for order transactions

// Generic API response type
export interface ApiResponse<T> {
  status: number;
  success: boolean;
  message?: string;
  data: T;
}

// Transaction Status
export type TransactionStatus = 
  | 'completed'
  | 'pending'
  | 'failed'
  | 'refunded'
  | 'partially_refunded';

// Payment Method
export type PaymentMethod = 
  | 'credit_card'
  | 'debit_card'
  | 'mobile_money'
  | 'bank_transfer'
  | 'cash'
  | 'wallet';

// Transaction Type
export type TransactionType = 
  | 'payment'
  | 'refund'
  | 'fee'
  | 'payout'
  | 'adjustment';

// Transaction entity type
export type Transaction = {
  transaction_id: string;
  order_id: string;
  tenant_id: string;
  vendor_id?: string;
  customer_id?: string;
  amount: number;
  fee_amount?: number;
  net_amount: number;
  currency: string;
  status: TransactionStatus;
  payment_method: PaymentMethod;
  transaction_type: TransactionType;
  reference_number?: string;
  description?: string;
  payment_gateway?: string;
  gateway_transaction_id?: string;
  metadata?: Record<string, any>;
  refund_reason?: string;
  created_at: string;
  updated_at?: string;
  completed_at?: string;
};

// Error Type
export type TransactionError = {
  status?: number;
  message: string;
};

// List Response Types
export type TransactionListResponse = {
  items: Transaction[];
  total: number;
  skip: number;
  limit: number;
};

// Filter Types
export type TransactionFilter = {
  skip?: number;
  limit?: number;
  search?: string;
  status?: TransactionStatus;
  payment_method?: PaymentMethod;
  transaction_type?: TransactionType;
  order_id?: string;
  vendor_id?: string;
  customer_id?: string;
  date_from?: string;
  date_to?: string;
  min_amount?: number;
  max_amount?: number;
};

// Action Types
export type TransactionAction =
  | 'fetch'
  | 'fetchOne'
  | 'fetchList'
  | 'fetchByOrder'
  | 'exportCsv'
  | 'refund'
  | 'markAsCompleted'
  | 'markAsFailed';
