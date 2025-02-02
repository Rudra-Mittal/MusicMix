import {  NextResponse,NextRequest } from "next/server";
import cookie from 'cookie';
export async function GET(req:NextRequest) {
// @ts-ignore
    const cookies = cookie.parse(req.headers.get('cookie') || '');
    const sessionToken = cookies["next-auth.session-token"];
    return new NextResponse(JSON.stringify(sessionToken));
  }
  