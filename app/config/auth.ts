import GoogleProvider from "next-auth/providers/google";
import { NextAuthOptions } from "next-auth";
import prisma from "../lib/db";

export const options: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_ID || "",
            clientSecret: process.env.GOOGLE_SECRET || "",
        })
    ],
    secret: process.env.SECRET || "rfhyiugyf",
    callbacks: {
        async session({ session, token }) {
            console.log("session", session);
            console.log("token", token);
            if (token?.user) {
                session.user = token.user;
            }
            return session;
        },
        async signIn({ user, account, profile }) {
            try {
                const res = await prisma.user.upsert({
                    create: {
                        email: user.email || "",
                        name: user.name || "",
                        username: user.name || "", // Add username
                        provider: "google", // Add provider
                    },
                    update: {
                        name: user.name || "",
                        username: user.name || "", // Add username
                        provider: "google", // Add provider
                    },
                    where: {
                        email: user.email || "",
                    }
                });
            } catch (error) {
                console.error("Error during signIn:", error);
                return false;
            }
            return true;
        },
        async jwt({ token, user, account, profile }) {
            if (account?.accessToken) {
                token.accessToken = account.accessToken;
            }
            if (user) {
                token.user = user;
            }
            return token;
        }
    }
};