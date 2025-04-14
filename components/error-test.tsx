'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ErrorType, AppError, showErrorNotification } from '@/lib/error-utils';
import { reportErrorToServer } from '@/lib/client-error-monitoring';
import { useErrorHandler } from '@/hooks/use-error-handler';
import { fetchWithErrorHandling } from '@/hooks/use-error-handler';
import { ApiError } from './ui/api-error';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function ErrorTest() {
  const [lastAction, setLastAction] = useState<string>('');
  const [apiError, setApiError] = useState<Error | null>(null);
  
  const { handleError, withErrorHandling, isLoading } = useErrorHandler({
    showNotification: true
  });

  // Synchronous error
  const throwSyncError = () => {
    setLastAction('Sync Error');
    throw new Error('This is a test synchronous error');
  };

  // Async error with try/catch
  const throwAsyncError = async () => {
    setLastAction('Async Error');
    await new Promise(resolve => setTimeout(resolve, 500));
    throw new Error('This is a test asynchronous error');
  };

  // Typed app error
  const throwAppError = () => {
    setLastAction('App Error');
    throw new AppError(
      'This is a test app error',
      ErrorType.VALIDATION,
      400,
      { field: 'username', value: 'invalid' }
    );
  };

  // Toast notification error
  const showErrorToast = () => {
    setLastAction('Error Toast');
    showErrorNotification(
      new Error('This is a test error notification'),
      'Operation failed'
    );
  };

  // Report to server
  const reportToServer = async () => {
    setLastAction('Server Reported');
    try {
      const error = new Error('This is a test error to be reported to the server');
      error.stack = new Error().stack;
      await reportErrorToServer(error, { page: 'ErrorTest', action: 'report' });
      showErrorNotification(
        null,
        'Error reported to server successfully'
      );
    } catch (error) {
      handleError(error, 'reportToServer');
    }
  };

  // Function with error handling wrapper
  const safeAsyncFunction = withErrorHandling(async () => {
    setLastAction('Handled Async Error');
    await new Promise(resolve => setTimeout(resolve, 500));
    throw new Error('This is a safely handled asynchronous error');
  }, 'safeAsyncFunction');

  // Test API errors
  const testApiError = async (type: string) => {
    setLastAction(`API Error (${type})`);
    setApiError(null);
    
    try {
      await fetchWithErrorHandling(
        `/api/test-error?type=${type}`,
        undefined,
        (error) => {
          setApiError(error);
        }
      );
    } catch (error) {
      // Error is already set and handled by fetchWithErrorHandling
    }
  };

  return (
    <Card className="w-full mx-auto">
      <CardHeader>
        <CardTitle>Error Handling Test</CardTitle>
        <CardDescription>Test different error handling mechanisms</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="client">
          <TabsList className="mb-4">
            <TabsTrigger value="client">Client Errors</TabsTrigger>
            <TabsTrigger value="api">API Errors</TabsTrigger>
          </TabsList>
          
          <TabsContent value="client" className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  try {
                    throwSyncError();
                  } catch (error) {
                    handleError(error, 'throwSyncError');
                  }
                }}
              >
                Sync Error
              </Button>
              
              <Button
                variant="outline"
                onClick={async () => {
                  try {
                    await throwAsyncError();
                  } catch (error) {
                    handleError(error, 'throwAsyncError');
                  }
                }}
              >
                Async Error
              </Button>
              
              <Button
                variant="outline"
                onClick={() => {
                  try {
                    throwAppError();
                  } catch (error) {
                    handleError(error, 'throwAppError');
                  }
                }}
              >
                Typed Error
              </Button>
              
              <Button
                variant="outline"
                onClick={showErrorToast}
              >
                Error Toast
              </Button>
              
              <Button
                variant="outline"
                onClick={reportToServer}
              >
                Report to Server
              </Button>
              
              <Button
                variant="outline"
                onClick={safeAsyncFunction}
                disabled={isLoading}
              >
                {isLoading ? 'Loading...' : 'Safe Async Error'}
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="api" className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              <Button variant="outline" onClick={() => testApiError('auth')}>
                Auth Error
              </Button>
              <Button variant="outline" onClick={() => testApiError('forbidden')}>
                Forbidden Error
              </Button>
              <Button variant="outline" onClick={() => testApiError('validation')}>
                Validation Error
              </Button>
              <Button variant="outline" onClick={() => testApiError('server')}>
                Server Error
              </Button>
              <Button variant="outline" onClick={() => testApiError('db')}>
                Database Error
              </Button>
              <Button variant="outline" onClick={() => testApiError('timeout')}>
                Timeout Error
              </Button>
              <Button variant="outline" onClick={() => testApiError('standard')}>
                Standard Error
              </Button>
              <Button variant="outline" onClick={() => testApiError('unknown')}>
                Unknown Error
              </Button>
              <Button variant="outline" onClick={() => testApiError('success')}>
                Success
              </Button>
            </div>
            
            {apiError && (
              <div className="mt-4">
                <ApiError 
                  title="API Error" 
                  message={apiError.message}
                  retry={() => testApiError('success')}
                />
              </div>
            )}
          </TabsContent>
        </Tabs>
        
        <Separator className="my-4" />
        
        <div className="text-sm text-muted-foreground">
          <p>Last action: <span className="font-mono">{lastAction || 'None'}</span></p>
        </div>
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground">
        Check your console logs and toast notifications for error details
      </CardFooter>
    </Card>
  );
} 