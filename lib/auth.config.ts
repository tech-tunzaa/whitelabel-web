import { NextAuthConfig } from "next-auth";
import CredentialProvider from "next-auth/providers/credentials";
import GithubProvider from "next-auth/providers/github";
import { use } from "react";
import { ZodError } from "zod";
import { JWT } from "next-auth/jwt";
import { Session } from "next-auth";

interface CustomUser {
  email: string;
  token: string;
  name: string;
  role: "super_owner" | "admin" | "sub_admin" | "support";
  accessToken: string;
}

interface CustomSession extends Session {
  user: CustomUser;
  accessToken: string;
}

const authConfig = {
  providers: [
    // GithubProvider({
    //   clientId: process.env.GITHUB_ID ?? '',
    //   clientSecret: process.env.GITHUB_SECRET ?? ''
    // }),
    CredentialProvider({
      credentials: {
        email: {
          type: "email",
        },
        password: {
          type: "password",
        },
      },
      async authorize(credentials): Promise<CustomUser | null> {
        try {
          //Call the server for login
          // const response = await fetch(`${process.env.API_URL}/auth/signin`, {
          //   method: "POST",
          //   body: JSON.stringify({
          //     email: credentials.email,
          //     password: credentials.password,
          //   }),
          //   headers: { "Content-Type": "application/json" },
          // });

          // const data = await response.json();

          let role = "admin";
          let name = "The Manager";

          if (
            credentials?.email === "superowner@meneja.inc" &&
            credentials?.password === "Test@1234"
          ) {
            role = "super_owner";
            name = "Super Owner";
          } else if (
            credentials?.email === "admin@afrizon.cheetah.co.tz" &&
            credentials?.password === "Test@1234"
          ) {
            role = "admin";
            name = "Marketplace Admin";
          } else if (
            credentials?.email === "staff@afrizon.cheetah.co.tz" &&
            credentials?.password === "Test@1234"
          ) {
            role = "sub_admin";
            name = "Sub Admin";
          } else if (
            credentials?.email === "support@afrizon.cheetah.co.tz" &&
            credentials?.password === "Test@1234"
          ) {
            role = "support";
            name = "Afrizon Support";
          } else {
            return null;
          }

          return {
            email: credentials?.email || "",
            token: "abcxyz",
            name: name,
            role: role as "super_owner" | "admin" | "sub_admin" | "support",
            accessToken: "abcxyz",
          };

          // // Check if the response is OK and a user object is returned
          // if (response.ok && data.user) {
          //   // Return a user object that includes any extra data (like accessToken)
          //   return { ...data.user, accessToken: data.token };
          // }

          // throw new Error("Invalid credentials.");
          // // If you return null then an error will be displayed advising the user to check their details.
          // return null;
        } catch (error) {
          if (error instanceof ZodError) {
            return null;
          }
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: "/", //sigin page
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    // Persist the user data to the JWT token on initial sign in
    async jwt({ token, user }: { token: JWT; user: CustomUser | null }) {
      // console.log('In JWT Token :: ', token);
      // console.log('In JWT User ::', user);
      if (user) {
        token.user = user;
        token.accessToken = user.accessToken;
      }
      return token;
    },
    // Make the user data and accessToken available in the session object
    async session({
      session,
      token,
    }: {
      session: Session;
      token: JWT & { user: CustomUser; accessToken: string };
    }) {
      // console.log('In JWT Session :: ', session);
      // console.log('In JWT Token ::', token);

      session.user = token.user;
      (session as CustomSession).accessToken = token.accessToken;
      return session as CustomSession;
    },
  },
};

export default authConfig;
