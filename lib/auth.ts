import NextAuth, { DefaultSession } from 'next-auth';
import authConfig from './auth.config';

// declare module 'next-auth' {
//   /**
//    * Returned by `auth`, `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
//    */
//   interface Session {
//     user: {
//       /** The user's postal address. */
//       _id: string;
//       name: string;
//       lastName: string;
//       country: string;
//       bio: string;
//       email: string;
//       phone: string;
//       emailVerification: any;
//       phoneVerification: any;
//       verified: boolean;
//       active: boolean;
//       createdBy: string;
//       lastActive: Date;
//       password: string;
//       salt: string;
//       role: any;
//       organization: any;
//       organizationType: any;
//       /**
//        * By default, TypeScript merges new interface properties and overwrites existing ones.
//        * In this case, the default session user properties will be overwritten,
//        * with the new ones defined above. To keep the default session user properties,
//        * you need to add them back into the newly declared interface.
//        */
//     } & DefaultSession['user'];
//   }
// }

export const { auth, handlers, signOut, signIn } = NextAuth(authConfig);
