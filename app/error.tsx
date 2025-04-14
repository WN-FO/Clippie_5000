'use client';

import { useEffect } from 'react';
import { ErrorDisplay } from '@/components/ui/error-display';
import { logError } from '@/lib/error-utils';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to our error logging service
    logError(error, 'AppError');
  }, [error]);

  // Get a more specific error message if available
  const errorMessage = error.message || 'An unexpected error occurred';
  const detailedMessage = error.digest ? `Error ID: ${error.digest}` : undefined;

  return (
    <ErrorDisplay
      title="Application Error"
      message={errorMessage}
      retry={reset}
    >
      {detailedMessage && (
        <div className="px-4 py-2 bg-muted rounded-md text-xs mb-6 max-w-md overflow-auto">
          <code>{detailedMessage}</code>
        </div>
      )}
    </ErrorDisplay>
  );
} 