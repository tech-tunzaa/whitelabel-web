import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ClipboardCopy, CreditCard, AlertCircle } from 'lucide-react';
import { Order, Transaction, Plan } from '@/features/orders/types';
import { copyToClipboard, formatCurrency, formatDate, formatStatus } from '../utils';
import { InstallmentPlanCard } from './installment-plan-card';
import { StatusBadge } from './status-badge';

interface PaymentDetailsCardProps {
  order: Order;
  transaction: Transaction | null;
}

const DetailItem: React.FC<{ label: string; value?: string | null; children?: React.ReactNode; hasCopy?: boolean; copyValue?: string; }> = ({ label, value, children, hasCopy, copyValue }) => (
  <div>
    <p className="text-sm text-muted-foreground">{label}</p>
    <div className="flex items-center gap-2">
        {children || <p className="font-medium">{value || 'N/A'}</p>}
        {hasCopy && value && (
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(copyValue || value, label)}>
                <ClipboardCopy className="h-3.5 w-3.5" />
            </Button>
        )}
    </div>
  </div>
);

export const PaymentDetailsCard: React.FC<PaymentDetailsCardProps> = ({ order, transaction }) => {
  const paymentDetails = order.payment_details;
  const plan = paymentDetails.metadata?.plan as Plan | undefined;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Details</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
                <DetailItem label="Payment Method">
                    <div className="flex items-center gap-2 font-medium">
                        <CreditCard className="h-5 w-5 text-muted-foreground" />
                        <span>{formatStatus(paymentDetails.method)}</span>
                    </div>
                </DetailItem>
                <DetailItem label="Payment Status">
                    <StatusBadge status={order.payment_status} />
                </DetailItem>
                <DetailItem label="Paid At" value={formatDate(paymentDetails.paid_at)} />
            </div>
            <div className="space-y-4">
                 <DetailItem label="Transaction ID" value={paymentDetails.transaction_id} hasCopy />
                 {transaction ? (
                    <>
                        <DetailItem label="Transaction Status">
                            <StatusBadge status={transaction.status} />
                        </DetailItem>
                        <DetailItem label="Transaction Amount" value={formatCurrency(transaction.amount, transaction.currency)} />
                    </>
                 ) : (
                    <div className="flex items-center gap-2 text-sm text-amber-600 p-3 bg-amber-50 rounded-md">
                        <AlertCircle className="h-4 w-4" />
                        <span>Transaction details not available.</span>
                    </div>
                 )}
            </div>
        </div>

        {plan && <InstallmentPlanCard plan={plan} />}
      </CardContent>
    </Card>
  );
};
