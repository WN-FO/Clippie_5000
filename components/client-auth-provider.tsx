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
    // Wait for hydration to complete
    setIsHydrated(true);
  }, []);

  if (!isHydrated) {
    return <AuthLoading />;
  }

  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
} 