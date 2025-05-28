'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { ErrorCard } from '@/components/ui/error-card';
import { RefreshCw, Search, CalendarIcon, Download, Filter, CreditCard, ArrowRightLeft, Wallet, DollarSign } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { DateRange } from 'react-day-picker';
import { Separator } from '@/components/ui/separator';
import { saveAs } from 'file-saver';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

import { useTransactionStore } from '@/features/orders/transactions/store';
import { TransactionTable } from '@/features/orders/transactions/components';
import { Transaction, TransactionFilter, TransactionStatus } from '@/features/orders/transactions/types';
import { cn } from '@/lib/utils';

export default function TransactionsPage() {
  const router = useRouter();
  const session = useSession();
  const tenantId = session?.data?.user ? (session.data.user as any).tenant_id : undefined;
  
  const {
    transactions,
    loading,
    storeError,
    fetchTransactions,
    exportTransactionsCsv,
    setTransactions,
    setStoreError
  } = useTransactionStore();
  
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState("all");
  const [isTabLoading, setIsTabLoading] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 10;

  // Define tenant headers
  const tenantHeaders = {
    "X-Tenant-ID": tenantId
  };

  // Define filter based on active tab
  const getFilter = (): Partial<TransactionFilter> => {
    const baseFilter: Partial<TransactionFilter> = {
      skip: (currentPage - 1) * pageSize,
      limit: pageSize,
      search: searchQuery || undefined,
      dateFrom: dateRange?.from?.toISOString(),
      dateTo: dateRange?.to?.toISOString(),
    };
    
    if (activeTab === "all") return baseFilter;
    return { ...baseFilter, status: activeTab as TransactionStatus };
  };

  // Function to load transactions
  const loadTransactions = async (showLoadingState = true) => {
    try {
      if (showLoadingState) {
        setIsTabLoading(true);
      }
      setStoreError(null);
      const filter = getFilter();
      const response = await fetchTransactions(filter, tenantHeaders);
      setTotalCount(response.total);
    } catch (error) {
      console.error("Error loading transactions:", error);
      // Always set empty transactions array for 404 errors
      if (error instanceof Error && 
          ((error.message.includes("404") && error.message.includes("No transactions found")) ||
           error.message.includes("not found"))) {
        setTransactions([]);
        setStoreError(null);
      } else {
        // For other errors, set the error
        setStoreError(error instanceof Error ? error : new Error("Failed to load transactions"));
      }
    } finally {
      if (showLoadingState) {
        setIsTabLoading(false);
      }
    }
  };

  // Handle transaction click
  const handleTransactionClick = (transaction: Transaction) => {
    router.push(`/dashboard/orders/transactions/${transaction.transaction_id}`);
  };

  // Effect for loading transactions when filter changes
  useEffect(() => {
    loadTransactions();
  }, [currentPage, activeTab, searchQuery, dateRange]);

  // Handle search input
  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to first page on new search
  };

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setCurrentPage(1); // Reset to first page on tab change
  };

  // Handle date range selection
  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range);
    setCurrentPage(1); // Reset to first page on date change
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle refresh
  const handleRefresh = () => {
    loadTransactions();
  };

  // Handle export
  const handleExport = async () => {
    try {
      const filter = getFilter();
      const csvContent = await exportTransactionsCsv(filter, tenantHeaders);
      
      // Create a Blob from the CSV content
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      
      // Use FileSaver.js to save the file
      saveAs(blob, `transactions-export-${new Date().toISOString().slice(0, 10)}.csv`);
      
      toast.success('Transactions exported successfully');
    } catch (error) {
      console.error('Error exporting transactions:', error);
      toast.error('Failed to export transactions');
    }
  };
  
  const getTransactionTypeBadge = (type: string) => {
    const typeConfig: Record<string, { icon: any, color: string }> = {
      'payment': { icon: <CreditCard className="h-3 w-3 mr-1" />, color: 'bg-green-100 text-green-800' },
      'refund': { icon: <ArrowRightLeft className="h-3 w-3 mr-1" />, color: 'bg-orange-100 text-orange-800' },
      'payout': { icon: <Wallet className="h-3 w-3 mr-1" />, color: 'bg-blue-100 text-blue-800' },
      'deposit': { icon: <DollarSign className="h-3 w-3 mr-1" />, color: 'bg-purple-100 text-purple-800' }
    };
    
    const config = typeConfig[type.toLowerCase()] || { icon: <CreditCard className="h-3 w-3 mr-1" />, color: 'bg-gray-100 text-gray-800' };
    
    return (
      <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.icon}
        <span className="capitalize">{type}</span>
      </div>
    );
  };

  const formatCurrency = (amount: number | string | undefined) => {
    if (amount === undefined || amount === null) return "$0.00";
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(numAmount);
  };

  return (
    <div className="flex-1 space-y-4">
      <div className="flex items-center justify-between p-4">
        <div className="">
          <h2 className="text-3xl font-bold tracking-tight">Transactions</h2>
          <p className="text-sm text-muted-foreground">
            Manage payment transactions and refunds
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading || isTabLoading}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="default" size="sm" onClick={handleExport} disabled={loading || isTabLoading}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>
      <Separator />
      
      <Tabs defaultValue="all" value={activeTab} onValueChange={handleTabChange} className="px-4 pb-4">
        <div className="flex items-center justify-between">
          <div className="relative w-60">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={handleSearchInput}
              className="pl-8"
            />
          </div>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "justify-start text-left font-normal w-[240px]",
                  !dateRange && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "LLL dd, y")} -{" "}
                      {format(dateRange.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(dateRange.from, "LLL dd, y")
                  )
                ) : (
                  <span>Filter by date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={handleDateRangeChange}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </div>
        <TabsList className="w-full">
          <TabsTrigger value="all">All Transactions</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="failed">Failed</TabsTrigger>
          <TabsTrigger value="refunded">Refunded</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab} className="space-y-4 mt-4">
          {storeError ? (
            <ErrorCard 
              title="Error Loading Transactions"
              error={{
                message: storeError.message || "Failed to load transactions",
                status: storeError.status ? String(storeError.status) : "error"
              }}
              buttonText="Try Again"
              buttonAction={handleRefresh}
              buttonIcon={RefreshCw}
            />
          ) : isTabLoading ? (
            <div className="flex justify-center py-8">
              <Spinner className="h-8 w-8" />
            </div>
          ) : transactions.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                <CreditCard className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Transactions Found</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {searchQuery
                    ? `No transactions matching "${searchQuery}"`
                    : activeTab !== "all"
                    ? `No ${activeTab} transactions found`
                    : "No transactions have been recorded yet"}
                </p>
                {searchQuery && (
                  <Button variant="outline" size="sm" onClick={() => setSearchQuery("")}>Clear Search</Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="rounded-md border">
              <div className="overflow-x-auto">
                <table className="w-full caption-bottom text-sm">
                  <thead className="[&_tr]:border-b">
                    <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                      <th className="h-10 px-4 text-left align-middle font-medium">Transaction ID</th>
                      <th className="h-10 px-4 text-left align-middle font-medium">Date</th>
                      <th className="h-10 px-4 text-left align-middle font-medium">Type</th>
                      <th className="h-10 px-4 text-left align-middle font-medium">Amount</th>
                      <th className="h-10 px-4 text-left align-middle font-medium">Status</th>
                      <th className="h-10 px-4 text-right align-middle font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="[&_tr:last-child]:border-0">
                    {transactions.map((transaction) => (
                      <tr
                        key={transaction.transaction_id}
                        className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted cursor-pointer"
                        onClick={() => handleTransactionClick(transaction)}
                      >
                        <td className="p-4 align-middle font-mono text-xs">{transaction.transaction_id}</td>
                        <td className="p-4 align-middle">
                          {transaction.created_at 
                            ? format(new Date(transaction.created_at), "MMM dd, yyyy h:mm a")
                            : "N/A"}
                        </td>
                        <td className="p-4 align-middle">
                          {transaction.type ? getTransactionTypeBadge(transaction.type) : "Payment"}
                        </td>
                        <td className="p-4 align-middle font-medium">
                          {formatCurrency(transaction.amount)}
                        </td>
                        <td className="p-4 align-middle">
                          <Badge 
                            variant={transaction.status === "completed" ? "default" : 
                                  transaction.status === "failed" ? "destructive" : 
                                  transaction.status === "refunded" ? "secondary" : "outline"}
                            className="capitalize"
                          >
                            {transaction.status}
                          </Badge>
                        </td>
                        <td className="p-4 align-middle text-right">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleTransactionClick(transaction);
                            }}
                          >
                            View
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination */}
              {totalCount > pageSize && (
                <div className="flex items-center justify-between p-4 border-t">
                  <div className="text-sm text-muted-foreground">
                    Showing {Math.min((currentPage - 1) * pageSize + 1, totalCount)} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount} transactions
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage * pageSize >= totalCount}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
