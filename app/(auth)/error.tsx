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
    logError(error, 'AuthError');
  }, [error]);

  return (
    <ErrorDisplay
      title="Authentication Error"
      message="There was a problem with the authentication service."
      errorType={ErrorType.AUTHENTICATION}
      retry={reset}
    />
  );
}
