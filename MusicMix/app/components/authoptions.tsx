"use client"
import { signIn, signOut, useSession } from 'next-auth/react';

export default function AuthOptions() {
    const { data: session, status } = useSession();

    if (status === "loading") {
        return <p>Loading...</p>;
    }
    
    if (session) {
       
        return (
            <button className="bg-white/10 text-white  rounded" onClick={() => {
                signOut()}}>Logout</button>
        );
    } else {
        return (
            <button className="bg-white/10 text-white-600 rounded" onClick={() => signIn()}>Login</button>
        );
    }
}