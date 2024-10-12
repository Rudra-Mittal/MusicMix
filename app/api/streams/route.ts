import { NextRequest, NextResponse } from "next/server";
import { CreateStreamSchema } from "@/app/utils/types";
import prisma from "@/app/lib/db";
import { getServerSession } from "next-auth";
import { options } from "@/app/config/auth";
// @ts-ignore
import youtubesearchapi from "youtube-search-api"
const YT_REGEX= /^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube(?:-nocookie)?\.com|youtu.be))(\/(?:[\w\-]+\?v=|embed\/|live\/|v\/)?)([\w\-]+)(\S+)?$/
export async function POST(req:NextRequest){
    try{
        const data= CreateStreamSchema.parse(await req.json());
         if(!data.url.match(YT_REGEX)){
            return new NextResponse(JSON.stringify({'messsage':'Invalid YouTube URL'}));
         }
         const videoId= data.url.split("?v=")[1];
         const videoDetails=await youtubesearchapi.GetVideoDetails(videoId);
        //  console.log(data.url);
         console.log(videoDetails.thumbnail.thumbnails[1]);
         const res= await prisma.stream.create({
            data:{
                type:"youtube",
                userId:data.ownerId,
                url:data.url,
                title:videoDetails.title,
                videoId,
                thumbnail:videoDetails.thumbnail.thumbnails[1].url,
                
            }
        });
        return new NextResponse(JSON.stringify(res));
    }catch(err){
        return new NextResponse(JSON.stringify({error:err}),{
            status:400,
            headers:{
                "Content-Type":"application/json",
            },
        });
    }

}

export async function GET(req:NextRequest){
    const ownerId= req.nextUrl.searchParams.get("roomId");
    if(!ownerId){
        return new NextResponse(JSON.stringify({error:"no room id"}),{
            status:400,
            headers:{
                "Content-Type":"application/json",
            },
        });
    }
    const session=await getServerSession(options);
    if(!session?.user?.email){
        return new NextResponse(JSON.stringify({error:"unauthorized"}),{
            status:401,
            headers:{
                "Content-Type":"application/json",
            },
        });
    }
    try{
        const user= await prisma.user.findUnique({
            where:{
                email:session.user.email,
            }
        })
        const streams=await prisma.stream.findMany({
            orderBy:{
                createdAt:"desc",
            },
            where:{
                userId:ownerId,
                votes:{
                    some:{
                        userId:user?.id,
                    }
                }
            }
        });
        return new NextResponse(JSON.stringify(streams),{
            status:200,
            headers:{
                "Content-Type":"application/json",
            },
        });
    }catch(err){
        return new NextResponse(JSON.stringify({error:err}),{
            status:400,
            headers:{
                "Content-Type":"application/json",
            },
        });
    }
}