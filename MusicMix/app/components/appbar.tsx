import React from 'react';
import AuthOptions from './authoptions'; 
import { ModeToggle } from './switchTheme';
export default function Appbar(){
  return (      
    <div className="bg-blue-600 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <ModeToggle/>
        <h1 className="text-white text-xl">MusicMix</h1>
        <AuthOptions/>
      </div>
    </div>
  );
};

