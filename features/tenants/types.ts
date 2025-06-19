import { TenantFormValues } from "./schema";

export type { TenantFormValues };

export type Banner = {
  title: string;
  image_url: string;
  alt_text?: string;
  display_order: number;
};

export type TenantTheme = {
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

export type TenantBranding = {
  logoUrl?: string | null;
  theme: TenantTheme;
};

export type TenantModules = {
  payments: boolean;
  promotions: boolean;
  inventory: boolean;
};

export type User = {
  user_id?: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
};

export type Tenant = {
  id: string;
  user: User;
  name: string;
  domain: string;
  country_code: string;
  currency: string;
  languages: string[];
  admin_email: string;
  admin_phone: string;
  is_active: boolean;
  fee?: string;
  trial_ends_at: string | null;
  plan: string | null;
  modules: TenantModules;
  branding: TenantBranding | null;
  banners: Banner[] | null;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
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