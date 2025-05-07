import { create } from 'zustand';
import { Role, Permission } from '../types/role';
import { mockRoles, mockPermissions } from '../data/roles';

interface RoleStore {
  roles: Role[];
  permissions: Permission[];
  selectedRole: Role | null;
  searchQuery: string;
  setRoles: (roles: Role[]) => void;
  setPermissions: (permissions: Permission[]) => void;
  selectRole: (role: Role | null) => void;
  setSearchQuery: (query: string) => void;
  getRole: (id: string) => Role | undefined;
  getPermission: (id: string) => Permission | undefined;
  getPermissionsByModule: (module: string) => Permission[];
  addRole: (role: Role) => void;
  updateRole: (role: Role) => void;
  deleteRole: (id: string) => void;
  getFilteredRoles: () => Role[];
}

export const useRoleStore = create<RoleStore>((set, get) => ({
  roles: mockRoles,
  permissions: mockPermissions,
  selectedRole: null,
  searchQuery: '',
  setRoles: (roles) => set({ roles }),
  setPermissions: (permissions) => set({ permissions }),
  selectRole: (role) => set({ selectedRole: role }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  
  getRole: (id) => get().roles.find(role => role.id === id),
  
  getPermission: (id) => get().permissions.find(permission => permission.id === id),
  
  getPermissionsByModule: (module) => 
    get().permissions.filter(permission => permission.module === module),
  
  addRole: (role) => set(state => ({
    roles: [...state.roles, role]
  })),
  
  updateRole: (updatedRole) => set(state => ({
    roles: state.roles.map(role => 
      role.id === updatedRole.id ? updatedRole : role
    ),
    selectedRole: state.selectedRole?.id === updatedRole.id ? updatedRole : state.selectedRole
  })),
  
  deleteRole: (id) => set(state => ({
    roles: state.roles.filter(role => role.id !== id),
    selectedRole: state.selectedRole?.id === id ? null : state.selectedRole
  })),
  
  getFilteredRoles: () => {
    const { roles, searchQuery } = get();
    
    return roles.filter(role => {
      // Filter by search query
      const matchesSearch = 
        role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        role.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesSearch;
    });
  }
}));
