"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ThumbsUp, Plus } from "lucide-react"
import axios from "axios"
interface QueueItem {
  id: string
  videoId: string
  title: string
  thumbnail: string
  votes: number
}
export default function CreatorDashboard({params}: {params: {username: string}}) {
  const [currentVideo, setCurrentVideo] = useState("")
  const [newVideoUrl, setNewVideoUrl] = useState("")
  const username = decodeURIComponent(params.username);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  useEffect(()=>{
    axios.get("/api/streams?userName="+username).then((res)=>{
      setQueue(res.data.sort((a:QueueItem, b:QueueItem) => b.votes - a.votes))
    }).catch((err)=>{
      console.log(err);
    })
  },[username])
  const addToQueue = () => {
    const videoId = newVideoUrl.split("v=")[1]
    if (videoId) {
      axios.post("/api/streams",{userName:username,videoId,newVideoUrl}).then((res)=>{
        // console.log(res);
        const newItem: QueueItem = {
          videoId:res.data.videoId,
          id:res.data.id,
          title: res.data.title,
          thumbnail: res.data.thumbnail,
          votes: res.data.votesCount,
        }
        setQueue([...queue, newItem].sort((a, b) => b.votes - a.votes))
      }).catch((err)=>{
        console.log(err);
      })
      setNewVideoUrl("")
    }else{
      alert("Invalid  Youtube URL")
    }
  }

  const voteForSong = (id: string) => {
    setQueue(queue.map(item => 

      item.id === id ? { ...item, votes: item.votes + 1 } : item
    ).sort((a, b) => b.votes - a.votes))
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">{username}  Stream</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">Now Playing</h2>
          <div className="aspect-video mb-4">
            <iframe 
              width="100%" 
              height="100%" 
              src={`https://www.youtube.com/embed/${currentVideo}`}
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
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
                      <p className="text-sm text-gray-500">{item.votes} votes</p>
                      {index < 3 && (
                        <span className="inline-block bg-primary text-primary-foreground text-xs px-2 py-1 rounded mt-1">
                          Top {index + 1}
                        </span>
                      )}
                    </div>
                    <Button 
                      variant="outline" 
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