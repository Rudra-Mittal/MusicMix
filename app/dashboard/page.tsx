"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Plus, SkipForward, Trash2 } from "lucide-react"
import axios from "axios"
import { useSession } from "next-auth/react"
import { date, set } from "zod"
import { useRouter } from "next/navigation"
import { CreateStreamSchema } from "../utils/types"
import YouTubeAudioPlayer from "../play/page"
interface QueueItem {
  id:string
  videoId: string
  title: string
  thumbnail: string
  votesCount: number
}

function getStreams(username:string,setQueue:React.Dispatch<React.SetStateAction<QueueItem[]>>){
          axios.get("/api/streams?userName="+username)
            .then((res)=>{
              setQueue(res.data.sort((a:QueueItem, b:QueueItem) => b.votesCount - a.votesCount))
            }).catch((err)=>{
              return err;
})
}
function SetCurrentStream(videoId:string,setCurrentVideo:React.Dispatch<React.SetStateAction<QueueItem|undefined>>){
  axios.post("/api/streams/active",{videoId:videoId||""}).then((res)=>{
    console.log(res.data);
    setCurrentVideo(res.data);
  }).catch((err)=>{
    console.log(err);
    setCurrentVideo(undefined);
  })
}
function getCurrentVideo(username:string,setCurrentVideo:React.Dispatch<React.SetStateAction<QueueItem|undefined>>){
  axios.get("/api/streams/active?userName="+username)
  .then((res)=>{
    if(res.data){
      setCurrentVideo(res.data)
    }
  }).catch((err)=>{
    return err;
  })
}
export default  function OwnerStreamControl() {
  const session =  useSession();
  const router = useRouter();
  const [currentVideo, setCurrentVideo] = useState<QueueItem>()
  const [newVideoUrl, setNewVideoUrl] = useState("")
  const [queue, setQueue] = useState<QueueItem[]>([])
  useEffect(()=>{
    if(session?.status!=="loading"){
      if (session?.data?.user) {
        getCurrentVideo(session.data.user.username||"",setCurrentVideo);
        getStreams(session.data.user.username||"",setQueue);
        setInterval(()=>{
          if(session?.data?.user){
            getStreams(session.data.user.username||"",setQueue);
          } 
        },10000)
      }
    }
  },[session])
  const playerRef = useRef<HTMLIFrameElement>(null)

  const addToQueue = () => {
    try{
      const data=CreateStreamSchema.parse({userName:session.data?.user.username,videoId:newVideoUrl.split("?v=")[1]?.split("&")[0],url:newVideoUrl});
    if (data) {
      axios.post("/api/streams",data).then((res)=>{
        getStreams(session.data?.user.username||"",setQueue);
      }).catch((err)=>{
        console.log(err);
      })
      setNewVideoUrl("")
    }else{
      console.log("eooror");
      alert(data);
    }
  }catch(err){
    console.log(err);
  }
  }

  const deleteFromQueue = (id: string) => {
    axios.delete("/api/streams/",{
      data:{
        id
      }
    }).then((res)=>{
      getStreams(session.data?.user.username||"",setQueue);
    }).catch((err)=>{
      console.log(err);
    })
  }

  const playNextSong = () => {
    // console.log(queue[0]);  
    if (queue.length > 0) {
      const nextSong = queue[0]
      if(currentVideo)deleteFromQueue(currentVideo.id);
      SetCurrentStream(nextSong.videoId,setCurrentVideo);
      getStreams(session.data?.user.username||"",setQueue);
    }else{
      if(currentVideo)deleteFromQueue(currentVideo.id);
      setCurrentVideo(undefined);
    }
  }
  if(session?.status==="loading"){
    return <div>Loading...</div>
  }else if(session.status==="unauthenticated"){
    setTimeout(()=>{
      router.push("/");
    },2000)
    return <div>You must be logged in,Redirecting to home page ...</div>  
  }
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">{session?.data?.user?.username} Stream Control</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">Now Playing</h2>
          <Card className="p-4">
            <div className="aspect-video mb-4">
            {(currentVideo)?  <YouTubeAudioPlayer videoId ={currentVideo?.videoId} thumbnailUrl={currentVideo?.thumbnail} />:<div>No video found</div>}
            </div>
            <div className="flex justify-end">
              <Button onClick={playNextSong} variant="outline" size="sm">
                <SkipForward className="h-4 w-4 mr-2" />
                Next Song
              </Button>
            </div>
          </Card>
          
          <h2 className="text-xl font-semibold my-4">Add to Queue</h2>
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
          <h2 className="text-xl font-semibold mb-4">Song Queue</h2>
          <ScrollArea className="h-[400px] w-full rounded-md border p-4">
            <div className="space-y-4">
              {(queue.length > 0) ? queue.map((item, index) => (
                <Card key={item.videoId}>
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
                      variant="destructive" 
                      size="sm" 
                      onClick={() => deleteFromQueue(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              )): <div>No songs is queue</div>}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  )
}