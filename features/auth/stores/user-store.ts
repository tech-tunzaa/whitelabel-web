import { create } from 'zustand';
import { User, UserFilter, UserListResponse, UserAction, UserError } from '../types/user';
import { apiClient } from '@/lib/api/client';

interface UserStore {
  users: User[];
  user: User | null;
  loading: boolean;
  storeError: UserError | null;
  activeAction: UserAction | null;
  selectedUser: User | null;
  searchQuery: string;
  selectedStatus: 'all' | 'active' | 'inactive';
  
  // State management
  setActiveAction: (action: UserAction | null) => void;
  setLoading: (loading: boolean) => void;
  setStoreError: (error: UserError | null) => void;
  setUser: (user: User | null) => void;
  setUsers: (users: User[]) => void;
  selectUser: (user: User | null) => void;
  setSearchQuery: (query: string) => void;
  setSelectedStatus: (status: 'all' | 'active' | 'inactive') => void;
  
  // API methods
  fetchUser: (id: string, headers?: Record<string, string>) => Promise<User>;
  fetchUserByRole: (role: string, headers?: Record<string, string>) => Promise<User[]>;
  fetchUsers: (filter?: UserFilter, headers?: Record<string, string>) => Promise<UserListResponse>;
  createUser: (data: Partial<User>, headers?: Record<string, string>) => Promise<User>;
  updateUser: (id: string, data: Partial<User>, headers?: Record<string, string>) => Promise<User>;
  deleteUser: (id: string, headers?: Record<string, string>) => Promise<void>;
  changeUserStatus: (id: string, status: string, headers?: Record<string, string>) => Promise<void>;
  
  // Local methods
  getUser: (id: string) => User | undefined;
  getFilteredUsers: () => User[];
}

