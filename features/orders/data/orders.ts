export const mockOrders = [
  {
    id: 1001,
    orderDate: "2023-12-01T10:30:00",
    customer: {
      name: "John Smith",
      email: "john.smith@example.com",
      phone: "+1 (555) 123-4567",
      avatar: "/placeholder.svg?height=40&width=40",
      since: "Jan 2023",
      orderCount: 5,
    },
    items: [
      {
        id: 1,
        name: "Wireless Noise-Cancelling Headphones",
        price: 349.99,
        quantity: 1,
        image: "/placeholder.svg?height=64&width=64",
      },
      {
        id: 2,
        name: "Smartphone Case",
        price: 24.99,
        quantity: 2,
        options: {
          Color: "Black",
          Material: "Silicone",
        },
        image: "/placeholder.svg?height=64&width=64",
      },
    ],
    subtotal: 399.97,
    tax: 32.0,
    shippingCost: 9.99,
    total: 441.96,
    status: "delivered",
    payment: {
      method: "Credit Card (Visa ****4567)",
      status: "paid",
      transactionId: "txn_1234567890",
    },
    shipping: {
      name: "John Smith",
      address: {
        street: "123 Main St",
        city: "San Francisco",
        state: "CA",
        zip: "94105",
        country: "United States",
      },
      method: "Standard Shipping (3-5 business days)",
    },
    vendor: {
      name: "Tech Gadgets Plus",
      address: "456 Market St, San Francisco, CA 94105",
    },
    timeline: [
      {
        status: "Order Placed",
        timestamp: "2023-12-01T10:30:00",
        note: "Order received and payment confirmed",
      },
      {
        status: "Processing",
        timestamp: "2023-12-01T11:45:00",
        note: "Order is being prepared for shipping",
      },
      {
        status: "shipped",
        timestamp: "2023-12-02T09:15:00",
        note: "Order has been shipped via UPS",
        images: [
          {
            url: "https://placehold.co/600x400/e2e8f0/94a3b8?text=Packaging+1",
            alt: "Package being prepared for shipping"
          },
          {
            url: "https://placehold.co/600x400/e2e8f0/94a3b8?text=Packaging+2",
            alt: "Package ready for pickup"
          }
        ]
      },
      {
        status: "delivered",
        timestamp: "2023-12-04T14:20:00",
        note: "Package delivered and signed for by recipient",
        images: [
          {
            url: "https://placehold.co/600x400/e2e8f0/94a3b8?text=Delivery+1",
            alt: "Package at delivery location"
          },
          {
            url: "https://placehold.co/600x400/e2e8f0/94a3b8?text=Delivery+2",
            alt: "Package delivered successfully"
          }
        ]
      },
    ],
    flagged: false,
    rider: {
      id: 1,
      name: "Michael Johnson",
      avatar: "/placeholder.svg?height=40&width=40",
      phone: "+1 (555) 987-6543",
      status: "available",
    },
  },
  {
    id: 1002,
    orderDate: "2023-12-02T15:45:00",
    customer: {
      name: "Emily Davis",
      email: "emily.davis@example.com",
      phone: "+1 (555) 234-5678",
      avatar: "/placeholder.svg?height=40&width=40",
      since: "Mar 2023",
      orderCount: 3,
    },
    items: [
      {
        id: 3,
        name: "Women's Summer Dress",
        price: 79.99,
        quantity: 1,
        options: {
          Size: "Medium",
          Color: "Blue",
        },
        image: "/placeholder.svg?height=64&width=64",
      },
    ],
    subtotal: 79.99,
    tax: 6.4,
    shippingCost: 4.99,
    total: 91.38,
    status: "shipped",
    payment: {
      method: "PayPal",
      status: "paid",
      transactionId: "txn_0987654321",
    },
    shipping: {
      name: "Emily Davis",
      address: {
        street: "456 Oak Ave",
        city: "Portland",
        state: "OR",
        zip: "97205",
        country: "United States",
      },
      method: "Express Shipping (1-2 business days)",
    },
    vendor: {
      name: "Fashion Brands Inc.",
      address: "789 Fashion Blvd, Portland, OR 97205",
    },
    timeline: [
      {
        status: "Order Placed",
        timestamp: "2023-12-02T15:45:00",
        note: "Order received and payment confirmed",
      },
      {
        status: "Processing",
        timestamp: "2023-12-02T16:30:00",
        note: "Order is being prepared for shipping",
      },
      {
        status: "shipped",
        timestamp: "2023-12-03T10:00:00",
        note: "Order has been shipped via FedEx",
        images: [
          {
            url: "https://placehold.co/600x400/e2e8f0/94a3b8?text=Packaging+1",
            alt: "Package being prepared for shipping"
          },
          {
            url: "https://placehold.co/600x400/e2e8f0/94a3b8?text=Packaging+2",
            alt: "Package ready for pickup"
          }
        ]
      },
    ],
    flagged: false,
    rider: {
      id: 2,
      name: "Sarah Wilson",
      avatar: "/placeholder.svg?height=40&width=40",
      phone: "+1 (555) 876-5432",
      status: "assigned",
    },
  },
  {
    id: 1003,
    orderDate: "2023-12-03T09:15:00",
    customer: {
      name: "Robert Johnson",
      email: "robert.johnson@example.com",
      phone: "+1 (555) 345-6789",
      avatar: "/placeholder.svg?height=40&width=40",
      since: "Nov 2022",
      orderCount: 8,
    },
    items: [
      {
        id: 4,
        name: "Professional Blender",
        price: 199.99,
        quantity: 1,
        image: "/placeholder.svg?height=64&width=64",
      },
      {
        id: 5,
        name: "Coffee Maker",
        price: 89.99,
        quantity: 1,
        image: "/placeholder.svg?height=64&width=64",
      },
    ],
    subtotal: 289.98,
    tax: 23.2,
    shippingCost: 0,
    total: 313.18,
    status: "processing",
    payment: {
      method: "Credit Card (Mastercard ****1234)",
      status: "paid",
      transactionId: "txn_2468135790",
    },
    shipping: {
      name: "Robert Johnson",
      address: {
        street: "789 Pine St",
        city: "Chicago",
        state: "IL",
        zip: "60601",
        country: "United States",
      },
      method: "Free Shipping (5-7 business days)",
    },
    vendor: {
      name: "KitchenPro",
      address: "101 Kitchen Ave, Chicago, IL 60601",
    },
    timeline: [
      {
        status: "Order Placed",
        timestamp: "2023-12-03T09:15:00",
        note: "Order received and payment confirmed",
      },
      {
        status: "Processing",
        timestamp: "2023-12-03T10:30:00",
        note: "Order is being prepared for shipping",
      },
    ],
    flagged: false,
    rider: {
      id: 3,
      name: "David Thompson",
      avatar: "/placeholder.svg?height=40&width=40",
      phone: "+1 (555) 765-4321",
      status: "assigned",
    },
  },
  {
    id: 1004,
    orderDate: "2023-12-03T14:20:00",
    customer: {
      name: "Jennifer Wilson",
      email: "jennifer.wilson@example.com",
      phone: "+1 (555) 456-7890",
      avatar: "/placeholder.svg?height=40&width=40",
      since: "Feb 2023",
      orderCount: 2,
    },
    items: [
      {
        id: 6,
        name: "Leather Crossbody Bag",
        price: 129.99,
        quantity: 1,
        options: {
          Color: "Brown",
        },
        image: "/placeholder.svg?height=64&width=64",
      },
    ],
    subtotal: 129.99,
    tax: 10.4,
    shippingCost: 7.99,
    total: 148.38,
    status: "pending",
    payment: {
      method: "Credit Card (Amex ****7890)",
      status: "pending",
      transactionId: null,
    },
    shipping: {
      name: "Jennifer Wilson",
      address: {
        street: "321 Maple Ave",
        city: "Boston",
        state: "MA",
        zip: "02108",
        country: "United States",
      },
      method: "Standard Shipping (3-5 business days)",
    },
    vendor: {
      name: "LuxLeather",
      address: "222 Fashion St, Boston, MA 02108",
    },
    timeline: [
      {
        status: "Order Placed",
        timestamp: "2023-12-03T14:20:00",
        note: "Order received, awaiting payment confirmation",
      },
    ],
    flagged: false,
    rider: null,
  },
  {
    id: 1005,
    orderDate: "2023-12-02T11:10:00",
    customer: {
      name: "Michael Brown",
      email: "michael.brown@example.com",
      phone: "+1 (555) 567-8901",
      avatar: "/placeholder.svg?height=40&width=40",
      since: "Apr 2023",
      orderCount: 4,
    },
    items: [
      {
        id: 7,
        name: "Modern Coffee Table",
        price: 249.99,
        quantity: 1,
        image: "/placeholder.svg?height=64&width=64",
      },
    ],
    subtotal: 249.99,
    tax: 20.0,
    shippingCost: 29.99,
    total: 299.98,
    status: "cancelled",
    payment: {
      method: "Credit Card (Visa ****5678)",
      status: "refunded",
      transactionId: "txn_1357924680",
    },
    shipping: {
      name: "Michael Brown",
      address: {
        street: "555 Elm St",
        city: "Denver",
        state: "CO",
        zip: "80202",
        country: "United States",
      },
      method: "Large Item Delivery (5-7 business days)",
    },
    vendor: {
      name: "HomeStyle",
      address: "333 Furniture Blvd, Denver, CO 80202",
    },
    timeline: [
      {
        status: "Order Placed",
        timestamp: "2023-12-02T11:10:00",
        note: "Order received and payment confirmed",
      },
      {
        status: "Processing",
        timestamp: "2023-12-02T13:45:00",
        note: "Order is being prepared for shipping",
      },
      {
        status: "Cancelled",
        timestamp: "2023-12-03T09:30:00",
        note: "Order cancelled by customer. Reason: Found a better deal elsewhere",
      },
      {
        status: "Refunded",
        timestamp: "2023-12-03T10:15:00",
        note: "Full refund processed to original payment method",
      },
    ],
    flagged: false,
    rider: null,
  },
  {
    id: 1006,
    orderDate: "2023-12-03T16:50:00",
    customer: {
      name: "Sarah Miller",
      email: "sarah.miller@example.com",
      phone: "+1 (555) 678-9012",
      avatar: "/placeholder.svg?height=40&width=40",
      since: "Jul 2023",
      orderCount: 1,
    },
    items: [
      {
        id: 8,
        name: "Gaming Laptop Pro",
        price: 1799.99,
        quantity: 1,
        image: "/placeholder.svg?height=64&width=64",
      },
      {
        id: 9,
        name: "Gaming Mouse",
        price: 59.99,
        quantity: 1,
        image: "/placeholder.svg?height=64&width=64",
      },
    ],
    subtotal: 1859.98,
    tax: 148.8,
    shippingCost: 0,
    total: 2008.78,
    status: "pending",
    payment: {
      method: "Financing (36 monthly payments)",
      status: "pending",
      transactionId: null,
    },
    shipping: {
      name: "Sarah Miller",
      address: {
        street: "777 Tech Blvd",
        city: "Seattle",
        state: "WA",
        zip: "98101",
        country: "United States",
      },
      method: "Free Expedited Shipping (2-3 business days)",
    },
    vendor: {
      name: "GameTech",
      address: "444 Gaming Ave, Seattle, WA 98101",
    },
    timeline: [
      {
        status: "Order Placed",
        timestamp: "2023-12-03T16:50:00",
        note: "Order received, awaiting financing approval",
      },
    ],
    flagged: true,
    rider: null,
  },
  {
    id: 1007,
    orderDate: "2023-12-01T13:25:00",
    customer: {
      name: "David Garcia",
      email: "david.garcia@example.com",
      phone: "+1 (555) 789-0123",
      avatar: "/placeholder.svg?height=40&width=40",
      since: "Sep 2022",
      orderCount: 7,
    },
    items: [
      {
        id: 10,
        name: "Decorative Wall Art",
        price: 89.99,
        quantity: 2,
        image: "/placeholder.svg?height=64&width=64",
      },
      {
        id: 11,
        name: "Table Lamp",
        price: 49.99,
        quantity: 1,
        image: "/placeholder.svg?height=64&width=64",
      },
    ],
    subtotal: 229.97,
    tax: 18.4,
    shippingCost: 12.99,
    total: 261.36,
    status: "refunded",
    payment: {
      method: "Credit Card (Discover ****9012)",
      status: "refunded",
      transactionId: "txn_0246813579",
    },
    shipping: {
      name: "David Garcia",
      address: {
        street: "888 Decor St",
        city: "Austin",
        state: "TX",
        zip: "78701",
        country: "United States",
      },
      method: "Standard Shipping (3-5 business days)",
    },
    vendor: {
      name: "ArtDecor",
      address: "555 Art Ave, Austin, TX 78701",
    },
    timeline: [
      {
        status: "Order Placed",
        timestamp: "2023-12-01T13:25:00",
        note: "Order received and payment confirmed",
      },
      {
        status: "Processing",
        timestamp: "2023-12-01T14:40:00",
        note: "Order is being prepared for shipping",
      },
      {
        status: "shipped",
        timestamp: "2023-12-02T11:30:00",
        note: "Order has been shipped via USPS",
        images: [
          {
            url: "https://placehold.co/600x400/e2e8f0/94a3b8?text=Packaging+1",
            alt: "Package being prepared for shipping"
          },
          {
            url: "https://placehold.co/600x400/e2e8f0/94a3b8?text=Packaging+2",
            alt: "Package ready for pickup"
          }
        ]
      },
      {
        status: "delivered",
        timestamp: "2023-12-04T15:10:00",
        note: "Package delivered and left at front door",
        images: [
          {
            url: "https://placehold.co/600x400/e2e8f0/94a3b8?text=Delivery+1",
            alt: "Package at delivery location"
          },
          {
            url: "https://placehold.co/600x400/e2e8f0/94a3b8?text=Delivery+2",
            alt: "Package delivered successfully"
          }
        ]
      },
      {
        status: "Return Requested",
        timestamp: "2023-12-05T09:20:00",
        note: "Customer requested return. Reason: Items damaged during shipping",
      },
      {
        status: "Refunded",
        timestamp: "2023-12-07T14:15:00",
        note: "Full refund processed to original payment method",
      },
    ],
    flagged: false,
    rider: {
      id: 4,
      name: "Lisa Martinez",
      avatar: "/placeholder.svg?height=40&width=40",
      phone: "+1 (555) 654-3210",
      status: "available",
    },
  },
  {
    id: 1008,
    orderDate: "2023-12-03T10:05:00",
    customer: {
      name: "Jessica Taylor",
      email: "jessica.taylor@example.com",
      phone: "+1 (555) 890-1234",
      avatar: "/placeholder.svg?height=40&width=40",
      since: "Oct 2023",
      orderCount: 2,
    },
    items: [
      {
        id: 12,
        name: "Smartphone XYZ Pro",
        price: 999.99,
        quantity: 1,
        options: {
          Color: "Midnight Blue",
          Storage: "256GB",
        },
        image: "/placeholder.svg?height=64&width=64",
      },
      {
        id: 13,
        name: "Screen Protector",
        price: 19.99,
        quantity: 1,
        image: "/placeholder.svg?height=64&width=64",
      },
      {
        id: 14,
        name: "Phone Case",
        price: 29.99,
        quantity: 1,
        options: {
          Color: "Clear",
          Material: "TPU",
        },
        image: "/placeholder.svg?height=64&width=64",
      },
    ],
    subtotal: 1049.97,
    tax: 84.0,
    shippingCost: 0,
    total: 1133.97,
    status: "processing",
    payment: {
      method: "Credit Card (Visa ****2345)",
      status: "paid",
      transactionId: "txn_9753108642",
    },
    shipping: {
      name: "Jessica Taylor",
      address: {
        street: "999 Tech St",
        city: "Miami",
        state: "FL",
        zip: "33101",
        country: "United States",
      },
      method: "Free Next-Day Delivery",
    },
    vendor: {
      name: "TechCorp",
      address: "666 Mobile Ave, Miami, FL 33101",
    },
    timeline: [
      {
        status: "Order Placed",
        timestamp: "2023-12-03T10:05:00",
        note: "Order received and payment confirmed",
      },
      {
        status: "Processing",
        timestamp: "2023-12-03T11:20:00",
        note: "Order is being prepared for shipping",
      },
    ],
    flagged: true,
    rider: null,
  },
]
