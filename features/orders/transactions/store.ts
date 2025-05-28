import { create } from 'zustand';
import { Transaction, TransactionFilter, TransactionListResponse, TransactionAction, TransactionError, ApiResponse, TransactionStatus } from './types';
import { apiClient } from '@/lib/api/client';
import transactions from './data/transactions';

interface TransactionStore {
  transactions: Transaction[];
  transaction: Transaction | null;
  loading: boolean;
  storeError: TransactionError | null;
  activeAction: TransactionAction | null;
  setActiveAction: (action: TransactionAction | null) => void;
  setLoading: (loading: boolean) => void;
  setStoreError: (error: TransactionError | null) => void;
  setTransaction: (transaction: Transaction | null) => void;
  setTransactions: (transactions: Transaction[]) => void;
  fetchTransaction: (id: string, headers?: Record<string, string>) => Promise<Transaction>;
  fetchTransactionsByOrder: (orderId: string, headers?: Record<string, string>) => Promise<Transaction[]>;
  fetchTransactions: (filter?: TransactionFilter, headers?: Record<string, string>) => Promise<TransactionListResponse>;
  refundTransaction: (transactionId: string, amount?: number, reason?: string, headers?: Record<string, string>) => Promise<Transaction>;
  markTransactionAsCompleted: (transactionId: string, headers?: Record<string, string>) => Promise<void>;
  markTransactionAsFailed: (transactionId: string, reason?: string, headers?: Record<string, string>) => Promise<void>;
  exportTransactionsCsv: (filter?: TransactionFilter, headers?: Record<string, string>) => Promise<string>;
}

