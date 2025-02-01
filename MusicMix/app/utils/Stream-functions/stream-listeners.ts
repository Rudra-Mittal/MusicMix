import { Dispatch, SetStateAction } from "react";
import { CreatorQueueItem, DashBoardQueueItem } from "../types";

export const DeleteD=({data,setQueue}:{data:DashBoardQueueItem,setQueue:Dispatch<SetStateAction<DashBoardQueueItem[]>>})=>{
    setQueue((prevQueue) => [...prevQueue.filter((item)=>item.videoId!=data.videoId)]);
}

export const InitalStreamsD=({data,setQueue}:{data:DashBoardQueueItem[],setQueue:Dispatch<SetStateAction<DashBoardQueueItem[]>>})=>{
    setQueue([...data].sort((a:DashBoardQueueItem, b:DashBoardQueueItem) => b.votesCount - a.votesCount));
}

export const NewStreamD=({data,setQueue}:{data:DashBoardQueueItem,setQueue:Dispatch<SetStateAction<DashBoardQueueItem[]>>})=>{
    setQueue((prevQueue) => [...prevQueue, data]);
}

export const InitalStreamsC= ({data,setQueue}:{data:CreatorQueueItem[],setQueue:Dispatch<SetStateAction<CreatorQueueItem[]>>})=>{
    setQueue([...data].sort((a:CreatorQueueItem, b:CreatorQueueItem) => b.votesCount - a.votesCount));
}
export const NewStreamC=({data,setQueue}:{data:CreatorQueueItem,setQueue:Dispatch<SetStateAction<CreatorQueueItem[]>>})=>{
    setQueue((prevQueue) => [...prevQueue, data]);
}

export const DeleteC=({data,setQueue}:{data:CreatorQueueItem,setQueue:Dispatch<SetStateAction<CreatorQueueItem[]>>})=>{
    setQueue((prevQueue) => [...prevQueue.filter((item)=>item.videoId!=data.videoId)]);
}