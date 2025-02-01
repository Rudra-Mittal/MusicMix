import NextAuth from "next-auth/next";
import { NextApiRequest, NextApiResponse } from "next";
import { options } from "@/app/config/auth";
import { User } from "next-auth";
import prisma from "@/app/lib/db";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  console.log(req.url);
  if(req.method==='GET'&&req.url?.includes('/api/auth/callback/google')){
    // @ts-ignore
    const username= await req.cookies.get('username')?.value;
   const modifiedOptions = {
      ...options,
      callbacks: {
        ...options.callbacks,
        signIn: async ({user}:{user:User}) => {
          console.log("in signin callback")
          try {
              const userExists = await prisma.user.findFirst({
              where: {
                  OR: [
                       { email: user.email! },
                      ]
                     }
                  });
                  if(userExists){
                    return true;
                  }
                  if(!username) return false;
                  await prisma.user.create({
                      data: {
                      email:user.email!,
                      username:username,
                      name:user.name!,
                      provider:'google'
                      },
                  });
                  return true;
                  } catch (err) {
                      console.log(err);
                      return false;
                  }
        },
        jwt : async ({token,user}:{token:any,user?:any})=>{
          if(user){
            const res=await prisma.user.findFirst({
              where :{
                email:user.email
              }
            })
            console.log(res);
            if(!res){
              return null;
            }
            token.user={email:res.email,name:res.name,username:res.username};
          }
          return token
        }
      },
    };
    return NextAuth(req, res, modifiedOptions);
  }
  return NextAuth(req, res, options);
};

export { handler as GET, handler as POST };