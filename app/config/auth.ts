import { PrismaClient } from '@prisma/client';
import { NextAuthOptions, Session } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

const prisma = new PrismaClient();

declare module 'next-auth' {
    interface Session {
        user: {
            name?: string | null;
            email?: string | null;
            image?: string | null;
            username?: string | null;
        };
    }
}

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
            if (token?.user) {
                session.user = token.user;
                session.user.username=session.user.email?.split('@')[0];
            }
            return session;
        },
        async signIn({ user, account, profile }) {
           try{
            const userExists = await prisma.user.findFirst({
                where: {
                    email: user.email||""
                }
            });
            if(!userExists){
                await prisma.user.create({
                    data: {
                        email: user.email||"",
                        name: user.name||"",
                        username:user.email?.split('@')[0]||"",
                        provider: "google",
                    }
                });
            }
           }catch(err){
                console.log(err);
                return false;
            }
            return true;
        },
        async jwt({ token, user, account, profile }) {
            if (user) {
                token.user = user;
            }
            if (account) {
                token.account = account;
            }
            if (profile) {
                token.profile = profile;
            }
            return token;
        }
    }
};