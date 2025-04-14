import { NextResponse } from "next/server";
import { AppError, ErrorType, withErrorHandling } from '@/lib/error-utils';

export const dynamic = 'force-dynamic';

async function handler(req: Request) {
  const { searchParams } = new URL(req.url);
  const errorType = searchParams.get('type') || 'unknown';
  
  // Simulate different types of errors
  switch (errorType) {
    case 'auth':
      throw new AppError(
        'Authentication required', 
        ErrorType.AUTHENTICATION, 
        401
      );
    
    case 'forbidden':
      throw new AppError(
        'Access denied', 
        ErrorType.AUTHORIZATION, 
        403
      );
    
    case 'validation':
      throw new AppError(
        'Invalid input parameters', 
        ErrorType.VALIDATION, 
        400, 
        { fields: ['email', 'username'] }
      );
    
    case 'server':
      throw new AppError(
        'Internal server error', 
        ErrorType.SERVER, 
        500
      );
    
    case 'db':
      throw new AppError(
        'Database connection error', 
        ErrorType.DATABASE, 
        500
      );
    
    case 'timeout':
      // Simulate long operation then timeout
      await new Promise(resolve => setTimeout(resolve, 1000));
      throw new AppError(
        'Operation timed out', 
        ErrorType.API, 
        408
      );
    
    case 'standard':
      // Regular JavaScript error
      throw new Error('This is a standard JavaScript error');
    
    case 'success':
      // Return success response
      return NextResponse.json({ 
        success: true, 
        message: 'Operation completed successfully' 
      });
    
    default:
      throw new AppError(
        'Unknown error type', 
        ErrorType.UNKNOWN, 
        500
      );
  }
}

export const GET = withErrorHandling(handler, 'TestError'); 