import next from "next";
import { Server } from "socket.io";
import { createServer } from "http";
const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;
export const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

export const httpServer = createServer(handler);
httpServer
.once("error", (err) => {
  console.error(err);
  process.exit(1);
})
.listen(port, () => {
  console.log(`> Ready on http://${hostname}:${port}`);
});
export const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      allowedHeaders: ["Authorization"],
    },
});
