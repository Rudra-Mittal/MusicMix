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
Object.defineProperty(exports, "__esModule", { value: true });
exports.realTime = realTime;
const index_1 = require("../../index");
const maps_1 = require("../miscellaneous/maps");
function realTime(socket, data) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c;
        const username = ((_c = (_b = (_a = socket.data) === null || _a === void 0 ? void 0 : _a.session) === null || _b === void 0 ? void 0 : _b.user) === null || _c === void 0 ? void 0 : _c.username) || "";
        const { seekTime, isPlaying } = data;
        if (username === "") {
            socket.emit("error", { message: "You are not authenticated" });
            return;
        }
        index_1.io.to(maps_1.user.get(username) || []).emit("realTime", { seekTime, isPlaying });
    });
}
