'use client';

import { AuthProvider as AuthProviderInternal } from "@/hooks/use-auth";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return <AuthProviderInternal>{children}</AuthProviderInternal>;
} 