"use client";
import { io, Socket } from "socket.io-client";
let socket: Socket | null = null;
async function getSessionToken(): Promise<string> {
  const response = await fetch(`${process.env.BACKEND_URL}/api/session-token`, {
    method: "GET",
    credentials: "include",
  });
  console.log(response)
  const data = await response.json();
  console.log(data);
  // send data.sessiontoken when in http
  return data.sessiontoken;
}

export async function initializeSocket(): Promise<Socket> {
  if (socket) {
    return socket;
  }
  const sessionToken = await getSessionToken();
  // console.log("sessionToken", sessionToken);
  socket = io("http://localhost:3000", {
    withCredentials: true,
    extraHeaders: {
      "next-auth.session-token": sessionToken,
      // "__Secure-next-auth.session-token": sessionToken,
    },
  });
  socket.on("connect", () => {
    console.log("Connected to socket server");
  });

  return socket;
}