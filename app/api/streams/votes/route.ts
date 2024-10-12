import { NextRequest } from "next/server";
import { VoteSchema } from "@/app/utils/types";
import prisma from "@/app/lib/db";
import { getServerSession } from "next-auth";
import { options } from "@/app/config/auth";
export const POST = async (req: NextRequest) => {
    const session=await  getServerSession(options);
    if(!session?.user?.email){
        return new Response(JSON.stringify({error:"unauthorized"}),{
            status:401,
            headers:{
                "Content-Type":"application/json",
            },
        });
    }
    try{
        const data = VoteSchema.parse(await req.json());
        // console.log(data);
        const check=await prisma.votes.findFirst({
            where:{
                userId:data.userId,
                streamId:data.streamId,
            }
        }); 
        if(check && data.vote>0){
            return  new Response(JSON.stringify({error:"already voted"}),{
                status:400,
                headers:{
                    "Content-Type":"application/json",
                },
            });
        }else if(!check && data.vote<0){
            return  new Response(JSON.stringify({error:"no vote to remove"}),{
                status:400,
                headers:{
                    "Content-Type":"application/json",
                },
            });
        }
        if(data.vote>0){
            await prisma.votes.create({
                data:{
                    userId:data.userId,
                    streamId:data.streamId,
                }
            });
        }else{
            await prisma.votes.delete({
                where:{
                    id:check?.id,
                }
            });
        }
        const votes=await prisma.votes.findMany({
            where:{
                streamId:data.streamId,
            }
        });
        const total=votes.reduce((acc,curr)=>acc+1,0);
        console.log("total votes",total);
        return new Response(JSON.stringify({total}),{
            status:200,
            headers:{
                "Content-Type":"application/json",
            },
        });
        
    }catch(err){
        return new Response(JSON.stringify({error:err}),{
            status:400,
            headers:{
                "Content-Type":"application/json",
            },
        });
    }
}
