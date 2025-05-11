import { Tenant } from "../types";

export const mockTenants: Tenant[] = [
  {
    id: "1",
    name: "Example Store",
    domain: "example-store.marketplace.com",
    country: "TZ",
    currency: "TZS",
    languages: ["en-US", "sw"],
    admin_email: "admin@examplestore.com",
    admin_phone: "+255712345678",
    billing_history: [
      { id: 1, date: "2024-04-15", description: "Monthly Subscription", amount: "150000", status: "paid" },
      { id: 2, date: "2024-03-15", description: "Monthly Subscription", amount: "150000", status: "paid" },
      { id: 3, date: "2024-02-15", description: "Monthly Subscription", amount: "150000", status: "paid" },
      { id: 4, date: "2024-01-15", description: "Monthly Subscription", amount: "150000", status: "paid" },
    ],
    revenue: {
      summary: { 
        total: 12500000, 
        growth: 8.5,
        transactions: 458
      },
      monthly: [
        { month: "Jan", amount: 2800000 },
        { month: "Feb", amount: 3100000 },
        { month: "Mar", amount: 3300000 },
        { month: "Apr", amount: 3300000 },
      ],
    },
    modules: {
      payments: true,
      promotions: true,
      inventory: true,
    },
    branding: {
      logoUrl: "https://storage.marketplace.com/logos/example-store.png",
      theme: {
        logo: {
          primary: "https://storage.marketplace.com/logos/example-store.png",
          secondary: "https://storage.marketplace.com/logos/example-store-secondary.png",
          icon: "https://storage.marketplace.com/logos/example-store-icon.png",
        },
        colors: {
          primary: "#4285F4",
          secondary: "#34A853",
          accent: "#FBBC05",
          text: {
            primary: "#000000",
            secondary: "#666666",
          },
          background: {
            primary: "#FFFFFF",
            secondary: "#F5F5F5",
          },
          border: "#E5E5E5",
        },
      },
    },
    created_at: "2023-01-15T08:30:00Z",
    updated_at: "2023-04-22T14:15:30Z",
    status: "active",
  },
  {
    id: "2",
    name: "Fashion Boutique",
    domain: "fashion-boutique.marketplace.com",
    country: "TZ",
    currency: "TZS",
    languages: ["en-US", "sw"],
    admin_email: "admin@fashionboutique.com",
    admin_phone: "+255787654321",
    billing_history: [
      { id: 1, date: "2024-04-15", description: "Monthly Subscription", amount: "150000", status: "paid" },
      { id: 2, date: "2024-03-15", description: "Monthly Subscription", amount: "150000", status: "paid" },
      { id: 3, date: "2024-02-15", description: "Monthly Subscription", amount: "150000", status: "paid" },
      { id: 4, date: "2024-01-15", description: "Monthly Subscription", amount: "150000", status: "paid" },
    ],
    revenue: {
      summary: { 
        total: 12500000, 
        growth: 8.5,
        transactions: 458
      },
      monthly: [
        { month: "Jan", amount: 2800000 },
        { month: "Feb", amount: 3100000 },
        { month: "Mar", amount: 3300000 },
        { month: "Apr", amount: 3300000 },
      ],
    },
    modules: {
      payments: true,
      promotions: true,
      inventory: false,
    },
    branding: {
      logoUrl: "https://storage.marketplace.com/logos/fashion-boutique.png",
      theme: {
        logo: {
          primary: "https://storage.marketplace.com/logos/fashion-boutique.png",
          secondary: "https://storage.marketplace.com/logos/fashion-boutique-secondary.png",
          icon: "https://storage.marketplace.com/logos/fashion-boutique-icon.png",
        },
        colors: {
          primary: "#FF5733",
          secondary: "#C70039",
          accent: "#FFC300",
          text: {
            primary: "#333333",
            secondary: "#777777",
          },
          background: {
            primary: "#FFFFFF",
            secondary: "#F9F9F9",
          },
          border: "#DDDDDD",
        },
      },
    },
    created_at: "2023-02-20T10:45:00Z",
    updated_at: "2023-05-15T11:30:45Z",
    status: "active",
  },
  {
    id: "3",
    name: "Tech Gadgets",
    domain: "tech-gadgets.marketplace.com",
    country: "KE",
    currency: "KES",
    languages: ["en-US"],
    admin_email: "admin@techgadgets.com",
    admin_phone: "+254712345678",
    billing_history: [
      { id: 1, date: "2024-04-15", description: "Monthly Subscription", amount: "150000", status: "paid" },
      { id: 2, date: "2024-03-15", description: "Monthly Subscription", amount: "150000", status: "paid" },
      { id: 3, date: "2024-02-15", description: "Monthly Subscription", amount: "150000", status: "paid" },
      { id: 4, date: "2024-01-15", description: "Monthly Subscription", amount: "150000", status: "paid" },
    ],
    revenue: {
      summary: { 
        total: 12500000, 
        growth: 8.5,
        transactions: 458
      },
      monthly: [
        { month: "Jan", amount: 2800000 },
        { month: "Feb", amount: 3100000 },
        { month: "Mar", amount: 3300000 },
        { month: "Apr", amount: 3300000 },
      ],
    },
    modules: {
      payments: true,
      promotions: false,
      inventory: true,
    },
    branding: {
      logoUrl: "https://storage.marketplace.com/logos/tech-gadgets.png",
      theme: {
        logo: {
          primary: "https://storage.marketplace.com/logos/tech-gadgets.png",
          secondary: "https://storage.marketplace.com/logos/tech-gadgets-secondary.png",
          icon: "https://storage.marketplace.com/logos/tech-gadgets-icon.png",
        },
        colors: {
          primary: "#3498DB",
          secondary: "#2ECC71",
          accent: "#F1C40F",
          text: {
            primary: "#2C3E50",
            secondary: "#7F8C8D",
          },
          background: {
            primary: "#ECF0F1",
            secondary: "#D6DBDF",
          },
          border: "#BDC3C7",
        },
      },
    },
    created_at: "2023-03-10T14:20:00Z",
    updated_at: "2023-06-05T09:15:20Z",
    status: "inactive",
  },
  {
    id: "4",
    name: "Fresh Groceries",
    domain: "fresh-groceries.marketplace.com",
    country: "TZ",
    currency: "TZS",
    languages: ["sw", "en-US"],
    admin_email: "admin@freshgroceries.com",
    admin_phone: "+255798765432",
    billing_history: [],
    revenue: {
      summary: { 
        total: 0, 
        growth: 0,
        transactions: 0
      },
      monthly: [],
    },
    modules: {
      payments: true,
      promotions: true,
      inventory: true,
    },
    branding: {
      logoUrl: "https://storage.marketplace.com/logos/fresh-groceries.png",
      theme: {
        logo: {
          primary: "https://storage.marketplace.com/logos/fresh-groceries.png",
          secondary: "https://storage.marketplace.com/logos/fresh-groceries-secondary.png",
          icon: "https://storage.marketplace.com/logos/fresh-groceries-icon.png",
        },
        colors: {
          primary: "#27AE60",
          secondary: "#2ECC71",
          accent: "#F39C12",
          text: {
            primary: "#2C3E50",
            secondary: "#34495E",
          },
          background: {
            primary: "#FDFEFE",
            secondary: "#EAEDED",
          },
          border: "#D5D8DC",
        },
      },
    },
    created_at: "2023-04-05T08:00:00Z",
    updated_at: "2023-07-12T16:30:15Z",
    status: "pending",
  },
];
