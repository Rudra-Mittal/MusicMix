"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ThumbsUp, Plus, Divide } from "lucide-react"
import axios from "axios"
import YouTube from "react-youtube"
import YouTubeAudioPlayer from "@/app/components/player"
import { socket } from "../../socket"
import { count } from "console"
interface QueueItem {
  id: string
  videoId: string
  title: string
  thumbnail: string
  votesCount: number
  vote:boolean
}

export default function CreatorDashboard({params}: {params: {username: string}}) {
  const [currentVideo, setCurrentVideo] = useState<QueueItem>()
  const [newVideoUrl, setNewVideoUrl] = useState("")
  const username = decodeURIComponent(params.username);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const userLike= useState<boolean[]>([]);  
  useEffect(()=>{
    
    socket.on("error",(data)=>{
      console.log(data);
    })
    socket.on("voteUpdate", (data) => {
      // console.log(queue);
      console.log(data);
      setQueue((prevqueue)=>[...prevqueue.map((item)=>(item.videoId==data.videoId)?{...item,votesCount:data.votesCount,vote:data.voteByUser}:item)].sort((a:QueueItem, b:QueueItem) => b.votesCount - a.votesCount));
      });

    socket.emit("joinRoom",username);
    socket.emit("getActiveStream",username);
    socket.on("connect",()=>{
      console.log("Connected to socket");
    })
    socket.once("initialStreams",(data:QueueItem[])=>{
      console.log(data)
      setQueue([...data].sort((a:QueueItem, b:QueueItem) => b.votesCount - a.votesCount));
    })
    socket.on("deleteStream",(data:QueueItem)=>{
      setQueue((prevQueue) => [...prevQueue.filter((item)=>item.videoId!=data.videoId)]);
    })
    socket.on("activeStream",(data:QueueItem)=>{
      if(data.videoId==""){
        setCurrentVideo(undefined);
      }else setCurrentVideo(data);
    })
    socket.on("newStream",(data:QueueItem)=>{
      console.log(queue);
      console.log(data)
      setQueue((prevQueue) => [...prevQueue, data]);
    })
    return ()=>{
      // socket.disconnect();
    }
  },[username])
  const addToQueue = () => {
    const videoId = newVideoUrl.split("v=")[1]
    if (videoId) {
      socket.emit("createStream",{userName:username,videoId:videoId,url:newVideoUrl});
    }else{
      alert("Invalid  Youtube URL")
    }
  }
   const handleVote = (id: string,vote:boolean) => {
    console.log("Voting for",id,vote);
    socket.emit("voteStream",{owner:username, videoId:id,count:vote});
  }
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">{username}  Stream</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">Now Playing</h2>
          <div className="aspect-video mb-4">
         {(currentVideo)?<YouTubeAudioPlayer videoId={currentVideo?.videoId} thumbnailUrl={currentVideo?.thumbnail}/>:<div>No active songs found</div>}
          </div>
          <h2 className="text-xl font-semibold mb-4">Add to Queue</h2>
          <div className="flex gap-2 mb-6">
            <Input 
              type="text" 
              placeholder="Paste YouTube URL here" 
              value={newVideoUrl}
              onChange={(e) => setNewVideoUrl(e.target.value)}
              className="flex-grow"
              />
            <Button onClick={addToQueue}>
              <Plus className="mr-2 h-4 w-4" /> Add
            </Button>
          </div>
        </div>        
        <div>
          <h2 className="text-xl font-semibold mb-4">Upcoming Songs</h2>
          <ScrollArea className="h-[400px] w-full rounded-md border p-4">
            <div className="space-y-4">
              {queue.map((item, index) => (
                <Card key={item.id}>
                  <CardContent className="flex items-center p-4">
                    <img 
                      src={item.thumbnail} 
                      alt={item.title} 
                      className="w-24 h-18 object-cover rounded mr-4"
                    />
                    <div className="flex-grow">
                      <h3 className="font-semibold">{item.title}</h3>
                      <p className="text-sm text-gray-500">{item.votesCount} votes</p>
                      {index < 3 && (
                        <span className="inline-block bg-primary text-primary-foreground text-xs px-2 py-1 rounded mt-1">
                          Top {index + 1}
                        </span>
                      )}
                    </div>
                    <Button 
                      variant={(!item.vote)?"outline":"destructive"} 
                      size="sm" 
                      onClick={() =>handleVote(item.videoId,!item.vote) }
                    >
                      <ThumbsUp className="mr-2 h-4 w-4" />
                      Vote
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  )
}