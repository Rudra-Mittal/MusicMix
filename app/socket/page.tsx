"use client"
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { socket } from "../socket";

export default function Home() {
  const [isConnected, setIsConnected] = useState(false);
  const [transport, setTransport] = useState("N/A");
  const [counter, setCounter] = useState(0);
  const { data: session } = useSession();
  useEffect(() => {
    if (socket.connected) {
      onConnect();
    }

    function onConnect() {
      setIsConnected(true);
      setTransport(socket.io.engine.transport.name);

      socket.io.engine.on("upgrade", (transport) => {
        setTransport(transport.name);
      });
      socket.emit("getInitialCount");
    }

    function onDisconnect() {
      setIsConnected(false);
      setTransport("N/A");
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("count", (data:{count:number}) => {
      setCounter(data.count);
    });
    socket.on("message", (data) => {
      console.log(data);
    });

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, [session]);

  return (
    <div>
      <p>Status: {isConnected ? "connected" : "disconnected"}</p>
      <p>Transport: {transport}</p>
      <p>Counter: {counter}</p>
      <button
        onClick={() => {
          socket.emit("changeCount", { count: counter + 1 });
        }}
      >
        ++
      </button>
      <br />
      <button
        onClick={() => {
          socket.emit("changeCount", { count: counter - 1 });
        }}
      >
        --
      </button>
    </div>
  );
}
