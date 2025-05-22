import { create } from "zustand";
import { apiClient } from "@/lib/api/client";
import {
  Order,
  OrderFilter,
  OrderListResponse,
  OrderAction,
  OrderError,
  OrderStatus,
  PaymentStatus,
  RefundStatus,
  Cart,
  CartTotals,
  OrderApiResponse,
  CartApiResponse,
} from "./types";

interface OrderStore {
  orders: Order[];
  order: Order | null;
  cart: Cart | null;
  cartTotals: CartTotals | null;
  loading: boolean;
  storeError: OrderError | null;
  activeAction: string | null;

  // State setters
  setActiveAction: (action: string | null) => void;
  setLoading: (loading: boolean) => void;
  setStoreError: (error: OrderError | null) => void;
  setOrder: (order: Order | null) => void;
  setOrders: (orders: Order[]) => void;
  setCart: (cart: Cart | null) => void;
  setCartTotals: (totals: CartTotals | null) => void;

  // Order API methods
  fetchOrder: (id: string, headers?: Record<string, string>) => Promise<Order>;
  fetchOrderByNumber: (
    orderNumber: string,
    headers?: Record<string, string>
  ) => Promise<Order>;
  fetchUserOrders: (
    userId: string,
    headers?: Record<string, string>
  ) => Promise<OrderListResponse>;
  fetchVendorOrders: (
    vendorId: string,
    headers?: Record<string, string>
  ) => Promise<OrderListResponse>;
  fetchOrders: (
    filter?: OrderFilter,
    headers?: Record<string, string>
  ) => Promise<OrderListResponse>;
  createOrder: (data: any, headers?: Record<string, string>) => Promise<Order>;
  updateOrder: (orderId: string, data: Partial<Order>) => Promise<Order>;
  deleteOrder: (orderId: string) => Promise<void>;
  updateOrderStatus: (orderId: string, status: OrderStatus, headers?: Record<string, string>) => Promise<Order>;
  updatePaymentStatus: (
    id: string,
    paymentStatus: PaymentStatus,
    headers?: Record<string, string>
  ) => Promise<Order>;
  createRefund: (
    id: string,
    data: any,
    headers?: Record<string, string>
  ) => Promise<Order>;

  // Cart API methods
  fetchUserCart: (
    userId: string,
    headers?: Record<string, string>
  ) => Promise<Cart>;
  fetchGuestCart: (
    sessionId: string,
    headers?: Record<string, string>
  ) => Promise<Cart>;
  addCartItem: (
    cartId: string,
    data: any,
    headers?: Record<string, string>
  ) => Promise<Cart>;
  updateCartItem: (
    cartId: string,
    itemId: string,
    data: any,
    headers?: Record<string, string>
  ) => Promise<Cart>;
  removeCartItem: (
    cartId: string,
    itemId: string,
    headers?: Record<string, string>
  ) => Promise<void>;
  getCartTotals: (
    cartId: string,
    headers?: Record<string, string>
  ) => Promise<CartTotals>;
  mergeGuestCart: (
    userCartId: string,
    guestCartId: string,
    headers?: Record<string, string>
  ) => Promise<Cart>;
}