export const useUserStore = create<UserStore>()(
  (set, get) => ({
  users: [],
  user: null,
  loading: false,
  storeError: null,
  activeAction: null,
  selectedUser: null,
  searchQuery: '',
  selectedStatus: 'all',
  // State setters
  setActiveAction: (action) => set({ activeAction: action }),
  setLoading: (loading) => set({ loading }),
  setStoreError: (error) => set({ storeError: error }),
  setUser: (user) => set({ user }),
  setUsers: (users) => set({ users }),
  selectUser: (user) => set({ selectedUser: user }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedStatus: (status) => set({ selectedStatus: status }),
  
  // Helper methods
  getUser: (id) => get().users.find(user => user.id === id),
  
  // API Integration Methods
  fetchUser: async (id: string, headers?: Record<string, string>) => {
    const { setActiveAction, setLoading, setStoreError, setUser } = get();
    try {
      setActiveAction('fetchOne');
      setLoading(true);
      const response = await apiClient.get<any>(`/users/${id}`, undefined, headers);

      // Handle different response structures
      let userData = null;
      if (response.data && response.data.data) {
        userData = response.data.data;
      } else if (response.data) {
        userData = response.data;
      }

      if (userData) {
        setUser(userData as User);
        setLoading(false);
        return userData as User;
      }

      throw new Error('User data not found in the response');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch user';
      const errorStatus = (error as any)?.response?.status;
      setStoreError({
        message: errorMessage,
        status: errorStatus,
      });
      setLoading(false);
      throw error;
    } finally {
      setActiveAction(null);
    }
  },

  fetchUserByRole: async (role: string, headers?: Record<string, string>) => {
    const { setActiveAction, setLoading, setStoreError } = get();
    try {
      setActiveAction('fetchMany');
      setLoading(true);
      const response = await apiClient.get<any>(`/auth/users/role/${role}`, undefined, headers);
      
      let userList = [];
      if (response.data && Array.isArray(response.data.data)) {
        userList = response.data.data;
      } else if (response.data && Array.isArray(response.data)) {
        userList = response.data;
      }
      
      setLoading(false);
      return userList as User[];
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch users by role';
      const errorStatus = (error as any)?.response?.status;
      setStoreError({
        message: errorMessage,
        status: errorStatus,
      });
      setLoading(false);
      throw error;
    } finally {
      setActiveAction(null);
    }
  },

  fetchUsers: async (filter: UserFilter = {}, headers?: Record<string, string>) => {
    const { setActiveAction, setLoading, setStoreError, setUsers } = get();
    try {
      setActiveAction('fetchMany');
      setLoading(true);
      
      // Build query parameters from filter
      const queryParams: Record<string, any> = { ...filter };
      
      const response = await apiClient.get<any>('/users/all', queryParams, headers);
      
      let userData;
      let totalCount = 0;
      
      // Try to extract data from different response structures
      if (response.data && response.data.data) {
        userData = response.data.data;
        totalCount = response.data.total || response.data.data.length;
      } else if (response.data && Array.isArray(response.data)) {
        userData = response.data;
        totalCount = response.data.length;
      } else if (response.data) {
        userData = response.data.users || response.data.items || [];
        totalCount = response.data.total || userData.length;
      }
      
      if (Array.isArray(userData)) {
        setUsers(userData);
        setLoading(false);
        return {
          data: userData,
          total: totalCount,
          page: filter.page || 1,
          limit: filter.limit || 10
        };
      }
      
      throw new Error('Failed to parse user data from response');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch users';
      const errorStatus = (error as any)?.response?.status;
      setStoreError({
        message: errorMessage,
        status: errorStatus,
      });
      setLoading(false);
      throw error;
    } finally {
      setActiveAction(null);
    }
  },

  createUser: async (data: Partial<User>, headers?: Record<string, string>) => {
    const { setActiveAction, setLoading, setStoreError, fetchUsers } = get();
    try {
      setActiveAction('create');
      setLoading(true);
      
      const response = await apiClient.post<any>('/auth/register-auto', data, headers);
      
      let createdUser;
      if (response.data && response.data.data) {
        createdUser = response.data.data;
      } else if (response.data) {
        createdUser = response.data;
      }
      
      if (createdUser) {
        // Refresh the user list
        await fetchUsers();
        setLoading(false);
        return createdUser as User;
      }
      
      throw new Error('Failed to create user');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create user';
      const errorStatus = (error as any)?.response?.status;
      setStoreError({
        message: errorMessage,
        status: errorStatus,
      });
      setLoading(false);
      throw error;
    } finally {
      setActiveAction(null);
    }
  },
  
  updateUser: async (id: string, data: Partial<User>, headers?: Record<string, string>) => {
    const { setActiveAction, setLoading, setStoreError, fetchUsers } = get();
    try {
      setActiveAction('update');
      setLoading(true);
      
      const response = await apiClient.put<any>(`/auth/users/${id}`, data, headers);
      
      let updatedUser;
      if (response.data && response.data.data) {
        updatedUser = response.data.data;
      } else if (response.data) {
        updatedUser = response.data;
      }
      
      if (updatedUser) {
        // Refresh the user list
        await fetchUsers();
        setLoading(false);
        return updatedUser as User;
      }
      
      throw new Error('Failed to update user');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update user';
      const errorStatus = (error as any)?.response?.status;
      setStoreError({
        message: errorMessage,
        status: errorStatus,
      });
      setLoading(false);
      throw error;
    } finally {
      setActiveAction(null);
    }
  },
  
  deleteUser: async (id: string, headers?: Record<string, string>) => {
    const { setActiveAction, setLoading, setStoreError, fetchUsers } = get();
    try {
      setActiveAction('delete');
      setLoading(true);
      
      await apiClient.delete<any>(`/auth/users/${id}`, undefined, headers);
      
      // Refresh the user list
      await fetchUsers();
      setLoading(false);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete user';
      const errorStatus = (error as any)?.response?.status;
      setStoreError({
        message: errorMessage,
        status: errorStatus,
      });
      setLoading(false);
      throw error;
    } finally {
      setActiveAction(null);
    }
  },
  
  changeUserStatus: async (id: string, status: string, headers?: Record<string, string>) => {
    const { setActiveAction, setLoading, setStoreError, fetchUsers } = get();
    try {
      setActiveAction('update');
      setLoading(true);
      
      await apiClient.put<any>(`/auth/users/${id}/status`, { status }, headers);
      
      // Refresh the user list
      await fetchUsers();
      setLoading(false);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to change user status';
      const errorStatus = (error as any)?.response?.status;
      setStoreError({
        message: errorMessage,
        status: errorStatus,
      });
      setLoading(false);
      throw error;
    } finally {
      setActiveAction(null);
    }
  },
  
  // Local filtering for UI
  getFilteredUsers: () => {
    const { users, searchQuery, selectedStatus } = get();
    
    return users.filter(user => {
      // Filter by search query
      const matchesSearch = 
        (user.first_name + ' ' + user.last_name).toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (user.active_profile_role || '').toLowerCase().includes(searchQuery.toLowerCase());
      
      // Filter by status
      const matchesStatus = 
        selectedStatus === 'all' || 
        (selectedStatus === 'active' && user.is_active) || 
        (selectedStatus === 'inactive' && !user.is_active);
      
      return matchesSearch && matchesStatus;
    });
  }
})
);
