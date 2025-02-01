import { PrismaClient } from '@prisma/client';
import { NextAuthOptions, Session, User } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import jwt from "jsonwebtoken";
import Credentials from 'next-auth/providers/credentials';
import bcrypt from "bcryptjs";
import {parse} from 'cookie'
const prisma = new PrismaClient();
declare module "next-auth" {
    interface SignInCallbackParams {
      state?: string;
    }
  }
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
            clientId: process.env.GOOGLE_ID!,
            clientSecret: process.env.GOOGLE_SECRET!,
        }),
        Credentials({
            name: "Credentials",
            credentials: {
                name: { label: "Name", type: "text" },
                username: { label: "Username", type: "text" },
                password: { label: "Password", type: "password" },
                email: { label: "Email", type: "email" },

            },
            async authorize(credentials) {
                if(!credentials){
                    throw new Error('Provide valid credentials') ;
                }
                const { email, password } = credentials;
                const user = await prisma.user.findFirst({
                    where: {
                        email: email!,
                    }
                });
                if(!user){
                    throw new Error('No user found with the provided email.');
                }
                if(!user.password){
                    throw new Error('Login via google with this email')
                }
                const valid = await bcrypt.compare(password,user?.password);
                if(valid){
                    return {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        username: user.username,
                    };
                }else 
                throw new Error('Invalid Email or Passowrd ') 
            }
        }),
        
    ],
    secret: process.env.NEXTAUTH_SECRET!,
    callbacks: {
        async session({ session, token }) {
            // console.log("token in auth",token)
            if(token?.user){
                session.user = token.user;
            }
            // console.log("session in auth",session)
            return session;
        },
        async signIn({user,account}) {
            if(account?.provider === "credentials"){
            return true;
            }
            console.log(user);
            return false
        },
        async jwt({ token,user, account, profile }) {
            // console.log("in jwt")
            // console.log("user in jwt",user)
            if(user){
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
    },
    pages:{
        signIn:'/auth'
    }
};