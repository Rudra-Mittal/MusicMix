import { NextRequest, NextResponse } from "next/server";
import { CreateStreamSchema } from "@/app/utils/types";
import prisma from "@/app/lib/db";
import { getServerSession } from "next-auth";
import { options } from "@/app/config/auth";
// @ts-ignore
import exp from "constants";

// create stream api
export async function POST(req:NextRequest){
    const session= await getServerSession(options);
    if(!session?.user){
        return new NextResponse(JSON.stringify({error:"Unauthorized"}),{
            status:401,
            headers:{
                "Content-Type":"application/json",
            },
        });
    }
    try{
        // console.log(await req.json());
        const data= CreateStreamSchema.parse(await req.json());
        if(!data){
            return new NextResponse(JSON.stringify({error:"Invalid data"}),{
                status:400,
                headers:{
                    "Content-Type":"application/json",
                },
            });
        }
        const videoDetails=await youtubesearchapi.GetVideoDetails(data.videoId);
        const username=session?.user?.username;
         const res= await prisma.stream.create({
            data:{
                type:"youtube",
                userName:data.userName||"",
                url:data.url,
                title:videoDetails.title,
                videoId:data.videoId,
                addedBy:username||"",
                thumbnail:videoDetails.thumbnail.thumbnails[1].url,
            }
        });
        // console.log(res);
        return new NextResponse(JSON.stringify(
            {
                message:"Stream created",
            }
        ));
    }catch(err){
        console.log(err);
        return new NextResponse(JSON.stringify({error:err}),{
            status:400,
            headers:{
                "Content-Type":"application/json",
            },
        });
    }
}
export async function DELETE(req:NextRequest){
    const session=await getServerSession(options);
    if(!session?.user){
        return new NextResponse(JSON.stringify({error:"Unauthorized"}),{
            status:401,
            headers:{
                "Content-Type":"application/json",
            },
        });
    }
    try{
        const data=await req.json();
        const streamId=data.id;
        const stream=await prisma.stream.findFirst({
            where:{
                id:streamId,
                userName:session.user.username||"",
            }
        });
        if(!stream){
            return new NextResponse(JSON.stringify({error:"Stream not found"}),{
                status:404,
                headers:{
                    "Content-Type":"application/json",
                },
            });
        }
        await prisma.stream.delete({
            where:{
                id:stream.id,
                
            }
        });
        return new NextResponse(JSON.stringify({message:"Stream deleted"}),{
            status:200,
            headers:{
                "Content-Type":"application/json",
            },
        });
    }catch(err){
        console.log(err);
        return new NextResponse(JSON.stringify({error:err}),{
            status:400,
            headers:{
                "Content-Type":"application/json",
            },
        });
    }
}
export async function GET(req:NextRequest){
    const ownerName= req.nextUrl.searchParams.get("userName");
    if(!ownerName){
        return new NextResponse(JSON.stringify({error:"provide a username"}),{
            status:400,
            headers:{
                "Content-Type":"application/json",
            },
        });
    }
    try{
        const session=await getServerSession(options);
        const user=await prisma.user.findFirst({
            where:{
                email:session?.user?.email||"",
            }
        });
        const streams=await prisma.stream.findMany({
            orderBy:{
                votesCount:"desc",
            },
            where:{
                userName:ownerName,
                active:false,
            },
            select:{
                id:true,
                videoId:true,
                thumbnail:true,
                title:true,
                votesCount:true,
                votes:{
                    where:{
                        userId:user?.id||"",
                    },
                    select:{
                        userId:true,
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
        console.log(err);   
        return new NextResponse(JSON.stringify({error:err}),{
            status:400,
            headers:{
                "Content-Type":"application/json",
            },
        });
    }
}