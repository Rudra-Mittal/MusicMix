"use client"

import { useState, useRef, useEffect,MutableRefObject } from "react"
import { motion, AnimatePresence, LayoutGroup } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Plus, SkipForward, Trash2 } from 'lucide-react'
import {useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { CreateStreamSchema } from "../utils/types"
import YouTubeAudioPlayer from "@/app/components/player"
import {initializeSocket} from "../socket"
import SearchBar from "../components/searchbar"
import { DashBoardQueueItem } from "../utils/types"
import { voteD } from "../utils/Stream-functions/vote-listeners"
import { DeleteD, InitalStreamsD, NewStreamD } from "../utils/Stream-functions/stream-listeners"
import Appbar from "../components/appbar"
import { Socket } from "socket.io-client"
import { DefaultEventsMap } from 'socket.io'
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -20 }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}

export default  function OwnerStreamControl() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [currentVideo, setCurrentVideo] = useState<DashBoardQueueItem | undefined>(undefined);
  const [newVideoUrl, setNewVideoUrl] = useState("");
  const [queue, setQueue] = useState<DashBoardQueueItem[]>([]);
  const socket = useRef<Socket|null>(null);
  const socketInitialized = useRef(false);
  useEffect(()=>{
    initializeSocket().then((data) => {
      socket.current = data;
      socket.current.on("deleteStream", (data: DashBoardQueueItem) => {
        DeleteD({ data, setQueue });
      })
      socket.current.on("voteUpdate", (data:any) => {
        voteD({ data, setQueue });
      });
      socket.current.on("newStream", (data: DashBoardQueueItem) => {
        NewStreamD({ data, setQueue });
      });
      socket.current.on("activeStream", (data: DashBoardQueueItem) => {
        setCurrentVideo(data);
      })
      socket.current.on("connect", () => {
        console.log("connected");
      });
      socket.current.on("error", (data:any) => {
        console.log(data);
      })
      socket.current.once("initialStreams", (data: DashBoardQueueItem[]) => {
        InitalStreamsD({ data, setQueue });
      });
    });    
  },[])
  useEffect(() => {
    if (status === "unauthenticated") {
      setTimeout(() => {
        router.push("/");
      }, 2000);
    } else if (session?.user.username&&socket.current&&!socketInitialized.current) {
      setCurrentVideo(undefined);
      setNewVideoUrl("");
      setQueue([]);
      
      
      socket.current.emit("joinRoom", session.user.username || "");
      socket.current.emit("getActiveStream", session.user.username);
      socketInitialized.current = true;
    }
    return ()=>{
      
    }
  }, [socket,session,router]);


  const addToQueue = () => {
    try {
      const data = CreateStreamSchema.parse({
        userName: session?.user.username,
        videoId: newVideoUrl.split("?v=")[1]?.split("&")[0],
        url: newVideoUrl,
      });
      if (data) {
        socket.current?.emit("createStream", data);
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
    socket.current?.emit("deleteStream", { videoId: id });
    return;
  };

  const playNextSong = () => {
    if (queue.length > 0) {
      const nextSong = queue[0];
      //  order is important as we need to set the active stream first
      socket.current?.emit("activeStream", { videoId: nextSong.videoId });
      socket.current?.emit("deleteStream", { videoId: nextSong.videoId });
    } else {
      socket.current?.emit("activeStream", { videoId: "null" });
    }
  };

  if (status === "unauthenticated") {
    return <div>Unauthenticated</div>
  }
  if(status === "loading"){
    return <div>Loading</div>
  }

  return (
    <div className="container mx-auto p-4">
      <Appbar />
      <motion.div
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        transition={{ duration: 0.5 }}
        className="container mx-auto p-4"
      >
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-2xl font-bold mb-6"
        >
          {session?.user?.username} Stream Control
        </motion.h1>
        <SearchBar username={session?.user.username || ""} socket={socket as MutableRefObject<Socket<DefaultEventsMap, DefaultEventsMap>>} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="z-0"
          >
            <h2 className="text-xl font-semibold mb-4">Now Playing</h2>
            <Card className="p-4">
              <motion.div
                className="aspect-video mb-4"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {(currentVideo &&socket) ? <YouTubeAudioPlayer videoId={currentVideo?.videoId} thumbnailUrl={currentVideo?.thumbnail} socket={socket as MutableRefObject<Socket<DefaultEventsMap, DefaultEventsMap>>}/> : <div>No video found</div>}
              </motion.div>
              <div className="flex justify-end">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button onClick={playNextSong} variant="outline" size="sm">
                    <SkipForward className="h-4 w-4 mr-2" />
                    Next Song
                  </Button>
                </motion.div>
              </div>
            </Card>

            <h2 className="text-xl font-semibold my-4">Add to Queue</h2>
            <motion.div
              className="flex gap-2 mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Input
                type="text"
                placeholder="Paste YouTube URL here"
                value={newVideoUrl}
                onChange={(e) => setNewVideoUrl(e.target.value)}
                className="flex-grow"
              />
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button onClick={addToQueue}>
                  <Plus className="mr-2 h-4 w-4" /> Add
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="z-0"
          >
            <h2 className="text-xl font-semibold mb-4">Song Queue</h2>
            <ScrollArea className="h-[400px] w-full rounded-md border p-4">
              <LayoutGroup>
                <AnimatePresence>
                  {(queue.length > 0) ? queue.map((item, index) => (
                    <motion.div
                      key={item.videoId}
                      layout
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                      variants={itemVariants}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 30,
                        duration: 0.5
                      }}
                      className="mb-4 z-0"
                    >
                      <Card>
                        <CardContent className="flex items-center p-4">
                          <motion.img
                            src={item.thumbnail}
                            alt={item.title}
                            className="w-24 h-18 object-cover rounded mr-4"
                            whileHover={{ scale: 1.1 }}
                            transition={{ type: "spring", stiffness: 300 }}
                          />
                          <div className="flex-grow">
                            <h3 className="font-semibold">{item.title}</h3>
                            <p className="text-sm text-gray-500">{item.votesCount} votes</p>
                            {index < 3 && (
                              <motion.span
                                className="inline-block bg-primary text-primary-foreground text-xs px-2 py-1 rounded mt-1"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.2 }}
                              >
                                Top {index + 1}
                              </motion.span>
                            )}
                          </div>
                          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => deleteFromQueue(item.videoId)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </motion.div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )) : <div>No songs in queue</div>}
                </AnimatePresence>
              </LayoutGroup>
            </ScrollArea>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}
