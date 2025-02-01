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
// @ts-ignore
const youtube_search_api_1 = __importDefault(require("youtube-search-api"));
const crypto_1 = require("crypto");
function createStream(socket, data) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c;
        // Strictly check the data
        console.log("create", data);
        const videoDetails = yield youtube_search_api_1.default.GetVideoDetails(data.videoId);
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
