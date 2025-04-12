import { NextResponse } from "next/server";
import { supabaseClient } from "@/lib/supabase";
import prismadb from "@/lib/prismadb";
import { getUserSubscription, hasAvailableMinutes } from "@/lib/subscription";
import { extractClip } from "@/lib/video-service";
import { transcribeClip } from "@/lib/transcription-service";

export async function POST(req: Request) {
  try {
    const { data: { session } } = await supabaseClient.auth.getSession();
    const userId = session?.user?.id;
    
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    
    const body = await req.json();
    const { videoId, title, startTime, endTime, subtitlesEnabled } = body;
    
    if (!videoId || startTime === undefined || endTime === undefined) {
      return new NextResponse("Missing required fields", { status: 400 });
    }
    
    // Validate time range
    if (startTime >= endTime) {
      return new NextResponse("Start time must be before end time", { status: 400 });
    }
    
    if (endTime - startTime < 3) {
      return new NextResponse("Clip must be at least 3 seconds long", { status: 400 });
    }
    
    if (endTime - startTime > 60) {
      return new NextResponse("Clip cannot be longer than 60 seconds for performance reasons", { status: 400 });
    }
    
    // Check if the user has available minutes
    const hasMinutes = await hasAvailableMinutes(userId);
    if (!hasMinutes) {
      return new NextResponse(
        "You've reached your monthly limit. Upgrade your plan for more processing minutes.", 
        { status: 403 }
      );
    }
    
    // Get user subscription to determine quality settings
    const userSubscription = await getUserSubscription(userId);
    const isPro = !!userSubscription?.stripePriceId;
    const plan = isPro 
      ? userSubscription?.stripePriceId?.includes('pro') 
        ? 'PRO' 
        : 'CREATOR'
      : 'FREE';
    
    // Set quality options based on plan
    const resolution = plan === 'PRO' ? '4K' : plan === 'CREATOR' ? '1080p' : '720p';
    const watermark = plan === 'FREE'; // Add watermark for free plan
    
    // Get the source video
    const video = await prismadb.video.findUnique({
      where: { 
        id: videoId,
        userId, // Ensure the user owns this video
      },
    });
    
    if (!video) {
      return new NextResponse("Video not found", { status: 404 });
    }
    
    // Create the clip record
    const clip = await prismadb.clip.create({
      data: {
        userId,
        videoId,
        title: title || `Clip from ${video.filename}`,
        startTime,
        endTime,
        duration: endTime - startTime,
        status: 'processing',
        resolution,
      },
    });
    
    // Start processing the clip asynchronously
    processClip(
      clip.id, 
      video.storageUrl, 
      startTime, 
      endTime, 
      resolution, 
      watermark, 
      subtitlesEnabled,
      userId
    );
    
    return NextResponse.json(clip);
  } catch (error) {
    console.error("[CLIPS_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

// Helper function to process the clip asynchronously
async function processClip(
  clipId: string,
  videoUrl: string,
  startTime: number,
  endTime: number,
  resolution: string,
  watermark: boolean,
  subtitlesEnabled: boolean,
  userId: string
) {
  try {
    // Extract the clip first
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
  } catch (error) {
    console.error("Clip processing error:", error);
    
    // Update clip status to error
    await prismadb.clip.update({
      where: { id: clipId },
      data: {
        status: 'error',
      },
    });
  }
}

export async function GET(req: Request) {
  try {
    const { data: { session } } = await supabaseClient.auth.getSession();
    const userId = session?.user?.id;
    
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    
    const clips = await prismadb.clip.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        video: {
          select: {
            filename: true,
          },
        },
        transcription: {
          select: {
            text: true,
            subtitlesUrl: true,
          },
        },
      },
    });
    
    return NextResponse.json(clips);
  } catch (error) {
    console.error("[CLIPS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 