import {
  IconBusinessplan,
  IconCategory,
  IconChartBar,
  IconCreditCard,
  IconFileDescription,
  IconHelp,
  IconListDetails,
  IconPackage,
  IconTruck,
  IconUsers,
  IconFileAi,
  IconDatabase,
  IconReport,
  IconFileWord,
  IconCamera,
  IconSearch,
  IconUserShield,
  IconSettings,
  IconSettings2,
  IconPackages,
  IconCoins,
  IconUserCode,
} from "@tabler/icons-react";

// Create a separate file for navigation data to ensure consistency
export const navigationData = {
  navMain: [
    {
      title: "Tenants",
      url: "/dashboard/tenants",
      icon: IconChartBar,
      roles: ["super_owner"],
    },
    {
      title: "Categories",
      url: "/dashboard/categories",
      icon: IconCategory,
      roles: ["super_owner", "admin", "sub_admin"],
    },
    {
      title: "Loans",
      url: "#",
      icon: IconCreditCard,
      roles: ["super_owner", "admin", "sub_admin"],
      items: [
        {
          title: "Providers",
          url: "/dashboard/loans/providers",
          icon: IconBusinessplan,
        },
        {
          title: "Products",
          url: "/dashboard/loans/products",
          icon: IconPackages,
        },
        {
          title: "Loan Requests",
          url: "/dashboard/loans/requests",
          icon: IconListDetails,
        }
      ],
    },
    {
      title: "Vendors",
      url: "/dashboard/vendors",
      icon: IconUsers,
      roles: ["super_owner", "admin", "sub_admin"],
      items: [
        {
          // Affiliate marketor
          title: "Winga",
          url: "/dashboard/vendors/winga",
          icon: IconUserCode,
        }
      ]
    },
    {
      title: "Delivery Partners",
      url: "/dashboard/delivery-partners",
      icon: IconTruck,
      roles: ["super_owner", "admin", "sub_admin"],
    },
    {
      title: "Products & Services",
      url: "/dashboard/products",
      icon: IconPackage,
      roles: ["super_owner", "admin", "sub_admin", "support"],
    },
    {
      title: "Orders",
      url: "/dashboard/orders",
      icon: IconListDetails,
      roles: ["super_owner", "admin", "sub_admin", "support"],
      items: [
        {
          title: "Delivery",
          url: "/dashboard/orders/delivery",
          icon: IconTruck,
        },
        {
          title: "Refunds",
          url: "/dashboard/orders/refunds",
          icon: IconCreditCard,
        },
        {
          title: "Transactions",
          url: "/dashboard/orders/transactions",
          icon: IconCoins,
        }
      ],
    },
    {
      title: "Support Tickets",
      url: "/dashboard/support",
      icon: IconHelp,
      roles: ["super_owner", "admin", "sub_admin", "support"],
    },
  ],
  
  navSecondary: [
    {
      title: "Marketplace Settings",
      url: "/dashboard/tenants/marketplace",
      icon: IconSettings2,
      roles: ["admin"],
    },
    {
      title: "Settings & Configurations",
      url: "/dashboard/settings",
      icon: IconSettings,
      roles: ["super_owner"],
    },
    {
      title: "Users",
      url: "/dashboard/auth/users",
      icon: IconUsers,
      roles: ["super_owner", "admin", "sub_admin"],
    },
    {
      title: "User Roles",
      url: "/dashboard/auth/roles",
      icon: IconUserShield,
      roles: ["super_owner", "admin", "sub_admin"],
    },
    {
      title: "Get Help",
      url: "#",
      icon: IconHelp,
      roles: ["admin", "sub_admin", "support"],
    },
    {
      title: "Search",
      url: "#",
      icon: IconSearch,
      roles: ["super_owner", "admin", "sub_admin", "support"],
    },
  ],

  navClouds: [
    {
      title: "Capture",
      icon: IconCamera,
      isActive: true,
      url: "#",
      role: "admin",
      items: [
        {
          title: "Active Proposals",
          url: "#",
          role: "admin",
        },
        {
          title: "Archived",
          url: "#",
          role: "admin",
        },
      ],
    },
    {
      title: "Proposal",
      icon: IconFileDescription,
      url: "#",
      role: "admin",
      items: [
        {
          title: "Active Proposals",
          url: "#",
          role: "admin",
        },
        {
          title: "Archived",
          url: "#",
          role: "admin",
        },
      ],
    },
    {
      title: "Prompts",
      icon: IconFileAi,
      url: "#",
      role: "admin",
      items: [
        {
          title: "Active Proposals",
          url: "#",
          role: "admin",
        },
        {
          title: "Archived",
          url: "#",
          role: "admin",
        },
      ],
    },
  ],

  documents: [
    {
      name: "Data Library",
      url: "#",
      icon: IconDatabase,
      role: "admin",
    },
    {
      name: "Reports",
      url: "#",
      icon: IconReport,
      role: "admin",
    },
    {
      name: "Word Assistant",
      url: "#",
      icon: IconFileWord,
      role: "sub_admin",
    },
  ],
};

export default navigationData;
