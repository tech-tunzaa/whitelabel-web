export interface Category {
  _id: string;
  name: string;
  description?: string;
  is_active: boolean;
  status?: 'active' | 'inactive';
  parentId?: string;
  featured?: boolean;
  slug?: string;
  created_at: string;
  updated_at: string;
}

export interface CategoryFilter {
  skip?: number;
  limit?: number;
  search?: string;
  status?: string;
}

export interface CategoryListResponse {
  items: Category[];
  total: number;
  skip: number;
  limit: number;
}

export type CategoryAction = 
  | 'fetchList'
  | 'fetchOne'
  | 'create'
  | 'update'
  | 'delete';

export interface CategoryError {
  message: string;
  status?: number;
}

export interface CategoryFormData {
  name: string;
  description?: string;
  status: 'active' | 'inactive';
  parentId?: string;
  featured?: boolean;
  slug?: string;
  category_id?: string; // Added to track the category being edited
}
