import { createServer } from "http";
import next from "next";
import { Server } from "socket.io";
import  redisClient  from "./app/lib/redis";
// @ts-ignore
import youtubesearchapi from "youtube-search-api"
const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
import { randomUUID } from 'crypto';
import { authentication } from "./app/middlewares/auth";
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

  redisClient.on("error", (err) => console.error("Redis Client Error", err));
  await redisClient.connect();
  const map = new Map<string, string>();
  const rooms = new Map<string, string[]>();
  io.use(authentication);
  io.on("connection", async (socket) => {
    console.log("New connection");
    console.log(socket.data?.session?.user?.username);
    map.set(socket.data?.session?.user?.username||socket.id,socket.id);
    socket.on("createStream", async (data) => {
      // Strictly check the data
      const videoDetails = await youtubesearchapi.GetVideoDetails(data.videoId);
        const username = socket.data?.session?.user?.username || "";
        const streamId = `stream:${data.userName}:${data.videoId}`;
      
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
      await redisClient.zAdd(`streams:${data.userName}`, { score: 0, value: streamId });
      const sendData={
        id:streamData.id,
        videoId:streamData.videoId,
        title:streamData.title,
        thumbnail:streamData.thumbnail,
        votesCount:streamData.votes
      }
      // console.log("new stream",await(redisClient.zRange(`streams:${username}`,0,-1)));
      io.to(rooms.get(data.userName||"") || []).emit("newStream", sendData);
    });
    
    socket.on("joinRoom",async (room)=>{
      const username = socket.data?.session?.user?.username || "";
      const ownerRoom=map.get(room);
      if(!ownerRoom)return;
      console.log("client socket",socket.id);
      console.log("owner socket",ownerRoom);
      rooms.set(room,[...rooms.get(room)||[],socket.id]);
      console.log("rooms",rooms); 
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
      io.to(rooms.get(data.owner||"") || []).except(socket.id).emit("voteUpdate", { videoId: data.videoId, votesCount: votes});
    });

    socket.on("deleteStream", async (data) => {
      const username = socket.data?.session?.user?.username || "";
      const streamId = `stream:${username}:${data.videoId}`;
      const voteStream = `streamVotes:${username}:${data.videoId}`;
      await redisClient.del(voteStream);
      await redisClient.del(streamId);
      await redisClient.zRem(`streams:${username}`, streamId);
      io.to(rooms.get(username||"") || []).emit("deleteStream", { videoId: data.videoId });
    })
    socket.on("activeStream",async (data)=>{
      const username = socket.data?.session?.user?.username || "";
      const streamId = `stream:${username}:${(data.videoId)}`;
      if(data.videoId=="null"){
        await redisClient.del(`activeStream:${username}`);
        io.to(rooms.get(username||"") || []).emit("activeStream", { id:"", videoId: "", title: "", thumbnail: "", votesCount: 0 });
        return;
      }
      const streamData = await redisClient.hGetAll(streamId);
      // console.log("active stream",streamData,streamId);
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
      io.to(rooms.get(username||"") || []).emit("activeStream", { id:streamData.id, videoId: data.videoId, title: streamData.title, thumbnail: streamData.thumbnail, votesCount: streamData.votes });
      return;
    })
    socket.on("getActiveStream",async (username)=>{
      // console.log("getActiveStream",username);
      const streamData = await redisClient.hGetAll(`activeStream:${username}`);
      // console.log("active stream",streamData);
      if(streamData){
        io.to(rooms.get(username||"") || []).emit("activeStream", { id:streamData.id, videoId: streamData.videoId, title: streamData.title, thumbnail: streamData.thumbnail, votesCount: streamData.votes });
      }
      return ;
    })
    socket.on("disconnect", () => {
      rooms.forEach((value,key)=>{
        rooms.set(key,value.filter((item)=>item!=socket.id));
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
});

