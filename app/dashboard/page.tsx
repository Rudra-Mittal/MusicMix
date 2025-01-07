"use client"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Plus, SkipForward, SortDesc, Trash2 } from "lucide-react"
import axios from "axios"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { CreateStreamSchema } from "../utils/types"
import YouTubeAudioPlayer from "@/app/components/player"
import { socket } from "../socket"
interface QueueItem {
  id:string
  videoId: string
  title: string
  thumbnail: string
  votesCount: number
}

export default  function OwnerStreamControl() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [currentVideo, setCurrentVideo] = useState<QueueItem | undefined>(undefined);
  const [newVideoUrl, setNewVideoUrl] = useState("");
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const socketInitialized = useRef(false);
  useEffect(() => {
    if (status === "unauthenticated") {
      setTimeout(() => {
        router.push("/");
      }, 2000);
    } else if (session?.user.username && !socketInitialized.current) {
      console.log("rerender");
      setCurrentVideo(undefined);
      setNewVideoUrl("");
      setQueue([]);

      const handleNewStream = (data: any) => {
        console.log(data);
        setQueue((prevQueue) => [...prevQueue, data]);
      };

      const handleInitialStreams = (data: any) => {
        console.log(data);
        setQueue([...data].sort((a:QueueItem, b:QueueItem) => b.votesCount - a.votesCount));
      };
      socket.on("error",(data)=>{
        console.log(data);
      })
      socket.on("deleteStream",(data:QueueItem)=>{
        setQueue((prevQueue) => [...prevQueue.filter((item)=>item.videoId!=data.videoId)]);
      })
      socket.on("voteUpdate", (data) => {
        console.log(queue);
        console.log(data);
        setQueue((prevqueue)=>[...prevqueue.map((item)=>(item.videoId==data.videoId)?{...item,votesCount:data.votesCount}:item)].sort((a:QueueItem, b:QueueItem) => b.votesCount - a.votesCount));
        });
      socket.on("newStream", handleNewStream);
      socket.emit("joinRoom", session.user.username || "");
      socket.once("initialStreams", handleInitialStreams);
      socket.emit("getActiveStream",session.user.username);
      socket.on("activeStream",(data:QueueItem)=>{
        console.log(data);
        setCurrentVideo(data);
      })
      socket.on("connect", () => {
        console.log("connected");
      });

      socketInitialized.current = true;

      return () => {
        socket.off("initialStreams", handleInitialStreams);
        socket.off("connect");
        // socket.disconnect();
      };
    }
  }, [session]);

  const playerRef = useRef<HTMLIFrameElement>(null);

  const addToQueue = () => {
    try {
      const data = CreateStreamSchema.parse({
        userName: session?.user.username,
        videoId: newVideoUrl.split("?v=")[1]?.split("&")[0],
        url: newVideoUrl,
      });
      if (data) {
        socket.emit("createStream", data);
        setNewVideoUrl("");
      } else {
        console.log("error");
        alert(data);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const deleteFromQueue = (id: string) => {
    socket.emit("deleteStream", { videoId: id });
    return ;
  };

  const playNextSong = () => {
    if (queue.length > 0) {
      const nextSong = queue[0];
      //  order is important as we need to set the active stream first
      socket.emit("activeStream", { videoId: nextSong.videoId });
      socket.emit("deleteStream", { videoId: nextSong.videoId });
    } else {
      socket.emit("activeStream", { videoId: "null" });
    }
  };
  if(status==="unauthenticated"||status==="loading"){
    return <div>Unauthenticated</div>
  }
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">{session?.user?.username} Stream Control</h1>
      
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
                      onClick={() => deleteFromQueue(item.videoId)}
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
      <button onClick={()=>{
        socket.emit("help",{data:"help"});
      }} >click me hellp hellpo</button>
    </div>
  )
}