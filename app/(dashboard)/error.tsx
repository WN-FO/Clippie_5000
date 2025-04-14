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
    logError(error, 'DashboardError');
  }, [error]);

  return (
    <ErrorDisplay
      title="Dashboard Error"
      message="There was a problem loading the dashboard."
      errorType={ErrorType.SERVER}
      retry={reset}
    />
  );
}
