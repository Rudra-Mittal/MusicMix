import { NextRequest, NextResponse } from 'next/server';
import redisClient from '@/app/lib/redisClient';

export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get('key')||"";  
  const client =  redisClient;
  const value = await client.get(key);
  return new NextResponse(JSON.stringify({ value }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export async function POST(req: NextRequest) {
    const client =  redisClient;
    const { key, value } = await req.json();
    await client.set(key, value);
    return new NextResponse(JSON.stringify({ message: "success" }), {
        status: 200,
        headers: {
        "Content-Type": "application/json",
        },
    });
}
