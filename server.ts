import {app,io} from "./controllers/miscellaneous/serverConfig";
import { authentication } from "./app/middlewares/auth";
import { createStream } from "./controllers/stream/create";
import { deleteStream } from "./controllers/stream/delete";
import { active, getActive } from "./controllers/stream/active";
import { vote } from "./controllers/votes/vote";
import { joinStream } from "./controllers/general/join";
import { disconnect } from "./controllers/general/disconnect";
import { httpServer,port,hostname } from "./controllers/miscellaneous/serverConfig";
app.prepare().then( () => {
  io.use(authentication);
  
  io.on("connection", async (socket) => {
    socket.on("createStream", async (data)=>{
      createStream(socket,data);
    })
    
    socket.on("joinRoom",async (room)=>{
      joinStream(socket,room);
    })

    socket.on("voteStream", async (data) => {
      vote(socket,data);
    });

    socket.on("deleteStream", async (data) => {
      deleteStream(socket,data);
    })
    socket.on("activeStream",async (data)=>{
      active(socket,data);
    })
    socket.on("getActiveStream",async (username)=>{
      getActive(socket,username);
    })
    socket.on("disconnect", () => {
      disconnect(socket);
    });
    
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

