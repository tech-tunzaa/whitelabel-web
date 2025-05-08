export type TenantBranding = {
  logoUrl: string;
  theme: {
    logo: {
      primary: string;
      secondary: string;
      icon: string;
    };
    colors: {
      primary: string;
      secondary: string;
      accent: string;
      text: {
        primary: string;
        secondary: string;
      };
      background: {
        primary: string;
        secondary: string;
      };
      border: string;
    };
  };
};

export type TenantModules = {
  payments: boolean;
  promotions: boolean;
  inventory: boolean;
};

export type BillingHistoryItem = {
  id: number;
  date: string;
  description: string;
  amount: string;
  status: 'paid' | 'pending' | 'failed';
};

export type RevenueData = {
  summary: {
    total: number;
    growth: number;
    transactions: number;
  };
  monthly: {
    month: string;
    amount: number;
  }[];
};

export type Tenant = {
  id: string;
  name: string;
  domain: string;
  country: string;
  currency: string;
  languages: string[];
  admin_email: string;
  admin_phone: string;
  modules: TenantModules;
  branding: TenantBranding;
  created_at: string;
  updated_at: string;
  status: "active" | "inactive" | "pending";
  billing_history?: BillingHistoryItem[];
  revenue?: RevenueData;
};
