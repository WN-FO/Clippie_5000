'use client';

import { useEffect, useState } from 'react';
import { AuthProvider } from "@/hooks/use-auth";
import AuthLoading from "./auth-loading";

export default function ClientAuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Wait for next tick to ensure hydration
    const timer = setTimeout(() => {
      setIsHydrated(true);
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  // Show loading state during hydration
  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-white">
        <AuthLoading />
      </div>
    );
  }

  return (
    <AuthProvider>
      <div className="min-h-screen bg-white">
        {children}
      </div>
    </AuthProvider>
  );
} 