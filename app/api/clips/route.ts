import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth-utils";
import prismadb from "@/lib/prismadb";
import { getUserSubscription } from "@/lib/subscription";
import { PLANS } from "@/constants/subscription-plans";

// Make sure we're using Node.js runtime for this API route
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
    const { videoId, title, startTime, endTime, resolution = '720p', subtitlesEnabled = false } = body;

    if (!videoId || startTime === undefined || endTime === undefined) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Get the user's subscription
    const userSubscription = await getUserSubscription(userId);
    const isPro = !!userSubscription?.stripePriceId;
    const plan = isPro 
      ? userSubscription?.stripePriceId?.includes('pro') 
        ? 'PRO' 
        : 'CREATOR'
      : 'FREE';
    
    // Check if the clip duration is within limits
    const clipDuration = endTime - startTime;
    const maxClipDuration = 60; // Maximum clip duration in seconds
    
    if (clipDuration > maxClipDuration) {
      return new NextResponse(
        `Clip duration exceeds the maximum allowed (${maxClipDuration} seconds)`, 
        { status: 403 }
      );
    }
    
    // Check if the user has enough minutes remaining
    const clipDurationMinutes = Math.ceil(clipDuration / 60);
    const minutesUsed = userSubscription?.minutesUsed || 0;
    const maxMinutes = PLANS[plan as keyof typeof PLANS].minutesLimit;
    
    if (minutesUsed + clipDurationMinutes > maxMinutes) {
      return new NextResponse(
        `Not enough minutes remaining in your plan. Used: ${minutesUsed}, Max: ${maxMinutes}`, 
        { status: 403 }
      );
    }
    
    // Add watermark for free plan
    const watermark = plan === 'FREE';
    
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

    // Start processing the clip
    const response = await fetch('/api/video-processing', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'extractClip',
        clipId: clip.id,
        videoUrl: video.storageUrl,
        startTime,
        endTime,
        resolution,
        watermark,
        subtitlesEnabled,
        userId,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to start clip processing: ${response.statusText}`);
    }
    
    return NextResponse.json(clip);
  } catch (error) {
    console.error("[CLIPS_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession();
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