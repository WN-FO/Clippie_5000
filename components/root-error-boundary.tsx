'use client';

/**
 * @deprecated This component is deprecated. 
 * Use the new error-boundary.tsx and error-utils.ts instead.
 * This file is kept for backwards compatibility.
 */

import { useEffect } from 'react';
import Link from 'next/link';
import { logError } from '@/lib/error-utils';

export default function RootErrorBoundary({
  error,
  reset,
  children,
}: {
  error?: Error & { digest?: string } | null;
  reset: () => void;
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    if (error) {
      logError(error, 'RootErrorBoundary');
    }
  }, [error]);

  if (!error) {
    return children;
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground">
            Something went wrong
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            We apologize for the inconvenience. Please try again or return to the home page.
          </p>
        </div>
        <div className="bg-card p-4 rounded-lg border shadow-sm">
          <pre className="text-sm text-muted-foreground overflow-auto">
            {error.message}
          </pre>
        </div>
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => reset()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Try again
          </button>
          <Link
            href="/"
            className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
} 