'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function AuthForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [name,setName]= useState('');
  const [isSignUp, setIsSignUp] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isGoogleUsername, setIsGoogleUsername] = useState(false)
  const router = useRouter()

  const callbackUrl = new URLSearchParams(window.location.search).get('callbackUrl') || '/';
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (isSignUp) {
      // Handle sign up
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, username,name }),
      })

      if (res.ok) {
        console.log("signed up")
        // If sign up is successful, log the user in
        signIn('credentials', { email, password, redirect: false })
          .then((result) => {
            if (result?.error) {
              setError(result.error)
            } else {
              router.push(callbackUrl) // Redirect to dashboard after successful sign up and sign in
            }
          })
      } else {
        const data = await res.json()
        setError(data.message || 'Something went wrong')
      }
    } else {
      // Handle sign in
      signIn('credentials', { email, password, redirect: false })
        .then((result) => {
          console.log(result)
          if (result?.error) {
            setError(result.error)
          } else {
            router.push(callbackUrl) // Redirect to dashboard after successful sign in
          }
        })
    }
  }

  const handleGoogleSignIn = (e: React.FormEvent) => {
    e.preventDefault()
    if (isSignUp&&username.trim() === '') {
      setError('Please enter a username for Google sign-in')
      return
    }
    if(isSignUp) document.cookie = `username=${username}; path=/;`;
    console.log(callbackUrl)
    signIn('google', { callbackUrl: callbackUrl });
  }

  if (isGoogleUsername&& isSignUp) {
    return (
      <form onSubmit={handleGoogleSignIn} className="mt-4">
        <div className="mt-4">
          <label className="block" htmlFor="google-username">Choose a username</label>
          <input
            type="text"
            placeholder="Username"
            id="google-username"
            className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        {error && <div className="text-red-500 mt-2">{error}</div>}
        <div className="mt-4">
          <button
            type="submit"
            className="w-full px-4 py-2 border flex justify-center items-center gap-2 border-slate-200 rounded-lg text-slate-700 hover:border-slate-400 hover:text-slate-900 hover:shadow transition duration-150"
          >
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google logo" className="w-6 h-6" />
            <span>{(isSignUp)?"SignUp":"Login"} with Google</span>
          </button>
        </div>
      </form>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4">
      {isSignUp && (
        <div className="mt-4">
          <label className="block" htmlFor="username">Username</label>
          <input
            type="text"
            placeholder="Username"
            id="username"
            className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <label className="block" htmlFor="username">Name</label>
          <input
            type="text"
            placeholder="name"
            id="name"
            className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        
      )}
      <div className="mt-4">
        <label className="block" htmlFor="email">Email</label>
        <input
          type="email"
          placeholder="Email"
          id="email"
          className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="mt-4">
        <label className="block" htmlFor="password">Password</label>
        <input
          type="password"
          placeholder="Password"
          id="password"
          className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      {error && <div className="text-red-500 mt-2">{error}</div>}
      <div className="flex items-center justify-between mt-4">
        <button
          className="px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-900"
          type="submit"
        >
          {isSignUp ? 'Sign Up' : 'Login'}
        </button>
        <button
          type="button"
          className="text-sm text-blue-600 hover:underline"
          onClick={() => setIsSignUp(!isSignUp)}
        >
          {isSignUp ? 'Already have an account? Sign in' : 'Need an account? Sign up'}
        </button>
      </div>
      <div className="mt-4">
        <button
          type="button"
          className="w-full px-4 py-2 border flex justify-center items-center gap-2 border-slate-200 rounded-lg text-slate-700 hover:border-slate-400 hover:text-slate-900 hover:shadow transition duration-150"
          onClick={(isSignUp)?() => setIsGoogleUsername(true):handleGoogleSignIn}
        >
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google logo" className="w-6 h-6" />
          <span>Continue with Google</span>
        </button>
      </div>
    </form>
  )
}

