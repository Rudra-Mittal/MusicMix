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
exports.joinStream = joinStream;
const maps_1 = require("../miscellaneous/maps");
const redis_1 = __importDefault(require("../lib/redis"));
const __1 = require("../..");
function joinStream(socket, room) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c;
        const username = ((_c = (_b = (_a = socket.data) === null || _a === void 0 ? void 0 : _a.session) === null || _b === void 0 ? void 0 : _b.user) === null || _c === void 0 ? void 0 : _c.username) || "";
        maps_1.rooms.set(room, [...maps_1.rooms.get(room) || [], socket.id]);
        maps_1.user.set(username, [...maps_1.user.get(username) || [], socket.id]);
        // console.log("rooms",rooms); 
        const streamIdx = yield redis_1.default.zRange(`streams:${room}`, 0, -1);
        // console.log(streamIdx);
        const streamData = yield Promise.all(streamIdx.map((streamId) => __awaiter(this, void 0, void 0, function* () {
            const stream = yield redis_1.default.hGetAll(streamId);
            return {
                id: stream.id,
                videoId: stream.videoId,
                title: stream.title,
                thumbnail: stream.thumbnail,
                votesCount: stream.votes,
                vote: (username == "") ? false : yield redis_1.default.sIsMember(`streamVotes:${room}:${stream.videoId}`, username)
            };
        })));
        __1.io.to(socket.id).emit("initialStreams", streamData);
    });
}
