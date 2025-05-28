"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  ArrowLeft,
  Check,
  X,
  RefreshCw,
  CreditCard,
  Calendar,
  Clock,
  DollarSign,
  BadgeDollarSign,
  Link as LinkIcon,
  Info,
  ArrowRightLeft,
  Receipt,
  CircleDollarSign,
  Wallet,
  ShoppingCart,
  Package,
  User,
  Eye,
  ExternalLink,
  Settings2
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
  CardDescription
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Spinner } from "@/components/ui/spinner";
import { ErrorCard } from "@/components/ui/error-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { EmptyPlaceholder } from "@/components/ui/empty-placeholder";

import { useTransactionStore } from "@/features/orders/transactions/store";
import { useOrderStore } from "@/features/orders/store";
import { Transaction } from "@/features/orders/transactions/types";
import { TransactionDialog } from "@/features/orders/transactions/components";

interface TransactionPageProps {
  params: {
    id: string;
  };
}

export default function TransactionDetailPage({ params }: TransactionPageProps) {
  const router = useRouter();
  const session = useSession();
  const tenant_id = (session?.data?.user as any)?.tenant_id;
  const id = params.id;
  
  // Store hooks
  const { 
    transaction,
    loading,
    storeError,
    fetchTransaction,
    refundTransaction,
    markTransactionAsCompleted,
    markTransactionAsFailed
  } = useTransactionStore();
  
  const { fetchOrder } = useOrderStore();
  
  // UI States
  const [activeTab, setActiveTab] = useState("details");
  const [dialogAction, setDialogAction] = useState<'refund' | 'complete' | 'fail' | null>(null);
  const [isDialogOpen, setDialogOpen] = useState(false);
  
  // Related order state
  const [relatedOrder, setRelatedOrder] = useState<any>(null);
  const [relatedOrderFetched, setRelatedOrderFetched] = useState(false);
  const [orderLoading, setOrderLoading] = useState(false);
  
  // Request headers
  const tenantHeaders = {
    'X-Tenant-ID': tenant_id || '',
  };
  
  const loadTransaction = async () => {
    try {
      await fetchTransaction(id, tenantHeaders);
    } catch (error) {
      console.error('Error loading transaction:', error);
    }
  };
  
  // Load transaction data
  useEffect(() => {
    loadTransaction();
  }, [id, fetchTransaction, tenant_id]);
  // Fetch related order only once when transaction is loaded and order_id is available
  useEffect(() => {
    const fetchRelatedOrder = async () => {
      // Only fetch if we have an order_id, haven't fetched yet, and don't already have the order
      if (transaction?.order_id && !relatedOrderFetched && !relatedOrder) {
        try {
          setOrderLoading(true);
          const order = await fetchOrder(transaction.order_id, tenantHeaders);
          setRelatedOrder(order);
          setRelatedOrderFetched(true); // Mark as fetched to prevent refetching
        } catch (error) {
          console.error('Error loading related order:', error);
        } finally {
          setOrderLoading(false);
        }
      }
    };
    
    fetchRelatedOrder();
  }, [transaction?.order_id, fetchOrder, tenantHeaders, relatedOrderFetched, relatedOrder]);
  
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "Not set";
    return format(new Date(dateString), "MMM dd, yyyy h:mm a");
  };
  
  const formatCurrency = (amount: number | string | undefined) => {
    if (amount === undefined || amount === null) return "$0.00";
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(numAmount);
  };
  
  const handleGoBack = () => {
    router.push('/dashboard/orders/transactions');
  };
  
  const handleRefresh = () => {
    loadTransaction();
  };
  
  const handleRefund = (transaction: Transaction) => {
    setDialogAction('refund');
    setDialogOpen(true);
  };
  
  const handleMarkCompleted = (transaction: Transaction) => {
    setDialogAction('complete');
    setDialogOpen(true);
  };
  
  const handleMarkFailed = (transaction: Transaction) => {
    setDialogAction('fail');
    setDialogOpen(true);
  };
  
  const handleConfirmAction = async (data: { amount?: number; reason?: string }) => {
    try {
      if (!transaction) return;
      
      switch (dialogAction) {
        case 'refund':
          await refundTransaction(transaction.transaction_id, data.amount, data.reason);
          toast.success('Transaction has been refunded successfully.');
          break;
        case 'complete':
          await markTransactionAsCompleted(transaction.transaction_id);
          toast.success('Transaction has been marked as completed.');
          break;
        case 'fail':
          await markTransactionAsFailed(transaction.transaction_id, data.reason);
          toast.warning('Transaction has been marked as failed.');
          break;
      }
      
      // Reload transaction data
      await loadTransaction();
    } catch (error) {
      console.error('Error performing action:', error);
      toast.error('Failed to perform the requested action. Please try again.');
    }
  };

  // Get status badge color based on transaction status
  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", label: string }> = {
      'completed': { variant: 'default', label: 'Completed' },
      'pending': { variant: 'outline', label: 'Pending' },
      'failed': { variant: 'destructive', label: 'Failed' },
      'refunded': { variant: 'secondary', label: 'Refunded' },
    };
    
    const config = statusMap[status] || { variant: 'outline', label: status };
    
    return (
      <Badge variant={config.variant} className="capitalize">
        {config.label}
      </Badge>
    );
  };

  // Transaction type badge
  const getTypeBadge = (type: string) => {
    const typeMap: Record<string, { icon: any, label: string }> = {
      'payment': { icon: <CreditCard className="h-4 w-4 mr-1" />, label: 'Payment' },
      'refund': { icon: <ArrowRightLeft className="h-4 w-4 mr-1" />, label: 'Refund' },
      'payout': { icon: <Wallet className="h-4 w-4 mr-1" />, label: 'Payout' },
      'deposit': { icon: <DollarSign className="h-4 w-4 mr-1" />, label: 'Deposit' },
    };
    
    const config = typeMap[type] || { icon: <CreditCard className="h-4 w-4 mr-1" />, label: type };
    
    return (
      <Badge variant="outline" className="flex items-center">
        {config.icon}
        <span className="capitalize">{config.label}</span>
      </Badge>
    );
  };
  if (loading && !transaction) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spinner />
      </div>
    );
  }

  if (storeError) {
    return (
      <ErrorCard
        title="Error Loading Transaction"
        error={{
          message: storeError?.message || "Failed to load transaction details",
          status: storeError?.status ? String(storeError.status) : "error"
        }}
        buttonText="Back to Transactions"
        buttonAction={() => router.push("/dashboard/orders/transactions")}
        buttonIcon={ArrowLeft}
      />
    );
  }

  if (!transaction) {
    return (
      <ErrorCard
        title="Transaction Not Found"
        error={{
          message: "The transaction you're looking for doesn't exist or has been removed.",
          status: "404"
        }}
        buttonText="Back to Transactions"
        buttonAction={() => router.push("/dashboard/orders/transactions")}
        buttonIcon={ArrowLeft}
      />
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/dashboard/orders/transactions")}
            className="shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Button>
          
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback style={{ backgroundColor: "#4f46e5" }}>
                <CreditCard className="h-5 w-5 text-white" />
              </AvatarFallback>
            </Avatar>
            
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Transaction</h1>
              <p className="text-muted-foreground text-sm flex items-center gap-1">
                <Receipt className="h-3 w-3" />
                {transaction.transaction_id}
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge 
            variant={transaction.status === 'completed' ? 'default' : transaction.status === 'failed' ? 'destructive' : 'outline'} 
            className={transaction.status === 'completed' ? "bg-green-500 hover:bg-green-600 px-2 py-1" : 
                      transaction.status === 'failed' ? "px-2 py-1" : 
                      "text-amber-500 border-amber-200 bg-amber-50 px-2 py-1"}
          >
            {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
          </Badge>
          
          <div className="flex items-center gap-2 ml-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-4 overflow-auto">
        <div className="grid grid-cols-1 md:grid-cols-7 gap-6">          
          {/* Main Content - 5 columns */}
          <div className="md:col-span-5 space-y-6">
            <Tabs
              defaultValue="details"
              value={activeTab}
              onValueChange={setActiveTab}
              className="space-y-6"
            >
              <TabsList className="w-full">
                <TabsTrigger value="details" className="gap-1">
                  <CreditCard className="h-4 w-4" /> Transaction Details
                </TabsTrigger>
                <TabsTrigger value="related" className="gap-1">
                  <ShoppingCart className="h-4 w-4" /> Related Order
                </TabsTrigger>
              </TabsList>
          
              <TabsContent value="details" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <CircleDollarSign className="h-5 w-5 text-primary" />
                      Transaction Information
                    </CardTitle>
                    <CardDescription>Details about this transaction</CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-6">
                    {/* Summary at the top */}
                    <div className="bg-muted/30 p-4 rounded-lg">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="flex items-center gap-3">
                          <div className="bg-primary/10 p-3 rounded-full">
                            <CreditCard className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-medium">{formatCurrency(transaction.amount)}</h3>
                            <p className="text-sm text-muted-foreground">{transaction.type || 'Payment'}</p>
                          </div>
                        </div>
                        <div>
                          {getStatusBadge(transaction.status)}
                        </div>
                      </div>
                    </div>
                    
                    {/* Main transaction details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-1">
                        <p className="text-sm font-medium flex items-center gap-1 text-muted-foreground">
                          <CreditCard className="h-4 w-4" /> Transaction ID
                        </p>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-mono bg-muted px-2 py-1 rounded">{transaction.transaction_id}</p>
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => {
                            navigator.clipboard.writeText(transaction.transaction_id);
                            toast.success("Transaction ID copied to clipboard");
                          }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                          </Button>
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <p className="text-sm font-medium flex items-center gap-1 text-muted-foreground">
                          <Calendar className="h-4 w-4" /> Date
                        </p>
                        <p className="text-sm bg-muted px-2 py-1 rounded">{formatDate(transaction.created_at)}</p>
                      </div>
                      
                      <div className="space-y-1">
                        <p className="text-sm font-medium flex items-center gap-1 text-muted-foreground">
                          <DollarSign className="h-4 w-4" /> Amount
                        </p>
                        <p className="text-sm font-semibold bg-muted px-2 py-1 rounded">{formatCurrency(transaction.amount)}</p>
                      </div>
                      
                      <div className="space-y-1">
                        <p className="text-sm font-medium flex items-center gap-1 text-muted-foreground">
                          <BadgeDollarSign className="h-4 w-4" /> Fee
                        </p>
                        <p className="text-sm bg-muted px-2 py-1 rounded">{formatCurrency(transaction.fee || 0)}</p>
                      </div>
                      
                      <div className="space-y-1">
                        <p className="text-sm font-medium flex items-center gap-1 text-muted-foreground">
                          <LinkIcon className="h-4 w-4" /> Reference
                        </p>
                        <p className="text-sm bg-muted px-2 py-1 rounded">{transaction.reference || 'N/A'}</p>
                      </div>
                      
                      <div className="space-y-1">
                        <p className="text-sm font-medium flex items-center gap-1 text-muted-foreground">
                          <Clock className="h-4 w-4" /> Status Updated
                        </p>
                        <p className="text-sm bg-muted px-2 py-1 rounded">{formatDate(transaction.updated_at)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Payment method card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Wallet className="h-5 w-5 text-primary" />
                      Payment Method
                    </CardTitle>
                    <CardDescription>How this transaction was processed</CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="flex items-center gap-3 bg-muted/50 p-4 rounded-lg border border-border/50">
                      <div className="bg-primary/10 p-2 rounded-md">
                        {transaction.payment_method?.toLowerCase().includes('card') ? (
                          <CreditCard className="h-5 w-5 text-primary" />
                        ) : transaction.payment_method?.toLowerCase().includes('wallet') ? (
                          <Wallet className="h-5 w-5 text-primary" />
                        ) : (
                          <CreditCard className="h-5 w-5 text-primary" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{transaction.payment_method || 'Card Payment'}</p>
                        <p className="text-xs text-muted-foreground">{transaction.payment_details || 'No additional details'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Additional info */}
                {transaction.metadata && Object.keys(transaction.metadata).length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Info className="h-5 w-5 text-primary" />
                        Additional Information
                      </CardTitle>
                      <CardDescription>Metadata for this transaction</CardDescription>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="border border-border/50 rounded-lg overflow-hidden">
                        <div className="bg-muted/30 px-3 py-2 border-b border-border/50 flex justify-between items-center">
                          <span className="text-xs font-medium">Metadata</span>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-7 text-xs" 
                            onClick={() => {
                              navigator.clipboard.writeText(JSON.stringify(transaction.metadata, null, 2));
                              toast.success("Metadata copied to clipboard");
                            }}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                            Copy
                          </Button>
                        </div>
                        <div className="bg-muted/10 p-3">
                          <pre className="text-xs overflow-auto whitespace-pre-wrap max-h-[200px] scrollbar-thin scrollbar-thumb-muted-foreground scrollbar-track-muted">
                            {JSON.stringify(transaction.metadata, null, 2)}
                          </pre>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
              <TabsContent value="related" className="space-y-4">
                {transaction.order_id ? (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <ShoppingCart className="h-5 w-5 text-primary" />
                        Order Details
                      </CardTitle>
                      <CardDescription>Information about the related order</CardDescription>
                    </CardHeader>
                    
                    <CardContent>
                      {orderLoading ? (
                        <div className="flex justify-center py-6">
                          <Spinner className="h-8 w-8" />
                        </div>
                      ) : relatedOrder ? (
                        <div className="space-y-6">
                          <div className="bg-muted/30 p-4 rounded-lg flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="bg-blue-100 p-2 rounded-full">
                                <ShoppingCart className="h-6 w-6 text-blue-600" />
                              </div>
                              <div>
                                <h3 className="font-medium">{formatCurrency(relatedOrder.total_amount)}</h3>
                                <p className="text-sm text-muted-foreground">Order {relatedOrder.status}</p>
                              </div>
                            </div>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => router.push(`/dashboard/orders/${relatedOrder.order_id}`)}
                            >
                              <ExternalLink className="h-4 w-4 mr-2" />
                              View Order
                            </Button>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1">
                              <p className="text-sm font-medium flex items-center gap-1 text-muted-foreground">
                                <Package className="h-4 w-4" /> Order ID
                              </p>
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-mono bg-muted px-2 py-1 rounded">{relatedOrder.order_id}</p>
                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => {
                                  navigator.clipboard.writeText(relatedOrder.order_id);
                                  toast.success("Order ID copied to clipboard");
                                }}>
                                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                                </Button>
                              </div>
                            </div>
                            
                            <div className="space-y-1">
                              <p className="text-sm font-medium flex items-center gap-1 text-muted-foreground">
                                <Calendar className="h-4 w-4" /> Date
                              </p>
                              <p className="text-sm bg-muted px-2 py-1 rounded">{formatDate(relatedOrder.created_at)}</p>
                            </div>
                            
                            <div className="space-y-1">
                              <p className="text-sm font-medium flex items-center gap-1 text-muted-foreground">
                                <User className="h-4 w-4" /> Customer
                              </p>
                              <p className="text-sm bg-muted px-2 py-1 rounded">{relatedOrder.customer_name || 'N/A'}</p>
                            </div>
                            
                            <div className="space-y-1">
                              <p className="text-sm font-medium flex items-center gap-1 text-muted-foreground">
                                <DollarSign className="h-4 w-4" /> Amount
                              </p>
                              <p className="text-sm font-semibold bg-muted px-2 py-1 rounded">{formatCurrency(relatedOrder.total_amount)}</p>
                            </div>
                          </div>
                          
                          {/* Add additional order details as needed */}
                        </div>
                      ) : (
                        <div className="py-8 text-center">
                          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                            <Package className="h-8 w-8 text-muted-foreground" />
                          </div>
                          <h3 className="text-lg font-semibold mb-2">Order Not Found</h3>
                          <p className="text-muted-foreground mb-4">We couldn't find the order associated with this transaction.</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ) : (
                  <EmptyPlaceholder>
                    <div className="flex flex-col items-center justify-center text-center p-6">
                      <div className="rounded-full bg-muted p-3 mb-4">
                        <ShoppingCart className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-medium mb-2">No Related Order</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        This transaction is not linked to any order.
                      </p>
                    </div>
                  </EmptyPlaceholder>
                )}
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Sidebar - 2 columns */}
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-primary" />
                  Transaction Summary
                </CardTitle>
                <CardDescription>Transaction status and type</CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">Status</h3>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={transaction.status === 'completed' ? 'default' : transaction.status === 'failed' ? 'destructive' : 'outline'}
                      className={transaction.status === 'completed' ? "bg-green-500 hover:bg-green-600" : 
                                transaction.status === 'failed' ? "" : 
                                "text-amber-500 border-amber-200 bg-amber-50"}
                    >
                      {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                    </Badge>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-sm font-medium mb-2">Type</h3>
                  <div className="flex items-center gap-2">
                    {getTypeBadge(transaction.type)}
                  </div>
                </div>
                
                <Separator />
                
                <div className="pt-2">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Amount</span>
                    <span className="text-sm font-medium">{formatCurrency(transaction.amount)}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Fee</span>
                    <span className="text-sm">{formatCurrency(transaction.fee || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Net Amount</span>
                    <span className="text-sm font-bold">{formatCurrency((parseFloat(transaction.amount) - (parseFloat(transaction.fee) || 0)))}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Actions Card */}
            {(transaction.status === 'completed' || transaction.status === 'pending') && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Settings2 className="h-5 w-5 text-primary" />
                    Actions
                  </CardTitle>
                  <CardDescription>Manage this transaction</CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {transaction.status === 'completed' && (
                    <Button 
                      onClick={() => handleRefund(transaction)}
                      variant="outline"
                      className="w-full flex items-center"
                    >
                      <ArrowRightLeft className="h-4 w-4 mr-2" />
                      Refund Transaction
                    </Button>
                  )}
                  
                  {transaction.status === 'pending' && (
                    <div className="space-y-2">
                      <Button 
                        onClick={() => handleMarkCompleted(transaction)}
                        variant="default"
                        className="w-full flex items-center"
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Mark as Completed
                      </Button>
                      <Button 
                        onClick={() => handleMarkFailed(transaction)}
                        variant="outline"
                        className="w-full flex items-center"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Mark as Failed
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
            
            {/* Related Order Card (Mini) */}
            {transaction.order_id && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Package className="h-5 w-5 text-primary" />
                    Related Order
                  </CardTitle>
                  <CardDescription>Order linked to this transaction</CardDescription>
                </CardHeader>
                
                <CardContent className="pt-4">
                  {orderLoading ? (
                    <div className="flex justify-center py-4">
                      <Spinner className="h-6 w-6" />
                    </div>
                  ) : relatedOrder ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Order ID</p>
                          <div className="flex items-center gap-1">
                            <p className="text-sm font-mono bg-muted px-1.5 py-0.5 rounded">{relatedOrder.order_id?.substring(0, 12)}...</p>
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => {
                              navigator.clipboard.writeText(relatedOrder.order_id);
                              toast.success("Order ID copied to clipboard");
                            }}>
                              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                            </Button>
                          </div>
                        </div>
                        
                        <div className="space-y-1 text-right">
                          <p className="text-xs text-muted-foreground">Amount</p>
                          <p className="text-sm font-medium">{formatCurrency(relatedOrder.total_amount)}</p>
                        </div>
                      </div>
                      
                      {relatedOrder.status && (
                        <div className="flex justify-between items-center bg-muted/30 p-2 rounded-md">
                          <p className="text-xs text-muted-foreground">Status</p>
                          <Badge variant={relatedOrder.status === 'completed' ? 'default' : 'outline'} className="capitalize">
                            {relatedOrder.status}
                          </Badge>
                        </div>
                      )}
                      
                      {relatedOrder.created_at && (
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-muted-foreground">Created</span>
                          <span>{formatDate(relatedOrder.created_at)}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-sm text-muted-foreground">Order information not available</p>
                    </div>
                  )}
                </CardContent>
                
                <CardFooter className="bg-muted/20 pt-3">
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    onClick={() => router.push(`/dashboard/orders/${transaction.order_id}`)}
                    disabled={!relatedOrder}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Order Details
                  </Button>
                </CardFooter>
              </Card>
            )}
          </div>
        </div>
      </div>
      
      {/* Dialog for actions */}
      <TransactionDialog
        open={isDialogOpen}
        onOpenChange={setDialogOpen}
        transaction={transaction}
        action={dialogAction}
        onConfirm={handleConfirmAction}
      />
    </div>
  );
}
