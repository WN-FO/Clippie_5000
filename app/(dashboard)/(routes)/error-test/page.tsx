'use client';

import { ErrorTest } from '@/components/error-test';
import { ErrorBoundary } from '@/components/error-boundary';
import { ErrorDisplay } from '@/components/ui/error-display';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ErrorTestPage() {
  return (
    <div className="container mx-auto py-10 space-y-10">
      <div className="max-w-3xl mx-auto space-y-4">
        <h1 className="text-3xl font-bold">Error Handling Test Page</h1>
        <p className="text-muted-foreground">
          This page demonstrates different error handling mechanisms in the application.
        </p>
      </div>
      
      <div className="grid gap-8 max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Protected Error Test</CardTitle>
            <CardDescription>
              This component is protected by an error boundary
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ErrorBoundary
              fallback={
                <ErrorDisplay
                  title="Component Error"
                  message="This error was caught by the error boundary."
                  retry={() => window.location.reload()}
                />
              }
            >
              <ErrorTest />
            </ErrorBoundary>
          </CardContent>
        </Card>
      </div>
      
      <div className="max-w-3xl mx-auto text-sm text-muted-foreground mt-8">
        <h3 className="font-medium text-base mb-2">About Error Handling</h3>
        <p>
          This page demonstrates the application's error handling capabilities:
        </p>
        <ul className="list-disc pl-6 mt-2 space-y-1">
          <li>React Error Boundaries for component errors</li>
          <li>Try/catch blocks for synchronous code</li>
          <li>Promise rejection handling for async code</li>
          <li>Toast notifications for user-friendly error messages</li>
          <li>Server-side error logging for tracking issues</li>
          <li>Typed errors for better error classification</li>
        </ul>
      </div>
    </div>
  );
} 