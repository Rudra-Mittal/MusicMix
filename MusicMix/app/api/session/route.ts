import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { options } from '../../config/auth'; // Ensure this path is correct
import { NextResponse } from 'next/server';

export  async function GET () {
  const session = await getServerSession(options);
  return new NextResponse(JSON.stringify(session));
};