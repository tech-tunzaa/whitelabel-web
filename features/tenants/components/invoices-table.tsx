"use client";

import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { InvoiceDetailsModal } from './invoice-details-modal';
import Pagination from '@/components/ui/pagination';

import { useTenantStore } from '@/features/tenants/store';
import { Invoice } from '@/features/tenants/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { format } from 'date-fns';
import { MoreHorizontal, AlertCircle } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const formatCurrency = (amount: number, currency: string) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
};

const getStatusVariant = (status: Invoice['status']) => {
  switch (status) {
    case 'paid':
      return 'success';
    case 'pending_payment':
      return 'secondary';
    case 'overdue':
      return 'destructive';
    case 'failed':
      return 'destructive';
    default:
      return 'outline';
  }
};

interface InvoicesTableProps {
  tenantId: string;
  statusFilter: Invoice['status'] | 'all';
}

export const InvoicesTable = ({ tenantId, statusFilter }: InvoicesTableProps) => {
  const {
    invoices,
    invoicesTotal,
    loadingInvoices,
    invoicesError,
    fetchInvoices,
    clearSelectedInvoice,
  } = useTenantStore();

  // This will be used for pagination later
  const [pagination, setPagination] = useState({ skip: 0, limit: 10 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);

  useEffect(() => {
    if (tenantId) {
      fetchInvoices({ tenantId, status: statusFilter, ...pagination });
    }
  }, [tenantId, statusFilter, pagination, fetchInvoices]);

  if (loadingInvoices) {
    return (
      <Spinner />
    );
  }

  const pageCount = Math.ceil(invoicesTotal / pagination.limit);
  const currentPage = Math.floor(pagination.skip / pagination.limit) + 1;

  const handlePageChange = (page: number) => {
    const newSkip = (page - 1) * pagination.limit;
    setPagination({ ...pagination, skip: newSkip });
  };

  if (invoicesError && invoices.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-60 border rounded-md text-center p-4">
        <AlertCircle className="h-10 w-10 text-destructive mb-2" />
        <p className="font-semibold text-destructive">Failed to load invoices</p>
        <p className="text-sm text-muted-foreground">{invoicesError.message}</p>
      </div>
    );
  }

  if (invoices.length === 0) {
    return (
      <div className="flex items-center justify-center h-60 border rounded-md">
        <p className="text-muted-foreground">No invoices found for this filter.</p>
      </div>
    );
  }

  return (
    <>
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice #</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Issue Date</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((invoice) => (
              <TableRow key={invoice.invoice_id}>
                <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                <TableCell>
                  <Badge variant={getStatusVariant(invoice.status)} className="capitalize">
                    {invoice.status.replace('_', ' ')}
                  </Badge>
                </TableCell>
                <TableCell>{formatCurrency(invoice.amount, invoice.currency)}</TableCell>
                <TableCell>{format(new Date(invoice.issue_date), 'MMM d, yyyy')}</TableCell>
                <TableCell>{format(new Date(invoice.due_date), 'MMM d, yyyy')}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onSelect={() => {
                        setSelectedInvoiceId(invoice.invoice_id);
                        setIsModalOpen(true);
                      }}>View Details</DropdownMenuItem>
                      <DropdownMenuItem>Record Payment</DropdownMenuItem>
                      <DropdownMenuItem>Send Reminder</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <Pagination
        currentPage={currentPage}
        pageSize={pagination.limit}
        totalItems={invoicesTotal}
        onPageChange={handlePageChange}
      />

      <Dialog open={isModalOpen} onOpenChange={(open) => {
        if (!open) {
          setIsModalOpen(false);
          setSelectedInvoiceId(null);
          clearSelectedInvoice();
        }
      }}>
        <DialogContent style={{ maxWidth: '675px' }}>
          {selectedInvoiceId && <InvoiceDetailsModal invoiceId={selectedInvoiceId} />}
        </DialogContent>
      </Dialog>
    </>
  );
};
