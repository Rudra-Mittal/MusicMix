import { createServer } from "http";
import next from "next";
import { Server } from "socket.io";
import { createClient } from "redis";
import cookie from "cookie";
// @ts-ignore
import youtubesearchapi from "youtube-search-api"
const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
import { randomUUID } from 'crypto';
import { title } from "process";
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
  const map = new Map<string, string>();
  const rooms = new Map<string, string[]>();
  io.use(async (socket, next) => {
    const cookies = cookie.parse(socket.handshake.headers.cookie || "");
    const sessionToken = cookies["next-auth.session-token"];
    // if (!sessionToken) {
    //   console.log("No session token found");
    //   return next(new Error("Authentication error"));
    // }
    try{
      const response= await fetch(`http://${hostname}:${port}/api/session`,{
        headers:{
          cookie: `next-auth.session-token=${sessionToken}`
        }
      })
      const session = await response.json();
      socket.data.session=session;
    }catch(err:any){
      next(err);
    }
    next();
  });
  io.on("connection", async (socket) => {
    console.log("New connection");
    map.set(socket.data?.session?.user?.username||socket.id,socket.id);
    rooms.set(socket.id,[]);

    socket.on("createStream", async (data) => {
      // Strictly check the data
      const videoDetails = await youtubesearchapi.GetVideoDetails(data.videoId);
        const username = socket.data?.session?.user?.username || "";
        const streamId = `stream:${username}:${data.videoId}`;
      
      const streamData = {
        id: randomUUID(),
        type: "youtube",
        userName: data.userName,
        url: data.url,
        title: videoDetails.title,
        videoId: data.videoId,
        votes: 0,
        addedBy: username,
        thumbnail: videoDetails.thumbnail.thumbnails[1].url,
      };
    
      await redisClient.hSet(streamId, streamData);
      await redisClient.zAdd(`streams:${username}`, { score: 0, value: streamId });
      const sendData={
        id:streamData.id,
        videoId:streamData.videoId,
        title:streamData.title,
        thumbnail:streamData.thumbnail,
        votesCount:streamData.votes
      }
      io.to(rooms.get(map.get(data.userName)||"") || []).emit("newStream", sendData);
    });
    
    socket.on("joinRoom",async (room)=>{
      const username = socket.data?.session?.user?.username || "";
      const ownerRoom=map.get(room);
      if(!ownerRoom)return;
      console.log(ownerRoom);
      if(!rooms.has(socket.id))  rooms.set(ownerRoom,[...rooms.get(ownerRoom)||[],socket.id]);
      const streamIdx = await redisClient.zRange(`streams:${room}`, 0, -1);
      console.log(streamIdx);
      const streamData = await Promise.all(streamIdx.map(async (streamId) => {
        const stream = await redisClient.hGetAll(streamId);
        return {
          id:stream.id,
          videoId:stream.videoId,
          title:stream.title,
          thumbnail:stream.thumbnail,
          votesCount:stream.votes,
          vote:(username=="")?false:await redisClient.sIsMember(`streamVotes:${room}:${stream.videoId}`,username)
        };
      }));
      
      io.to(socket.id).emit("initialStreams", streamData);
    })

    socket.on("voteStream", async (data) => {
      const username = socket.data?.session?.user?.username || "";
      if (!username) {
        io.to(socket.id).emit("error", { message: "You must be logged in to vote" });
        return;
      }
    
      const streamId = `stream:${data.owner}:${data.videoId}`;
      const voteStream = `streamVotes:${data.owner}:${data.videoId}`;
    
      // Ensure the voteStream key is a set
      const voteStreamType = await redisClient.type(voteStream);
      if (voteStreamType !== 'set' && voteStreamType !== 'none') {
        io.to(socket.id).emit("error", { message: "Vote stream key is of the wrong type" });
        return;
      }
    
      if (data.count) {
        if (await redisClient.sIsMember(voteStream, username)) {
          io.to(socket.id).emit("error", { message: "You have already voted for this stream" });
          return;
        }
        await redisClient.hIncrBy(streamId, "votes", 1);
        await redisClient.sAdd(voteStream, username);
      } else {
        if (!await redisClient.sIsMember(voteStream, username)) {
          io.to(socket.id).emit("error", { message: "You have not voted for this stream" });
          return;
        }
        await redisClient.hIncrBy(streamId, "votes", -1);
        await redisClient.sRem(voteStream, username);
      }
    
      const votes = await redisClient.hGet(streamId, "votes");
      io.to(socket.id).emit("voteUpdate", { videoId: data.videoId, votesCount: votes, voteByUser:data.count });
      io.to(rooms.get(map.get(data.userName)||"") || []).except(socket.id).emit("voteUpdate", { videoId: data.videoId, votesCount: votes});
    });

    socket.on("deleteStream", async (data) => {
      const username = socket.data?.session?.user?.username || "";
      const streamId = `stream:${username}:${data.videoId}`;
      const voteStream = `streamVotes:${username}:${data.videoId}`;
      await redisClient.del(streamId);
      await redisClient.del(voteStream);
      await redisClient.zRem(`streams:${username}`, streamId);
      io.to(rooms.get(map.get(username)||"") || []).emit("deleteStream", { videoId: data.videoId });
    })
    socket.on("activeStream",async (data)=>{
      const username = socket.data?.session?.user?.username || "";
      const streamId = `stream:${username}:${(data.videoId)}`;
      if(data.videoId=="null"){
        io.to(rooms.get(map.get(username)||"") || []).emit("activeStream", { id:"", videoId: "", title: "", thumbnail: "", votesCount: 0 });
        return;
      }
      const streamData = await redisClient.hGetAll(streamId);
      // console.log("active stream",streamData);
      await redisClient.hSet(`activeStream:${username}`, {
        id: streamData.id,
        type: streamData.type,
        userName: streamData.userName,
        url: streamData.url,
        title: streamData.title,
        videoId: streamData.videoId,
        votes: streamData.votes,
        addedBy: streamData.addedBy,
        thumbnail: streamData.thumbnail
      });
      // console.log("active stream set", await redisClient.hGetAll(`activeStream:${username}`));
      // await redisClient.zRem(`streams:${username}`,streamId);
      // await redisClient.del(`streamVotes:${username}:${data.videoId}`);
      // console.log("active stream", await redisClient.get(`activeStream:${username}`));
      io.to(rooms.get(map.get(username)||"") || []).emit("activeStream", { id:streamData.id, videoId: data.videoId, title: streamData.title, thumbnail: streamData.thumbnail, votesCount: streamData.votes });
      return;
    })
    socket.on("getActiveStream",async (username)=>{
      // console.log("getActiveStream",username);
      const streamData = await redisClient.hGetAll(`activeStream:${username}`);
      // console.log("active stream",streamData);
      if(streamData){
        io.to(rooms.get(map.get(username)||"") || []).emit("activeStream", { id:streamData.id, videoId: streamData.videoId, title: streamData.title, thumbnail: streamData.thumbnail, votesCount: streamData.votes });
      }
      return ;
    })

    
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

