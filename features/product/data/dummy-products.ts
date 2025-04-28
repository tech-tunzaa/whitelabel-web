import { Product } from "../types/product";

export const dummyProducts: Product[] = [
  {
    _id: "65f1a2b3c4d5e6f7a8b9c0d1",
    vendorId: "65f1a2b3c4d5e6f7a8b9c0d2",
    name: "Premium Coffee Beans",
    slug: "premium-coffee-beans",
    status: "active",
    brandId: "65f1a2b3c4d5e6f7a8b9c0d3",
    description: "High-quality Arabica coffee beans from Kilimanjaro region",
    featured: true,
    categoryIds: ["65f1a2b3c4d5e6f7a8b9c0d4"],
    images: [
      {
        url: "/images/coffee-beans.jpg",
        alt: "Premium Coffee Beans",
        pos: 1,
      },
    ],
    price: 25000,
    inventory: {
      stockLevel: 100,
      stockStatus: "in_stock",
    },
    createdAt: new Date("2024-03-15T10:00:00Z"),
    updatedAt: new Date("2024-03-15T10:00:00Z"),
  },
  {
    _id: "65f1a2b3c4d5e6f7a8b9c0d5",
    vendorId: "65f1a2b3c4d5e6f7a8b9c0d2",
    name: "Handmade Maasai Beaded Necklace",
    slug: "maasai-beaded-necklace",
    status: "active",
    brandId: "65f1a2b3c4d5e6f7a8b9c0d6",
    description: "Traditional Maasai beaded necklace with vibrant colors",
    featured: true,
    categoryIds: ["65f1a2b3c4d5e6f7a8b9c0d7"],
    images: [
      {
        url: "/images/maasai-necklace.jpg",
        alt: "Maasai Beaded Necklace",
        pos: 1,
      },
    ],
    variants: [
      {
        _id: "65f1a2b3c4d5e6f7a8b9c0d8",
        sku: "MB-NECK-001",
        attributes: [
          { name: "color", value: "red" },
          { name: "size", value: "medium" },
        ],
        price: 35000,
        inventory: {
          stockLevel: 15,
          stockStatus: "in_stock",
        },
      },
      {
        _id: "65f1a2b3c4d5e6f7a8b9c0d9",
        sku: "MB-NECK-002",
        attributes: [
          { name: "color", value: "blue" },
          { name: "size", value: "large" },
        ],
        price: 40000,
        inventory: {
          stockLevel: 10,
          stockStatus: "in_stock",
        },
      },
    ],
    createdAt: new Date("2024-03-14T15:30:00Z"),
    updatedAt: new Date("2024-03-14T15:30:00Z"),
  },
  {
    _id: "65f1a2b3c4d5e6f7a8b9c0da",
    vendorId: "65f1a2b3c4d5e6f7a8b9c0db",
    name: "Tanzanite Gemstone",
    slug: "tanzanite-gemstone",
    status: "draft",
    brandId: "65f1a2b3c4d5e6f7a8b9c0dc",
    description: "Rare Tanzanite gemstone from Mererani Hills",
    featured: false,
    categoryIds: ["65f1a2b3c4d5e6f7a8b9c0dd"],
    images: [
      {
        url: "/images/tanzanite.jpg",
        alt: "Tanzanite Gemstone",
        pos: 1,
      },
    ],
    price: 1500000,
    inventory: {
      stockLevel: 5,
      stockStatus: "low_stock",
    },
    createdAt: new Date("2024-03-13T09:15:00Z"),
    updatedAt: new Date("2024-03-13T09:15:00Z"),
  },
];
