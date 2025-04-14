import { NextResponse } from "next/server";
import { supabaseAdmin, STORAGE_BUCKETS, getStorageUrl } from "@/lib/supabase";
import prismadb from "@/lib/prismadb";
import { getUserSubscription } from "@/lib/subscription";
import { getVideoInfo } from "@/lib/video-service";
import { PLANS } from "@/constants/subscription-plans";
import { getServerSession } from "@/lib/auth-utils";
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    const userId = session?.user?.id;
    
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    
    const body = await req.json();
    const { fileName, fileSize, fileType, storagePath } = body;
    
    if (!fileName || !fileSize || !fileType || !storagePath) {
      return new NextResponse("Missing required fields", { status: 400 });
    }
    
    // Check if the mime type is supported
    const supportedTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm'];
    if (!supportedTypes.includes(fileType)) {
      return new NextResponse("Unsupported file type", { status: 400 });
    }
    
    // Get the user's subscription
    const userSubscription = await getUserSubscription(userId);
    const isPro = !!userSubscription?.stripePriceId;
    const plan = isPro 
      ? userSubscription?.stripePriceId?.includes('pro') 
        ? 'PRO' 
        : 'CREATOR'
      : 'FREE';
    
    const maxVideoLength = PLANS[plan as keyof typeof PLANS].maxVideoLength;
    
    // Check if the user has already uploaded a video this month (for free tier)
    if (plan === 'FREE') {
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      
      const startOfMonth = new Date(currentYear, currentMonth, 1);
      
      const existingVideos = await prismadb.video.count({
        where: {
          userId,
          createdAt: {
            gte: startOfMonth,
          },
        },
      });
      
      if (existingVideos >= 1) {
        return new NextResponse(
          "Free tier is limited to 1 video per month. Upgrade to upload more.", 
          { status: 403 }
        );
      }
    }
    
    // Get the full URL for the video in Supabase Storage
    const storageUrl = getStorageUrl(STORAGE_BUCKETS.VIDEOS, storagePath);
    
    // Extract the video format from the filename
    const format = fileName.split('.').pop() || 'mp4';
    
    // Create the video record in the database
    const video = await prismadb.video.create({
      data: {
        userId,
        filename: fileName,
        fileSize,
        format,
        storageUrl,
        status: 'processing',
        duration: 0, // Will be updated after analysis
      },
    });
    
    // Start processing the video asynchronously (no need to await)
    processVideo(video.id, storageUrl, maxVideoLength, userId);
    
    return NextResponse.json(video);
  } catch (error) {
    console.error("[VIDEOS_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

// Helper function to process the video asynchronously
async function processVideo(videoId: string, storageUrl: string, maxVideoLength: number, userId: string) {
  try {
    // Download the video for analysis
    const { data, error } = await supabaseAdmin
      .storage
      .from(STORAGE_BUCKETS.VIDEOS)
      .download(storageUrl.split('/').pop() || '');
    
    if (error || !data) {
      throw new Error(`Error downloading video: ${error?.message}`);
    }
    
    // Create a temporary file
    const tempFilePath = `/tmp/${videoId}.mp4`;
    const fs = require('fs');
    fs.writeFileSync(tempFilePath, Buffer.from(await data.arrayBuffer()));
    
    try {
      // Get video metadata
      const metadata = await getVideoInfo(tempFilePath);
      
      const duration = Math.round(metadata.format.duration || 0);
      
      // Check if video is too long for the user's plan
      if (duration > maxVideoLength) {
        await prismadb.video.update({
          where: { id: videoId },
          data: {
            status: 'error',
            duration,
          },
        });
        
        // Clean up temp file
        fs.unlinkSync(tempFilePath);
        
        // We don't throw an error here because we want to update the DB with the duration
        console.error(`Video is too long for user's plan (${duration}s > ${maxVideoLength}s)`);
        return;
      }
      
      // Update the video with the actual duration
      await prismadb.video.update({
        where: { id: videoId },
        data: {
          status: 'ready',
          duration,
        },
      });
      
      // Update the user's minutes used
      await prismadb.userSubscription.update({
        where: { userId },
        data: {
          minutesUsed: {
            increment: Math.ceil(duration / 60),
          },
        },
      });
      
      // Clean up temp file
      fs.unlinkSync(tempFilePath);
      
    } catch (error) {
      console.error("Error processing video:", error);
      
      // Update video status to error
      await prismadb.video.update({
        where: { id: videoId },
        data: {
          status: 'error',
        },
      });
      
      // Clean up temp file if it exists
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }
    }
  } catch (error) {
    console.error("Video processing error:", error);
    
    // Update video status to error
    await prismadb.video.update({
      where: { id: videoId },
      data: {
        status: 'error',
      },
    });
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession();
    const userId = session?.user?.id;
    
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    
    const videos = await prismadb.video.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    return NextResponse.json(videos);
  } catch (error) {
    console.error("[VIDEOS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 