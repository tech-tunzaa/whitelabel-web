import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Plan } from '@/features/orders/types';
import { StatusBadge } from './status-badge';
import { formatCurrency, formatDate } from '../utils';

interface InstallmentPlanCardProps {
  plan: Plan;
}

export const InstallmentPlanCard: React.FC<InstallmentPlanCardProps> = ({ plan }) => {
  const progress = (plan.paid_amount / plan.total_amount) * 100;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Installment Plan</CardTitle>
          <StatusBadge status={plan.status} />
        </div>
        <CardDescription>{plan.name}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2 text-sm">
            <span className="font-medium text-muted-foreground">Payment Progress</span>
            <span className="font-semibold">{formatCurrency(plan.paid_amount)} / {formatCurrency(plan.total_amount)}</span>
          </div>
          <Progress value={progress} aria-label={`${progress.toFixed(2)}% Paid`} />
          <div className="mt-2 text-sm text-muted-foreground">
            Remaining Balance: <span className="font-semibold text-primary">{formatCurrency(plan.remaining_balance)}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6 text-sm">
          <div>
            <p className="text-muted-foreground">Frequency</p>
            <p className="font-medium capitalize">{plan.payment_frequency}{plan.custom_interval ? ` (Every ${plan.custom_interval} days)` : ''}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Start Date</p>
            <p className="font-medium">{formatDate(plan.start_date)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">End Date</p>
            <p className="font-medium">{formatDate(plan.end_date)}</p>
          </div>
        </div>

        <h4 className="font-semibold mb-2 text-base">Installment Schedule</h4>
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">#</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {plan.installments.map((installment) => (
                <TableRow key={installment.installment_id}>
                  <TableCell className="font-medium">{installment.installment_number}</TableCell>
                  <TableCell>{formatDate(installment.due_date)}</TableCell>
                  <TableCell>
                    <StatusBadge status={installment.status} />
                  </TableCell>
                  <TableCell className="text-right">{formatCurrency(installment.amount)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
