import { Socket } from "socket.io";
const hostname = "localhost";
const port = 3001;
export async function authentication(socket: Socket, next: (err?: any) => void) {
  const cookies =socket.handshake.headers.cookie
  const sessionToken = cookies?.search("next-auth.session-token=") !== -1 ? cookies?.split("next-auth.session-token=")[1].split(";")[0] : null;
  // const sessionToken = cookies["__secure-next-auth.session-token"];
  console.log("sessionToken", sessionToken);
      try{
        const response= await fetch(`http://${hostname}:${port}/api/session`,{
          headers:{
            // cookie: `__Secure-next-auth.session-token=${sessionToken}`
            cookie: `next-auth.session-token=${sessionToken}` 
          }
        })
        const session = await response.json();
        console.log("session", session);
        socket.data.session=session;
      }catch(err:any){
        next(err);
      }
      next();
}