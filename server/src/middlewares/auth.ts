import { Socket } from "socket.io";
const hostname = "musicmix.devrudra.site";
const port = 3001;
export async function authentication(socket: Socket, next: (err?: any) => void) {
  const cookies =socket.handshake.headers;
  console.log(socket.handshake.headers);
   const sessionToken = cookies["authorization"];
  console.log("sessionToken", sessionToken);
      try{
        const response= await fetch(`https://${hostname}/api/session`,{
          headers:{
            cookie: `__Secure-next-auth.session-token=${sessionToken}` 
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