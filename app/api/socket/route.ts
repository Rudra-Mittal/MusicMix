import { NextApiRequest } from 'next';
import { NextResponse } from 'next/server';
import { Server } from 'socket.io';
import redisClient from '@/app/lib/redis';

export async function GET(request: NextApiRequest) {
  if (!(request.socket as any).server.io) {
    const io = new Server((request.socket as any).server);
    (request.socket as any).server.io = io;

    // Set up Redis subscription
    const sub = redisClient.duplicate();
    await sub.subscribe('messages');

    sub.on('message', (channel, message) => {
      io.emit('message', message);
    });

    io.on('connection', (socket) => {
      console.log('A user connected');

      socket.on('disconnect', () => {
        console.log('A user disconnected');
      });

      socket.on('message', async (msg) => {
        // Publish message to Redis
        await redisClient.publish('messages', msg);
      });
    });
  }

  return NextResponse.json({ message: 'WebSocket server initialized' });
}