'use client';

import React from 'react';
import { Separator } from '@/components/ui/separator';
import { Transaction } from '../types';
import { TransactionStatusBadge } from './';
import { Button } from '@/components/ui/button';
import { Check, XCircle } from 'lucide-react';
import Link from 'next/link';

interface TransactionDetailsProps {
  transaction: Transaction;
  onRefund?: (transaction: Transaction) => void;
  onMarkCompleted?: (transaction: Transaction) => void;
  onMarkFailed?: (transaction: Transaction) => void;
}

export default function TransactionDetails({
  transaction,
  onRefund,
  onMarkCompleted,
  onMarkFailed,
}: TransactionDetailsProps) {
  const canRefund =
    transaction.transaction_type === 'payment' &&
    transaction.status === 'completed';

  const canChangeStatus = transaction.status === 'pending';

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-semibold tracking-tight">Transaction Details</h3>
          <div className="flex gap-2">
            {canRefund && onRefund && (
              <Button 
                variant="outline" 
                onClick={() => onRefund(transaction)}
              >
                Refund Transaction
              </Button>
            )}
            {canChangeStatus && onMarkCompleted && (
              <Button 
                variant="outline" 
                onClick={() => onMarkCompleted(transaction)}
                className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100 hover:text-green-800"
              >
                <Check className="mr-2 h-4 w-4" />
                Mark Completed
              </Button>
            )}
            {canChangeStatus && onMarkFailed && (
              <Button 
                variant="outline" 
                onClick={() => onMarkFailed(transaction)}
                className="bg-red-50 border-red-200 text-red-700 hover:bg-red-100 hover:text-red-800"
              >
                <XCircle className="mr-2 h-4 w-4" />
                Mark Failed
              </Button>
            )}
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          View and manage transaction information
        </p>
      </div>
      <Separator />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Transaction Information</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <span className="text-muted-foreground">Transaction ID:</span>
              <span className="font-mono">{transaction.transaction_id}</span>
              
              <span className="text-muted-foreground">Status:</span>
              <span><TransactionStatusBadge status={transaction.status} /></span>
              
              <span className="text-muted-foreground">Transaction Type:</span>
              <span className="capitalize">{transaction.transaction_type}</span>
              
              <span className="text-muted-foreground">Payment Method:</span>
              <span className="capitalize">{transaction.payment_method.replace('_', ' ')}</span>
              
              <span className="text-muted-foreground">Reference Number:</span>
              <span>{transaction.reference_number || "N/A"}</span>
              
              <span className="text-muted-foreground">Created At:</span>
              <span>{new Date(transaction.created_at).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</span>
              
              <span className="text-muted-foreground">Updated At:</span>
              <span>{transaction.updated_at ? new Date(transaction.updated_at).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }) : "N/A"}</span>
              
              <span className="text-muted-foreground">Completed At:</span>
              <span>{transaction.completed_at ? new Date(transaction.completed_at).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }) : "N/A"}</span>
              
              <span className="text-muted-foreground">Description:</span>
              <span>{transaction.description || "N/A"}</span>
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Related Information</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <span className="text-muted-foreground">Order ID:</span>
              <span>
                <Link 
                  href={`/dashboard/orders/${transaction.order_id}`} 
                  className="text-blue-600 hover:underline"
                >
                  {transaction.order_id}
                </Link>
              </span>
              
              <span className="text-muted-foreground">Tenant ID:</span>
              <span className="font-mono">{transaction.tenant_id}</span>
              
              <span className="text-muted-foreground">Vendor ID:</span>
              <span>
                {transaction.vendor_id ? (
                  <Link 
                    href={`/dashboard/vendors/${transaction.vendor_id}`} 
                    className="text-blue-600 hover:underline"
                  >
                    {transaction.vendor_id}
                  </Link>
                ) : "N/A"}
              </span>
              
              <span className="text-muted-foreground">Customer ID:</span>
              <span>
                {transaction.customer_id ? (
                  <Link 
                    href={`/dashboard/customers/${transaction.customer_id}`} 
                    className="text-blue-600 hover:underline"
                  >
                    {transaction.customer_id}
                  </Link>
                ) : "N/A"}
              </span>
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Financial Details</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <span className="text-muted-foreground">Amount:</span>
              <span className="font-semibold">{new Intl.NumberFormat('en-US', { style: 'currency', currency: transaction.currency }).format(transaction.amount)}</span>
              
              <span className="text-muted-foreground">Fee Amount:</span>
              <span>{transaction.fee_amount ? new Intl.NumberFormat('en-US', { style: 'currency', currency: transaction.currency }).format(transaction.fee_amount) : "N/A"}</span>
              
              <span className="text-muted-foreground">Net Amount:</span>
              <span className="font-semibold">{new Intl.NumberFormat('en-US', { style: 'currency', currency: transaction.currency }).format(transaction.net_amount)}</span>
              
              <span className="text-muted-foreground">Currency:</span>
              <span>{transaction.currency}</span>
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Payment Gateway Information</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <span className="text-muted-foreground">Payment Gateway:</span>
              <span>{transaction.payment_gateway || "N/A"}</span>
              
              <span className="text-muted-foreground">Gateway Transaction ID:</span>
              <span className="font-mono text-xs break-all">{transaction.gateway_transaction_id || "N/A"}</span>
            </div>
          </div>
          
          {transaction.transaction_type === 'refund' && transaction.refund_reason && (
            <>
              <Separator />
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Refund Information</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span className="text-muted-foreground">Refund Reason:</span>
                  <span>{transaction.refund_reason}</span>
                </div>
              </div>
            </>
          )}
          
          {transaction.metadata && Object.keys(transaction.metadata).length > 0 && (
            <>
              <Separator />
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Additional Information</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {Object.entries(transaction.metadata).map(([key, value]) => (
                    <React.Fragment key={key}>
                      <span className="text-muted-foreground capitalize">{key.replace('_', ' ')}:</span>
                      <span className="break-all">
                        {typeof value === 'object' 
                          ? JSON.stringify(value) 
                          : String(value)}
                      </span>
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
