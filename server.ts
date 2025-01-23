import { authentication } from "./app/middlewares/auth";
import { createStream } from "./controllers/stream/create";
import { deleteStream } from "./controllers/stream/delete";
import { active, getActive } from "./controllers/stream/active";
import { vote } from "./controllers/votes/vote";
import { joinStream } from "./controllers/general/join";
import { disconnect } from "./controllers/general/disconnect";
import { realTime } from "./controllers/stream/realtime";
import next from "next";
import { Server } from "socket.io";
import { createServer } from "http";
const dev = process.env.NODE_ENV !== "production";

const hostname = "localhost";
const port = 3000;
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();
const httpServer = createServer(handler);
export const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["Authorization"],
  },
});
app.prepare().then( () => {
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
    
  });
 
});
httpServer
.once("error", (err) => {
  console.error(err);
  process.exit(1);
})
.listen(port, () => {
  console.log(`> Ready on http://${hostname}:${port}`);
});

