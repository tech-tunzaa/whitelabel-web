// {
//   "_id": "682478a3146affbf57e9550d",
//   "category_id": "f95c463b-2bbf-4eda-8a03-5df1abde523d",
//   "tenant_id": "4c56d0c3-55d9-495b-ae26-0d922d430a42",
//   "name": "Electronics",
//   "slug": "electronics",
//   "description": "",
//   "parent_id": null,
//   "image_url": null,
//   "is_active": true,
//   "display_order": 0,
//   "created_at": "14/05/2025",
//   "updated_at": "14/05/2025"
// },

export interface Category {
  _id: string;
  category_id: string;
  tenant_id: string;
  name: string;
  slug: string;
  description: string;
  parent_id: string;
  image_url: string;
  is_active: boolean;
  display_order: number;
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
  category_id?: string; // Category ID for editing and getting a single category
  name: string;
  slug?: string;
  description?: string;
  parent_id?: string;
  image_url?: string;
  is_active: boolean;
  display_order?: number;
}
