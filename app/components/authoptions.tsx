"use client"
import { signIn, signOut, useSession } from 'next-auth/react';

export default function AuthOptions() {
    const { data: session, status } = useSession();
    // console.log("Session data:", session);
    // console.log("Session status:", status);

    if (status === "loading") {
        return <p>Loading...</p>;
    }
    
    if (session) {
       
        return (
            <button className="bg-white text-blue-600 px-4 py-2 rounded" onClick={() => {
                console.log(session);
                signOut()}}>Logout</button>
        );
    } else {
        return (
            <button className="bg-white text-blue-600 px-4 py-2 rounded" onClick={() => signIn('google')}>Login via Google</button>
        );
    }
}