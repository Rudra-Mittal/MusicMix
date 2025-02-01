"use client";

import React, { MutableRefObject, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ThumbsUp, Plus } from "lucide-react";
import YouTubeAudioPlayer from "@/app/components/player";
import { initializeSocket } from "../../socket";
import SearchBar from "@/app/components/searchbar";
import { CreatorQueueItem } from "../../utils/types";
import {
  DeleteC,
  InitalStreamsC,
  NewStreamC,
} from "@/app/utils/Stream-functions/stream-listeners";
import { VoteC } from "@/app/utils/Stream-functions/vote-listeners";
import Appbar from "@/app/components/appbar";
import { Socket } from "socket.io-client";
import { DefaultEventsMap } from "socket.io";

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -20 },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function CreatorDashboard({
  params,
}: {
  params: any;
}) {
  const [currentVideo, setCurrentVideo] = useState<CreatorQueueItem>();
  const [newVideoUrl, setNewVideoUrl] = useState("");
  // @ts-expect-error
  const { username } = React.use(params);
  const [queue, setQueue] = useState<CreatorQueueItem[]>([]);
  const socket = useRef<Socket|null>(null)
  const socketInitialized = useRef(false);
  useEffect(()=>{ 
       initializeSocket().then((s)=>{
        socket.current=s 
          socket.current.on("error", (data) => {
            console.log(data);
          });
          socket.current.on("voteUpdate", (data) => {
            console.log("Vote update", data);
            VoteC({ data, setQueue });
          });
      
          socket.current.emit("joinRoom", username);
          socket.current.emit("getActiveStream", username);
          socket.current.on("connect", () => {
            console.log("Connected to socket");
          });
          socket.current.once("initialStreams", (data: CreatorQueueItem[]) => {
            InitalStreamsC({ data, setQueue });
          });
          socket.current.on("deleteStream", (data: CreatorQueueItem) => {
            DeleteC({ data, setQueue });
          });
          socket.current.on("activeStream", (data: CreatorQueueItem) => {
            if (data.videoId == "") {
              setCurrentVideo(undefined);
            } else setCurrentVideo(data);
          });
          socket.current.on("newStream", (data: CreatorQueueItem) => {
            NewStreamC({ data, setQueue });
          });
        socketInitialized.current = true;
       })
  },[username])
  useEffect(() => {
    console.log("Socket", socket.current);
    
    return () => {
      // socket.disconnect();
    };
  }, [socket]);

  const handleVote = (id: string, vote: boolean) => {
    console.log("Voting for", id, vote);
    console.log("Queue", queue);
    socket.current?.emit("voteStream", { owner: username, videoId: id, count: vote });
  };

  const handleAddToQueue = () => {
    console.log("Adding to queue:", newVideoUrl);
    setNewVideoUrl("");
  };

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
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        ></motion.div>
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-2xl font-bold mb-6"
        >
          {username} Stream
        </motion.h1>
        <SearchBar username={username} socket={socket as MutableRefObject<Socket<DefaultEventsMap, DefaultEventsMap>>} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="z-0"
          >
            <h2 className="text-xl font-semibold mb-4">Now Playing</h2>
            <motion.div
              className="aspect-video mb-4 z-0"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              {currentVideo ? (
                <YouTubeAudioPlayer
                  videoId={currentVideo?.videoId}
                  thumbnailUrl={currentVideo?.thumbnail}
                  socket={socket as MutableRefObject<Socket<DefaultEventsMap, DefaultEventsMap>>}
                />
              ) : (
                <div>No active songs found</div>
              )}
            </motion.div>
            <h2 className="text-xl font-semibold mb-4">Add to Queue</h2>
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
              <Button onClick={handleAddToQueue}>
                <Plus className="mr-2 h-4 w-4" /> Add
              </Button>
            </motion.div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="z-0"
          >
            <h2 className="text-xl font-semibold mb-4">Upcoming Songs</h2>
            <ScrollArea className="h-[400px] w-full rounded-md border p-4">
              <LayoutGroup>
                <AnimatePresence>
                  {queue.map((item, index) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                      variants={itemVariants}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 30,
                        duration: 0.5,
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
                            <p className="text-sm text-gray-500">
                              {item.votesCount} votes
                            </p>
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
                          <motion.div
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Button
                              variant={!item.vote ? "outline" : "destructive"}
                              size="sm"
                              onClick={() =>
                                handleVote(item.videoId, !item.vote)
                              }
                            >
                              <ThumbsUp className="mr-2 h-4 w-4" />
                              Vote
                            </Button>
                          </motion.div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </LayoutGroup>
            </ScrollArea>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
