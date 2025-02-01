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
exports.vote = vote;
const index_1 = require("../../index");
const redis_1 = __importDefault(require("../lib/redis"));
const maps_1 = require("../miscellaneous/maps");
function vote(socket, data) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c;
        const username = ((_c = (_b = (_a = socket.data) === null || _a === void 0 ? void 0 : _a.session) === null || _b === void 0 ? void 0 : _b.user) === null || _c === void 0 ? void 0 : _c.username) || "";
        if (!username) {
            index_1.io.to(socket.id).emit("error", { message: "You must be logged in to vote" });
            return;
        }
        const streamId = `stream:${data.owner}:${data.videoId}`;
        const voteStream = `streamVotes:${data.owner}:${data.videoId}`;
        // Ensure the voteStream key is a set
        const voteStreamType = yield redis_1.default.type(voteStream);
        if (voteStreamType !== 'set' && voteStreamType !== 'none') {
            index_1.io.to(socket.id).emit("error", { message: "Vote stream key is of the wrong type" });
            return;
        }
        if (data.count) {
            if (yield redis_1.default.sIsMember(voteStream, username)) {
                index_1.io.to(socket.id).emit("error", { message: "You have already voted for this stream" });
                return;
            }
            yield redis_1.default.hIncrBy(streamId, "votes", 1);
            yield redis_1.default.sAdd(voteStream, username);
        }
        else {
            if (!(yield redis_1.default.sIsMember(voteStream, username))) {
                index_1.io.to(socket.id).emit("error", { message: "You have not voted for this stream" });
                return;
            }
            yield redis_1.default.hIncrBy(streamId, "votes", -1);
            yield redis_1.default.sRem(voteStream, username);
        }
        const votes = yield redis_1.default.hGet(streamId, "votes");
        index_1.io.to(maps_1.user.get(username) || []).emit("voteUpdate", { videoId: data.videoId, votesCount: votes, voteByUser: data.count });
        index_1.io.to(maps_1.rooms.get(data.owner || "") || []).except(maps_1.user.get(username) || []).emit("voteUpdate", { videoId: data.videoId, votesCount: votes });
    });
}
