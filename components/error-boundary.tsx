'use client';

import React, { useEffect } from 'react';
import { ErrorDisplay } from '@/components/ui/error-display';
import { ErrorType, logError } from '@/lib/error-utils';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  errorComponent?: React.ComponentType<{
    error: Error;
    reset: () => void;
  }>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error
    logError(error, 'ErrorBoundary');
    
    // Call onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  render() {
    const { children, fallback, errorComponent: ErrorComponent } = this.props;
    const { hasError, error } = this.state;

    if (hasError && error) {
      // Use custom error component if provided
      if (ErrorComponent) {
        return <ErrorComponent error={error} reset={() => this.setState({ hasError: false, error: null })} />;
      }
      
      // Use custom fallback if provided
      if (fallback) {
        return fallback;
      }
      
      // Default error UI
      return (
        <ErrorDisplay
          title="Something went wrong"
          message={error.message || "An unexpected error occurred"}
          retry={() => this.setState({ hasError: false, error: null })}
        />
      );
    }

    return children;
  }
}

interface WithErrorBoundaryProps {
  children: React.ReactNode;
  errorComponent?: React.ComponentType<{
    error: Error;
    reset: () => void;
  }>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

export function withErrorBoundary<P extends WithErrorBoundaryProps>(
  Component: React.ComponentType<P>
): React.ComponentType<P> {
  const WithErrorBoundary = (props: P) => {
    return (
      <ErrorBoundary
        errorComponent={props.errorComponent}
        onError={props.onError}
      >
        <Component {...props} />
      </ErrorBoundary>
    );
  };

  return WithErrorBoundary;
}

// Hook for catching and handling async errors
export function useAsyncErrorHandler() {
  useEffect(() => {
    const handler = (event: ErrorEvent) => {
      logError(event.error, 'AsyncError');
    };

    const rejectionHandler = (event: PromiseRejectionEvent) => {
      logError(event.reason, 'UnhandledPromiseRejection');
    };

    window.addEventListener('error', handler);
    window.addEventListener('unhandledrejection', rejectionHandler);

    return () => {
      window.removeEventListener('error', handler);
      window.removeEventListener('unhandledrejection', rejectionHandler);
    };
  }, []);
} 