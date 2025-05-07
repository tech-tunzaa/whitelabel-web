export type UserRole = 'super_owner' | 'admin' | 'sub_admin' | 'support';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  status: 'active' | 'inactive';
  avatar?: string;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}
