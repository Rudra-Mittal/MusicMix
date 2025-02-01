import { Socket } from "socket.io";
import redisClient from "../../app/lib/redis";
import { io } from "../../server";
import { user } from "../miscellaneous/maps";

export async function realTime(socket:Socket, data:any) {
    const username = socket.data?.session?.user?.username || "";
    const {seekTime,isPlaying}=data
    if(username === ""){
        socket.emit("error", {message:"You are not authenticated"});
        return;
    }
    io.to(user.get(username)||[]).emit("realTime", {seekTime,isPlaying});
}