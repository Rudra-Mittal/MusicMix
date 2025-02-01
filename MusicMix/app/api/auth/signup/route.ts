import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import prisma from '@/app/lib/db'
export async function POST(req: Request) {
  try {
    const { email, password, username,name }:{email:string,password:string,username:string,name:string} = await req.json()
    const hashedPassword = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        username,
        name:name,
        provider:'local'
      },
    })

    return NextResponse.json({ user: { id: user.id, email: user.email, username: user.username } })
  }
  catch (error:any) {
    return NextResponse.json({ message: error.message }, { status: 500 })
  }
}

