'use client';

import { AlertCircle, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useState } from 'react';

interface ApiErrorProps {
  title?: string;
  message?: string;
  code?: string | number;
  retry?: () => Promise<void>;
  suggestion?: string;
  timestamp?: Date;
}

export function ApiError({
  title = "Request Failed",
  message = "We couldn't complete your request. Please try again.",
  code,
  retry,
  suggestion,
  timestamp = new Date(),
}: ApiErrorProps) {
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = async () => {
    if (!retry) return;
    
    try {
      setIsRetrying(true);
      await retry();
    } catch (error) {
      console.error("Retry failed:", error);
    } finally {
      setIsRetrying(false);
    }
  };

  return (
    <Card className="max-w-md w-full mx-auto shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-destructive" />
          <CardTitle className="text-xl">{title}</CardTitle>
        </div>
        <CardDescription>
          {code && <span className="font-mono text-sm">Error {code}</span>}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{message}</p>
        {suggestion && (
          <p className="text-sm text-muted-foreground mt-2">
            <strong>Suggestion:</strong> {suggestion}
          </p>
        )}
        <div className="text-xs text-muted-foreground mt-4">
          {timestamp.toLocaleString()}
        </div>
      </CardContent>
      {retry && (
        <CardFooter className="pt-3">
          <Button
            variant="outline"
            onClick={handleRetry}
            disabled={isRetrying}
            className="w-full"
          >
            {isRetrying ? (
              <>
                <RefreshCcw className="mr-2 h-4 w-4 animate-spin" />
                Retrying...
              </>
            ) : (
              "Try Again"
            )}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
} 