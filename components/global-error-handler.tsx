'use client';

import React, { useEffect } from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class GlobalErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // You can log the error to an error reporting service
    console.error('Error caught by GlobalErrorBoundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-center text-gray-900">Something went wrong</h2>
            <div className="mt-2 text-center text-sm text-gray-600">
              {this.state.error?.message && (
                <pre className="p-4 bg-gray-100 rounded text-left overflow-auto text-sm">
                  {this.state.error.message}
                </pre>
              )}
            </div>
            <div className="mt-4">
              <button
                onClick={() => window.location.reload()}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Reload page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// This component will log unhandled promise rejections
export function GlobalErrorHandler({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Add global error handlers for unhandled errors and promise rejections
    const originalConsoleError = console.error;
    console.error = (...args) => {
      // Log to original console.error
      originalConsoleError(...args);
      
      // If this is a React error, don't report it again (it will be caught by error boundary)
      if (typeof args[0] === 'string' && args[0].includes('React will try to recreate this component tree')) {
        return;
      }
    };

    const unhandledRejectionHandler = (event: PromiseRejectionEvent) => {
      console.error('Unhandled Promise Rejection:', event.reason);
    };

    window.addEventListener('unhandledrejection', unhandledRejectionHandler);

    return () => {
      console.error = originalConsoleError;
      window.removeEventListener('unhandledrejection', unhandledRejectionHandler);
    };
  }, []);

  return (
    <GlobalErrorBoundary>
      {children}
    </GlobalErrorBoundary>
  );
}

export default GlobalErrorHandler; 