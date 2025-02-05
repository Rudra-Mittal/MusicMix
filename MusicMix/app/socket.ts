"use client";
import { io, Socket } from "socket.io-client";
import dotenv from "dotenv";
dotenv.config()
let socket: Socket | null = null;
async function getSessionToken(): Promise<string> {
  const response = await fetch(process.env.NEXT_PUBLIC_NEXTAUTH_URL+`/api/session-token`, {
    method: "GET",
    credentials: "include",
  });
  const responseBody = await response.text();
  console.log(responseBody);
  const data = JSON.parse(responseBody);
  console.log(data);
  return data;
}

export async function initializeSocket(): Promise<Socket> {
  if (socket) {
    return socket;
  }
  const sessionToken = await getSessionToken();
  console.log("sessionToken", sessionToken);
  socket = io("https://musicbackend.devrudra.site", {
    withCredentials: true,
    extraHeaders: {
      "Authorization": sessionToken,
    },
  });
  socket.on("connect", () => {
    console.log("Connected to socket server");
  });

  return socket;
}