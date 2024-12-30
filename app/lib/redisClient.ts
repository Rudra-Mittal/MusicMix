import { createClient } from 'redis';

const client= createClient()
client.on("error", function(error) {
  console.error(error);
});
async function main() {
  try{
    console.log("creating  redis connection")
    await client.connect();
  }catch(e){
    console.error(e)
  } 
}
const redisClient= ()=>{
  
  main().then(()=>{
    return client
  }).catch((e)=>{
    console.error(e)
  })
  return client
}
export default redisClient();