// filepath: /home/jarvis/Development/MusicMix/music-mix/server.ts
import { createServer } from "http";
import next from "next";
import { Server } from "socket.io";
import { createClient } from "redis";
// import fetch from "node-fetch";
import cookie from "cookie";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(async () => {
  const httpServer = createServer(handler);

  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      allowedHeaders: ["Authorization"],
    },
  });

  const redisClient = createClient();
  redisClient.on("error", (err) => console.error("Redis Client Error", err));
  await redisClient.connect();

  io.use(async (socket, next) => {
    const cookies = cookie.parse(socket.handshake.headers.cookie || "");
    const sessionToken = cookies["next-auth.session-token"];
    if (!sessionToken) {
      console.log("No session token found");
      return next(new Error("Authentication error"));
    }
    try{
      const response= await fetch(`http://${hostname}:${port}/api/session`,{
        headers:{
          cookie: `next-auth.session-token=${sessionToken}`
        }
      })
      const session = await response.json();
      console.log("server.ts side",session);
      socket.data.session=session;
    }catch(err:any){
      next(err);
    }
    next();
  });

  io.on("connection", async (socket) => {
    console.log("New connection");

    socket.on("getInitialCount", async () => {
      const initialCounter = await redisClient.get("counter");
      console.log(`Initial counter value: ${initialCounter}`);
      io.emit("count", { count: parseInt(initialCounter || "0") });
    });

    socket.on("changeCount", async (msg) => {
      const newCount = msg.count;
      await redisClient.set("counter", newCount);
      const latestMessage = await redisClient.get("counter");
      console.log(`Counter updated to: ${latestMessage}`);
      io.emit("count", { count: newCount });
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
});