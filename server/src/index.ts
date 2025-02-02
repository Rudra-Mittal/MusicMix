import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import path from 'path';
import { realTime } from './controllers/stream/realtime';
import { active, getActive } from './controllers/stream/active';
import { vote } from './controllers/votes/vote';
import { joinStream } from './controllers/general/join';
import { disconnect } from './controllers/general/disconnect';
import { authentication } from './middlewares/auth';
import { createStream } from './controllers/stream/create';
import { deleteStream } from './controllers/stream/delete';
import dotenv from "dotenv";
dotenv.config();
const app = express();
const httpServer = createServer(app);
export const io = new SocketIOServer(httpServer, {
  cors: {
    origin: [`http://${process.env.HOST}:3001`],
    methods: ["GET", "POST"],
    allowedHeaders: ["Authorization","next-auth.session-token","__Secure-next-auth.session-token"],
    credentials: true,
  },
});

const port = process.env.PORT 
const hostname = 'localhost';

app.use(express.static(path.join(__dirname, 'public')));

io.use(authentication);

io.on("connection", (socket) => {
  socket.on("createStream", (data)=>{
    createStream(socket,data);
  })
  
  socket.on("joinRoom",(room)=>{
    joinStream(socket,room);
  })

  socket.on("voteStream", (data) => {
    vote(socket,data);
  });

  socket.on("deleteStream", (data) => {
    deleteStream(socket,data);
  })
  socket.on("activeStream",(data)=>{
    active(socket,data);
  })
  socket.on("getActiveStream",(username)=>{
    getActive(socket,username);
  })
  socket.on("disconnect", () => {
    disconnect(socket);
  });
  socket.on("realTime", (data) => { 
     realTime(socket,data); 
  })
})
httpServer
  .once('error', (err) => {
    console.error(err);
    process.exit(1);
  })
  .listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });