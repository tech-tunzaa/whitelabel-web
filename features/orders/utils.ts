import { format } from 'date-fns';
import { toast } from 'sonner';

export const formatCurrency = (amount: number, currency = 'TZS') => {
  if (typeof amount !== 'number') return 'N/A';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
};

export const formatDate = (dateString?: string | null) => {
  if (!dateString) return 'N/A';
  try {
    return format(new Date(dateString), 'MMM d, yyyy, h:mm a');
  } catch {
    return 'Invalid Date';
  }
};

export const formatStatus = (status: string) => {
  if (!status) return 'N/A';
  return status.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
};

export const copyToClipboard = (text: string | undefined, fieldName: string) => {
  if (!text) return;
  navigator.clipboard.writeText(text).then(() => {
    toast.success(`${fieldName} copied to clipboard!`);
  });
};
