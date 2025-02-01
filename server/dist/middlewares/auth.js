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
exports.authentication = authentication;
const hostname = "localhost";
const port = 3001;
function authentication(socket, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const cookies = socket.handshake.headers.cookie;
        const sessionToken = (cookies === null || cookies === void 0 ? void 0 : cookies.search("next-auth.session-token=")) !== -1 ? cookies === null || cookies === void 0 ? void 0 : cookies.split("next-auth.session-token=")[1].split(";")[0] : null;
        // const sessionToken = cookies["__secure-next-auth.session-token"];
        console.log("sessionToken", sessionToken);
        try {
            const response = yield fetch(`http://${hostname}:${port}/api/session`, {
                headers: {
                    // cookie: `__Secure-next-auth.session-token=${sessionToken}`
                    cookie: `next-auth.session-token=${sessionToken}`
                }
            });
            const session = yield response.json();
            console.log("session", session);
            socket.data.session = session;
        }
        catch (err) {
            next(err);
        }
        next();
    });
}
