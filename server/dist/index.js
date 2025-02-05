"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
app.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    function getVideoDetails(videoId, apiKey) {
        return __awaiter(this, void 0, void 0, function* () {
            const endpoint = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${videoId}&key=${apiKey}`;
            try {
                const response = yield fetch(endpoint);
                if (!response.ok) {
                    throw new Error(`YouTube API responded with status ${response.status}`);
                }
                const data = yield response.json();
                if (!data.items || data.items.length === 0) {
                    throw new Error('No video found for the provided video ID.');
                }
                // Assuming the video ID is unique and returns a single video item.
                return data.items[0];
            }
            catch (error) {
                console.error('Error fetching video details:', error);
                throw error;
            }
        });
    }
    // Example usage:
    const temp = () => __awaiter(void 0, void 0, void 0, function* () {
        const videoId = '39rZASvpUfg';
        const apiKey = 'AIzaSyAyY_Eeuhsm_tJTX0beRICKIBNvPJ-byu8'; // or process.env.YOUTUBE_API_KEY if stored in env
        try {
            const videoDetails = yield getVideoDetails(videoId, apiKey);
            console.log('Video Details:', videoDetails.snippet.thumbnails);
        }
        catch (error) {
            console.error('Failed to fetch video details:', error);
        }
    });
    temp();
    res.json("videoDetails");
}));
exports.io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: [`http://${process.env.HOST}:3001`],
        methods: ["GET", "POST"],
        allowedHeaders: ["Authorization", "next-auth.session-token", "__Secure-next-auth.session-token"],
        credentials: true,
    },
});
const port = process.env.PORT;
const hostname = 'localhost';
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
