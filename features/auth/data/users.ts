import { User } from '../types/user';

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Super Owner',
    email: 'superowner@meneja.inc',
    phone: '+255 123 456 789',
    role: 'super_owner',
    status: 'active',
    avatar: 'https://ui-avatars.com/api/?name=Super+Owner&background=4F46E5&color=fff',
    lastLogin: '2025-05-06T14:22:00Z',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2025-05-06T14:22:00Z'
  },
  {
    id: '2',
    name: 'The Admin',
    email: 'admin@meneja.inc',
    phone: '+255 123 456 790',
    role: 'admin',
    status: 'active',
    avatar: 'https://ui-avatars.com/api/?name=The+Admin&background=4F46E5&color=fff',
    lastLogin: '2025-05-06T10:15:00Z',
    createdAt: '2023-01-02T00:00:00Z',
    updatedAt: '2025-05-06T10:15:00Z'
  },
  {
    id: '3',
    name: 'Sub Admin',
    email: 'staff@meneja.inc',
    phone: '+255 123 456 791',
    role: 'sub_admin',
    status: 'active',
    avatar: 'https://ui-avatars.com/api/?name=Sub+Admin&background=4F46E5&color=fff',
    lastLogin: '2025-05-05T16:30:00Z',
    createdAt: '2023-02-15T00:00:00Z',
    updatedAt: '2025-05-05T16:30:00Z'
  },
  {
    id: '4',
    name: 'Support Team',
    email: 'support@meneja.inc',
    phone: '+255 123 456 792',
    role: 'support',
    status: 'active',
    avatar: 'https://ui-avatars.com/api/?name=Support+Team&background=4F46E5&color=fff',
    lastLogin: '2025-05-06T09:45:00Z',
    createdAt: '2023-03-01T00:00:00Z',
    updatedAt: '2025-05-06T09:45:00Z'
  },
];
