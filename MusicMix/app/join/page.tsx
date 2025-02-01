"use client"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Music, ArrowRight, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

export default function JoinStream() {
  const [creatorId, setCreatorId] = useState("")
  const [isJoining, setIsJoining] = useState(false)
  const [error, setError] = useState("")
  const router= useRouter();
  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsJoining(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
   if(!error) router.push(`/creator/${creatorId}`);
   else setError("Cannot Join Stream");
  }
  
  
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  }

  const inputVariants = {
    focus: { scale: 1.02, boxShadow: "0 0 0 2px var(--primary)" },
    blur: { scale: 1, boxShadow: "none" }
  }

  const buttonVariants = {
    hover: { scale: 1.05 },
    tap: { scale: 0.95 },
    loading: { scale: 0.98 }
  }

  return (
    <div className="container mx-auto p-4 min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background to-secondary">
      <motion.div
        className="w-full max-w-md"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <Card className="backdrop-blur-sm bg-background/80">
          <CardHeader>
            <motion.div 
              variants={itemVariants} 
              className="flex items-center justify-center mb-4"
              whileHover={{ rotate: 360, transition: { duration: 0.5 } }}
            >
              <Music className="h-12 w-12 text-primary" />
            </motion.div>
            <CardTitle>
              <motion.div 
                variants={itemVariants} 
                className="text-3xl font-bold text-center"
                whileHover={{ scale: 1.05 }}
              >
                Join a Stream
              </motion.div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <motion.form onSubmit={handleJoin} className="space-y-4" variants={itemVariants}>
              <div className="space-y-2">
                <label htmlFor="creatorId" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Creator ID
                </label>
                <motion.div
                  variants={inputVariants}
                  whileFocus="focus"
                  initial="blur"
                  animate="blur"
                >
                  <Input
                    id="creatorId"
                    type="text"
                    placeholder="Enter creator ID"
                    value={creatorId}
                    onChange={(e) => {
                        setCreatorId(()=>{
                            return e.target.value;
                        })
                        
                    }}
                    className="w-full"
                  />
                </motion.div>
              </div>
              <motion.div
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                animate={isJoining ? "loading" : ""}
              >
                <Button type="submit" className="w-full" disabled={isJoining}>
                  {isJoining ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <ArrowRight className="mr-2 h-4 w-4" />
                  )}
                  {isJoining ? "Joining..." : "Join Stream"}
                </Button>
              </motion.div>
            </motion.form>
            <AnimatePresence>
              {creatorId && !error && (
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-4 text-sm text-center text-primary"
                >
                  Ready to join {creatorId}&apos;s stream!
                </motion.p>
              )}
                {error && creatorId && (
                    <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mt-4 text-sm text-center text-red-500"
                    >
                    {error+ " with ID: "+creatorId} 
                    </motion.p> 
                )}
            </AnimatePresence>
            <motion.p variants={itemVariants} className="mt-4 text-sm text-center text-muted-foreground">
              Enter the unique ID provided by the stream creator to join their music stream.
            </motion.p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}