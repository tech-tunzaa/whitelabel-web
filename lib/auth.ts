import NextAuth from 'next-auth';
import authConfig from './auth.config';
import { CustomUser } from './auth/index';

// NextAuth exports used throughout the application
export const { auth, handlers, signOut, signIn } = NextAuth(authConfig);

// Re-export the CustomUser type for easier imports
export type { CustomUser };
