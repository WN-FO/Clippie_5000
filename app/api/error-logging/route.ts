import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth-utils";
import { logError } from "@/lib/error-utils";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    // Get user session if available
    const session = await getServerSession();
    const userId = session?.user?.id;
    
    // Parse the error data
    const errorData = await req.json();
    
    // Add user ID if authenticated
    if (userId) {
      errorData.userId = userId;
    }
    
    // Log the error with source
    logError(
      {
        message: errorData.message,
        stack: errorData.stack,
        ...errorData.context,
      },
      'client-error'
    );
    
    // In a production app, you would:
    // 1. Store in database or send to error monitoring service
    // 2. Add metadata like user info, URL, etc.
    // 3. Filter out unnecessary errors
    
    console.error('[CLIENT ERROR]', {
      message: errorData.message,
      clientInfo: errorData.clientInfo,
      context: errorData.context,
      userId,
      timestamp: new Date().toISOString(),
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in error-logging API:', error);
    return NextResponse.json(
      { error: 'Failed to log error' },
      { status: 500 }
    );
  }
} 