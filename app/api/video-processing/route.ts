import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth-utils";
import prismadb from "@/lib/prismadb";
import { extractClip, burnSubtitles, generateSubtitles } from '@/lib/video-service';
import { transcribeClip } from '@/lib/transcription-service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    const userId = session?.user?.id;
    
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
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
      return new NextResponse("Missing required fields", { status: 400 });
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
          return new NextResponse(`Unknown action: ${action}`, { status: 400 });
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
      
      throw error;
    }
  } catch (error) {
    console.error("[VIDEO_PROCESSING_ERROR]", error);
    return new NextResponse(
      error instanceof Error ? error.message : "Internal error",
      { status: 500 }
    );
  }
} 