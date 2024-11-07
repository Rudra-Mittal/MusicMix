"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ThumbsUp, Plus, Divide } from "lucide-react"
import axios from "axios"
import YouTube from "react-youtube"
import YouTubeAudioPlayer from "@/app/play/page"
interface QueueItem {
  id: string
  videoId: string
  title: string
  thumbnail: string
  votesCount: number
  votes:{
    userId:string
  }[]
}
function getStreams(username:string,setQueue:React.Dispatch<React.SetStateAction<QueueItem[]>>){
  axios.get("/api/streams?userName="+username)
    .then((res)=>{
      setQueue(res.data.sort((a:QueueItem, b:QueueItem) => b.votesCount - a.votesCount))
    }).catch((err)=>{
      return err;
})
}
function getCurrentVideo(username:string,setCurrentVideo:React.Dispatch<React.SetStateAction<QueueItem|undefined>>){
  axios.get("/api/streams/active?userName="+username)
  .then((res)=>{
    if(res.data){
      setCurrentVideo(res.data)
    }else{
      setCurrentVideo(undefined);
    }
  }).catch((err)=>{
    return err;
  })
}
export default function CreatorDashboard({params}: {params: {username: string}}) {
  const [currentVideo, setCurrentVideo] = useState<QueueItem>()
  const [newVideoUrl, setNewVideoUrl] = useState("")
  const username = decodeURIComponent(params.username);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const userLike= useState<boolean[]>([]);
  useEffect(()=>{
    getStreams(username,setQueue);
    getCurrentVideo(username,setCurrentVideo);
    setInterval(()=>{
      getStreams(username,setQueue);
      getCurrentVideo(username,setCurrentVideo);
    },10000)
  },[username])
  const addToQueue = () => {
    const videoId = newVideoUrl.split("v=")[1]
    if (videoId) {
      axios.post("/api/streams",{userName:username,videoId,url:newVideoUrl}).then((res)=>{
        // console.log(res);
        getStreams(username,setQueue);
        getCurrentVideo(username,setCurrentVideo);
      }).catch((err)=>{
        console.log(err);
      })
      setNewVideoUrl("")
    }else{
      alert("Invalid  Youtube URL")
    }
  }
  
  const voteForSong = (id: string,) => {
      const vote = queue.find((item) => item.id === id);
      console.log(queue)
      axios.post("/api/streams/votes",{streamId:id,vote:!(vote?.votes?.length)}).then((res)=>{
        getStreams(username,setQueue);
        getCurrentVideo(username,setCurrentVideo);
      } ).catch((err)=>{
        console.log(err);
      }
    )}
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
                      variant={(!item.votes.length)?"outline":"destructive"} 
                      size="sm" 
                      onClick={() => voteForSong(item.id)}
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