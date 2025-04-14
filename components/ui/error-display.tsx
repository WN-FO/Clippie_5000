'use client';

import { AlertTriangle, Bug, Database, Lock, RefreshCw, ServerCrash, Wifi, Zap } from "lucide-react";
import Link from "next/link";
import { ErrorType } from "@/lib/error-utils";

interface ErrorDisplayProps {
  title?: string;
  message?: string;
  errorType?: ErrorType;
  retry?: () => void;
  homeLink?: boolean;
  children?: React.ReactNode;
}

export function ErrorDisplay({
  title = "Something went wrong",
  message = "An error occurred while processing your request.",
  errorType = ErrorType.UNKNOWN,
  retry,
  homeLink = true,
  children,
}: ErrorDisplayProps) {
  const getErrorIcon = () => {
    switch (errorType) {
      case ErrorType.AUTHENTICATION:
        return <Lock className="h-12 w-12 text-amber-500" />;
      case ErrorType.AUTHORIZATION:
        return <Lock className="h-12 w-12 text-red-500" />;
      case ErrorType.VALIDATION:
        return <AlertTriangle className="h-12 w-12 text-orange-500" />;
      case ErrorType.SERVER:
        return <ServerCrash className="h-12 w-12 text-red-500" />;
      case ErrorType.NETWORK:
        return <Wifi className="h-12 w-12 text-gray-500" />;
      case ErrorType.API:
        return <ServerCrash className="h-12 w-12 text-purple-500" />;
      case ErrorType.DATABASE:
        return <Database className="h-12 w-12 text-blue-500" />;
      case ErrorType.VIDEO_PROCESSING:
        return <Zap className="h-12 w-12 text-yellow-500" />;
      default:
        return <Bug className="h-12 w-12 text-primary" />;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 text-center">
      <div className="mb-6">{getErrorIcon()}</div>
      <h1 className="text-2xl md:text-3xl font-bold mb-2">{title}</h1>
      <p className="text-muted-foreground max-w-md mb-6">{message}</p>
      
      {children}
      
      <div className="flex flex-col sm:flex-row gap-3 mt-2">
        {retry && (
          <button
            onClick={retry}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Try again
          </button>
        )}
        
        {homeLink && (
          <Link
            href="/"
            className="flex items-center justify-center px-4 py-2 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/90 transition-colors"
          >
            Return home
          </Link>
        )}
      </div>
    </div>
  );
} 