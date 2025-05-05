import { NextAuthConfig } from "next-auth";
import CredentialProvider from "next-auth/providers/credentials";
import GithubProvider from "next-auth/providers/github";
import { use } from "react";
import { ZodError } from "zod";

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
      async authorize(credentials, req) {
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

          if (credentials.email === "superowner@meneja.inc") {
            role = "super_owner";
            name = "Super Owner";
          } else if (credentials.email === "admin@meneja.inc") {
            role = "admin";
            name = "The Admin";
          } else if (credentials.email === "staff@meneja.inc") {
            role = "sub_admin";
            name = "Sub Admin";
          } else if (credentials.email === "support@meneja.inc") {
            role = "support";
            name = "Support Team";
          } else {
            throw new Error("Invalid credentials.");
            return null;
          }

          const testUser = {
            email: credentials.email,
            token: "abcxyz",
            name: name,
            role: role,
          };

          return { ...testUser, accessToken: "abcxyz" };

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
            // Return `null` to indicate that the credentials are invalid
            return null;
          }
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
    async jwt({ token, user }) {
      // console.log('In JWT Token :: ', token);
      // console.log('In JWT User ::', user);
      if (user) {
        token.user = user;
        token.accessToken = user.accessToken;
      }
      return token;
    },
    // Make the user data and accessToken available in the session object
    async session({ session, token }) {
      // console.log('In JWT Session :: ', session);
      // console.log('In JWT Token ::', token);

      session.user = token.user;
      session.accessToken = token.accessToken;
      return session;
    },
  },
};

export default authConfig;
