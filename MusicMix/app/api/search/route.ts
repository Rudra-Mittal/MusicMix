import { NextRequest, NextResponse } from "next/server";
// @ts-ignore
import youtubesearchapi from "youtube-search-api"

export async function GET(req:NextRequest){
    const q=req.nextUrl.searchParams.get("q");
    if(!q){
        return NextResponse.json({error:"Query is required"});
    }
    const data=await youtubesearchapi.GetListByKeyword(q);
    return NextResponse.json(data);

}