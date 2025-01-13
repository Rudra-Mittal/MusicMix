import { Dispatch, SetStateAction } from "react";
import { DashBoardQueueItem,CreatorQueueItem } from "../types";
export async function voteD({data,setQueue}:{data:DashBoardQueueItem,setQueue:Dispatch<SetStateAction<DashBoardQueueItem[]>>}){
    setQueue((prevqueue:DashBoardQueueItem[])=>[...prevqueue.map((item)=>(item.videoId==data.videoId)?{...item,votesCount:data.votesCount}:item)].sort((a:DashBoardQueueItem, b:DashBoardQueueItem) => b.votesCount - a.votesCount));
}
export const VoteC= ({data,setQueue}:{data:any,setQueue:Dispatch<SetStateAction<CreatorQueueItem[]>>})=>{
    if(data.voteByUser!=undefined){
        setQueue((prevqueue:CreatorQueueItem[])=>[...prevqueue.map((item)=>(item.videoId==data.videoId)?{...item,votesCount:data.votesCount,vote:data.voteByUser}:item)].sort((a:CreatorQueueItem, b:CreatorQueueItem) => b.votesCount - a.votesCount))
    }else{
        setQueue((prevqueue:CreatorQueueItem[])=>[...prevqueue.map((item)=>(item.videoId==data.videoId)?{...item,votesCount:data.votesCount}:item)].sort((a:CreatorQueueItem, b:CreatorQueueItem) => b.votesCount - a.votesCount))
    }

}