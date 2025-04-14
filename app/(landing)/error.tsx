"use client";

import { ErrorDisplay } from '@/components/ui/error-display';
import { ErrorType, logError } from '@/lib/error-utils';
import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logError(error, 'LandingError');
  }, [error]);

  return (
    <ErrorDisplay
      title="Oops! Something went wrong"
      message="We're having trouble loading this page."
      errorType={ErrorType.UNKNOWN}
      retry={reset}
    />
  );
}
