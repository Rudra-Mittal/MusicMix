import { NextRequest, NextResponse } from "next/server";
import redisClient from "@/app/lib/redisClient";
export async function POST(req:NextRequest){
    const client= redisClient;
    const {channel}= await req.json();
    client.subscribe(channel, (err, count)=>{
        if(err){
            console.error(err)
        }
        console.log(`Subscribed to ${count} channels`); 
    });
    client.on("message", (channel, message)=>{
        console.log(`Received message ${message} from ${channel}`)
    });
    return new NextResponse("Subscribed");
}