export const useOrderStore = create<OrderStore>()((set, get) => ({
  orders: [],
  order: null,
  cart: null,
  cartTotals: null,
  loading: false,
  storeError: null,
  activeAction: null,

  // State setters
  setActiveAction: (action) => set({ activeAction: action }),
  setLoading: (loading) => set({ loading }),
  setStoreError: (error) => set({ storeError: error }),
  setOrder: (order) => set({ order }),
  setOrders: (orders) => set({ orders }),
  setCart: (cart) => set({ cart }),
  setCartTotals: (totals) => set({ cartTotals: totals }),

  // Order API methods
  fetchOrder: async (id: string, headers?: Record<string, string>) => {
    const { setActiveAction, setLoading, setStoreError, setOrder } = get();
    try {
      setActiveAction("fetchOrder");
      setLoading(true);
      const response = await apiClient.get<OrderApiResponse>(
        `/orders/${id}`,
        undefined,
        headers
      );

      let orderData = null;

      if (response.data && response.data.data) {
        orderData = response.data.data as unknown as Order;
      } else if (response.data) {
        orderData = response.data as unknown as Order;
      }

      if (orderData) {
        setOrder(orderData);
        setLoading(false);
        return orderData;
      }

      throw new Error("Order data not found or in unexpected format");
    } catch (error: unknown) {
      console.error("Error fetching order:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch order";
      const errorStatus = (error as any)?.response?.status;
      setStoreError({
        message: errorMessage,
        status: errorStatus,
      });
      setOrder(null);
      setLoading(false);
      throw error;
    } finally {
      setActiveAction(null);
    }
  },

  fetchOrderByNumber: async (
    orderNumber: string,
    headers?: Record<string, string>
  ) => {
    const { setActiveAction, setLoading, setStoreError, setOrder } = get();
    try {
      setActiveAction("fetchOrderByNumber");
      setLoading(true);
      const response = await apiClient.get<OrderApiResponse>(
        `/orders/number/${orderNumber}`,
        undefined,
        headers
      );

      let orderData = null;

      if (response.data && response.data.data) {
        orderData = response.data.data as unknown as Order;
      } else if (response.data) {
        orderData = response.data as unknown as Order;
      }

      if (orderData) {
        setOrder(orderData);
        setLoading(false);
        return orderData;
      }

      throw new Error("Order data not found or in unexpected format");
    } catch (error: unknown) {
      console.error("Error fetching order by number:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to fetch order by number";
      const errorStatus = (error as any)?.response?.status;
      setStoreError({
        message: errorMessage,
        status: errorStatus,
      });
      setOrder(null);
      setLoading(false);
      throw error;
    } finally {
      setActiveAction(null);
    }
  },

  fetchUserOrders: async (userId: string, headers?: Record<string, string>) => {
    const { setActiveAction, setLoading, setStoreError, setOrders } = get();
    try {
      setActiveAction("fetchUserOrders");
      setLoading(true);
      const response = await apiClient.get<OrderApiResponse>(
        `/orders/user/${userId}/orders`,
        undefined,
        headers
      );

      let orderList: OrderListResponse = {
        items: [],
        total: 0,
        skip: 0,
        limit: 10,
      };

      if (response.data && response.data.data) {
        if (Array.isArray(response.data.data)) {
          orderList = {
            items: response.data.data as unknown as Order[],
            total: response.data.data.length,
            skip: 0,
            limit: response.data.data.length,
          };
        } else {
          orderList = response.data.data as unknown as OrderListResponse;
        }
      } else if (response.data && Array.isArray(response.data)) {
        orderList = {
          items: response.data as unknown as Order[],
          total: response.data.length,
          skip: 0,
          limit: response.data.length,
        };
      }

      setOrders(orderList.items);
      setLoading(false);
      return orderList;
    } catch (error: unknown) {
      console.error("Error fetching user orders:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch user orders";
      const errorStatus = (error as any)?.response?.status;
      setStoreError({
        message: errorMessage,
        status: errorStatus,
      });
      setLoading(false);
      throw error;
    } finally {
      setActiveAction(null);
    }
  },

  fetchVendorOrders: async (
    vendorId: string,
    headers?: Record<string, string>
  ) => {
    const { setActiveAction, setLoading, setStoreError, setOrders } = get();
    try {
      setActiveAction("fetchVendorOrders");
      setLoading(true);
      const response = await apiClient.get<OrderApiResponse>(
        `/orders/vendor/${vendorId}/orders`,
        undefined,
        headers
      );

      let orderList: OrderListResponse = {
        items: [],
        total: 0,
        skip: 0,
        limit: 10,
      };

      // Handle the response data
      if (response.data) {
        if ("items" in response.data) {
          // Direct response with items array
          const data = response.data as unknown as OrderListResponse;
          orderList = {
            items: data.items,
            total: data.total || 0,
            skip: data.skip || 0,
            limit: data.limit || 10,
          };
        } else if (response.data.data && "items" in response.data.data) {
          // Nested response with data.items
          const data = response.data.data as unknown as OrderListResponse;
          orderList = {
            items: data.items,
            total: data.total || 0,
            skip: data.skip || 0,
            limit: data.limit || 10,
          };
        }
      }

      console.log("Vendor orders response:", orderList);

      // Update the store with the orders
      setOrders(orderList.items);
      setLoading(false);
      return orderList;
    } catch (error: unknown) {
      console.error("Error fetching vendor orders:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to fetch vendor orders";
      const errorStatus = (error as any)?.response?.status;
      setStoreError({
        message: errorMessage,
        status: errorStatus,
      });
      setLoading(false);
      throw error;
    } finally {
      setActiveAction(null);
    }
  },

  fetchOrders: async (
    filter: OrderFilter = {},
    headers?: Record<string, string>
  ) => {
    const { setActiveAction, setLoading, setStoreError, setOrders } = get();
    try {
      setActiveAction("fetchOrders");
      setLoading(true);
      const params = new URLSearchParams();
      if (filter.skip) params.append("skip", filter.skip.toString());
      if (filter.limit) params.append("limit", filter.limit.toString());
      if (filter.search) params.append("search", filter.search);
      if (filter.status) params.append("status", filter.status);
      if (filter.userId) params.append("user_id", filter.userId);
      if (filter.vendorId) params.append("vendor_id", filter.vendorId);
      if (filter.dateFrom) params.append("date_from", filter.dateFrom);
      if (filter.dateTo) params.append("date_to", filter.dateTo);

      const response = await apiClient.get<OrderApiResponse>(
        `/orders/?${params.toString()}`,
        undefined,
        headers
      );

      let orderList: OrderListResponse = {
        items: [],
        total: 0,
        skip: filter.skip || 0,
        limit: filter.limit || 10,
      };

      if (response.data && response.data.data) {
        if (Array.isArray(response.data.data)) {
          orderList = {
            items: response.data.data as Order[],
            total: response.data.data.length,
            skip: filter.skip || 0,
            limit: filter.limit || response.data.data.length,
          };
        } else {
          orderList = response.data.data as OrderListResponse;
        }
      } else if (response.data && Array.isArray(response.data)) {
        orderList = {
          items: response.data as Order[],
          total: response.data.length,
          skip: filter.skip || 0,
          limit: filter.limit || response.data.length,
        };
      }

      setOrders(orderList.items);
      setLoading(false);
      return orderList;
    } catch (error: unknown) {
      console.error("Error fetching orders:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch orders";
      const errorStatus = (error as any)?.response?.status;
      setStoreError({
        message: errorMessage,
        status: errorStatus,
      });
      setLoading(false);
      throw error;
    } finally {
      setActiveAction(null);
    }
  },

  createOrder: async (data: any, headers?: Record<string, string>) => {
    const { setActiveAction, setLoading, setStoreError, setOrder } = get();
    try {
      setActiveAction("createOrder");
      setLoading(true);
      const response = await apiClient.post<OrderApiResponse>(
        "/orders/",
        data,
        headers
      );

      let orderData = null;

      if (response.data && response.data.data) {
        orderData = response.data.data as unknown as Order;
      } else if (response.data) {
        orderData = response.data as unknown as Order;
      }

      if (orderData) {
        setOrder(orderData);
        setLoading(false);
        return orderData;
      }

      throw new Error("Order data not found or in unexpected format");
    } catch (error: unknown) {
      console.error("Error creating order:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create order";
      const errorStatus = (error as any)?.response?.status;
      setStoreError({
        message: errorMessage,
        status: errorStatus,
      });
      setLoading(false);
      throw error;
    } finally {
      setActiveAction(null);
    }
  },

  updateOrder: async (orderId: string, data: Partial<Order>) => {
    const { setActiveAction, setLoading, setStoreError, orders, setOrders } =
      get();
    try {
      setActiveAction("update");
      setLoading(true);
      const response = await apiClient.put<OrderApiResponse>(
        `/orders/${orderId}`,
        data
      );

      let updatedOrder: Order | null = null;
      if (response.data) {
        if ("data" in response.data) {
          const responseData = response.data.data;
          if (responseData && !Array.isArray(responseData)) {
            updatedOrder = responseData as unknown as Order;
          }
        }
      }

      if (!updatedOrder) {
        throw new Error("Failed to get updated order data");
      }

      // Update the order in the store
      const updatedOrders = orders.map((order) =>
        order._id === orderId ? { ...order, ...updatedOrder } : order
      );
      setOrders(updatedOrders);
      setLoading(false);
      return updatedOrder;
    } catch (error: unknown) {
      console.error("Error updating order:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update order";
      const errorStatus = (error as any)?.response?.status;
      setStoreError({
        message: errorMessage,
        status: errorStatus,
      });
      setLoading(false);
      throw error;
    } finally {
      setActiveAction(null);
    }
  },

  deleteOrder: async (orderId: string) => {
    const { setActiveAction, setLoading, setStoreError, orders, setOrders } =
      get();
    try {
      setActiveAction("delete");
      setLoading(true);
      await apiClient.delete(`/orders/${orderId}`);

      // Remove the order from the store
      const updatedOrders = orders.filter((order) => order._id !== orderId);
      setOrders(updatedOrders);
      setLoading(false);
    } catch (error: unknown) {
      console.error("Error deleting order:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete order";
      const errorStatus = (error as any)?.response?.status;
      setStoreError({
        message: errorMessage,
        status: errorStatus,
      });
      setLoading(false);
      throw error;
    } finally {
      setActiveAction(null);
    }
  },

  updateOrderStatus: async (orderId: string, status: OrderStatus, headers?: Record<string, string>) => {
    const { setActiveAction, setLoading, setStoreError, orders, setOrders } =
      get();
    try {
      setActiveAction("updateStatus");
      setLoading(true);
      const response = await apiClient.put<OrderApiResponse>(
        `/orders/${orderId}/status`,
        { status },
        headers
      );

      let updatedOrder: Order | null = null;
      if (response.data) {
        if ("data" in response.data) {
          const responseData = response.data.data;
          if (responseData && !Array.isArray(responseData)) {
            updatedOrder = responseData as unknown as Order;
          }
        }
      }

      if (!updatedOrder) {
        throw new Error("Failed to get updated order data");
      }

      // Update the order in the store
      const updatedOrders = orders.map((order) =>
        order._id === orderId
          ? { ...order, status: updatedOrder.status }
          : order
      );
      setOrders(updatedOrders);
      setLoading(false);
      return updatedOrder;
    } catch (error: unknown) {
      console.error("Error updating order status:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to update order status";
      const errorStatus = (error as any)?.response?.status;
      setStoreError({
        message: errorMessage,
        status: errorStatus,
      });
      setLoading(false);
      throw error;
    } finally {
      setActiveAction(null);
    }
  },

  updatePaymentStatus: async (
    id: string,
    paymentStatus: PaymentStatus,
    headers?: Record<string, string>
  ) => {
    const {
      setActiveAction,
      setLoading,
      setStoreError,
      setOrder,
      orders,
      setOrders,
    } = get();
    try {
      setActiveAction("updatePaymentStatus");
      setLoading(true);
      const response = await apiClient.put<OrderApiResponse>(
        `/orders/${id}/payment`,
        { payment_status: paymentStatus },
        headers
      );

      let orderData: Order | null = null;
      if (response.data) {
        if ("data" in response.data) {
          const responseData = response.data.data;
          if (responseData && !Array.isArray(responseData)) {
            orderData = responseData as unknown as Order;
          }
        }
      }

      if (!orderData) {
        throw new Error("Order data not found or in unexpected format");
      }

      // Update the order in the store
      setOrder(orderData);

      // Update the order in the orders list if it exists
      if (orders.length > 0) {
        const updatedOrders = orders.map((o) => (o._id === id ? orderData : o));
        setOrders(updatedOrders);
      }

      setLoading(false);
      return orderData;
    } catch (error: unknown) {
      console.error("Error updating payment status:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to update payment status";
      const errorStatus = (error as any)?.response?.status;
      setStoreError({
        message: errorMessage,
        status: errorStatus,
      });
      setLoading(false);
      throw error;
    } finally {
      setActiveAction(null);
    }
  },

  createRefund: async (
    id: string,
    data: any,
    headers?: Record<string, string>
  ) => {
    const {
      setActiveAction,
      setLoading,
      setStoreError,
      setOrder,
      orders,
      setOrders,
    } = get();
    try {
      setActiveAction("createRefund");
      setLoading(true);
      const response = await apiClient.post<OrderApiResponse>(
        `/orders/${id}/refunds`,
        data,
        headers
      );

      let orderData: Order | null = null;
      if (response.data) {
        if ("data" in response.data) {
          const responseData = response.data.data;
          if (responseData && !Array.isArray(responseData)) {
            orderData = responseData as unknown as Order;
          }
        }
      }

      if (!orderData) {
        throw new Error("Order data not found or in unexpected format");
      }

      // Update the order in the store
      setOrder(orderData);

      // Update the order in the orders list if it exists
      if (orders.length > 0) {
        const updatedOrders = orders.map((o) => (o._id === id ? orderData : o));
        setOrders(updatedOrders);
      }

      setLoading(false);
      return orderData;
    } catch (error: unknown) {
      console.error("Error creating refund:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create refund";
      const errorStatus = (error as any)?.response?.status;
      setStoreError({
        message: errorMessage,
        status: errorStatus,
      });
      setLoading(false);
      throw error;
    } finally {
      setActiveAction(null);
    }
  },

  // Cart API methods
  fetchUserCart: async (userId: string, headers?: Record<string, string>) => {
    const { setActiveAction, setLoading, setStoreError, setCart } = get();
    try {
      setActiveAction("fetchUserCart");
      setLoading(true);
      const response = await apiClient.get<CartApiResponse>(
        `/carts/user?user_id=${userId}`,
        undefined,
        headers
      );

      let cartData = null;

      if (response.data && response.data.data) {
        cartData = response.data.data as unknown as Cart;
      } else if (response.data) {
        cartData = response.data as unknown as Cart;
      }

      if (cartData) {
        setCart(cartData);
        setLoading(false);
        return cartData;
      }

      throw new Error("Cart data not found or in unexpected format");
    } catch (error: unknown) {
      console.error("Error fetching user cart:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch user cart";
      const errorStatus = (error as any)?.response?.status;
      setStoreError({
        message: errorMessage,
        status: errorStatus,
      });
      setLoading(false);
      throw error;
    } finally {
      setActiveAction(null);
    }
  },

  fetchGuestCart: async (
    sessionId: string,
    headers?: Record<string, string>
  ) => {
    const { setActiveAction, setLoading, setStoreError, setCart } = get();
    try {
      setActiveAction("fetchGuestCart");
      setLoading(true);
      const response = await apiClient.get<CartApiResponse>(
        `/carts/session?session_id=${sessionId}`,
        undefined,
        headers
      );

      let cartData = null;

      if (response.data && response.data.data) {
        cartData = response.data.data as unknown as Cart;
      } else if (response.data) {
        cartData = response.data as unknown as Cart;
      }

      if (cartData) {
        setCart(cartData);
        setLoading(false);
        return cartData;
      }

      throw new Error("Cart data not found or in unexpected format");
    } catch (error: unknown) {
      console.error("Error fetching guest cart:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch guest cart";
      const errorStatus = (error as any)?.response?.status;
      setStoreError({
        message: errorMessage,
        status: errorStatus,
      });
      setLoading(false);
      throw error;
    } finally {
      setActiveAction(null);
    }
  },

  addCartItem: async (
    cartId: string,
    data: any,
    headers?: Record<string, string>
  ) => {
    const { setActiveAction, setLoading, setStoreError, setCart } = get();
    try {
      setActiveAction("addCartItem");
      setLoading(true);
      const response = await apiClient.post<CartApiResponse>(
        `/carts/${cartId}/items`,
        data,
        headers
      );

      let cartData = null;

      if (response.data && response.data.data) {
        cartData = response.data.data as unknown as Cart;
      } else if (response.data) {
        cartData = response.data as unknown as Cart;
      }

      if (cartData) {
        setCart(cartData);
        setLoading(false);
        return cartData;
      }

      throw new Error("Cart data not found or in unexpected format");
    } catch (error: unknown) {
      console.error("Error adding cart item:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to add cart item";
      const errorStatus = (error as any)?.response?.status;
      setStoreError({
        message: errorMessage,
        status: errorStatus,
      });
      setLoading(false);
      throw error;
    } finally {
      setActiveAction(null);
    }
  },

  updateCartItem: async (
    cartId: string,
    itemId: string,
    data: any,
    headers?: Record<string, string>
  ) => {
    const { setActiveAction, setLoading, setStoreError, setCart } = get();
    try {
      setActiveAction("updateCartItem");
      setLoading(true);
      const response = await apiClient.put<CartApiResponse>(
        `/carts/${cartId}/items/${itemId}`,
        data,
        headers
      );

      let cartData = null;

      if (response.data && response.data.data) {
        cartData = response.data.data as unknown as Cart;
      } else if (response.data) {
        cartData = response.data as unknown as Cart;
      }

      if (cartData) {
        setCart(cartData);
        setLoading(false);
        return cartData;
      }

      throw new Error("Cart data not found or in unexpected format");
    } catch (error: unknown) {
      console.error("Error updating cart item:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update cart item";
      const errorStatus = (error as any)?.response?.status;
      setStoreError({
        message: errorMessage,
        status: errorStatus,
      });
      setLoading(false);
      throw error;
    } finally {
      setActiveAction(null);
    }
  },

  removeCartItem: async (
    cartId: string,
    itemId: string,
    headers?: Record<string, string>
  ) => {
    const { setActiveAction, setLoading, setStoreError, cart, setCart } = get();
    try {
      setActiveAction("removeCartItem");
      setLoading(true);
      await apiClient.delete(`/carts/${cartId}/items/${itemId}`, headers);

      // If we have a cart in state, update it by removing the item
      if (cart) {
        const updatedCart = {
          ...cart,
          items: cart.items.filter((item) => item.id !== itemId),
        };
        setCart(updatedCart);
      }

      setLoading(false);
    } catch (error: unknown) {
      console.error("Error removing cart item:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to remove cart item";
      const errorStatus = (error as any)?.response?.status;
      setStoreError({
        message: errorMessage,
        status: errorStatus,
      });
      setLoading(false);
      throw error;
    } finally {
      setActiveAction(null);
    }
  },

  getCartTotals: async (cartId: string, headers?: Record<string, string>) => {
    const { setActiveAction, setLoading, setStoreError, setCartTotals } = get();
    try {
      setActiveAction("getCartTotals");
      setLoading(true);
      const response = await apiClient.get<CartApiResponse>(
        `/carts/${cartId}/totals`,
        undefined,
        headers
      );

      let totalsData = null;

      if (response.data && response.data.data) {
        totalsData = response.data.data as unknown as CartTotals;
      } else if (response.data) {
        totalsData = response.data as unknown as CartTotals;
      }

      if (totalsData) {
        setCartTotals(totalsData);
        setLoading(false);
        return totalsData;
      }

      throw new Error("Cart totals data not found or in unexpected format");
    } catch (error: unknown) {
      console.error("Error fetching cart totals:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch cart totals";
      const errorStatus = (error as any)?.response?.status;
      setStoreError({
        message: errorMessage,
        status: errorStatus,
      });
      setLoading(false);
      throw error;
    } finally {
      setActiveAction(null);
    }
  },

  mergeGuestCart: async (
    userCartId: string,
    guestCartId: string,
    headers?: Record<string, string>
  ) => {
    const { setActiveAction, setLoading, setStoreError, setCart } = get();
    try {
      setActiveAction("mergeGuestCart");
      setLoading(true);
      const response = await apiClient.post<CartApiResponse>(
        `/carts/${userCartId}/merge/${guestCartId}`,
        undefined,
        headers
      );

      let cartData = null;

      if (response.data && response.data.data) {
        cartData = response.data.data as unknown as Cart;
      } else if (response.data) {
        cartData = response.data as unknown as Cart;
      }

      if (cartData) {
        setCart(cartData);
        setLoading(false);
        return cartData;
      }

      throw new Error("Cart data not found or in unexpected format");
    } catch (error: unknown) {
      console.error("Error merging guest cart:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to merge guest cart";
      const errorStatus = (error as any)?.response?.status;
      setStoreError({
        message: errorMessage,
        status: errorStatus,
      });
      setLoading(false);
      throw error;
    } finally {
      setActiveAction(null);
    }
  },
}));
