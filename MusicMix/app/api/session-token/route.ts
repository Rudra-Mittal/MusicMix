import { NextApiRequest } from "next";
import {  NextResponse } from "next/server";
import cookie from 'cookie';
export async function GET(req:NextApiRequest) {
// @ts-ignore
    const cookies = cookie.parse(req.headers.get('cookie') || '');
    const sessionToken = cookies["next-auth.session-token"];
    return new NextResponse(JSON.stringify(sessionToken));
  }
  