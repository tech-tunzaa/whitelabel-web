"use client";

import { useEffect } from 'react';
import { useTenantStore } from '@/features/tenants/store';
import { DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Spinner } from '@/components/ui/spinner';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Invoice } from '@/features/tenants/types';
import {
  Calendar,
  CheckCircle,
  Banknote,
  Clock,
  CreditCard,
  Download,
  FileText,
  Hash,
  Info,
  Mail,
  Send,
} from 'lucide-react';

interface InvoiceDetailsModalProps {
  invoiceId: string;
}

const getStatusVariant = (status: string) => {
  switch (status) {
    case 'paid': return 'success';
    case 'pending_payment': return 'warning';
    case 'failed': return 'destructive';
    default: return 'default';
  }
};

const DetailRow = ({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value?: string | number | null;
}) => {
  if (!value) {
    return null;
  }

  return (
    <div className="flex items-start space-x-3">
      <Icon className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
      <div className="flex flex-col">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  );
};

export const InvoiceDetailsModal: React.FC<InvoiceDetailsModalProps> = ({ invoiceId }) => {
  const {
    selectedInvoice: invoice,
    loadingSelectedInvoice,
    fetchInvoiceDetails,
  } = useTenantStore();

  useEffect(() => {
    if (invoiceId) {
      fetchInvoiceDetails(invoiceId);
    }
  }, [invoiceId, fetchInvoiceDetails]);

  if (loadingSelectedInvoice || !invoice) {
    return (
      <Spinner />
    );
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center justify-between">
          <span>Invoice #{invoice.invoice_number}</span>
          <Badge variant={getStatusVariant(invoice.status)} className="capitalize">
            {invoice.status.replace('_', ' ')}
          </Badge>
        </DialogTitle>
        <DialogDescription>
          Issued on {format(new Date(invoice.issue_date), 'PPP')}
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 py-4">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg border">
          <div className="flex items-center space-x-3">
            <Banknote className="h-6 w-6 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Amount</p>
              <p className="text-lg font-bold">{`${invoice.amount.toLocaleString()} ${invoice.currency}`}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Calendar className="h-6 w-6 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Due Date</p>
              <p className="text-lg font-bold">{format(new Date(invoice.due_date), 'PPP')}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {invoice.paid_date ? <CheckCircle className="h-6 w-6 text-green-500" /> : <Clock className="h-6 w-6 text-orange-500" />}
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <p className="text-lg font-bold">{invoice.paid_date ? `Paid on ${format(new Date(invoice.paid_date), 'PPP')}` : 'Pending'}</p>
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 pt-4">
          <DetailRow
            icon={Calendar}
            label="Billing Period"
            value={`${format(new Date(invoice.billing_period_start), 'MMM d, yyyy')} - ${format(new Date(invoice.billing_period_end), 'MMM d, yyyy')}`}
          />
          <DetailRow icon={CreditCard} label="Payment Method" value={invoice.payment_method} />
          <DetailRow icon={Hash} label="Payment Reference" value={invoice.payment_reference} />
          <DetailRow
            icon={Mail}
            label="Email Sent"
            value={invoice.email_sent ? `Yes, on ${format(new Date(invoice.email_sent_at!), 'PPP')}` : 'No'}
          />
          <DetailRow icon={FileText} label="Description" value={invoice.description} />
          <DetailRow icon={Info} label="Notes" value={invoice.notes} />
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Download PDF
        </Button>
        {!invoice.paid_date && (
          <Button>
            <Send className="mr-2 h-4 w-4" />
            Send Reminder
          </Button>
        )}
      </DialogFooter>
    </>
  );
};
