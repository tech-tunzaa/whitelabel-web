'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  ChevronDown, 
  Download, 
  Eye, 
  MoreHorizontal, 
  RefreshCw, 
  Search 
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Transaction, TransactionFilter } from '../types';
import { TransactionStatusBadge } from './';
// Alternatively could use: import TransactionStatusBadge from './transaction-status-badge';

interface TransactionTableProps {
  transactions: Transaction[];
  loading: boolean;
  totalCount: number;
  onSearch: (search: string) => void;
  onFilter: (filter: Partial<TransactionFilter>) => void;
  onRefresh: () => void;
  onExport: () => void;
}

export default function TransactionTable({
  transactions,
  loading,
  totalCount,
  onSearch,
  onFilter,
  onRefresh,
  onExport,
}: TransactionTableProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = () => {
    onSearch(searchQuery);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const viewTransaction = (id: string) => {
    router.push(`/dashboard/orders/transactions/${id}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-2 items-center">
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search transactions..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>
          <Button variant="outline" onClick={handleSearch}>
            Search
          </Button>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={onExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                Filter
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>Transaction Status</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onFilter({ status: 'completed' })}>
                Completed
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onFilter({ status: 'pending' })}>
                Pending
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onFilter({ status: 'failed' })}>
                Failed
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onFilter({ status: 'refunded' })}>
                Refunded
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Transaction Type</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onFilter({ transaction_type: 'payment' })}>
                Payment
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onFilter({ transaction_type: 'refund' })}>
                Refund
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onFilter({ transaction_type: 'fee' })}>
                Fee
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onFilter({ transaction_type: 'payout' })}>
                Payout
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onFilter({})}>
                Clear Filters
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Transaction ID</TableHead>
              <TableHead>Order ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-8 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : transactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  No transactions found.
                </TableCell>
              </TableRow>
            ) : (
              transactions.map((transaction) => (
                <TableRow key={transaction.transaction_id}>
                  <TableCell className="font-medium">
                    {transaction.transaction_id}
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/dashboard/orders/${transaction.order_id}`}
                      className="text-blue-600 hover:underline"
                    >
                      {transaction.order_id}
                    </Link>
                  </TableCell>
                  <TableCell>
                    {new Date(transaction.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </TableCell>
                  <TableCell>
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: transaction.currency }).format(transaction.amount)}
                  </TableCell>
                  <TableCell>
                    <TransactionStatusBadge status={transaction.status} />
                  </TableCell>
                  <TableCell className="capitalize">
                    {transaction.payment_method.replace('_', ' ')}
                  </TableCell>
                  <TableCell className="capitalize">
                    {transaction.transaction_type}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => viewTransaction(transaction.transaction_id)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {transactions.length} of {totalCount} transactions
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            disabled={transactions.length === 0}
            onClick={() => {
              // TODO: Implement pagination
            }}
          >
            Load More
          </Button>
        </div>
      </div>
    </div>
  );
}
