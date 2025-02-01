"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = void 0;
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const path_1 = __importDefault(require("path"));
const realtime_1 = require("./controllers/stream/realtime");
const active_1 = require("./controllers/stream/active");
const vote_1 = require("./controllers/votes/vote");
const join_1 = require("./controllers/general/join");
const disconnect_1 = require("./controllers/general/disconnect");
const auth_1 = require("./middlewares/auth");
const create_1 = require("./controllers/stream/create");
const delete_1 = require("./controllers/stream/delete");
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
exports.io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: ["http://localhost:3001", "https://4j55gz30-3001.inc1.devtunnels.ms", "http://172.16.230.69:3001"],
        methods: ["GET", "POST"],
        allowedHeaders: ["Authorization", "next-auth.session-token", "__Secure-next-auth.session-token"],
        credentials: true,
    },
});
const port = process.env.PORT || 3000;
const hostname = process.env.HOSTNAME || 'localhost';
app.use(express_1.default.static(path_1.default.join(__dirname, 'public')));
exports.io.use(auth_1.authentication);
exports.io.on("connection", (socket) => {
    socket.on("createStream", (data) => {
        (0, create_1.createStream)(socket, data);
    });
    socket.on("joinRoom", (room) => {
        (0, join_1.joinStream)(socket, room);
    });
    socket.on("voteStream", (data) => {
        (0, vote_1.vote)(socket, data);
    });
    socket.on("deleteStream", (data) => {
        (0, delete_1.deleteStream)(socket, data);
    });
    socket.on("activeStream", (data) => {
        (0, active_1.active)(socket, data);
    });
    socket.on("getActiveStream", (username) => {
        (0, active_1.getActive)(socket, username);
    });
    socket.on("disconnect", () => {
        (0, disconnect_1.disconnect)(socket);
    });
    socket.on("realTime", (data) => {
        (0, realtime_1.realTime)(socket, data);
    });
});
httpServer
    .once('error', (err) => {
    console.error(err);
    process.exit(1);
})
    .listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
});
