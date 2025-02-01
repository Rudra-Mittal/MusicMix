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
exports.active = active;
exports.getActive = getActive;
const redis_1 = __importDefault(require("../lib/redis"));
const maps_1 = require("../miscellaneous/maps");
const index_1 = require("../../index");
function active(socket, data) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c;
        const username = ((_c = (_b = (_a = socket.data) === null || _a === void 0 ? void 0 : _a.session) === null || _b === void 0 ? void 0 : _b.user) === null || _c === void 0 ? void 0 : _c.username) || "";
        const streamId = `stream:${username}:${(data.videoId)}`;
        if (data.videoId == "null") {
            yield redis_1.default.del(`activeStream:${username}`);
            index_1.io.to(maps_1.rooms.get(username || "") || []).emit("activeStream", { id: "", videoId: "", title: "", thumbnail: "", votesCount: 0 });
            return;
        }
        const streamData = yield redis_1.default.hGetAll(streamId);
        // console.log("active stream",streamData,streamId);
        yield redis_1.default.hSet(`activeStream:${username}`, {
            id: streamData.id,
            type: streamData.type,
            userName: streamData.userName,
            title: streamData.title,
            videoId: streamData.videoId,
            votes: streamData.votes,
            addedBy: streamData.addedBy,
            thumbnail: streamData.thumbnail
        });
        // console.log("active stream set", await redisClient.hGetAll(`activeStream:${username}`));
        // await redisClient.zRem(`streams:${username}`,streamId);
        // await redisClient.del(`streamVotes:${username}:${data.videoId}`);
        // console.log("active stream", await redisClient.get(`activeStream:${username}`));
        index_1.io.to(maps_1.rooms.get(username || "") || []).emit("activeStream", { id: streamData.id, videoId: data.videoId, title: streamData.title, thumbnail: streamData.thumbnail, votesCount: streamData.votes });
        return;
    });
}
function getActive(socket, username) {
    return __awaiter(this, void 0, void 0, function* () {
        // console.log("getActiveStream",username);
        const streamData = yield redis_1.default.hGetAll(`activeStream:${username}`);
        // console.log("active stream",streamData);
        if (streamData) {
            index_1.io.to(socket.id).emit("activeStream", { id: streamData.id, videoId: streamData.videoId, title: streamData.title, thumbnail: streamData.thumbnail, votesCount: streamData.votes });
        }
        return;
    });
}
