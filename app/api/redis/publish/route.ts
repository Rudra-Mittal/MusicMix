import redisClient from "@/app/lib/redisClient";
import { count } from "console";
import { NextRequest, NextResponse } from "next/server";
import { RedisClientOptions } from "redis";
export async function POST(req: NextRequest) {
  const client = redisClient;
  const { channel, message } = await req.json();
  client.publish(channel, message);
  return NextResponse.json({ message: "published" });
}