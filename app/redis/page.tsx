"use client"
import { useState } from "react";
import axios from "axios";
export default function Page() {
    const [key, setKey] = useState("");
    const [value, setValue] = useState("");
    const [query, setQuery] = useState("");
    const [res, setRes] = useState("");
    const [publish,setPublish]= useState({channel:"", message:""});
    const [subscribe,setSubscribe]= useState("");
    const get = async () => {
        const res = await axios.get(`/api/redis?key=${query}`);
        setRes(res.data.value||"not found");
    }
    const post= async ()=>{
        await axios.post(`/api/redis`, {key, value});
        setRes("success");
    }
    return (
        <div>
        <h1>Redis</h1>
        <input value={key} onChange={(e) => setKey(e.target.value)} placeholder="key" />
        <input value={value} onChange={(e) => setValue(e.target.value)} placeholder="value" />
        <button onClick={post}>Set</button>
        <br />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="query" />
        <button onClick={get}> Get</button>
        <br />
        <h2>Response: {res}</h2>
        <hr />
        <h2>API</h2>
        <h3>PUBLISH</h3>
        <input type="text" onChange={(e)=>setPublish({
            ...publish,
            channel:e.target.value,
        })} placeholder="Enter Message" />
         <input type="text" onChange={(e)=>setPublish({
            ...publish,
            message:e.target.value,
        })} placeholder="Enter Message" />
        <button onClick={()=>{
            axios.post(`/api/redis/publish`, publish);
        }}>Publish</button>
        <h3>SUBSCRIBE</h3>
        <input type="text" placeholder="Enter Channel" onChange={(e)=>setSubscribe(e.target.value)} />
        <button onClick={()=>{
            axios.post(`/api/redis/subscribe`, {channel:subscribe});
        }} >Subscribe</button>
        </div>
    )
}