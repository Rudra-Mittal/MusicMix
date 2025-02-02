import { createClient } from "redis";
const redisUrl = "redis://default:4gdHNvdsTXMVgtYquG01Ij9NG106gTVP@redis-17531.c89.us-east-1-3.ec2.redns.redis-cloud.com:17531";
const redisClient = createClient({url:redisUrl});
redisClient.on("error", (err) => console.error("Redis Client Error", err));
redisClient.connect();
export default redisClient;
