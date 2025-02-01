import redisClient from "../lib/redis";
import { io } from "../../index";

import { rooms } from "../miscellaneous/maps";
// @ts-ignore
import youtubesearchapi from "youtube-search-api"
import { randomUUID } from "crypto";
import { Socket } from "socket.io";
export async function createStream(socket:Socket, data:any) {
        // Strictly check the data
        console.log("create", data);
        const videoDetails = await youtubesearchapi.GetVideoDetails(data.videoId);
          const username = socket.data?.session?.user?.username || "";
          const streamId = `stream:${data.userName}:${data.videoId}`;
          // console.log(videoDetails);
        const streamData = {
          id: randomUUID(),
          type: "youtube",
          userName: data.userName,
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
}