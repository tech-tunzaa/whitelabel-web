export type CategoryStatus = "active" | "inactive";

export interface Category {
  _id: string;
  name: string;
  description?: string;
  status: CategoryStatus;
  parentId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryFormData {
  name: string;
  description?: string;
  status: CategoryStatus;
  parentId?: string;
} 