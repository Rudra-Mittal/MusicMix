"use client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Music, Play, Vote, Users } from "lucide-react"
import Link from "next/link"
import AuthOptions from "./components/authoptions";
export default function Home() {
  return (
    <div>
      <div className="flex flex-col min-h-screen bg-white">
      <header className="px-4 lg:px-6 h-14 flex items-center bg-black text-white">
        <Link className="flex items-center justify-center" href="#">
          <Music className="h-6 w-6 text-white" />
          <span className="ml-2 text-2xl font-bold text-white">MusicMix</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link className="text-sm font-medium hover:underline underline-offset-4 text-white" href="#">
            Features
          </Link>
          
          <Link className="text-sm font-medium hover:underline underline-offset-4 text-white" href="#">
            Contact
          </Link>
          <Link className="text-sm font-medium hover:underline underline-offset-4 text-white" href="#">
           <AuthOptions/>
          </Link>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full min-h-screen py-12 md:py-24 lg:py-32 xl:py-48 bg-black text-white">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Where Music Meets Democracy
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-400 md:text-xl">
                  Stream your music and let your audience decide what plays next. MusicMix brings creators and listeners
                  together in a unique, interactive experience that&apos;s pure elegance.
                </p>
              </div>
              <div className="space-x-4 pt-auto">
             
                <Button  variant={"outline"} className= "border-white hover:text-black bg-white/10 text-white "><a href="/dashboard">Start Streaming</a></Button>
                <Button variant="outline" className="border-white hover:text-black bg-white/10 text-white "><a href="/join">Join a stream</a></Button>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-white text-black">
          <div className="container px-4 md:px-6">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-center mb-12">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center text-center">
                <Play className="h-12 w-12 mb-4 text-black" />
                <h3 className="text-xl font-bold mb-2">Create Your Stream</h3>
                <p className="text-gray-600">Set up your music library and start streaming to your audience.</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <Vote className="h-12 w-12 mb-4 text-black" />
                <h3 className="text-xl font-bold mb-2">Audience Votes</h3>
                <p className="text-gray-600">Listeners vote on which song should play next in real-time.</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <Music className="h-12 w-12 mb-4 text-black" />
                <h3 className="text-xl font-bold mb-2">Music Plays</h3>
                <p className="text-gray-600">The most voted song automatically plays next, keeping everyone engaged.</p>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-black">
          <div className="container px-4 md:px-6">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-center mb-12 text-white">Live Voting Demo</h2>
            <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gray-200 rounded-full mr-4" />
                  <div>
                    <h3 className="font-bold text-black">DJ Awesome</h3>
                    <p className="text-sm text-gray-600">Live Now</p>
                  </div>
                </div>
                <div className="flex items-center text-black">
                  <Users className="h-5 w-5 mr-2" />
                  <span>1.2k listeners</span>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-black">
                  <span className="font-medium">Song A</span>
                  <Slider defaultValue={[75]} max={100} step={1} className="w-64" />
                </div>
                <div className="flex items-center justify-between text-black">
                  <span className="font-medium">Song B</span>
                  <Slider defaultValue={[50]} max={100} step={1} className="w-64" />
                </div>
                <div className="flex items-center justify-between text-black">
                  <span className="font-medium">Song C</span>
                  <Slider defaultValue={[25]} max={100} step={1} className="w-64" />
                </div>
              </div>
              {/* <ButtonUi></ButtonUi> */}
              <Button className="w-full mt-6 bg-black text-white hover:bg-gray-800">Cast Your Vote</Button>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-white text-black">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Ready to Compose Your Musical Story?
                </h2>
                <p className="mx-auto max-w-[600px] text-gray-600 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Join MusicMix today and start creating interactive, audience-driven music experiences that resonate.
                </p>
              </div>
              <div className="w-full max-w-sm space-y-2">
                <form className="flex space-x-2">
                  <Input className="max-w-lg flex-1 bg-white text-black border-gray-300 placeholder-gray-500" placeholder="Enter your email" type="email" />
                  <Button type="submit" className="bg-black text-white hover:bg-gray-800">Sign Up</Button>
                </form>
                <p className="text-xs text-gray-600">
                  By signing up, you agree to our{" "}
                  <Link className="underline underline-offset-2 text-black" href="#">
                    Terms & Conditions
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t border-gray-200 bg-white text-black">
        <p className="text-xs text-gray-600">© 2024 MusicMix. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs hover:underline underline-offset-4 text-black" href="#">
            Terms of Service
          </Link>
          <Link className="text-xs hover:underline underline-offset-4 text-black" href="#">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
    </div>
  );
}
