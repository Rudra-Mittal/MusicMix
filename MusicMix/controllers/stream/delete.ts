import { Socket } from "socket.io";
import redisClient from "../../app/lib/redis";
import { io } from "../../server";

import { rooms } from "../miscellaneous/maps";
export async function deleteStream(socket:Socket, data:any) {
    const username = socket.data?.session?.user?.username || "";
    const streamId = `stream:${username}:${data.videoId}`;
    const voteStream = `streamVotes:${username}:${data.videoId}`;
    await redisClient.del(voteStream);
    await redisClient.del(streamId);
    await redisClient.zRem(`streams:${username}`, streamId);
    io.to(rooms.get(username||"") || []).emit("deleteStream", { videoId: data.videoId });
}