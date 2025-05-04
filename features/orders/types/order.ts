export type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded";

export type PaymentMethod = "Credit Card" | "PayPal" | "Bank Transfer" | "Cash on Delivery";

export type PaymentStatus = "paid" | "pending" | "failed" | "refunded";

export type ShippingMethod = "Standard" | "Express" | "Free";

export interface Customer {
    name: string;
    email: string;
    phone: string;
    avatar: string;
    since: string;
    orderCount: number;
}

export interface OrderItem {
    id: number;
    name: string;
    price: number;
    quantity: number;
    image: string;
    options?: Record<string, string>;
}

export interface Payment {
    method: string;
    status: PaymentStatus;
    transactionId: string;
}

export interface Address {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
}

export interface Shipping {
    name: string;
    address: Address;
    method: string;
}

export interface Vendor {
    name: string;
    address: string;
}

export interface TimelineEvent {
    status: OrderStatus;
    timestamp: string;
    note: string;
    images?: {
        url: string;
        alt: string;
    }[];
}

export interface Rider {
    id: number;
    name: string;
    avatar: string;
    phone: string;
    status: "available" | "assigned" | "busy";
}

export interface Order {
    id: number;
    orderDate: string;
    customer: Customer;
    items: OrderItem[];
    subtotal: number;
    tax: number;
    shippingCost: number;
    total: number;
    status: OrderStatus;
    payment: Payment;
    shipping: Shipping;
    vendor: Vendor;
    timeline: TimelineEvent[];
    flagged: boolean;
    rider?: Rider;
} 