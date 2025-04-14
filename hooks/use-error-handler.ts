'use client';

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { logError, showErrorNotification, ErrorType, AppError } from '@/lib/error-utils';

interface UseErrorHandlerOptions {
  showNotification?: boolean;
  fallbackMessage?: string;
  logErrors?: boolean;
}

export function useErrorHandler(
  options: UseErrorHandlerOptions = {
    showNotification: true,
    fallbackMessage: 'Something went wrong',
    logErrors: true
  }
) {
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleError = useCallback((err: unknown, source?: string) => {
    const error = err instanceof Error ? err : new Error(String(err));
    
    // Set the error state
    setError(error);
    
    // Log the error if option is enabled
    if (options.logErrors) {
      logError(error, source);
    }
    
    // Show notification if option is enabled
    if (options.showNotification) {
      showErrorNotification(error, options.fallbackMessage);
    }
    
    return error;
  }, [options]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Wrapper for async functions to automatically handle errors
  const withErrorHandling = useCallback(<T>(
    fn: (...args: any[]) => Promise<T>,
    source?: string
  ) => {
    return async (...args: any[]): Promise<T | undefined> => {
      try {
        setIsLoading(true);
        clearError();
        const result = await fn(...args);
        return result;
      } catch (err) {
        handleError(err, source);
        return undefined;
      } finally {
        setIsLoading(false);
      }
    };
  }, [handleError, clearError]);

  return {
    error,
    isLoading,
    handleError,
    clearError,
    withErrorHandling
  };
}

// Helper for API requests
export async function fetchWithErrorHandling<T>(
  url: string,
  options?: RequestInit,
  errorHandler?: (error: Error) => void,
  customErrorType?: ErrorType
): Promise<T> {
  try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const message = errorData?.error || `Request failed with status ${response.status}`;
      
      throw new AppError(
        message,
        customErrorType || ErrorType.API,
        response.status,
        errorData?.context
      );
    }
    
    return await response.json();
  } catch (error) {
    if (errorHandler && error instanceof Error) {
      errorHandler(error);
    } else {
      // Just rethrow if no handler provided
      throw error;
    }
    
    // We still need to throw after handling to break the execution chain
    throw error;
  }
} 