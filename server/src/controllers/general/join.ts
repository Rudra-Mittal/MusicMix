import { Socket } from "socket.io";
import {rooms,user } from "../miscellaneous/maps";
import redisClient from "../lib/redis";
import { io } from "../..";

export async function joinStream(socket:Socket, room:any) {
    const username = socket.data?.session?.user?.username || "";
      rooms.set(room,[...rooms.get(room)||[],socket.id]);
      user.set(username,[...user.get(username)||[],socket.id]);
      // console.log("rooms",rooms); 
      const streamIdx = await redisClient.zRange(`streams:${room}`, 0, -1);
      // console.log(streamIdx);
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
}