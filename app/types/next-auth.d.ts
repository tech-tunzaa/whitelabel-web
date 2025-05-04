import { DefaultSession } from "next-auth";

declare module "next-auth" {
    interface Session {
        user: {
            role: "super_owner" | "admin" | "sub_admin" | "support";
        } & DefaultSession["user"];
    }

    interface User {
        role: "super_owner" | "admin" | "sub_admin" | "support";
    }
} 