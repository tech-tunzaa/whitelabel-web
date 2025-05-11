import { TenantFormValues } from "./schema";

export type { TenantFormValues };

export type TenantBranding = {
  logoUrl: string;
  theme: {
    logo: {
      primary: string | null;
      secondary: string | null;
      icon: string | null;
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
  user_id: string;
  name: string;
  domain: string;
  country_code: string;
  currency: string;
  languages: string[];
  admin_email: string;
  admin_phone: string;
  is_active: boolean;
  trial_ends_at: string | null;
  plan: string | null;
  modules: TenantModules;
  branding: TenantBranding;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  billing_history: Array<{
    id: string;
    description: string;
    date: string;
    amount: number;
    status: string;
  }>;
};

export type TenantError = {
  status: number;
  message: string;
};
  
export type TenantListResponse = {
  items: Tenant[];
  total: number;
  skip: number;
  limit: number;
};

export type TenantFilter = {
  skip?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
};

export type TenantAction = 'fetch' | 'fetchList' | 'create' | 'update' | 'activate' | 'deactivate' | 'toggleModule';