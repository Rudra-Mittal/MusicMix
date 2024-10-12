import React from 'react';
import AuthOptions from './authoptions'; 
import { getServerSession } from 'next-auth';
import { options } from '../config/auth';
export default async function Appbar(){
  // const data=await getServerSession(options);
  // console.log("datata",data);
  return (      
    <div className="bg-blue-600 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-white text-xl">MusicMix</h1>
        <AuthOptions/>
      </div>
    </div>
  );
};

