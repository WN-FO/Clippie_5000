import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth-utils";
import prismadb from "@/lib/prismadb";
import { extractClip, burnSubtitles, generateSubtitles } from '@/lib/video-service';
import { transcribeClip } from '@/lib/transcription-service';
import { AppError, ErrorType, handleApiError, withErrorHandling } from '@/lib/error-utils';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function handler(req: Request) {
  const session = await getServerSession();
  const userId = session?.user?.id;
  
  if (!userId) {
    throw new AppError("Unauthorized", ErrorType.AUTHENTICATION, 401);
  }

  const body = await req.json();
  const { 
    action,
    clipId,
    videoUrl,
    startTime,
    endTime,
    resolution,
    watermark,
    subtitlesEnabled,
  } = body;

  if (!action || !clipId || !videoUrl) {
    throw new AppError("Missing required fields", ErrorType.VALIDATION, 400);
  }

  try {
    switch (action) {
      case 'extractClip': {
        // Extract the clip
        console.log(`Processing clip ${clipId}: Extracting clip...`);
        const clipPath = await extractClip(
          videoUrl,
          startTime,
          endTime,
          resolution,
          watermark
        );
        
        // Update clip with the storage URL
        await prismadb.clip.update({
          where: { id: clipId },
          data: {
            storageUrl: clipPath,
          },
        });
        
        // Generate subtitles if enabled
        if (subtitlesEnabled) {
          console.log(`Processing clip ${clipId}: Generating transcription...`);
          try {
            // Transcribe the specific portion of the video
            const transcription = await transcribeClip(
              videoUrl,
              startTime,
              endTime
            );
            
            // Create the transcription record
            await prismadb.clipTranscription.create({
              data: {
                clipId,
                text: transcription,
              },
            });
          } catch (error) {
            console.error(`Error generating transcription for clip ${clipId}:`, error);
            // We continue even if transcription generation fails
          }
        }
        
        // Update the clip status to ready
        await prismadb.clip.update({
          where: { id: clipId },
          data: {
            status: 'ready',
          },
        });
        
        // Update the user's minutes used
        const clipDurationMinutes = Math.ceil((endTime - startTime) / 60);
        await prismadb.userSubscription.update({
          where: { userId },
          data: {
            minutesUsed: {
              increment: clipDurationMinutes,
            },
          },
        });
        
        console.log(`Clip ${clipId} processed successfully`);
        return NextResponse.json({ success: true });
      }
      
      default:
        throw new AppError(`Unknown action: ${action}`, ErrorType.VALIDATION, 400);
    }
  } catch (error) {
    console.error("Video processing error:", error);
    
    // Update clip status to error
    await prismadb.clip.update({
      where: { id: clipId },
      data: {
        status: 'error',
      },
    });
    
    throw new AppError(
      error instanceof Error ? error.message : "Video processing failed",
      ErrorType.VIDEO_PROCESSING,
      500,
      { clipId }
    );
  }
}

export const POST = withErrorHandling(handler, 'VideoProcessing'); 