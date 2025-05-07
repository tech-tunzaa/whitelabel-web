import { create } from 'zustand';
import { User } from '../types/user';
import { mockUsers } from '../data/users';

interface UserStore {
  users: User[];
  selectedUser: User | null;
  searchQuery: string;
  selectedStatus: 'all' | 'active' | 'inactive';
  setUsers: (users: User[]) => void;
  selectUser: (user: User | null) => void;
  setSearchQuery: (query: string) => void;
  setSelectedStatus: (status: 'all' | 'active' | 'inactive') => void;
  getUser: (id: string) => User | undefined;
  addUser: (user: User) => void;
  updateUser: (user: User) => void;
  deleteUser: (id: string) => void;
  toggleUserStatus: (id: string) => void;
  getFilteredUsers: () => User[];
}

export const useUserStore = create<UserStore>((set, get) => ({
  users: mockUsers,
  selectedUser: null,
  searchQuery: '',
  selectedStatus: 'all',
  setUsers: (users) => set({ users }),
  selectUser: (user) => set({ selectedUser: user }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedStatus: (status) => set({ selectedStatus: status }),
  
  getUser: (id) => get().users.find(user => user.id === id),
  
  addUser: (user) => set(state => ({
    users: [...state.users, user]
  })),
  
  updateUser: (updatedUser) => set(state => ({
    users: state.users.map(user => 
      user.id === updatedUser.id ? updatedUser : user
    ),
    selectedUser: state.selectedUser?.id === updatedUser.id ? updatedUser : state.selectedUser
  })),
  
  deleteUser: (id) => set(state => ({
    users: state.users.filter(user => user.id !== id),
    selectedUser: state.selectedUser?.id === id ? null : state.selectedUser
  })),
  
  toggleUserStatus: (id) => set(state => {
    const users = state.users.map(user => {
      if (user.id === id) {
        return {
          ...user,
          status: user.status === 'active' ? 'inactive' : 'active'
        };
      }
      return user;
    });
    
    const selectedUser = state.selectedUser?.id === id 
      ? users.find(user => user.id === id) || null 
      : state.selectedUser;
      
    return { users, selectedUser };
  }),
  
  getFilteredUsers: () => {
    const { users, searchQuery, selectedStatus } = get();
    
    return users.filter(user => {
      // Filter by search query
      const matchesSearch = 
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.role.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Filter by status
      const matchesStatus = 
        selectedStatus === 'all' || user.status === selectedStatus;
      
      return matchesSearch && matchesStatus;
    });
  }
}));
