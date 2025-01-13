import { rooms, user } from "../miscellaneous/maps";

export async function disconnect(socket: any) {
    rooms.forEach((value,key)=>{
        rooms.set(key,value.filter((item)=>item!=socket.id));
      })
      user.forEach((value,key)=>{
        user.set(key,value.filter((item)=>item!=socket.id));
      })
}