import { Socket } from "socket.io";
import { io } from "../../server";
import redisClient from "../../app/lib/redis";
import { rooms,user } from "../miscellaneous/maps";
export async function vote(socket:Socket, data:any) {
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
      io.to(user.get(username)||[]).emit("voteUpdate", { videoId: data.videoId, votesCount: votes, voteByUser:data.count });
      io.to(rooms.get(data.owner||"") || []).except(user.get(username)||[]).emit("voteUpdate", { videoId: data.videoId, votesCount: votes});
}