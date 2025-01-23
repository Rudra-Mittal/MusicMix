import redisClient from "../../app/lib/redis";
import { Socket } from "socket.io";
import { rooms } from "../miscellaneous/maps";
import { io } from "../../server";

export async function active(socket:Socket, data:any) {
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
}

export async function getActive(socket:Socket, username:string) {
    // console.log("getActiveStream",username);
    const streamData = await redisClient.hGetAll(`activeStream:${username}`);
    // console.log("active stream",streamData);
    if(streamData){
      io.to(socket.id).emit("activeStream", { id:streamData.id, videoId: streamData.videoId, title: streamData.title, thumbnail: streamData.thumbnail, votesCount: streamData.votes });
    }
    return ;
}