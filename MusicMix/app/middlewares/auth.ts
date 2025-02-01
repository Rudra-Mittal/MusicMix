import { Socket } from "socket.io";
import cookie from "cookie";
// const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;
export async function authentication(socket: Socket, next: (err?: any) => void) {
   const cookies = cookie.parse(socket.handshake.headers.cookie || "");
   const sessionToken = cookies["next-auth.session-token"];
  //  const sessionToken = cookies["__Secure-next-auth.session-token"]; // use this while using  https in production
      try{
        const response= await fetch(`http://${hostname}:${port}/api/session`,{
          headers:{
            cookie: `next-auth.session-token=${sessionToken}`
            // cookie: `__Secure-next-auth.session-token=${sessionToken}` // use this while using  https in production
          }
        })
        const session = await response.json();
        console.log(session);
        socket.data.session=session;
      }catch(err:any){
        next(err);
      }
      next();
}