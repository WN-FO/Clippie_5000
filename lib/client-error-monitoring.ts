'use client';

import { useEffect } from 'react';
import { logError } from './error-utils';

// Simple in-memory error store for development/debugging
let recentErrors: Array<{
  message: string;
  source: string;
  timestamp: Date;
  stack?: string;
}> = [];

const MAX_STORED_ERRORS = 10;

// Add error to in-memory store
export function addError(error: Error, source: string) {
  const errorData = {
    message: error.message,
    source,
    timestamp: new Date(),
    stack: error.stack,
  };
  
  recentErrors = [errorData, ...recentErrors.slice(0, MAX_STORED_ERRORS - 1)];
  
  // In a real app, you might send this to a monitoring service like Sentry
  console.debug('[Error Monitoring] Captured error:', errorData);
}

// Get recent errors for debugging
export function getRecentErrors() {
  return [...recentErrors];
}

// Clear error history
export function clearErrorHistory() {
  recentErrors = [];
}

// React hook to set up global error listeners
export function useErrorMonitoring() {
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      const error = event.error || new Error(event.message);
      logError(error, 'window.onerror');
      addError(error, 'window.onerror');
    };

    const handleRejection = (event: PromiseRejectionEvent) => {
      const error = event.reason instanceof Error 
        ? event.reason 
        : new Error(String(event.reason));
      
      logError(error, 'unhandledRejection');
      addError(error, 'unhandledRejection');
    };

    // Add global error handlers
    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleRejection);

    return () => {
      // Remove handlers on cleanup
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, []);

  return { getRecentErrors, clearErrorHistory };
}

// Send error to backend for server-side logging
export async function reportErrorToServer(error: Error, context?: Record<string, any>) {
  try {
    await fetch('/api/error-logging', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: error.message,
        stack: error.stack,
        context,
        clientInfo: {
          userAgent: navigator.userAgent,
          url: window.location.href,
          timestamp: new Date().toISOString(),
        },
      }),
    });
  } catch (err) {
    // Silent fail - don't want to cause more errors when reporting errors
    console.error('Failed to report error to server:', err);
  }
} 