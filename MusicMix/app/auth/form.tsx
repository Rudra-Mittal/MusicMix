"use client"

import { useState, useEffect } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Label } from "@/components/ui/label"
import Image from "next/image"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function AuthForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [username, setUsername] = useState("")
  const [name, setName] = useState("")
  const [isSignUp, setIsSignUp] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isGoogleUsername, setIsGoogleUsername] = useState(false)
  const [callbackUrl, setCallbackUrl] = useState("/")

  useEffect(() => {
    const url = new URLSearchParams(window.location.search).get("callbackUrl") || "/"
    setCallbackUrl(url)
  }, [])

  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (isSignUp) {
      // Handle sign up
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, username, name }),
      })

      if (res.ok) {
        console.log("signed up")
        // If sign up is successful, log the user in
        signIn("credentials", { email, password, redirect: false }).then((result) => {
          if (result?.error) {
            setError(result.error)
          } else {
            router.push(callbackUrl) // Redirect to dashboard after successful sign up and sign in
          }
        })
      } else {
        const data = await res.json()
        setError(data.message || "Something went wrong")
      }
    } else {
      // Handle sign in
      signIn("credentials", { email, password, redirect: false }).then((result) => {
        console.log(result)
        if (result?.error) {
          setError(result.error)
        } else {
          router.push(callbackUrl) 
        }
      })
    }
  }

  const handleGoogleSignIn = (e: React.FormEvent) => {
    e.preventDefault()
    if (isSignUp && username.trim() === "") {
      setError("Please enter a username for Google sign-in")
      return
    }
    if (isSignUp) {
      document.cookie = `username=${username}; path=/;`
    }
    // console.log(callbackUrl)
    signIn("google", { callbackUrl: callbackUrl })
  }

  const formVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  }

  const fieldVariants = {
    hidden: { opacity: 0, height: 0 },
    visible: { opacity: 1, height: "auto", transition: { duration: 0.3 } },
  }

  const buttonVariants = {
    hover: { scale: 1.05, transition: { duration: 0.2 } },
    tap: { scale: 0.95, transition: { duration: 0.2 } },
  }

  if (isGoogleUsername && isSignUp) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Choose a Username</CardTitle>
        </CardHeader>
        <CardContent>
          <motion.form onSubmit={handleGoogleSignIn} initial="hidden" animate="visible" variants={formVariants}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="google-username">Username</Label>
                <Input
                  id="google-username"
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            </div>
            {error && (
              <motion.p
                className="text-red-500 mt-2 text-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {error}
              </motion.p>
            )}
            <div className="mt-6">
              <motion.div whileHover="hover" whileTap="tap" variants={buttonVariants}>
                  <Image
                    src="https://www.svgrepo.com/show/475656/google-color.svg"
                    alt="Google logo"
                    width={20}
                    height={20}
                    className="w-5 h-5 mr-2"
                  />
                <Button type="submit" className="w-full">
                  Sign Up with Google
                </Button>
              </motion.div>
            </div>
          </motion.form>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">
          {isSignUp ? "Create an Account" : "Welcome Back"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <motion.form onSubmit={handleSubmit} initial="hidden" animate="visible" variants={formVariants}>
          <AnimatePresence>
            {isSignUp && (
              <motion.div key="signup-fields" initial="hidden" animate="visible" exit="hidden" variants={fieldVariants}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      type="text"
                      placeholder="Username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>
          {error && (
            <motion.p
              className="text-red-500 mt-2 text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {error}
            </motion.p>
          )}
          <div className="mt-6 space-y-4">
            <motion.div whileHover="hover" whileTap="tap" variants={buttonVariants}>
              <Button type="submit" className="w-full">
                {isSignUp ? "Sign Up" : "Login"}
              </Button>
            </motion.div>
            <motion.div whileHover="hover" whileTap="tap" variants={buttonVariants}>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={isSignUp ? () => setIsGoogleUsername(true) : handleGoogleSignIn}
              >
                <Image
                  src="https://www.svgrepo.com/show/475656/google-color.svg"
                  alt="Google logo"
                  className="w-5 h-5 mr-2"
                />
                Continue with Google
              </Button>
            </motion.div>
          </div>
        </motion.form>
      </CardContent>
      <CardFooter>
        <motion.div whileHover="hover" whileTap="tap" variants={buttonVariants} className="w-full">
          <Button
            variant="link"
            className="w-full"
            onClick={() => {
              setIsSignUp(!isSignUp)
              setIsGoogleUsername(false)
            }}
          >
            {isSignUp ? "Already have an account? Sign in" : "Need an account? Sign up"}
          </Button>
        </motion.div>
      </CardFooter>
    </Card>
  )
}

