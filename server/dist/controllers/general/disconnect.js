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
exports.disconnect = disconnect;
const maps_1 = require("../miscellaneous/maps");
function disconnect(socket) {
    return __awaiter(this, void 0, void 0, function* () {
        maps_1.rooms.forEach((value, key) => {
            maps_1.rooms.set(key, value.filter((item) => item != socket.id));
        });
        maps_1.user.forEach((value, key) => {
            maps_1.user.set(key, value.filter((item) => item != socket.id));
        });
    });
}
