// Error utility functions for consistent error handling across the application

import { toast } from 'sonner';

// Error types for better categorization
export enum ErrorType {
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  VALIDATION = 'validation',
  SERVER = 'server',
  NETWORK = 'network',
  UNKNOWN = 'unknown',
  API = 'api',
  DATABASE = 'database',
  VIDEO_PROCESSING = 'video_processing',
  PAYMENT = 'payment',
}

// Custom error class with additional metadata
export class AppError extends Error {
  type: ErrorType;
  status?: number;
  context?: Record<string, any>;
  
  constructor(
    message: string, 
    type: ErrorType = ErrorType.UNKNOWN, 
    status?: number,
    context?: Record<string, any>
  ) {
    super(message);
    this.name = 'AppError';
    this.type = type;
    this.status = status;
    this.context = context;
  }
}

// Format error for logging
export function formatErrorForLogging(error: unknown): Record<string, any> {
  if (error instanceof AppError) {
    return {
      message: error.message,
      type: error.type,
      status: error.status,
      context: error.context,
      stack: error.stack,
    };
  }
  
  if (error instanceof Error) {
    return {
      message: error.message,
      name: error.name,
      stack: error.stack,
    };
  }
  
  return { message: String(error) };
}

// Log error with consistent format
export function logError(error: unknown, source?: string): void {
  const formattedError = formatErrorForLogging(error);
  console.error(`[ERROR]${source ? ` [${source}]` : ''}:`, formattedError);
}

// Handle API error responses
export function handleApiError(error: unknown): Response {
  if (error instanceof AppError) {
    return new Response(
      JSON.stringify({ 
        error: error.message, 
        type: error.type,
        context: error.context
      }), 
      { 
        status: error.status || 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
  
  if (error instanceof Error) {
    return new Response(
      JSON.stringify({ error: error.message }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
  
  return new Response(
    JSON.stringify({ error: 'An unknown error occurred' }), 
    { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    }
  );
}

// Show user-friendly error notification
export function showErrorNotification(error: unknown, fallbackMessage = 'Something went wrong'): void {
  let message = fallbackMessage;
  let description = '';
  
  if (error instanceof AppError) {
    message = getUserFriendlyErrorMessage(error) || fallbackMessage;
    if (error.context?.userMessage) {
      description = error.context.userMessage;
    }
  } else if (error instanceof Error) {
    message = error.message || fallbackMessage;
  }
  
  toast.error(message, {
    description,
    duration: 5000,
  });
}

// Get user-friendly error message based on error type
function getUserFriendlyErrorMessage(error: AppError): string {
  switch (error.type) {
    case ErrorType.AUTHENTICATION:
      return 'Authentication error. Please sign in again.';
    case ErrorType.AUTHORIZATION:
      return 'You do not have permission to perform this action.';
    case ErrorType.VALIDATION:
      return 'Please check your input and try again.';
    case ErrorType.NETWORK:
      return 'Network error. Please check your connection.';
    case ErrorType.VIDEO_PROCESSING:
      return 'Video processing error. Please try again.';
    case ErrorType.PAYMENT:
      return 'Payment error. Please check your payment details.';
    case ErrorType.API:
      return 'Service error. Please try again later.';
    case ErrorType.DATABASE:
      return 'Database error. Please try again later.';
    default:
      return error.message || 'An error occurred. Please try again.';
  }
}

// Create a wrapper for async API route handlers
export function withErrorHandling(
  handler: (req: Request, ...args: any[]) => Promise<Response>,
  source?: string
) {
  return async (req: Request, ...args: any[]): Promise<Response> => {
    try {
      return await handler(req, ...args);
    } catch (error) {
      logError(error, source);
      return handleApiError(error);
    }
  };
} 