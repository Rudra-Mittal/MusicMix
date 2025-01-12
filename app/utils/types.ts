import {z} from 'zod';
export const CreateStreamSchema = z.object({
    userName: z.string(),
    videoId: z.string(),
    url:z.string().regex(/^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube(?:-nocookie)?\.com|youtu.be))(\/(?:[\w\-]+\?v=|embed\/|live\/|v\/)?)([\w\-]+)(\S+)?$/),
})

export const VoteSchema = z.object({
    streamId: z.string(),
    vote: z.boolean().default(false),    
})
export interface DashBoardQueueItem {
    id:string
    videoId: string
    title: string
    thumbnail: string
    votesCount: number
}

export interface CreatorQueueItem {
    id:string
    videoId: string
    title: string
    thumbnail: string
    votesCount: number
    vote: boolean
}