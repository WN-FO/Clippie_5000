"use client";

import TypewriterComponent from "typewriter-effect";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";

import { Button } from "@/components/ui/button";

export const LandingHero = () => {
  const { user } = useAuth();

  return (
    <div className="text-white font-bold py-36 text-center space-y-5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
      <div className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl space-y-5 font-extrabold">
        <h1>Turn Long Videos into</h1>
        <div className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 pb-2">
          <TypewriterComponent
            options={{
              strings: [
                "Viral Clips.",
                "TikTok Content.",
                "Instagram Reels.",
                "YouTube Shorts.",
              ],
              autoStart: true,
              loop: true,
            }}
          />
        </div>
      </div>
      <div className="text-sm md:text-xl font-light text-zinc-100 px-4 md:px-0 max-w-3xl mx-auto">
        Create engaging short-form content from your long videos with AI-powered subtitles.
        Perfect for content creators, marketers, and educators.
      </div>
      <div>
        <Link href={user ? "/dashboard" : "/sign-up"}>
          <Button variant="premium" className="md:text-lg p-4 md:p-6 rounded-full font-semibold">
            {user ? "Go to Dashboard" : "Start Creating For Free"}
          </Button>
        </Link>
      </div>
      <div className="text-zinc-200 text-xs md:text-sm font-normal">
        No credit card required.
      </div>
    </div>
  );
};
