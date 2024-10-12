import NextAuth from "next-auth/next";
import { NextResponse } from "next/server";
import { options } from "@/app/config/auth";
const handler = NextAuth(options);
export {handler as GET , handler as POST}