import redisClient from "../lib/redis";
import { io } from "../../index";
import { rooms } from "../miscellaneous/maps";
import { randomUUID } from "crypto";
import { Socket } from "socket.io"
async function getVideoDetails(videoId: string, apiKey: string): Promise<any> {
    const endpoint = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${videoId}&key=${apiKey}`;

    try {
      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error(`YouTube API responded with status ${response.status}`);
      }
  
      const data = await response.json();
      if (!data.items || data.items.length === 0) {
        throw new Error('No video found for the provided video ID.');
      }
        return data.items[0] as any;
    } catch (error) {
      console.error('Error fetching video details:', error);
      throw error;
    }
  }
export async function createStream(socket: Socket, data: any) {
  // Strictly check the data
  const videoDetails = await getVideoDetails(data.videoId, process.env.YOUTUBE_API_KEY||"");
  const username = socket.data?.session?.user?.username || "";
  const streamId = `stream:${data.userName}:${data.videoId}`;
  const streamData = {
    id: randomUUID(),
    type: "youtube",
    userName: data.userName,
    title: videoDetails.snippet.title,
    videoId: data.videoId,
    votes: 0,
    addedBy: username,
    thumbnail: videoDetails.snippet.thumbnails.default.url,
  };

  await redisClient.hSet(streamId, streamData);
  await redisClient.zAdd(`streams:${data.userName}`, { score: 0, value: streamId });
  const sendData = {
    id: streamData.id,
    videoId: streamData.videoId,
    title: streamData.title,
    thumbnail: streamData.thumbnail,
    votesCount: streamData.votes
  }
  // console.log("new stream",await(redisClient.zRange(`streams:${username}`,0,-1)));
  io.to(rooms.get(data.userName || "") || []).emit("newStream", sendData);
}