import { Role, Permission } from '../types/role';

export const mockPermissions: Permission[] = [
  {
    id: '1',
    name: 'view_users',
    description: 'View user list and details',
    module: 'users'
  },
  {
    id: '2',
    name: 'create_users',
    description: 'Create new users',
    module: 'users'
  },
  {
    id: '3',
    name: 'edit_users',
    description: 'Edit existing users',
    module: 'users'
  },
  {
    id: '4',
    name: 'delete_users',
    description: 'Delete users',
    module: 'users'
  },
  {
    id: '5',
    name: 'view_roles',
    description: 'View role list and details',
    module: 'roles'
  },
  {
    id: '6',
    name: 'create_roles',
    description: 'Create new roles',
    module: 'roles'
  },
  {
    id: '7',
    name: 'edit_roles',
    description: 'Edit existing roles',
    module: 'roles'
  },
  {
    id: '8',
    name: 'delete_roles',
    description: 'Delete roles',
    module: 'roles'
  },
  {
    id: '9',
    name: 'view_tenants',
    description: 'View tenant list and details',
    module: 'tenants'
  },
  {
    id: '10',
    name: 'create_tenants',
    description: 'Create new tenants',
    module: 'tenants'
  },
  {
    id: '11',
    name: 'edit_tenants',
    description: 'Edit existing tenants',
    module: 'tenants'
  },
  {
    id: '12',
    name: 'delete_tenants',
    description: 'Delete tenants',
    module: 'tenants'
  },
  {
    id: '13',
    name: 'view_vendors',
    description: 'View vendor list and details',
    module: 'vendors'
  },
  {
    id: '14',
    name: 'create_vendors',
    description: 'Create new vendors',
    module: 'vendors'
  },
  {
    id: '15',
    name: 'edit_vendors',
    description: 'Edit existing vendors',
    module: 'vendors'
  },
  {
    id: '16',
    name: 'delete_vendors',
    description: 'Delete vendors',
    module: 'vendors'
  },
  {
    id: '17',
    name: 'view_delivery_partners',
    description: 'View delivery partner list and details',
    module: 'delivery_partners'
  },
  {
    id: '18',
    name: 'create_delivery_partners',
    description: 'Create new delivery partners',
    module: 'delivery_partners'
  },
  {
    id: '19',
    name: 'edit_delivery_partners',
    description: 'Edit existing delivery partners',
    module: 'delivery_partners'
  },
  {
    id: '20',
    name: 'delete_delivery_partners',
    description: 'Delete delivery partners',
    module: 'delivery_partners'
  },
  {
    id: '21',
    name: 'view_orders',
    description: 'View order list and details',
    module: 'orders'
  },
  {
    id: '22',
    name: 'update_order_status',
    description: 'Update order status',
    module: 'orders'
  },
  {
    id: '23',
    name: 'process_refunds',
    description: 'Process order refunds',
    module: 'orders'
  },
  {
    id: '24',
    name: 'view_revenue',
    description: 'View revenue and financial data',
    module: 'finance'
  },
  {
    id: '25',
    name: 'manage_settings',
    description: 'Manage system settings',
    module: 'settings'
  }
];

export const mockRoles: Role[] = [
  {
    id: '1',
    name: 'Super Owner',
    description: 'Complete system access with all permissions',
    permissions: mockPermissions.map(p => p.id),
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z'
  },
  {
    id: '2',
    name: 'Admin',
    description: 'Administrative access with most permissions except role management',
    permissions: mockPermissions
      .filter(p => p.module !== 'roles' || p.name === 'view_roles')
      .map(p => p.id),
    createdAt: '2023-01-02T00:00:00Z',
    updatedAt: '2023-01-02T00:00:00Z'
  },
  {
    id: '3',
    name: 'Sub Admin',
    description: 'Limited administrative access without tenant management',
    permissions: mockPermissions
      .filter(p => 
        (p.module !== 'roles' || p.name === 'view_roles') && 
        (p.module !== 'tenants' || p.name === 'view_tenants') &&
        p.name !== 'delete_users' &&
        p.name !== 'view_revenue'
      )
      .map(p => p.id),
    createdAt: '2023-02-15T00:00:00Z',
    updatedAt: '2023-02-15T00:00:00Z'
  },
  {
    id: '4',
    name: 'Support',
    description: 'Access focused on customer and order management',
    permissions: mockPermissions
      .filter(p => 
        p.module === 'orders' || 
        p.name === 'view_users' || 
        p.name === 'view_vendors' || 
        p.name === 'view_delivery_partners'
      )
      .map(p => p.id),
    createdAt: '2023-03-01T00:00:00Z',
    updatedAt: '2023-03-01T00:00:00Z'
  }
];
