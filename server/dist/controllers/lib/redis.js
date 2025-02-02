"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const redis_1 = require("redis");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const redisClient = (0, redis_1.createClient)({ url: process.env.REDIS_URL });
redisClient.on("error", (err) => console.error("Redis Client Error", process.env.REDIS_URL, err));
redisClient.connect();
exports.default = redisClient;
