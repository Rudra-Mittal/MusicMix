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
        console.log(data);
        const user=await prisma.user.findFirst({
            where:{
                email:session.user.email,
            }
        });
        if(!user){
            return new Response(JSON.stringify({error:"user not found"}),{
                status:404,
                headers:{
                    "Content-Type":"application/json",
                },
            });
        }
        const check=await prisma.votes.findFirst({
            where:{
                userId:user?.id,
                streamId:data.streamId,
            }
        }); 
        if(check && data.vote){
            return  new Response(JSON.stringify({error:"already voted"}),{
                status:400,
                headers:{
                    "Content-Type":"application/json",
                },
            });
        }else if(!check && !data.vote){
            return  new Response(JSON.stringify({error:"no vote to remove"}),{
                status:400,
                headers:{
                    "Content-Type":"application/json",
                },
            });
        }
        if(data.vote){
            console.log("voting");
            await prisma.votes.create({
                data:{
                    userId:user.id,
                    streamId:data.streamId,
                }
            });
            const stream=await prisma.stream.update({
                where:{
                    id:data.streamId,
                },
                data:{
                    votesCount:{
                        increment:1,
                    }
                },
                select:{
                    id:true,
                }
            });
            return new Response(JSON.stringify(stream),{
                status:200,
                headers:{
                    "Content-Type":"application/json",
                },
            });
        }else{
            await prisma.votes.delete({
                where:{
                    id:check?.id,
                }
            });
           const stream= await prisma.stream.update({
                where:{
                    id:data.streamId,
                },
                data:{
                    votesCount:{
                        decrement:1,
                    }
                },
                select:{
                    id:true,
                }
            });
            return new Response(JSON.stringify(stream),{
                status:200,
                headers:{
                    "Content-Type":"application/json",
                },
            });
        }
        
    }catch(err){
        return new Response(JSON.stringify({error:err}),{
            status:400,
            headers:{
                "Content-Type":"application/json",
            },
        });
    }
}
