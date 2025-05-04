import { create } from "zustand";
import { mockOrders } from "../data/orders";
import type { Order, OrderStatus } from "../types/order";

interface OrderStore {
    orders: Order[];
    selectedOrder: Order | null;
    searchQuery: string;
    selectedStatus: OrderStatus | "all";
    selectedTimeframe: "all" | "today" | "week" | "month";
    setOrders: (orders: Order[]) => void;
    setSelectedOrder: (order: Order | null) => void;
    setSearchQuery: (query: string) => void;
    setSelectedStatus: (status: OrderStatus | "all") => void;
    setSelectedTimeframe: (timeframe: "all" | "today" | "week" | "month") => void;
    updateOrder: (updatedOrder: Order) => void;
    updateOrderStatus: (orderId: number, status: OrderStatus) => void;
    toggleOrderFlag: (orderId: number) => void;
    getFilteredOrders: () => Order[];
}

export const useOrderStore = create<OrderStore>((set, get) => ({
    orders: mockOrders,
    selectedOrder: null,
    searchQuery: "",
    selectedStatus: "all",
    selectedTimeframe: "all",

    setOrders: (orders) => set({ orders }),
    setSelectedOrder: (order) => set({ selectedOrder: order }),
    setSearchQuery: (query) => set({ searchQuery: query }),
    setSelectedStatus: (status) => set({ selectedStatus: status }),
    setSelectedTimeframe: (timeframe) => set({ selectedTimeframe: timeframe }),

    updateOrder: (updatedOrder) =>
        set((state) => ({
            orders: state.orders.map((order) =>
                order.id === updatedOrder.id ? updatedOrder : order
            ),
            selectedOrder: state.selectedOrder?.id === updatedOrder.id ? updatedOrder : state.selectedOrder,
        })),

    updateOrderStatus: (orderId, status) =>
        set((state) => ({
            orders: state.orders.map((order) =>
                order.id === orderId ? { ...order, status } : order
            ),
        })),

    toggleOrderFlag: (orderId) =>
        set((state) => ({
            orders: state.orders.map((order) =>
                order.id === orderId ? { ...order, flagged: !order.flagged } : order
            ),
        })),

    getFilteredOrders: () => {
        const { orders, searchQuery, selectedStatus, selectedTimeframe } = get();

        return orders.filter((order) => {
            const matchesSearch =
                order.id.toString().includes(searchQuery) ||
                order.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                order.customer.email.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesStatus =
                selectedStatus === "all" || order.status === selectedStatus;

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
    },
})); 