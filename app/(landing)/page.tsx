"use client";

import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { LandingNavbar } from '@/components/landing-navbar';
import { LandingHero } from '@/components/landing-hero';

export default function LandingPage() {
  console.log('Landing page rendering');
  
  return (
    <div className="min-h-screen bg-white">
      <LandingNavbar />
      <LandingHero />
      <div className="container mx-auto py-20 px-4 text-center">
        <h1 className="text-4xl font-bold mb-4">
          Welcome to Clippie 5000
        </h1>
        <p className="text-xl mb-8">
          Transform your long videos into engaging clips
        </p>
        <Button asChild>
          <Link href="/sign-up">Get Started</Link>
        </Button>
      </div>
    </div>
  );
}
