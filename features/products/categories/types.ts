export interface Category {
  _id: string;
  name: string;
  description?: string;
  is_active: boolean;
  parentId?: string;
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
