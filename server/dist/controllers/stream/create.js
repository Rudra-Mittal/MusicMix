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
exports.createStream = createStream;
const redis_1 = __importDefault(require("../lib/redis"));
const index_1 = require("../../index");
const maps_1 = require("../miscellaneous/maps");
const crypto_1 = require("crypto");
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
function createStream(socket, data) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c;
        // Strictly check the data
        const videoDetails = yield getVideoDetails(data.videoId, process.env.YOUTUBE_API_KEY || "");
        console.log("create", videoDetails.thumbnails);
        const username = ((_c = (_b = (_a = socket.data) === null || _a === void 0 ? void 0 : _a.session) === null || _b === void 0 ? void 0 : _b.user) === null || _c === void 0 ? void 0 : _c.username) || "";
        const streamId = `stream:${data.userName}:${data.videoId}`;
        // console.log(videoDetails);
        const streamData = {
            id: (0, crypto_1.randomUUID)(),
            type: "youtube",
            userName: data.userName,
            title: videoDetails.title,
            videoId: data.videoId,
            votes: 0,
            addedBy: username,
            thumbnail: videoDetails.thumbnail.thumbnails[1].url,
        };
        yield redis_1.default.hSet(streamId, streamData);
        yield redis_1.default.zAdd(`streams:${data.userName}`, { score: 0, value: streamId });
        const sendData = {
            id: streamData.id,
            videoId: streamData.videoId,
            title: streamData.title,
            thumbnail: streamData.thumbnail,
            votesCount: streamData.votes
        };
        // console.log("new stream",await(redisClient.zRange(`streams:${username}`,0,-1)));
        index_1.io.to(maps_1.rooms.get(data.userName || "") || []).emit("newStream", sendData);
    });
}
