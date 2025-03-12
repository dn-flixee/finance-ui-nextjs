import NextAuth from "next-auth";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { signInSchema } from "@/lib/zod";
import { drizzle } from "drizzle-orm/node-postgres";
import { users } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import Github from "next-auth/providers/github";

export const authOptions: NextAuthOptions = {
    providers: [
        Github,
        CredentialsProvider({
            id: "credentials",
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email", placeholder: "Email" },
                password: { label: "Password", type: "password", placeholder: "Password" },
            },
            async authorize(credentials) {
                const db = drizzle(process.env.DATABASE_URL!);
                
                console.log("Validate credentials")
                const parsedCredentials = signInSchema.safeParse(credentials);
                if (!parsedCredentials.success) {
                    console.error("Invalid credentials:", parsedCredentials.error.errors);
                    return null;
                }

                try {
                    // Get user
                    const userArray = await db.select().from(users)
                        .where(eq(users.email, credentials.email));

                    const user = userArray[0]; // Access the first user

                    if (!user) {
                        console.log("Invalid credentials");
                        throw new Error("Email or Password is incorrect");
                    }

                    if (await bcrypt.compare(credentials.password, user.password)) {
                        return user;
                    } else {
                        throw new Error("Email or Password is incorrect");
                    }
                } catch (error) {
                    console.error("Error during authorization:", error);
                    throw new Error("Authorization failed");
                }
            }
        })
    ],
    callbacks: {
        jwt({ token, user }) {
            if (user) {
                token.id = user.id as string; // Ensure `user.id` is defined
            }
            return token;
        },
        session({ session, token }) {
            session.user.id = token.id; // Attach user ID to session
            return session;
        }
    },
    pages: {
        signIn: '/sign-in',
    },
    session: {
        strategy :"jwt",
    },
    secret: process.env.NEXT_AUTH_SECRET,
};
