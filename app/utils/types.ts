import {z} from 'zod';
export const CreateStreamSchema = z.object({
    ownerId: z.string(),
    url:z.string().includes('youtube.com').or(z.string().includes('spotify.com')),
})

export const VoteSchema = z.object({
    streamId: z.string(),
    userId: z.string(),
    vote: z.number().min(-1).max(1),    
})