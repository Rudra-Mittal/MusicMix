import { Socket } from "socket.io";
import cookie from "cookie";
const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;
export async function authentication(socket: Socket, next: (err?: any) => void) {
   const cookies = cookie.parse(socket.handshake.headers.cookie || "");
      const sessionToken = cookies["next-auth.session-token"];
      // if (!sessionToken) {
      //   console.log("No session token found");
      //   return next(new Error("Authentication error"));
      // }
      // console.log(sessionToken);
      try{
        const response= await fetch(`http://${hostname}:${port}/api/session`,{
          headers:{
            cookie: `next-auth.session-token=${sessionToken}`
          }
        })
        const session = await response.json();
        socket.data.session=session;
      }catch(err:any){
        next(err);
      }
      next();
}