import prisma from "@/app/lib/db";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { options } from "@/app/config/auth";
export  async function GET(req:NextRequest){
    const userName= req.nextUrl.searchParams.get("userName");
    if(!userName){
        return new NextResponse(JSON.stringify({error:"username not provided"}),{
            status:400,
            headers:{
                "Content-Type":"application/json",
            },
        });
    }
    try{
        const user= await prisma.user.findFirst({
            where:{
                username:userName,
            }
        });
        if(!user){
            return new NextResponse(JSON.stringify({error:"User not found"}),{
                status:404,
                headers:{
                    "Content-Type":"application/json",
                },
            });
        }
        const activeStream = await prisma.stream.findFirst({
            where:{
                userName:userName,
                active:true,
            },
            select:{
                id:true,
                videoId:true,
                title:true,
                thumbnail:true,
                votesCount:true,
            }
        })
        return new NextResponse(JSON.stringify(activeStream),{
            status:200,
            headers:{
                "Content-Type":"application/json",
            }
        })
    }catch(err){
        console.log(err);
        return new NextResponse(JSON.stringify({error:"database error"}),{
            status:400,
            headers:{
                "Content-Type":"application/json",
            },
        });
    }
}


export  async function POST(req:NextRequest){
    const session=await getServerSession(options);
    if(!session?.user){
        return new NextResponse(JSON.stringify({error:"Unauthorized"}),{
            status:401,
            headers:{
                "Content-Type":"application/json",
            },
        });
    }
    const data=await req.json();
    if(!data.videoId){
        return new NextResponse(JSON.stringify({error:"videoId not provided"}),{
            status:400,
            headers:{
                "Content-Type":"application/json",
            },
        });
    }
    try{
        const stream=await prisma.stream.update({
            data:{
                active:true,
            },
            where:{
                videoId_userName: {
                    videoId: data.videoId ,
                    userName: session.user.username || "",
                },
            },
            select:{
                id:true,
                videoId:true,
                title:true,
                thumbnail:true,
                votesCount:true,
            }
        });
        return new NextResponse(JSON.stringify(stream),{
            status:200,
            headers:{
                "Content-Type":"application/json",
            },
        });
    }catch(err){
        console.log(err);
        return new NextResponse(JSON.stringify({error:"DATABASE ERROR"}),{
            status:400,
            headers:{
                "Content-Type":"application/json",
            },
        });
    }

}