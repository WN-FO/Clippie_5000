"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export const LandingNavbar = () => {
  console.log('LandingNavbar rendering');
  
  return (
    <nav className="p-4 bg-white border-b flex items-center justify-between">
      <Link href="/" className="text-2xl font-bold">
        Clippie
      </Link>
      <div className="flex items-center gap-x-2">
        <Button asChild>
          <Link href="/sign-up">Get Started</Link>
        </Button>
      </div>
    </nav>
  );
};