export const useTransactionStore = create<TransactionStore>()(
  (set, get) => ({
    transactions: [],
    transaction: null,
    loading: true,
    storeError: null,
    activeAction: null,

    setActiveAction: (action) => set({ activeAction: action }),
    setLoading: (loading) => set({ loading }),
    setStoreError: (error) => set({ storeError: error }),
    setTransaction: (transaction: Transaction | null) => set({ transaction }),
    setTransactions: (transactions: Transaction[]) => set({ transactions }),

    fetchTransaction: async (id: string, headers?: Record<string, string>) => {
      const { setActiveAction, setLoading, setStoreError, setTransaction } = get();
      try {
        setActiveAction('fetchOne');
        setLoading(true);
        
        // For now, use mock data since API is not ready
        const transactionData = transactions.find(t => t.transaction_id === id);
        if (transactionData) {
          setTransaction(transactionData);
          setLoading(false);
          return transactionData;
        }

        // API code for future use (commented out for now)
        /*
        const response = await apiClient.get<any>(`/orders/transactions/${id}`, undefined, headers);
        
        // Try multiple possible response structures
        let transactionData = null;
        
        // Option 1: response.data.data structure
        if (response.data && response.data.data) {
          transactionData = response.data.data;
        }
        // Option 2: response.data structure (direct)
        else if (response.data) {
          transactionData = response.data;
        }
        
        // Check if we found transaction data and it has the expected properties
        if (transactionData && (transactionData.transaction_id || transactionData._id)) {
          // Ensure we have transaction_id
          if (!transactionData.transaction_id && transactionData._id) {
            transactionData.transaction_id = transactionData._id;
          }
          setTransaction(transactionData as Transaction);
          setLoading(false);
          return transactionData as Transaction;
        }
        */
        
        throw new Error('Transaction data not found');
      } catch (error: unknown) {
        console.error('Error fetching transaction:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch transaction';
        const errorStatus = (error as any)?.response?.status;
        setStoreError({
          message: errorMessage,
          status: errorStatus,
        });
        setTransaction(null);
        setLoading(false);
        throw error;
      } finally {
        setActiveAction(null);
      }
    },

    fetchTransactionsByOrder: async (orderId: string, headers?: Record<string, string>) => {
      const { setActiveAction, setLoading, setStoreError, setTransactions } = get();
      try {
        setActiveAction('fetchByOrder');
        setLoading(true);
        
        // For now, use mock data since API is not ready
        const filteredTransactions = transactions.filter(t => t.order_id === orderId);
        setTransactions(filteredTransactions);
        setLoading(false);
        return filteredTransactions;
        
        // API code for future use (commented out for now)
        /*
        const response = await apiClient.get<ApiResponse<Transaction[]>>(
          `/orders/${orderId}/transactions`, 
          undefined, 
          headers
        );
        
        if (response.data && response.data.data) {
          const transactionData = response.data.data as Transaction[];
          setTransactions(transactionData);
          return transactionData;
        }
        throw new Error('Transactions not found for this order');
        */
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch transactions for order';
        const errorStatus = (error as any)?.response?.status;
        setStoreError({
          message: errorMessage,
          status: errorStatus,
        });
        throw error;
      } finally {
        setLoading(false);
        setActiveAction(null);
      }
    },

    fetchTransactions: async (filter: TransactionFilter = {}, headers?: Record<string, string>) => {
      const { setActiveAction, setLoading, setStoreError, setTransactions } = get();
      try {
        setActiveAction('fetchList');
        setLoading(true);
        
        // For now, use mock data since API is not ready
        let filteredTransactions = [...transactions];
        
        // Apply filters if provided
        if (filter.search) {
          const searchLower = filter.search.toLowerCase();
          filteredTransactions = filteredTransactions.filter(transaction => 
            transaction.transaction_id.toLowerCase().includes(searchLower) || 
            transaction.order_id.toLowerCase().includes(searchLower) ||
            transaction.reference_number?.toLowerCase().includes(searchLower) ||
            transaction.description?.toLowerCase().includes(searchLower)
          );
        }
        
        if (filter.status) {
          filteredTransactions = filteredTransactions.filter(transaction => 
            transaction.status === filter.status
          );
        }
        
        if (filter.payment_method) {
          filteredTransactions = filteredTransactions.filter(transaction => 
            transaction.payment_method === filter.payment_method
          );
        }
        
        if (filter.transaction_type) {
          filteredTransactions = filteredTransactions.filter(transaction => 
            transaction.transaction_type === filter.transaction_type
          );
        }
        
        if (filter.order_id) {
          filteredTransactions = filteredTransactions.filter(transaction => 
            transaction.order_id === filter.order_id
          );
        }
        
        if (filter.vendor_id) {
          filteredTransactions = filteredTransactions.filter(transaction => 
            transaction.vendor_id === filter.vendor_id
          );
        }
        
        if (filter.customer_id) {
          filteredTransactions = filteredTransactions.filter(transaction => 
            transaction.customer_id === filter.customer_id
          );
        }
        
        if (filter.date_from) {
          const dateFrom = new Date(filter.date_from);
          filteredTransactions = filteredTransactions.filter(transaction => 
            new Date(transaction.created_at) >= dateFrom
          );
        }
        
        if (filter.date_to) {
          const dateTo = new Date(filter.date_to);
          filteredTransactions = filteredTransactions.filter(transaction => 
            new Date(transaction.created_at) <= dateTo
          );
        }
        
        if (filter.min_amount !== undefined) {
          filteredTransactions = filteredTransactions.filter(transaction => 
            transaction.amount >= filter.min_amount!
          );
        }
        
        if (filter.max_amount !== undefined) {
          filteredTransactions = filteredTransactions.filter(transaction => 
            transaction.amount <= filter.max_amount!
          );
        }
        
        // Apply pagination
        const skip = filter.skip || 0;
        const limit = filter.limit || 10;
        const paginatedTransactions = filteredTransactions.slice(skip, skip + limit);
        
        const response: TransactionListResponse = {
          items: paginatedTransactions,
          total: filteredTransactions.length,
          skip: skip,
          limit: limit
        };
        
        setTransactions(paginatedTransactions);
        setLoading(false);
        return response;
        
        // API code for future use (commented out for now)
        /*
        const params = new URLSearchParams();
        if (filter.skip) params.append('skip', filter.skip.toString());
        if (filter.limit) params.append('limit', filter.limit.toString());
        if (filter.search) params.append('search', filter.search);
        if (filter.status) params.append('status', filter.status);
        if (filter.payment_method) params.append('payment_method', filter.payment_method);
        if (filter.transaction_type) params.append('transaction_type', filter.transaction_type);
        if (filter.order_id) params.append('order_id', filter.order_id);
        if (filter.vendor_id) params.append('vendor_id', filter.vendor_id);
        if (filter.customer_id) params.append('customer_id', filter.customer_id);
        if (filter.date_from) params.append('date_from', filter.date_from);
        if (filter.date_to) params.append('date_to', filter.date_to);
        if (filter.min_amount !== undefined) params.append('min_amount', filter.min_amount.toString());
        if (filter.max_amount !== undefined) params.append('max_amount', filter.max_amount.toString());

        const response = await apiClient.get<ApiResponse<TransactionListResponse>>(
          `/orders/transactions?${params.toString()}`, 
          undefined, 
          headers
        );

        if (response.data && response.data.data) {
          const transactionData = response.data.data as TransactionListResponse;
          setTransactions(transactionData.items || []);
          setLoading(false);
          return transactionData;
        } else {
          const transactionData = response.data as unknown as TransactionListResponse;
          setTransactions(transactionData.items || []);
          setLoading(false);
          return transactionData;
        }
        */
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch transactions';
        const errorStatus = (error as any)?.response?.status;
        setStoreError({
          message: errorMessage,
          status: errorStatus,
        });
        setLoading(false);
        throw error;
      } finally {
        setActiveAction(null);
      }
    },

    refundTransaction: async (transactionId: string, amount?: number, reason?: string, headers?: Record<string, string>) => {
      const { setActiveAction, setLoading, setStoreError, fetchTransaction } = get();
      try {
        setActiveAction('refund');
        setLoading(true);
        
        // For now, create a mock refund response since API is not ready
        const originalTransaction = transactions.find(t => t.transaction_id === transactionId);
        if (!originalTransaction) {
          throw new Error('Transaction not found');
        }
        
        // Check if transaction is eligible for refund
        if (originalTransaction.status !== 'completed' || originalTransaction.transaction_type !== 'payment') {
          throw new Error('Transaction is not eligible for refund');
        }
        
        // Create a new refund transaction
        const refundAmount = amount || originalTransaction.amount;
        const refundTransaction: Transaction = {
          transaction_id: `txn_refund_${transactionId}`,
          order_id: originalTransaction.order_id,
          tenant_id: originalTransaction.tenant_id,
          vendor_id: originalTransaction.vendor_id,
          customer_id: originalTransaction.customer_id,
          amount: refundAmount,
          fee_amount: refundAmount * 0.05, // 5% fee
          net_amount: refundAmount * 0.95, // net amount after fee
          currency: originalTransaction.currency,
          status: 'completed' as TransactionStatus,
          payment_method: originalTransaction.payment_method,
          transaction_type: 'refund',
          reference_number: `REF-R-${originalTransaction.reference_number}`,
          description: `Refund for transaction ${transactionId}`,
          payment_gateway: originalTransaction.payment_gateway,
          gateway_transaction_id: `refund_${originalTransaction.gateway_transaction_id}`,
          metadata: {
            ...originalTransaction.metadata,
            original_transaction_id: transactionId,
            refund_amount: refundAmount,
            refund_reason: reason || 'Customer request'
          },
          refund_reason: reason || 'Customer request',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          completed_at: new Date().toISOString()
        };
        
        // Add to mock data (in a real implementation, this would be done by the API)
        transactions.push(refundTransaction);
        
        setLoading(false);
        return refundTransaction;
        
        // API code for future use (commented out for now)
        /*
        const response = await apiClient.post<ApiResponse<Transaction>>(
          `/orders/transactions/${transactionId}/refund`, 
          { 
            amount, 
            reason 
          }, 
          headers
        );
        
        if (response.data && response.data.data) {
          return response.data.data;
        }
        throw new Error('Failed to refund transaction: Invalid response');
        */
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to refund transaction';
        const errorStatus = (error as any)?.response?.status;
        setStoreError({
          message: errorMessage,
          status: errorStatus,
        });
        setLoading(false);
        throw error;
      } finally {
        setActiveAction(null);
      }
    },

    markTransactionAsCompleted: async (transactionId: string, headers?: Record<string, string>) => {
      const { setActiveAction, setLoading, setStoreError, fetchTransaction } = get();
      try {
        setActiveAction('markAsCompleted');
        setLoading(true);
        
        // For now, update mock data since API is not ready
        const transactionIndex = transactions.findIndex(t => t.transaction_id === transactionId);
        if (transactionIndex === -1) {
          throw new Error('Transaction not found');
        }
        
        // Check if transaction can be marked as completed
        if (transactions[transactionIndex].status !== 'pending') {
          throw new Error('Only pending transactions can be marked as completed');
        }
        
        // Update transaction status
        transactions[transactionIndex] = {
          ...transactions[transactionIndex],
          status: 'completed',
          updated_at: new Date().toISOString(),
          completed_at: new Date().toISOString()
        };
        
        // Refresh transaction data
        await fetchTransaction(transactionId);
        
        setLoading(false);
        
        // API code for future use (commented out for now)
        /*
        await apiClient.patch<ApiResponse<Transaction>>(
          `/orders/transactions/${transactionId}/complete`, 
          {}, 
          headers
        );
        */
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to mark transaction as completed';
        const errorStatus = (error as any)?.response?.status;
        setStoreError({
          message: errorMessage,
          status: errorStatus,
        });
        throw error;
      } finally {
        setLoading(false);
        setActiveAction(null);
      }
    },

    markTransactionAsFailed: async (transactionId: string, reason?: string, headers?: Record<string, string>) => {
      const { setActiveAction, setLoading, setStoreError, fetchTransaction } = get();
      try {
        setActiveAction('markAsFailed');
        setLoading(true);
        
        // For now, update mock data since API is not ready
        const transactionIndex = transactions.findIndex(t => t.transaction_id === transactionId);
        if (transactionIndex === -1) {
          throw new Error('Transaction not found');
        }
        
        // Check if transaction can be marked as failed
        if (transactions[transactionIndex].status !== 'pending') {
          throw new Error('Only pending transactions can be marked as failed');
        }
        
        // Update transaction status
        transactions[transactionIndex] = {
          ...transactions[transactionIndex],
          status: 'failed',
          updated_at: new Date().toISOString(),
          metadata: {
            ...transactions[transactionIndex].metadata,
            failure_reason: reason || 'Manual action'
          }
        };
        
        // Refresh transaction data
        await fetchTransaction(transactionId);
        
        setLoading(false);
        
        // API code for future use (commented out for now)
        /*
        await apiClient.patch<ApiResponse<Transaction>>(
          `/orders/transactions/${transactionId}/fail`, 
          { 
            reason 
          }, 
          headers
        );
        */
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to mark transaction as failed';
        const errorStatus = (error as any)?.response?.status;
        setStoreError({
          message: errorMessage,
          status: errorStatus,
        });
        throw error;
      } finally {
        setLoading(false);
        setActiveAction(null);
      }
    },

    exportTransactionsCsv: async (filter: TransactionFilter = {}, headers?: Record<string, string>) => {
      const { setActiveAction, setLoading, setStoreError } = get();
      try {
        setActiveAction('exportCsv');
        setLoading(true);
        
        // For now, generate a mock CSV string since API is not ready
        const filteredTransactions = await get().fetchTransactions(filter, headers);
        
        // Create CSV header
        const csvHeader = 'Transaction ID,Order ID,Date,Amount,Fee,Net Amount,Currency,Status,Payment Method,Type,Reference Number,Description\n';
        
        // Create CSV rows
        const csvRows = filteredTransactions.items.map(transaction => {
          const date = new Date(transaction.created_at).toLocaleDateString('en-US');
          return `${transaction.transaction_id},${transaction.order_id},${date},${transaction.amount},${transaction.fee_amount || 0},${transaction.net_amount},${transaction.currency},${transaction.status},${transaction.payment_method},${transaction.transaction_type},${transaction.reference_number || ''},${transaction.description || ''}`;
        }).join('\n');
        
        // Combine header and rows
        const csvContent = csvHeader + csvRows;
        
        setLoading(false);
        return csvContent;
        
        // API code for future use (commented out for now)
        /*
        const params = new URLSearchParams();
        if (filter.search) params.append('search', filter.search);
        if (filter.status) params.append('status', filter.status);
        if (filter.payment_method) params.append('payment_method', filter.payment_method);
        if (filter.transaction_type) params.append('transaction_type', filter.transaction_type);
        if (filter.order_id) params.append('order_id', filter.order_id);
        if (filter.vendor_id) params.append('vendor_id', filter.vendor_id);
        if (filter.customer_id) params.append('customer_id', filter.customer_id);
        if (filter.date_from) params.append('date_from', filter.date_from);
        if (filter.date_to) params.append('date_to', filter.date_to);
        if (filter.min_amount !== undefined) params.append('min_amount', filter.min_amount.toString());
        if (filter.max_amount !== undefined) params.append('max_amount', filter.max_amount.toString());

        const response = await apiClient.get<Blob>(
          `/orders/transactions/export?${params.toString()}`, 
          { 
            responseType: 'blob' 
          }, 
          headers
        );
        
        // Convert blob to string
        const reader = new FileReader();
        return new Promise<string>((resolve, reject) => {
          reader.onload = () => {
            resolve(reader.result as string);
          };
          reader.onerror = reject;
          reader.readAsText(response.data);
        });
        */
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to export transactions';
        const errorStatus = (error as any)?.response?.status;
        setStoreError({
          message: errorMessage,
          status: errorStatus,
        });
        setLoading(false);
        throw error;
      } finally {
        setActiveAction(null);
      }
    }
  })
);
