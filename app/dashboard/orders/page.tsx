"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Filter, MoreHorizontal, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { mockOrders } from "./data/orders";
import { OrderStatusBadge } from "../../../features/orders/components/order-status-badge";

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState(mockOrders);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedTimeframe, setSelectedTimeframe] = useState("all");

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toString().includes(searchQuery) ||
      order.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      selectedStatus === "all" || order.status === selectedStatus;

    // Simple timeframe filtering
    let matchesTimeframe = true;
    const now = new Date();
    const orderDate = new Date(order.orderDate);

    if (selectedTimeframe === "today") {
      matchesTimeframe = orderDate.toDateString() === now.toDateString();
    } else if (selectedTimeframe === "week") {
      const weekAgo = new Date(now);
      weekAgo.setDate(now.getDate() - 7);
      matchesTimeframe = orderDate >= weekAgo;
    } else if (selectedTimeframe === "month") {
      const monthAgo = new Date(now);
      monthAgo.setMonth(now.getMonth() - 1);
      matchesTimeframe = orderDate >= monthAgo;
    }

    return matchesSearch && matchesStatus && matchesTimeframe;
  });

  const pendingOrders = filteredOrders.filter(
    (order) => order.status === "pending"
  );
  const processingOrders = filteredOrders.filter(
    (order) => order.status === "processing"
  );
  const shippedOrders = filteredOrders.filter(
    (order) => order.status === "shipped"
  );
  const deliveredOrders = filteredOrders.filter(
    (order) => order.status === "delivered"
  );
  const cancelledOrders = filteredOrders.filter(
    (order) => order.status === "cancelled"
  );
  const refundedOrders = filteredOrders.filter(
    (order) => order.status === "refunded"
  );
  const flaggedOrders = filteredOrders.filter((order) => order.flagged);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground">
            Manage and track customer orders
          </p>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search orders..."
              className="pl-8 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={selectedTimeframe}
              onValueChange={setSelectedTimeframe}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">Last 7 Days</SelectItem>
                <SelectItem value="month">Last 30 Days</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
              <span className="sr-only">Filter</span>
            </Button>
          </div>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid grid-cols-4 md:grid-cols-8 mb-4">
            <TabsTrigger value="all">
              All
              <Badge variant="secondary" className="ml-2">
                {filteredOrders.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="pending">
              Pending
              <Badge variant="secondary" className="ml-2">
                {pendingOrders.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="processing">
              Processing
              <Badge variant="secondary" className="ml-2">
                {processingOrders.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="shipped">
              Shipped
              <Badge variant="secondary" className="ml-2">
                {shippedOrders.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="delivered">
              Delivered
              <Badge variant="secondary" className="ml-2">
                {deliveredOrders.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="cancelled">
              Cancelled
              <Badge variant="secondary" className="ml-2">
                {cancelledOrders.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="refunded">
              Refunded
              <Badge variant="secondary" className="ml-2">
                {refundedOrders.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="flagged">
              Flagged
              <Badge variant="secondary" className="ml-2">
                {flaggedOrders.length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="hidden md:table-cell">
                        Customer
                      </TableHead>
                      <TableHead className="hidden md:table-cell">
                        Items
                      </TableHead>
                      <TableHead className="hidden md:table-cell">
                        Total
                      </TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((order) => (
                      <TableRow
                        key={order.id}
                        className={order.flagged ? "bg-amber-50" : undefined}
                      >
                        <TableCell className="font-medium">
                          #{order.id}
                          {order.flagged && (
                            <Badge variant="warning" className="ml-2">
                              Issue
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-sm">
                              {formatDate(order.orderDate)}
                            </span>
                            <span className="text-xs text-muted-foreground hidden md:inline-block">
                              {new Date(order.orderDate).toLocaleTimeString(
                                [],
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="flex flex-col">
                            <span>{order.customer.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {order.customer.email}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {order.items.length}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {formatCurrency(order.total)}
                        </TableCell>
                        <TableCell>
                          <OrderStatusBadge status={order.status} />
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Open menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem
                                onClick={() =>
                                  router.push(`/dashboard/orders/${order.id}`)
                                }
                              >
                                View details
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {order.status === "pending" && (
                                <DropdownMenuItem
                                  onClick={() => {
                                    setOrders(
                                      orders.map((o) =>
                                        o.id === order.id
                                          ? { ...o, status: "processing" }
                                          : o
                                      )
                                    );
                                    toast.success(
                                      `Order #${order.id} marked as processing`
                                    );
                                  }}
                                >
                                  Mark as processing
                                </DropdownMenuItem>
                              )}
                              {(order.status === "pending" ||
                                order.status === "processing") && (
                                <DropdownMenuItem
                                  onClick={() => {
                                    setOrders(
                                      orders.map((o) =>
                                        o.id === order.id
                                          ? { ...o, status: "cancelled" }
                                          : o
                                      )
                                    );
                                    toast.success(
                                      `Order #${order.id} cancelled`
                                    );
                                  }}
                                >
                                  Cancel order
                                </DropdownMenuItem>
                              )}
                              {order.status === "processing" && (
                                <DropdownMenuItem
                                  onClick={() => {
                                    setOrders(
                                      orders.map((o) =>
                                        o.id === order.id
                                          ? { ...o, status: "shipped" }
                                          : o
                                      )
                                    );
                                    toast.success(
                                      `Order #${order.id} marked as shipped`
                                    );
                                  }}
                                >
                                  Mark as shipped
                                </DropdownMenuItem>
                              )}
                              {order.status === "shipped" && (
                                <DropdownMenuItem
                                  onClick={() => {
                                    setOrders(
                                      orders.map((o) =>
                                        o.id === order.id
                                          ? { ...o, status: "delivered" }
                                          : o
                                      )
                                    );
                                    toast.success(
                                      `Order #${order.id} marked as delivered`
                                    );
                                  }}
                                >
                                  Mark as delivered
                                </DropdownMenuItem>
                              )}
                              {(order.status === "delivered" ||
                                order.status === "shipped") && (
                                <DropdownMenuItem
                                  onClick={() => {
                                    setOrders(
                                      orders.map((o) =>
                                        o.id === order.id
                                          ? { ...o, status: "refunded" }
                                          : o
                                      )
                                    );
                                    toast.success(
                                      `Order #${order.id} refunded`
                                    );
                                  }}
                                >
                                  Issue refund
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem
                                onClick={() => {
                                  setOrders(
                                    orders.map((o) =>
                                      o.id === order.id
                                        ? { ...o, flagged: !o.flagged }
                                        : o
                                    )
                                  );
                                  toast.success(
                                    order.flagged
                                      ? `Issue resolved for order #${order.id}`
                                      : `Issue flagged for order #${order.id}`
                                  );
                                }}
                              >
                                {order.flagged ? "Resolve issue" : "Flag issue"}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredOrders.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          className="text-center py-8 text-muted-foreground"
                        >
                          No orders found matching your criteria.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Similar structure for other tabs, showing filtered orders by status */}
          {[
            "pending",
            "processing",
            "shipped",
            "delivered",
            "cancelled",
            "refunded",
            "flagged",
          ].map((status) => (
            <TabsContent key={status} value={status} className="space-y-4">
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="hidden md:table-cell">
                          Customer
                        </TableHead>
                        <TableHead className="hidden md:table-cell">
                          Items
                        </TableHead>
                        <TableHead className="hidden md:table-cell">
                          Total
                        </TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(status === "flagged"
                        ? flaggedOrders
                        : filteredOrders.filter(
                            (order) => order.status === status
                          )
                      ).map((order) => (
                        <TableRow
                          key={order.id}
                          className={order.flagged ? "bg-amber-50" : undefined}
                        >
                          <TableCell className="font-medium">
                            #{order.id}
                            {order.flagged && (
                              <Badge variant="warning" className="ml-2">
                                Issue
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="text-sm">
                                {formatDate(order.orderDate)}
                              </span>
                              <span className="text-xs text-muted-foreground hidden md:inline-block">
                                {new Date(order.orderDate).toLocaleTimeString(
                                  [],
                                  {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }
                                )}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <div className="flex flex-col">
                              <span>{order.customer.name}</span>
                              <span className="text-xs text-muted-foreground">
                                {order.customer.email}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {order.items.length}
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {formatCurrency(order.total)}
                          </TableCell>
                          <TableCell>
                            <OrderStatusBadge status={order.status} />
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                router.push(`/admin/orders/${order.id}`)
                              }
                            >
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {(status === "flagged"
                        ? flaggedOrders.length === 0
                        : filteredOrders.filter(
                            (order) => order.status === status
                          ).length === 0) && (
                        <TableRow>
                          <TableCell
                            colSpan={7}
                            className="text-center py-8 text-muted-foreground"
                          >
                            No {status} orders found.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}
