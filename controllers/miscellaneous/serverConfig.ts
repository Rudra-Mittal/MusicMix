import next from "next";
import { Server } from "socket.io";
import { createServer } from "http";
const dev = process.env.NODE_ENV !== "production";
export const hostname = "localhost";
export const port = 3000;
export const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

export const httpServer = createServer(handler);
export const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      allowedHeaders: ["Authorization"],
    },
});
